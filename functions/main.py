from firebase_functions import https_fn, options
from firebase_admin import initialize_app
import os

initialize_app()

# ============================================================
# Global variables for lazy loading
# ============================================================

# --- Keras LSTM model (legacy, 30-frame sequence) ---
model = None
classes = None

def load_model_and_classes():
    """Lazy load Keras model and classes only when needed"""
    global model, classes
    if model is None:
        # ใช้ tf_keras แทน tf.keras เพื่อความ compatible กับ model เก่า
        try:
            import tf_keras as keras  # type: ignore
        except ImportError:
            import tensorflow.keras as keras  # type: ignore
        
        print("📦 Loading Keras model...")
        model_path = os.path.join(os.path.dirname(__file__), "final_model.keras")
        model = keras.models.load_model(model_path)
        print("✅ Model loaded successfully")
                
    if classes is None:
        import pickle
        print("📦 Loading classes...")
        label_path = os.path.join(os.path.dirname(__file__), "classes.pkl")
        with open(label_path, 'rb') as f:
            classes = pickle.load(f)
        print(f"✅ Loaded {len(classes)} classes: {classes[:5]}... (showing first 5)")

# --- Decision Tree model (per-frame, pairwise distances) ---
decision_model = None
decision_scaler = None
decision_label_encoder = None

def load_decision_model():
    """Lazy load decision tree model, scaler, and label encoder"""
    global decision_model, decision_scaler, decision_label_encoder
    if decision_model is None:
        import joblib
        base_dir = os.path.dirname(__file__)
        decision_model = joblib.load(os.path.join(base_dir, 'decision_model.pkl'))
        decision_scaler = joblib.load(os.path.join(base_dir, 'scaler_decision.pkl'))
        decision_label_encoder = joblib.load(os.path.join(base_dir, 'label_encoder_decision.pkl'))


# ============================================================
# Cloud Functions
# ============================================================

@https_fn.on_call(
    memory=options.MemoryOption.GB_2,
    timeout_sec=300,
    cpu=2
)
def predict_gesture(req: https_fn.CallableRequest):
    """ทำนายจาก 30-frame sequence ด้วย Keras LSTM model (2GB RAM, 2 CPUs)"""
    try:
        import numpy as np
        import time
        
        start_time = time.time()
        print(f"🚀 Starting prediction...")
        
        load_model_and_classes()
        load_time = time.time() - start_time
        print(f"⏱️ Model loaded in {load_time:.2f}s")
        
        data = req.data.get("landmarks")
        expected_label = req.data.get("expected_label", "").lower().strip()  # คำที่คาดว่าจะเป็น
        
        if data is None:
            return {"error": "No data provided"}

        # Validate input shape
        try:
            input_data = np.array(data).reshape(1, 30, 1627)
        except ValueError as e:
            return {"error": f"Invalid input shape: {str(e)}"}
        
        print(f"🎯 Expected label: '{expected_label}'")
        
        # Feature statistics for debugging
        print(f"📊 Input stats: shape={input_data.shape}, min={input_data.min():.3f}, max={input_data.max():.3f}, mean={input_data.mean():.3f}")
        
        predict_start = time.time()
        predictions = model.predict(input_data, verbose=0)
        predict_time = time.time() - predict_start
        
        # Get top-3 predictions
        top3_idx = np.argsort(predictions[0])[-3:][::-1]
        top3_labels = [classes[i] for i in top3_idx]
        top3_conf = [float(predictions[0][i]) for i in top3_idx]
        
        class_idx = top3_idx[0]
        predicted_label = str(classes[class_idx]).lower().strip()
        confidence = top3_conf[0]
        
        # เช็คว่า prediction ตรงกับ expected_label หรือไม่
        is_correct = (predicted_label == expected_label) if expected_label else None
        
        total_time = time.time() - start_time
        print(f"✅ Prediction complete in {total_time:.2f}s (model: {load_time:.2f}s, predict: {predict_time:.2f}s)")
        print(f"🥇 Top-1: {top3_labels[0]} ({top3_conf[0]*100:.1f}%)")
        print(f"🥈 Top-2: {top3_labels[1]} ({top3_conf[1]*100:.1f}%)")
        print(f"🥉 Top-3: {top3_labels[2]} ({top3_conf[2]*100:.1f}%)")
        
        if expected_label:
            match_symbol = "✅" if is_correct else "❌"
            print(f"{match_symbol} Expected: '{expected_label}' vs Predicted: '{predicted_label}' - {'CORRECT' if is_correct else 'INCORRECT'}")
        
        return {
            "label": predicted_label,
            "confidence": confidence,
            "is_correct": is_correct,
            "expected_label": expected_label if expected_label else None,
            "top3": [
                {"label": str(top3_labels[0]).lower().strip(), "confidence": top3_conf[0]},
                {"label": str(top3_labels[1]).lower().strip(), "confidence": top3_conf[1]},
                {"label": str(top3_labels[2]).lower().strip(), "confidence": top3_conf[2]}
            ]
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"error": str(e)}


@https_fn.on_call(
    memory=options.MemoryOption.GB_1,
    timeout_sec=60,
    cpu=1
)
def predict_single_frame(req: https_fn.CallableRequest):
    """
    ทำนายท่ามือจาก single frame ด้วย Decision Tree model (1GB RAM, 1 CPU)
    รับ landmarks 21 จุด [[x, y], ...] → คำนวณ pairwise distances → scale → predict
    """
    try:
        import numpy as np
        from itertools import combinations

        load_decision_model()

        landmarks = req.data.get("landmarks")
        if landmarks is None:
            return {"error": "No landmarks provided"}

        # คำนวณระยะห่างแบบยุคลิดระหว่างจุดคู่ต่างๆ C(21,2) = 210 คู่
        distances = []
        point_pairs = list(combinations(range(21), 2))
        for i, j in point_pairs:
            a = landmarks[i]
            b = landmarks[j]
            dist = np.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2)
            distances.append(dist)

        distances = np.array(distances).reshape(1, -1)
        distances_scaled = decision_scaler.transform(distances)

        pred = decision_model.predict(distances_scaled)[0]
        pred_class = decision_label_encoder.inverse_transform([pred])[0]

        # ดึงค่า confidence (probability) ถ้า model รองรับ
        if hasattr(decision_model, 'predict_proba'):
            proba = decision_model.predict_proba(distances_scaled)[0]
            confidence = float(np.max(proba))
        else:
            confidence = 1.0

        return {
            "label": str(pred_class).lower().strip(),
            "confidence": confidence
        }
    except Exception as e:
        return {"error": str(e)}