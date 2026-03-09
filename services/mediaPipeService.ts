import { Holistic, Results } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS, POSE_CONNECTIONS, FACEMESH_TESSELATION } from '@mediapipe/holistic';
import { FeedbackData } from '../types';

// ระยะห่างระหว่าง prediction แต่ละครั้ง (ms)
const PREDICTION_INTERVAL_MS = 500; // 0.5 วินาที - predict บ่อยมากเพื่อ real-time feedback
const SEQUENCE_LENGTH = 30;
const FEATURES_PER_FRAME = 1627;
const MIN_VALID_FRAMES = 20; // ต้องมี detection จริงอย่างน้อย 20/30 frames

export class MediaPipeService {
  private holistic: Holistic | null = null;
  private camera: Camera | null = null;
  private onFeedbackCallback: ((data: FeedbackData) => void) | null = null;
  private targetWord: string = "";
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private detectionCount: number = 0;
  private lastDetectionTime: number = 0;
  private isActive: boolean = false;
  private validFrameHistory: number[] = [];

  // 30-frame landmark buffer สำหรับ Keras LSTM model
  private landmarkBuffer: number[][] = [];
  private validFrameCount: number = 0; // นับจำนวน frames ที่มี detection จริง
  private onBufferReadyCallback: ((buffer: number[][]) => void) | null = null;
  private lastPredictionTime: number = 0;

