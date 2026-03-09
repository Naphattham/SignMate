import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

// Initialize Functions from existing app
const functions = getFunctions(app);
// ถ้า deploy ไป region อื่น เช่น asia-southeast1 ให้เปลี่ยนเป็น:
// const functions = getFunctions(app, "asia-southeast1");

const predictGestureCallable = httpsCallable(functions, "predict_gesture");
const predictSingleFrameCallable = httpsCallable(functions, "predict_single_frame");

export interface PredictionResult {
  label: string;
  confidence: number;
  is_correct?: boolean | null; // ถูกต้องหรือไม่เทียบกับ expected_label
  expected_label?: string | null;
  top3?: Array<{label: string; confidence: number}>; // Top-3 predictions for debugging
}

/**
 * ส่ง landmarks sequence ไปทำนายท่ามือผ่าน Firebase Cloud Function (Keras LSTM)
 * @param landmarksSequence - Array ขนาด [30, 1627]
 * @param expectedLabel - คำที่คาดว่าจะเป็น (เช่น 'hello_adult') สำหรับเช็คความถูกต้อง
 * @param timeoutMs - Timeout in milliseconds (default: 30000ms = 30s)
 */
export const getPrediction = async (
  landmarksSequence: number[][],
  expectedLabel?: string,
  timeoutMs: number = 30000
): Promise<PredictionResult | null> => {
  try {
    // Validate input shape
    if (!landmarksSequence || landmarksSequence.length !== 30) {
      console.error(`Invalid sequence length: ${landmarksSequence?.length}, expected 30`);
      return null;
    }
    
    if (landmarksSequence[0]?.length !== 1627) {
      console.error(`Invalid feature length: ${landmarksSequence[0]?.length}, expected 1627`);
      return null;
    }

    console.log("📤 Sending prediction request...", {
      sequenceLength: landmarksSequence.length,
      featureLength: landmarksSequence[0].length,
      expectedLabel: expectedLabel || 'none',
      timestamp: new Date().toISOString()
    });

    // Create promise with timeout
    const predictionPromise = predictGestureCallable({ 
      landmarks: landmarksSequence,
      expected_label: expectedLabel || ""
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );

    const result = await Promise.race([predictionPromise, timeoutPromise]) as any;
    const data = result.data as any;

    if (data.error) {
      console.error("❌ Prediction error:", data.error);
      return null;
    }

    console.log("✅ Prediction result:", {
      label: data.label,
      confidence: (data.confidence * 100).toFixed(1) + '%',
      is_correct: data.is_correct,
      expected: data.expected_label,
      timestamp: new Date().toISOString()
    });

    // Validate response
    if (!data.label || typeof data.confidence !== 'number') {
      console.error("Invalid response format:", data);
      return null;
    }

    return {
      label: String(data.label).toLowerCase().trim(), // Normalize label
      confidence: Number(data.confidence),
      is_correct: data.is_correct,
      expected_label: data.expected_label,
      top3: data.top3
    };
  } catch (error: any) {
    if (error.message === 'Request timeout') {
      console.error("⏱️ Prediction timeout after", timeoutMs, "ms");
    } else {
      console.error("❌ Prediction failed:", error);
    }
    return null;
  }
};

/**
 * ส่ง landmarks 21 จุด (single frame) ไปทำนายด้วย Decision Tree model
 * @param landmarks - Array ขนาด [21][2] คือ [[x, y], ...] ของแต่ละ hand landmark
 */
export const getSingleFramePrediction = async (
  landmarks: number[][]
): Promise<PredictionResult | null> => {
  try {
    const result = await predictSingleFrameCallable({ landmarks });
    const data = result.data as any;

    if (data.error) {
      console.error("Single frame prediction error:", data.error);
      return null;
    }

    return {
      label: data.label,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error("Single frame prediction failed:", error);
    return null;
  }
};
