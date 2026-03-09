import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Level, FeedbackData, UserProgress } from '../types';
import { MediaPipeService } from '../services/mediaPipeService';
import { getPrediction, PredictionResult } from '../services/predictionService';
import { Button } from './Button';
import { StarRating } from './StarRating';
import { Navbar } from './Navbar';
import { type User as FirebaseUser } from '../services/firebase';
import dialogueIcon from '/src/assets/images/dialogue.png';
import emotionalIcon from '/src/assets/images/emotional.png';
import painIcon from '/src/assets/images/pain.png';
import questionIcon from '/src/assets/images/question.png';

// ใช้ tutorial video ที่กำหนดไว้ใน level หรือ fallback เป็น default
const getTutorialVideoUrl = (level: Level, selectedIndex: number = 0, wordIndex: number = 0): string => {
  // ถ้ามี tutorialVideoUrls
  if (level.tutorialVideoUrls) {
    // ถ้าเป็น 2D array (array of arrays)
    if (Array.isArray(level.tutorialVideoUrls[0])) {
      const urls2D = level.tutorialVideoUrls as string[][];
      if (urls2D.length > selectedIndex && urls2D[selectedIndex].length > wordIndex) {
        return urls2D[selectedIndex][wordIndex];
      }
    } else {
      // ถ้าเป็น 1D array
      const urls1D = level.tutorialVideoUrls as string[];
      if (urls1D.length > selectedIndex) {
        return urls1D[selectedIndex];
      }
    }
  }
  // ถ้าไม่มี ให้ใช้ tutorialVideoUrl เดี่ยว หรือ fallback
  return level.tutorialVideoUrl || '';
};