  // Canvas overlay สำหรับวาด hand landmarks แบบ real-time
  private overlayCanvas: HTMLCanvasElement | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    // MediaPipe Holistic initialization
    this.holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
    });

    this.holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true
    });
  }

  /**
   * ตั้งค่า canvas overlay สำหรับวาด hand landmarks
   */
  setOverlayCanvas(canvas: HTMLCanvasElement): void {
    this.overlayCanvas = canvas;
    this.overlayCtx = canvas.getContext('2d');
  }

  /**
   * เริ่มการตรวจจับมือ
   */
  async connect(
    targetWord: string, 
    onFeedback: (data: FeedbackData) => void,
    onBufferReady?: (buffer: number[][]) => void
  ): Promise<void> {
    this.targetWord = targetWord;
    this.onFeedbackCallback = onFeedback;
    this.onBufferReadyCallback = onBufferReady || null;
    this.detectionCount = 0;
    this.lastDetectionTime = Date.now();
    this.lastPredictionTime = 0;
    this.isActive = true;
    this.landmarkBuffer = [];
    this.validFrameCount = 0; // reset valid frame counter

    if (this.holistic) {
      this.holistic.onResults((results) => this.onResults(results));
    }
  }

  /**
   * เริ่มสตรีมวิดีโอและวาดผลลัพธ์
   */
  startStreaming(videoElement: HTMLVideoElement): void {
    if (!this.holistic) return;

    // สร้าง canvas สำหรับวาดผล
    this.canvasElement = document.createElement('canvas');
    this.canvasCtx = this.canvasElement.getContext('2d');
    
    // ซ่อน canvas (ใช้แค่วาดลงบน overlay)
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.display = 'none';
    
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.holistic && this.isActive) {
          await this.holistic.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });

    this.camera.start();
  }

  /**
   * ประมวลผลเมื่อตรวจจับมือได้
   */
  private onResults(results: Results): void {
    if (!this.isActive || !this.onFeedbackCallback) return;

    const now = Date.now();
    const timeSinceLastDetection = now - this.lastDetectionTime;

    // วาด landmarks ลง overlay canvas ทุกเฟรม
    this.drawLandmarksOverlay(results);

    // ตรวจสอบว่ามีการตรวจจับร่างกาย/มือหรือไม่
    const hasDetection = results.poseLandmarks || results.leftHandLandmarks || results.rightHandLandmarks;
    
    if (hasDetection) {
      this.detectionCount++;
      this.lastDetectionTime = now;

      // เก็บ landmarks ลง buffer สำหรับส่งไปทำนาย
      this.collectLandmarks(results);

      // แจ้ง feedback เบื้องต้นว่ากำลังเก็บข้อมูล (stars = 0, passed = false เสมอ)
      // เฉพาะตอนยังไม่มี prediction result (ช่วงแรก 1-2 วินาที)
      // หลังจากมี prediction จาก handleBufferReady จะ override ค่านี้
      if (this.detectionCount <= 15) {
        // ช่วงเก็บข้อมูลแรกๆ แจ้งให้รู้ว่าเห็นร่างกายแล้ว
        this.onFeedbackCallback({
          stars: 0,
          feedback: `กำลังเก็บข้อมูล... (${this.landmarkBuffer.length}/${SEQUENCE_LENGTH})`,
          passed: false
        });
      }
      // หลังจากนั้นไม่ต้องเรียก callback เพื่อไม่ให้ override ค่าจาก model prediction
    } else {
      // ไม่พบร่างกาย - แค่กรณีนี้ถึงแจ้ง feedback
      if (timeSinceLastDetection > 2000) {
        this.onFeedbackCallback({
          stars: 0,
          feedback: "กรุณาเข้าเฟรม...",
          passed: false
        });
      }
    }
  }

  /**
   * เก็บ landmarks จากแต่ละเฟรมเข้า buffer (Holistic version)
   * รวม Pose (33×4) + Face (468×3) + Left Hand (21×3) + Right Hand (21×3) = 1662 -> slice to 1627
   * เมื่อครบ 30 เฟรม จะเรียก callback เพื่อส่งไปทำนาย
   */
  private collectLandmarks(results: Results): void {
  const now = Date.now();
  const frameFeatures: number[] = [];
  let hasValidDetection = false;

  // 1. Pose: 132 ค่า
  if (results.poseLandmarks) {
    hasValidDetection = true;
    for (const lm of results.poseLandmarks) frameFeatures.push(lm.x, lm.y, lm.z, lm.visibility || 0);
  } else {
    for (let i = 0; i < 132; i++) frameFeatures.push(0);
  }

  // 2. Face: 1404 ค่า
  if (results.faceLandmarks) {
    for (const lm of results.faceLandmarks) frameFeatures.push(lm.x, lm.y, lm.z);
  } else {
    for (let i = 0; i < 1404; i++) frameFeatures.push(0);
  }

  // 3. Left Hand: 63 ค่า
  if (results.leftHandLandmarks) {
    hasValidDetection = true;
    for (const lm of results.leftHandLandmarks) frameFeatures.push(lm.x, lm.y, lm.z);
  } else {
    for (let i = 0; i < 63; i++) frameFeatures.push(0);
  }

  // 4. Right Hand: 63 ค่า
  if (results.rightHandLandmarks) {
    hasValidDetection = true;
    for (const lm of results.rightHandLandmarks) frameFeatures.push(lm.x, lm.y, lm.z);
  } else {
    for (let i = 0; i < 63; i++) frameFeatures.push(0);
  }

  // ⚠️ คำเตือน: การ slice(0, 1627) จะตัดข้อมูลมือขวาทิ้งไป 35 ค่า 
  // หากตอนเทรนใน Python คุณใช้ 1627 จริงๆ ให้คงบรรทัดนี้ไว้ 
  // แต่ถ้าใน Python คุณได้ shape=(30, 1662) คุณต้องแก้ FEATURES_PER_FRAME เป็น 1662 นะครับ!
  const trimmedFeatures = frameFeatures.slice(0, FEATURES_PER_FRAME);
  
  // แนบ flag ความถูกต้องไปด้วย เพื่อเอาไว้นับใน Sliding Window
  this.landmarkBuffer.push(trimmedFeatures);
  
  // เก็บประวัติ Valid Frames แยกไว้ (เพื่อให้มีขนาด 30 เท่ากับ buffer)
  if (!this.validFrameHistory) this.validFrameHistory = [];
  this.validFrameHistory.push(hasValidDetection ? 1 : 0);

  // [Sliding Window Logic] เลื่อนข้อมูลเก่าออกเมื่อเกิน 30 เฟรม
  if (this.landmarkBuffer.length > SEQUENCE_LENGTH) {
    this.landmarkBuffer.shift();
    this.validFrameHistory.shift();
  }

  // เมื่อสะสมครบ 30 เฟรม "และ" ถึงรอบเวลาส่ง (ทุกๆ 500ms)
  if (this.landmarkBuffer.length === SEQUENCE_LENGTH && (now - this.lastPredictionTime >= PREDICTION_INTERVAL_MS)) {
    
    // นับจำนวนเฟรมที่มีคนอยู่จริงๆ ใน 30 เฟรมล่าสุด
    const currentValidFrames = this.validFrameHistory.reduce((a, b) => a + b, 0);

    if (currentValidFrames >= MIN_VALID_FRAMES) {
      // ส่งข้อมูลโดย clone array ไป เพื่อป้องกันการโดนแก้ค่าระหว่างทาง
      if (this.onBufferReadyCallback) {
        this.onBufferReadyCallback([...this.landmarkBuffer]);
      }
      this.lastPredictionTime = now;
      console.log(`✅ Sent prediction! (${currentValidFrames}/30 valid frames)`);
    } else {
      console.log(`⚠️ Skip prediction: Not enough valid frames (${currentValidFrames}/${MIN_VALID_FRAMES})`);
    }
    
    // 💡 ไม่ต้องสั่ง this.landmarkBuffer = [] แล้วนะครับ! เพื่อให้เฟรมถัดๆ ไปเอาของเก่ามาต่อยอดได้เลย
  }
}

  /**
   * วาด holistic landmarks (pose + face + hands) ลง overlay canvas แบบ real-time
   * (mirror แบบ scale-x-[-1] ให้ตรงกับ video ที่ flip แล้ว)
   */
  private drawLandmarksOverlay(results: Results): void {
    if (!this.overlayCanvas || !this.overlayCtx) return;
    const ctx = this.overlayCtx;
    const w = this.overlayCanvas.width;
    const h = this.overlayCanvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // ไม่ต้อง flip canvas เพราะ selfieMode: true ใน MediaPipe ทำให้ landmarks ออกมา mirror อยู่แล้ว
    // และ video ก็ถูก mirror ด้วย scale-x-[-1] แล้ว ทำให้ตำแหน่งตรงกันพอดี

    // วาด Pose (ร่างกาย)
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        fillColor: '#FF0000',
        lineWidth: 1,
        radius: 2
      });
    }

    // วาด Face Mesh (ใบหน้า) - วาดแค่เส้นเบาๆ ไม่ต้องวาดจุดทุกจุด
    if (results.faceLandmarks) {
      drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, {
        color: '#C0C0C070',
        lineWidth: 1
      });
    }

    // วาด Left Hand (มือซ้าย)
    if (results.leftHandLandmarks) {
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 3
      });
      drawLandmarks(ctx, results.leftHandLandmarks, {
        color: '#FF0000',
        fillColor: '#FF6600',
        lineWidth: 1,
        radius: 4
      });
    }

    // วาด Right Hand (มือขวา)
    if (results.rightHandLandmarks) {
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 3
      });
      drawLandmarks(ctx, results.rightHandLandmarks, {
        color: '#FF0000',
        fillColor: '#FF6600',
        lineWidth: 1,
        radius: 4
      });
    }

    ctx.restore();
  }

  stopStreaming(): void {
    this.isActive = false;
    this.detectionCount = 0;
    this.lastPredictionTime = 0;
    this.landmarkBuffer = [];
    // เคลียร์ canvas overlay
    if (this.overlayCtx && this.overlayCanvas) {
      this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }
  }

  /**
   * หยุดการตรวจจับและปิดกล้อง
   */
  stop(): void {
    this.isActive = false;
    this.detectionCount = 0;
    
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    
    if (this.holistic) {
      this.holistic.close();
      this.holistic = null;
    }
    
    this.onFeedbackCallback = null;
  }

  /**
   * วาด landmarks บน canvas (ถ้าต้องการแสดงผล)
   */
  drawResults(results: Results, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // วาด pose
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 4
      });
    }

    // วาด hands
    if (results.leftHandLandmarks) {
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 5
      });
      drawLandmarks(ctx, results.leftHandLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 5
      });
    }

    if (results.rightHandLandmarks) {
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 5
      });
      drawLandmarks(ctx, results.rightHandLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 5
      });
    }

    ctx.restore();
  }
}
