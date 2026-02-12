import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Level, FeedbackData } from '../types';
import { MediaPipeService } from '../services/mediaPipeService';
import { Button } from './Button';
import { StarRating } from './StarRating';
import { Navbar } from './Navbar';
import dialogueIcon from '/src/assets/images/dialogue.png';
import emotionalIcon from '/src/assets/images/emotional.png';
import painIcon from '/src/assets/images/pain.png';
import questionIcon from '/src/assets/images/question.png';
import tutorialVideo from '/src/assets/images/video test.mp4';

// Icons components for cleaner JSX
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

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
  onBack: () => void;
  onComplete: (stars: number) => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({ level, onBack, onComplete }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const tutorialVideoRef = useRef<HTMLVideoElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({ stars: 0, feedback: "พร้อมแล้ว?", passed: false });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const mediaPipeService = useRef<MediaPipeService | null>(null);

  useEffect(() => {
    mediaPipeService.current = new MediaPipeService();
    return () => {
      mediaPipeService.current?.stop();
    };
  }, []);

  // Control tutorial video to loop every 5 seconds
  useEffect(() => {
    const video = tutorialVideoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= 5) {
        video.currentTime = 0;
        video.play();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
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
    } else {
      if (!videoRef.current) return;
      setIsDetecting(true);
      setFeedback({ stars: 0, feedback: "แสดงมือให้เห็น!", passed: false });
      try {
        await mediaPipeService.current?.connect(level.word, handleFeedback);
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
        <Navbar />
       
        {/* Navigation Bar (Purple Section) */}
        <div className="w-full max-w-[1200px] mx-auto mb-2">
          <div className="bg-[#D0C3F1] rounded-3xl py-3 px-8 flex items-center shadow-sm min-h-[100px]">
            
            {/* --- ส่วนซ้าย: ปุ่มย้อนกลับ + เส้นคั่น --- */}
            <div className="flex items-center gap-4 shrink-0 pr-6">
              
              {/* ปุ่มวงกลมดำ */}
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

              {/* ข้อความ "ย้อนกลับ" */}
              <span className="text-2xl font-black text-black tracking-wide font-thai hidden md:block">
                ย้อนกลับ
              </span>

              {/* เส้นคั่นแนวตั้ง (Divider) */}
              <div className="w-[3px] h-16 bg-black rounded-full mx-2"></div>
            </div>

            {/* --- ส่วนขวา: เมนู 4 อัน --- */}
            <div className="flex-1 flex items-center justify-around px-2">
              
              {/* Item 1 */}
              <div onClick={() => navigate('/category/cat_greetings')} className="flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={dialogueIcon} alt="dialogue" className="w-14 h-14 object-contain drop-shadow-md" />
                <h2 className="text-lg font-black text-black font-thai leading-none">บทสนทนาทั่วไป</h2>
              </div>

              {/* Item 2 */}
              <div onClick={() => navigate('/category/cat_basic')} className="flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={painIcon} alt="pain" className="w-14 h-14 object-contain drop-shadow-md" />
                <h2 className="text-lg font-black text-black font-thai leading-none">อาการเจ็บป่วย</h2>
              </div>

              {/* Item 3 */}
              <div onClick={() => navigate('/category/cat_questions')} className="flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={questionIcon} alt="question" className="w-14 h-14 object-contain drop-shadow-md" />
                <h2 className="text-lg font-black text-black font-thai leading-none">คำถาม-คำตอบ</h2>
              </div>

              {/* Item 4 */}
              <div onClick={() => navigate('/category/cat_emotional')} className="flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform">
                <img src={emotionalIcon} alt="emotional" className="w-14 h-14 object-contain drop-shadow-md" />
                <h2 className="text-lg font-black text-black font-thai leading-none">อารมณ์</h2>
              </div>

            </div>
          </div>
        </div>

        {/* Header Section - Title */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-2 mt-2 max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-thai flex flex-wrap justify-center items-center gap-3">
              <span className="tracking-tight">{level.thaiWord}</span>
              <span className="text-gray-300 text-2xl md:text-3xl font-light">|</span>
              <span className="text-yellow-600 font-bold">{level.word}</span>
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
                        src={tutorialVideo}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-2xl"
                    />
                </div>

                {/* Instruction Text */}
                <p className="text-gray-400 text-sm font-medium text-center font-thai">
                    {level.description}
                </p>
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
                        <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline 
                            muted 
                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] rounded-lg"
                        />
                    )}
                    
                    {/* Feedback Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col items-center">
                        <StarRating stars={feedback.stars} size="md" />
                        {feedback.passed && <span className="text-green-400 font-bold bg-black/50 px-2 rounded mt-1 text-sm font-thai">สุดยอด!</span>}
                    </div>
                    
                    {/* Live Badge */}
                    {isDetecting && (
                         <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
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