// Icons components for cleaner JSX
const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface PracticeArenaProps {
  level: Level;
  categoryId?: string;
  onBack: () => void;
  onComplete: (stars: number) => void;
  user: FirebaseUser | null;
  userProgress: UserProgress;
  onLogout?: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({ level, categoryId, onBack, onComplete, user, userProgress, onLogout }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tutorialVideoRef = useRef<HTMLVideoElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({ stars: 0, feedback: "พร้อมแล้ว?", passed: false });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [currentWordInSequence, setCurrentWordInSequence] = useState(0); // ติดตามว่ากำลังฝึกคำไหนในชุด
  const mediaPipeService = useRef<MediaPipeService | null>(null);

  // เกณฑ์ confidence ขั้นต่ำที่นับว่าถูกต้อง (50% ขึ้นไปได้ 1 ดาว)
  const MIN_CONFIDENCE_FOR_CORRECT = 0.50;

  useEffect(() => {
    mediaPipeService.current = new MediaPipeService();
    return () => {
      mediaPipeService.current?.stop();
    };
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Camera blocked!");
      }
    };
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleFeedback = useCallback((data: FeedbackData) => {
    setFeedback(data);
  }, []);

  // เมื่อ buffer ครบ 30 เฟรม ส่งไปทำนายที่ Cloud Function (Keras LSTM)
  const handleBufferReady = useCallback(async (buffer: number[][]) => {
    if (isPredicting) {
      return; // ป้องกันเรียกซ้ำ
    }
    
    // Validate buffer before sending
    if (!buffer || buffer.length !== 30 || buffer[0]?.length !== 1627) {
      return;
    }

    setIsPredicting(true);
    
    try {
      // ส่ง expectedLabel ไปที่ backend เพื่อเช็คว่าถูกต้องหรือไม่
      // ใช้ modelLabels[selectedWordIndex] ถ้ามี หรือใช้ modelLabel ถ้าไม่มี
      const expectedLabel = (level.modelLabels && level.modelLabels.length > selectedWordIndex 
        ? level.modelLabels[selectedWordIndex] 
        : level.modelLabel).toLowerCase().trim();
      const result = await getPrediction(buffer, expectedLabel, 30000);
      
      if (result) {
        setPrediction(result);

        const predictedLabel = result.label;
        const confidence = result.confidence;
        
        // ถูกต้องเมื่อ Label ตรงกัน และ ความมั่นใจเกิน 50%
        const isCorrect = (predictedLabel === expectedLabel) && (confidence >= MIN_CONFIDENCE_FOR_CORRECT);

        let stars = 0;
        let feedbackText = "";
        let passed = false;

        if (isCorrect) {
          if (confidence >= 0.90) {
            stars = 3;
            feedbackText = `สุดยอด! (${(confidence * 100).toFixed(0)}%)`;
            passed = true;
          } else if (confidence >= 0.75) {
            stars = 2;
            feedbackText = `ดีมาก! (${(confidence * 100).toFixed(0)}%)`;
            passed = false;
          } else {
            stars = 1;
            feedbackText = `ถูกต้อง! (${(confidence * 100).toFixed(0)}%)`;
            passed = false;
          }
        } else {
          stars = 0;
          feedbackText = "ไม่ถูกต้อง";
          passed = false;
        }

        setFeedback({ stars, feedback: feedbackText, passed });
      } else {
        setFeedback({ stars: 0, feedback: "ไม่สามารถวิเคราะห์ได้ ลองอีกครั้ง", passed: false });
      }
    } catch (err) {
      console.error("❌ Prediction error:", err);
      setFeedback({ stars: 0, feedback: "เกิดข้อผิดพลาด กรุณาลองใหม่", passed: false });
    } finally {
      setIsPredicting(false);
    }
  }, [isPredicting, level.modelLabel, level.modelLabels, selectedWordIndex]);

  // Auto-stop detection when achieving 3 stars
  useEffect(() => {
    if (feedback.stars === 3 && isDetecting) {
      mediaPipeService.current?.stopStreaming();
      setIsDetecting(false);
    }
  }, [feedback.stars, isDetecting]);

  const toggleDetection = async () => {
    if (isDetecting) {
      // หยุด detection แต่ไม่ปิดกล้อง
      mediaPipeService.current?.stopStreaming();
      setIsDetecting(false);
      setFeedback({ stars: 0, feedback: "พร้อมแล้ว?", passed: false });
      setPrediction(null);
      setCurrentWordInSequence(0); // รีเซ็ตคำเมื่อหยุด
    } else {
      if (!videoRef.current) return;
      setIsDetecting(true);
      setFeedback({ stars: 0, feedback: "แสดงมือให้เห็น!", passed: false });
      setCurrentWordInSequence(0); // เริ่มจากคำแรก
      
      try {
        if (canvasRef.current) {
          mediaPipeService.current?.setOverlayCanvas(canvasRef.current);
        }
        await mediaPipeService.current?.connect(level.words[selectedWordIndex], handleFeedback, handleBufferReady);
        mediaPipeService.current?.startStreaming(videoRef.current);
      } catch (e) {
        console.error(e);
        setIsDetecting(false);
        setFeedback(prev => ({ ...prev, feedback: "Connection Error" }));
      }
    }
  };

  const handleFinish = () => {
    mediaPipeService.current?.stop();
    onComplete(feedback.stars);
  };

  return (
    <div className="min-h-screen bg-[#ef4848] flex items-center justify-center p-4 font-sans">
      
      {/* โหลด Font จาก Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@500;600&family=VT323&display=swap');
          
          .font-pixel {
            font-family: 'VT323', monospace;
          }
          .font-thai {
            font-family: 'Kanit', sans-serif;
          }
        `}
      </style>

      {/* การ์ดหลักสีครีม */}
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden">
        <Navbar 
          totalStars={Object.values(userProgress.stars).reduce((a: number, b: number) => a + b, 0)}
          user={user}
          onLogout={onLogout}
        />
       
        {/* Navigation Bar (Purple Section) */}
        <div className="w-full max-w-[1200px] mx-auto mb-2">
          <div className="bg-[#D0C3F1] rounded-3xl py-3 px-8 flex items-center shadow-sm min-h-[100px]">
            
            {/* --- ส่วนซ้าย: ปุ่มย้อนกลับ + เส้นคั่น --- */}
            <div className="flex items-center gap-4 shrink-0 pr-6">
              <button
                onClick={onBack}
                className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="#D0C3F1"
                  className="w-8 h-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>

              <span className="text-2xl font-black text-black tracking-wide font-thai hidden md:block">
                ย้อนกลับ
              </span>

              <div className="w-[3px] h-16 bg-black rounded-full mx-2"></div>
            </div>

            {/* --- ส่วนขวา: เมนู 4 อัน --- */}
            <div className="flex-1 flex items-center justify-around px-2 gap-1">
              <div onClick={() => navigate('/category/cat_greetings')} className="flex flex-col items-center gap-1 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={dialogueIcon} alt="dialogue" className="w-12 h-12 object-contain drop-shadow-md" />
                <h2 className="text-xs font-black text-black font-thai leading-none text-center">บทสนทนา</h2>
              </div>
              <div onClick={() => navigate('/category/cat_illness')} className="flex flex-col items-center gap-1 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={painIcon} alt="illness" className="w-12 h-12 object-contain drop-shadow-md" />
                <h2 className="text-xs font-black text-black font-thai leading-none text-center">เจ็บป่วย</h2>
              </div>
              <div onClick={() => navigate('/category/cat_questions')} className="flex flex-col items-center gap-1 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={questionIcon} alt="question" className="w-12 h-12 object-contain drop-shadow-md" />
                <h2 className="text-xs font-black text-black font-thai leading-none text-center">คำถาม</h2>
              </div>
              <div onClick={() => navigate('/category/cat_emotional')} className="flex flex-col items-center gap-1 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={emotionalIcon} alt="emotional" className="w-12 h-12 object-contain drop-shadow-md" />
                <h2 className="text-xs font-black text-black font-thai leading-none text-center">อารมณ์</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section - Title */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-2 mt-2 max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-thai flex flex-wrap justify-center items-center gap-3">
              <span className="font-bold flex items-center gap-2">
                {(level.wordOptions && level.wordOptions.length > selectedWordIndex ? level.wordOptions[selectedWordIndex] : level.words).map((word, idx) => (
                  <span 
                    key={idx}
                    className={idx === currentWordInSequence ? 'text-yellow-600' : 'text-gray-400'}
                  >
                    {word}
                  </span>
                ))}
              </span>
          </h1>
        </div>

        {/* Content Columns */}
        <div className="flex gap-4 max-w-2xl mx-auto w-full ">
            
            {/* Left Column: Tutorial Video */}
            <div className="flex-1 flex flex-col gap-2 bg-white rounded-3xl p-3 shadow-md">
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-red-50 p-1.5 rounded-full text-red-500 border border-red-100">
                        <VideoIcon />
                    </div>
                    <span className="text-xs font-black text-gray-500 tracking-wider uppercase font-thai">Tutorial Video</span>
                </div>

                {/* Tutorial Video */}
                <div className="h-[250px] bg-black rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden">
                    <video 
                        ref={tutorialVideoRef}
                        key={`${selectedWordIndex}-${currentWordInSequence}`}
                        src={getTutorialVideoUrl(level, selectedWordIndex, currentWordInSequence)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-2xl"
                    />
                </div>
                {level.wordOptions && level.wordOptions.length >= 2 && (
                  <div className="pt-1 flex gap-2">
                      {level.wordOptions.map((_, index) => (
                        <button 
                          key={index}
                          onClick={() => {
                            setSelectedWordIndex(index);
                            setCurrentWordInSequence(0);
                          }}
                          className={`flex-1 py-3 rounded-xl font-black shadow-md transition-all active:scale-95 text-sm flex items-center justify-center font-thai ${
                            selectedWordIndex === index 
                              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                            {level.buttonLabels?.[index] || level.wordOptions[index].join(' ')}
                        </button>
                      ))}
                  </div>
                )}
            </div>

            {/* Right Column: User Camera */}
            <div className="flex-1 flex flex-col gap-2 bg-white rounded-3xl p-3 shadow-md">
                 <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-50 p-1.5 rounded-full text-blue-500 border border-blue-100">
                        <CameraIcon />
                    </div>
                    <span className="text-xs font-black text-gray-500 tracking-wider uppercase font-thai">Your Camera</span>
                </div>

                {/* Camera Frame */}
                <div className={`h-[250px] bg-black rounded-xl overflow-visible relative shadow-lg ${feedback.stars === 3 ? 'border-4 border-green-500' : ''}`}>
                    {cameraError ? (
                        <div className="absolute inset-0 flex items-center rounded-xl justify-center text-white bg-gray-800 font-thai">No Camera</div>
                    ) : (
                        <>
                          <video 
                              ref={videoRef}
                              autoPlay 
                              playsInline 
                              muted 
                              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] rounded-lg"
                          />
                          <canvas
                              ref={canvasRef}
                              width={640}
                              height={480}
                              className="absolute inset-0 w-full h-full rounded-lg pointer-events-none"
                              style={{ zIndex: 10 }}
                          />
                        </>
                    )}
                    
                    {/* Feedback Overlay - แสดงดาวตามความถูกต้อง */}
                    <div className="absolute top-4 right-4 flex flex-col items-center">
                        <StarRating stars={feedback.stars} size="md" />
                        {feedback.passed && <span className="text-green-400 font-bold bg-black/50 px-2 rounded mt-1 text-sm font-thai">ผ่านแล้ว!</span>}
                    </div>
                    
                    {/* Live Badge */}
                    {isDetecting && (
                         <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                         </div>
                    )}

                    {/* Prediction Result / Loading */}
                    {isPredicting && !prediction && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400/90 text-black text-xs px-4 py-1.5 rounded-full font-bold font-thai animate-pulse shadow-md">
                        กำลังเริ่มวิเคราะห์...
                      </div>
                    )}

                    {prediction && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 w-full max-w-[90%]">
                        {prediction.is_correct !== null && prediction.is_correct !== undefined ? (
                          <div className={`text-sm px-4 py-2 rounded-full font-bold font-thai flex items-center gap-2 shadow-lg transition-colors duration-300 ${
                            prediction.is_correct 
                              ? 'bg-green-500/95 text-white' 
                              : 'bg-red-500/95 text-white'
                          }`}>
                            {prediction.is_correct ? (
                              <>
                                <span className="text-lg leading-none">✓</span>
                                <span>ถูกต้อง!</span>
                                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
                                  {(prediction.confidence * 100).toFixed(0)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg leading-none">✗</span>
                                <span className="whitespace-nowrap">ไม่ถูกต้อง</span>
                              </>
                            )}

                            {/* จุดไข่ปลาเล็กๆ กระพริบตอนกำลังดึงข้อมูลใหม่รอบถัดไป */}
                            {isPredicting && (
                               <span className="flex gap-0.5 ml-1">
                                 <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce"></span>
                                 <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                 <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                               </span>
                            )}
                          </div>
                        ) : (
                          <div className="bg-black/80 text-white text-xs px-4 py-1.5 rounded-full font-bold font-thai shadow-md flex items-center gap-2">
                            รอผลลัพธ์...
                            {isPredicting && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="pt-1">
                    {!feedback.passed ? (
                        <button 
                            onClick={toggleDetection}
                            className={`w-full py-3 rounded-xl font-black shadow-md transition-all active:scale-95 text-lg flex items-center justify-center gap-2 font-thai ${
                                isDetecting 
                                ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {isDetecting ? 'STOP' : 'START'}
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinish}
                            className="w-full bg-[#FDE047] hover:bg-[#FCD34D] text-gray-900 py-3 rounded-xl font-black shadow-[0_4px_0_rgb(202,138,4)] active:shadow-none active:translate-y-[4px] transition-all text-lg flex items-center justify-center gap-2 uppercase tracking-wide font-thai"
                        >
                            Next Level ➜
                        </button>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};