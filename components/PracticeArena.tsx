import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Level, FeedbackData } from '../types';
import { MediaPipeService } from '../services/mediaPipeService';
import { Button } from './Button';
import { StarRating } from './StarRating';

interface PracticeArenaProps {
  level: Level;
  onBack: () => void;
  onComplete: (stars: number) => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({ level, onBack, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
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
        setCameraError("Camera blocked! Check permissions.");
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

  const toggleDetection = async () => {
    if (isDetecting) {
      mediaPipeService.current?.stop();
      setIsDetecting(false);
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
        setFeedback(prev => ({ ...prev, feedback: "เกิดข้อผิดพลาดในการเชื่อมต่อ" }));
      }
    }
  };

  const handleFinish = () => {
    mediaPipeService.current?.stop();
    onComplete(feedback.stars);
  };

  // Determine border color based on state
  const getFeedbackColor = () => {
     if (feedback.passed) return "border-green-500 shadow-green-200";
     if (isDetecting) return "border-red-500 shadow-red-200"; // Recording state
     return "border-gray-300";
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 gap-6">
      
      {/* Game Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-lg border-b-8 border-gray-200 z-10">
        <Button onClick={onBack} variant="secondary" className="px-4 py-2 text-sm">
          ← EXIT
        </Button>
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-purple-600 uppercase tracking-wider">{level.thaiWord}</h2>
            <span className="text-gray-400 font-bold text-lg tracking-widest">{level.word}</span>
        </div>
        <div className="w-24 flex justify-end">
            <div className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide border-2 ${
              level.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' : 
              level.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'
            }`}>
                {level.difficulty}
            </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: Tutorial Video */}
        <div className="flex-1 flex flex-col bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-gray-200 relative overflow-hidden z-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-xl text-red-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">TUTORIAL VIDEO</h3>
          </div>

          {/* Simulated Video Player */}
          <div className={`flex-1 rounded-3xl relative overflow-hidden ${level.videoPlaceholderColor} border-4 border-black/5 shadow-inner group cursor-pointer`}>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                   <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                </div>
             </div>
             <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                 <div className="text-6xl mb-2 drop-shadow-md animate-bounce">👋</div>
                 <p className="font-bold text-shadow-md opacity-90">Watch how to sign "{level.word}"</p>
             </div>
             
             {/* Fake Progress Bar */}
             <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                <div className="h-full w-1/3 bg-red-500 rounded-r-full"></div>
             </div>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
            <h4 className="font-bold text-gray-400 text-xs uppercase mb-1">Instruction</h4>
            <p className="font-bold text-lg text-gray-800 leading-snug">{level.description}</p>
          </div>
        </div>

        {/* Right: User Camera & Controls */}
        <div className="flex-1 flex flex-col bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-gray-200 relative z-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">YOUR CAMERA</h3>
          </div>
          
          {/* Camera Frame */}
          <div className={`relative flex-1 rounded-3xl overflow-hidden bg-gray-900 border-[6px] transition-all duration-300 ${getFeedbackColor()} shadow-lg`}>
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 font-bold text-center bg-gray-800">
                <div className="flex flex-col items-center gap-2">
                   <span className="text-3xl">🚫</span>
                   <span>{cameraError}</span>
                </div>
              </div>
            ) : (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            )}
            
            {/* Live Indicator */}
            {isDetecting && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse shadow-md flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                LIVE
              </div>
            )}

            {/* Results Overlay */}
            <div className="absolute top-4 right-4">
                <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 ${feedback.passed ? 'scale-105' : ''}`}>
                    <StarRating stars={feedback.stars} size="lg" />
                    <p className={`text-xl font-black text-center uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${feedback.passed ? 'text-green-400' : 'text-white'}`}>
                        {feedback.feedback}
                    </p>
                </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6">
            {!feedback.passed ? (
               <Button 
                onClick={toggleDetection} 
                variant={isDetecting ? 'danger' : 'success'}
                fullWidth
                className="text-xl py-4 shadow-lg"
              >
                {isDetecting ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-pulse">⏹</span> STOP
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <span>▶</span> START DETECT
                    </span>
                )}
              </Button>
            ) : (
               <Button onClick={handleFinish} variant="warning" fullWidth className="text-xl py-4 animate-bounce shadow-lg">
                 NEXT LEVEL ➔
               </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};