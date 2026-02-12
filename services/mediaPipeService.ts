import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { FeedbackData } from '../types';

export class MediaPipeService {
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  private onFeedbackCallback: ((data: FeedbackData) => void) | null = null;
  private targetWord: string = "";
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private detectionCount: number = 0;
  private lastDetectionTime: number = 0;
  private isActive: boolean = false;

  constructor() {
    // MediaPipe Hands initialization
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  /**
   * เริ่มการตรวจจับมือ
   */
  async connect(
    targetWord: string, 
    onFeedback: (data: FeedbackData) => void
  ): Promise<void> {
    this.targetWord = targetWord;
    this.onFeedbackCallback = onFeedback;
    this.detectionCount = 0;
    this.lastDetectionTime = Date.now();
    this.isActive = true;

    if (this.hands) {
      this.hands.onResults((results) => this.onResults(results));
    }
  }

  /**
   * เริ่มสตรีมวิดีโอและวาดผลลัพธ์
   */
  startStreaming(videoElement: HTMLVideoElement): void {
    if (!this.hands) return;

    // สร้าง canvas สำหรับวาดผล
    this.canvasElement = document.createElement('canvas');
    this.canvasCtx = this.canvasElement.getContext('2d');
    
    // ซ่อน canvas (ใช้แค่วาดลงบน overlay)
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.display = 'none';
    
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.hands && this.isActive) {
          await this.hands.send({ image: videoElement });
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

    // ตรวจสอบว่ามีการตรวจจับมือหรือไม่
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      this.detectionCount++;
      this.lastDetectionTime = now;

      // วิเคราะห์ท่ามือและให้คะแนน
      const feedback = this.analyzeHandGesture(results);
      this.onFeedbackCallback(feedback);
    } else {
      // ไม่พบมือ
      if (timeSinceLastDetection > 2000) {
        this.onFeedbackCallback({
          stars: 0,
          feedback: "ยกมือขึ้นให้เห็น...",
          passed: false
        });
      }
    }
  }

  /**
   * วิเคราะห์ท่ามือและให้คะแนน (แบบง่าย)
   */
  private analyzeHandGesture(results: Results): FeedbackData {
    const hands = results.multiHandLandmarks;
    const handCount = hands.length;

    // ตรวจสอบจำนวนมือที่ตรวจจับได้
    if (handCount === 0) {
      return {
        stars: 0,
        feedback: "ไม่เห็นมือ ลองอีกครั้ง",
        passed: false
      };
    }

    // คำนวณคะแนนตามจำนวนการตรวจจับที่ต่อเนื่อง
    let stars = 1;
    let feedback = "เห็นมือแล้ว! ทำต่อ";
    let passed = false;

    if (this.detectionCount > 30) {
      // ตรวจจับได้มากกว่า 30 เฟรม (~3 วินาที) = ผ่าน!
      stars = 3;
      feedback = "สุดยอด! เก่งมาก! 🎉";
      passed = true;
    } else if (this.detectionCount > 20) {
      stars = 2;
      feedback = "ดีมาก! เกือบแล้ว";
      passed = true;
    } else if (this.detectionCount > 10) {
      stars = 2;
      feedback = "เริ่มดีแล้ว ทำต่อ!";
      passed = false;
    }

    // วิเคราะห์เพิ่มเติมจากตำแหน่งมือ
    const hand = hands[0];
    const wrist = hand[0];
    const indexTip = hand[8];
    const thumbTip = hand[4];

    // ตรวจสอบว่ามือขึ้นสูงกว่าข้อมือหรือไม่
    const isHandRaised = indexTip.y < wrist.y;
    
    if (!isHandRaised && this.detectionCount > 5) {
      return {
        stars: 1,
        feedback: "ยกมือขึ้นสูงกว่านี้",
        passed: false
      };
    }

    return { stars, feedback, passed };
  }

  /**
   * หยุดการตรวจจับแต่ไม่ปิดกล้อง
   */
  stopStreaming(): void {
    this.isActive = false;
    this.detectionCount = 0;
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
    
    if (this.hands) {
      this.hands.close();
      this.hands = null;
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

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5
        });
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 2,
          radius: 5
        });
      }
    }

    ctx.restore();
  }
}
