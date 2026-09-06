import React from 'react';
import { X, Play, CheckCircle2, Volume2, Maximize2, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, onExploreCourses }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Platform Tour & Demo Overview</h3>
              <p className="text-xs text-slate-400">See how MedPrep Pro structures your clinical preparation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen Mockup */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-6">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80" 
              alt="Medical platform demo" 
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE PLATFORM WALKTHROUGH
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 bg-black/50 px-2 py-1 rounded">1080p HD</span>
              </div>
            </div>

            <div className="relative z-10 text-center space-y-3">
              <div className="inline-flex w-16 h-16 rounded-full bg-brand-600 text-white items-center justify-center shadow-glow hover:scale-105 transition-transform cursor-pointer mx-auto">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Interactive Guided Tour of QBank, Lecture Notes & Grand Tests
              </p>
            </div>

            {/* Video progress mock bar */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>01:45 / 04:20</span>
                <span>Chapter 2: Active Recall & Test Engine</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-[42%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Key demo highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Step-wise Roadmaps</span>
                <span className="text-[11px] text-slate-400">Week-by-week 19-subject schedules</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Clinical Vignette QBank</span>
                <span className="text-[11px] text-slate-400">Detailed option rationales</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Faculty Grand Rounds</span>
                <span className="text-[11px] text-slate-400">Weekly live clinical case discussions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Ready to experience the full curriculum?
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onExploreCourses();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition-colors text-center"
            >
              Explore Exam Courses
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
