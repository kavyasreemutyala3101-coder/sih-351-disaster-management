import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Play } from 'lucide-react';

export default function OpeningIntroModal({ onClose }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 1500);
    const timer2 = setTimeout(() => setStep(3), 3200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-pulse">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-cyan-400 tracking-widest font-heading">
              EARTH DATA INITIALIZING...
            </h2>
            <p className="text-xs text-slate-400">Connecting Sentinel-1 SAR & NASA GPM IMERG Feeds</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Globe className="w-20 h-20 text-cyan-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-extrabold text-white font-heading">
              HYDRAULIC GRAPH TOPOLOGY LOADED
            </h2>
            <p className="text-xs text-slate-300">Coupling Vijayawada Municipal Drainage Nodes with IMD Radar</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-scale-up">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400 font-heading">
                NEXUS-FLOOD
              </h1>
              <p className="text-sm font-bold text-cyan-300 tracking-wider">
                "SEE THE RAIN. UNDERSTAND THE DRAIN. PREDICT THE FLOOD."
              </p>
              <p className="text-xs text-slate-400 pt-2">
                Smart India Hackathon 2026 Problem Statement: Urban Flood Nowcasting System (Drainage & Rainfall Coupling)
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 mx-auto transition-all"
            >
              <span>ENTER 3D DIGITAL EARTH PLATFORM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-300 underline pt-4 block mx-auto"
        >
          Skip Intro & Enter Immediately
        </button>
      </div>
    </div>
  );
}
