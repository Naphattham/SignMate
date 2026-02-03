import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { FeedbackData } from '../types';

// Constants for image processing
const JPEG_QUALITY = 0.8;
const FRAME_RATE = 5; // Frames per second to send to Gemini (Keep low for latency/budget)

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any = null; // Holds the active session
  private frameIntervalId: number | null = null;
  private onFeedbackCallback: ((data: FeedbackData) => void) | null = null;
  private targetWord: string = "";

  constructor() {
    // API Key is injected by the environment as per instructions
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Connects to the Gemini Live API.
   * @param targetWord The word the user is trying to sign.
   * @param onFeedback Callback function when Gemini returns a rating.
   */
  async connect(targetWord: string, onFeedback: (data: FeedbackData) => void): Promise<void> {
    this.targetWord = targetWord;
    this.onFeedbackCallback = onFeedback;

    const systemInstruction = `
      You are a strict American Sign Language (ASL) Tutor and Judge.
      
      Task:
      1. Watch the video stream of the user.
      2. The user is attempting to perform the sign for the word: "${targetWord}".
      3. Analyze their hand shape, movement, and position.
      4. Provide feedback in strictly JSON format ONLY. Do not output markdown code blocks. Just the raw JSON string.
      
      Output JSON Schema:
      {
        "stars": number, // 1, 2, or 3. (1 = Wrong/Poor, 2 = Recognizable/Okay, 3 = Perfect)
        "feedback": "string", // Short, constructive advice (max 10 words) or "Great job!"
        "passed": boolean // true if stars >= 2
      }

      If you cannot see the user clearly or they are not moving, return {"stars": 0, "feedback": "Waiting for sign...", "passed": false}.
      Be lenient on lighting, focus on the gesture.
    `;

    try {
      this.session = await this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onclose: () => {
            console.log('Gemini Live Session Closed');
          },
          onerror: (e) => {
            console.error('Gemini Live Session Error', e);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO], // We use AUDIO modality to get text-to-speech feedback if needed, but we rely on transcription/text mostly.
          systemInstruction: systemInstruction,
          // We use transcription to "read" the model's response since we asked for JSON in the text response
          outputAudioTranscription: {}, 
        }
      });
    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      throw error;
    }
  }

  private handleMessage(message: LiveServerMessage) {
    // We are looking for the text transcription of the model's response to parse our JSON.
    // The Live API returns audio mostly, but with `outputAudioTranscription`, we get text.
    
    if (message.serverContent?.modelTurn?.parts) {
       // Sometimes text comes directly in parts if modality allows text, but for Live generic, 
       // it's often better to look at transcription if we force audio output.
       // However, let's try to parse any text part available.
       const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
       if (textPart && textPart.text) {
         this.tryParseJSON(textPart.text);
       }
    }

    if (message.serverContent?.outputTranscription?.text) {
       this.tryParseJSON(message.serverContent.outputTranscription.text);
    }
  }

  private tryParseJSON(text: string) {
    try {
      // Clean up potential markdown code blocks
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      // Find JSON object start/end
      const start = cleanText.indexOf('{');
      const end = cleanText.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonStr = cleanText.substring(start, end + 1);
        const data = JSON.parse(jsonStr) as FeedbackData;
        
        if (this.onFeedbackCallback) {
          this.onFeedbackCallback(data);
        }
      }
    } catch (e) {
      // Partial JSON or non-JSON chatter; ignore
      // console.debug("Could not parse JSON from model:", text);
    }
  }

  /**
   * Starts streaming video frames from the provided HTMLVideoElement.
   */
  startStreaming(videoElement: HTMLVideoElement) {
    if (!this.session) {
      console.warn("Session not established. Call connect() first.");
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    this.frameIntervalId = window.setInterval(async () => {
      if (videoElement.paused || videoElement.ended) return;

      canvas.width = videoElement.videoWidth * 0.5; // Scale down for bandwidth
      canvas.height = videoElement.videoHeight * 0.5;
      
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      const base64Data = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];

      try {
        await this.session.sendRealtimeInput({
          media: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
      } catch (err) {
        console.error("Error sending frame:", err);
        this.stop();
      }

    }, 1000 / FRAME_RATE);
  }

  stop() {
    if (this.frameIntervalId) {
      clearInterval(this.frameIntervalId);
      this.frameIntervalId = null;
    }
    // There is no explicit "close" method on the session object returned by connect directly in the new SDK types provided in context? 
    // Actually, checking the docs provided: "When the conversation is finished, use session.close()".
    // However, the `sessionPromise` resolves to a `LiveSession`.
    if (this.session) {
      // Assuming session has a close method or we rely on just stopping input.
      // Based on provided context: "use session.close() to close the connection"
      try {
         // Force close logic if available, otherwise just drop ref
         // @ts-ignore
         this.session.close?.();
      } catch (e) {
        console.warn("Error closing session", e);
      }
      this.session = null;
    }
    this.onFeedbackCallback = null;
  }
}
