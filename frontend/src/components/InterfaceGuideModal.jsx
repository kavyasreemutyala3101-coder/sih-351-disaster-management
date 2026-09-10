import React, { useState } from 'react';
import { 
  X, Globe, Sparkles, CloudRain, Layers, Activity, Cpu, Play, MousePointer, Image, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function InterfaceGuideModal({ onClose, onSelectTab, onChangeTheme }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Welcome & Project Navigation",
      icon: Globe,
      color: "text-cyan-400",
      description: "Use the left sidebar to move between Explore, Predict, Monitor and Respond. The active screen is always highlighted.",
      actionText: "Open Digital Earth",
      action: () => { onSelectTab('earth'); onClose(); }
    },
    {
      title: "2. Dynamic Disaster Background Animations",
      icon: Image,
      color: "text-blue-400",
      description: "Use Background Scene in the sidebar to choose Rain, Flood, Glacier or Earthquake. Auto mode cycles through the scenes with a soft cross-fade.",
      actionText: "Use Rain Scene",
      action: () => { onChangeTheme('rain'); }
    },
    {
      title: "3. Fully Worked 3D Interactive Models",
      icon: Sparkles,
      color: "text-purple-400",
      description: "The 3D Globe, Hazard Lab, Drainage Twin and Flood Map are interactive. In the Hazard Lab, rotate, zoom, pause orbit and change model parameters without leaving the screen.",
      actionText: "Open 3D Hazard Lab",
      action: () => { onSelectTab('hazards'); onClose(); }
    },
    {
      title: "4. 1-Click Hackathon Flood Scenario Demo",
      icon: Play,
      color: "text-red-400",
      description: "To see the complete flood workflow, use Start flood scenario in the sidebar. It moves from prediction to response automatically.",
      actionText: "Open Flood Demo",
      action: () => { onSelectTab('nowcast'); onClose(); }
    }
  ];

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-panel p-6 rounded-3xl max-w-2xl w-full border-cyan-500/40 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <MousePointer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-heading">
              User Interface & Interaction Guide
            </h2>
            <p className="text-xs text-slate-400">
              Clear guide on navigating NEXUS-FLOOD, background animations, and worked 3D models
            </p>
          </div>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all border ${
                activeStep === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Step Card Content */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <StepIcon className={`w-7 h-7 ${currentStep.color}`} />
            <h3 className="text-base font-bold text-white font-heading">{currentStep.title}</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={currentStep.action}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>{currentStep.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {activeStep < steps.length - 1 && (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Need help anytime? Open Interface guide from the sidebar.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold text-xs transition-all"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
