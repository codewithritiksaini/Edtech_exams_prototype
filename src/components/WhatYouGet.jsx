import React, { useState } from 'react';
import { 
  FileText, 
  Video, 
  Brain, 
  Radio, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Download, 
  Play, 
  RotateCw, 
  BarChart3,
  BookOpen
} from 'lucide-react';
import { whatYouGetFacilities } from '../data/mockData';

export default function WhatYouGet() {
  const [selectedFacility, setSelectedFacility] = useState('pdf-notes');
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const activeData = whatYouGetFacilities.find(f => f.id === selectedFacility) || whatYouGetFacilities[0];

  return (
    <section id="what-you-get" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>5 All-Inclusive Pillars</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need in One Place
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Ditch scattered notes, telegram groups, and multiple subscriptions. 
            Get a single, synchronized clinical study ecosystem.
          </p>
        </div>

        {/* 5 Facilities Horizontal Pill Selector (Mobile & Desktop) */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-10">
          {whatYouGetFacilities.map((facility) => {
            const isSelected = selectedFacility === facility.id;
            return (
              <button
                key={facility.id}
                onClick={() => {
                  setSelectedFacility(facility.id);
                  setFlashcardFlipped(false);
                }}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-102'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-brand-600'}>
                  {getIcon(facility.icon)}
                </span>
                <span>{facility.title}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Interactive Feature Card + Live Demonstration Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Information & Highlights */}
            <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-md">
                    {activeData.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {activeData.metrics}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                  {activeData.title} <span className="text-brand-600 font-semibold text-xl">({activeData.subtitle})</span>
                </h3>

                <p className="text-base text-slate-600 leading-relaxed mb-6">
                  {activeData.description}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Core Capabilities:
                  </div>
                  {activeData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Included in all Pro & Elite exam plans
                </span>
                <a 
                  href="#courses"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>Select an Exam to Start</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview Mockup */}
            <div className="lg:col-span-6 bg-slate-900 text-white p-8 sm:p-10 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-800 relative">
              <div className="w-full max-w-md">
                
                {/* 1. PDF Notes Preview Mockup */}
                {selectedFacility === 'pdf-notes' && (
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-400" />
                        <span className="text-sm font-bold text-slate-100">Cardiology: Murmurs & Valvular Path</span>
                      </div>
                      <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded">
                        PDF 24 pgs
                      </span>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3 font-sans">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>High-Yield Summary Note</span>
                        <span className="text-emerald-400 font-bold">Verified MD Review</span>
                      </div>
                      <div className="p-3 bg-brand-950/40 rounded-lg border border-brand-800/40 text-xs space-y-1.5">
                        <div className="font-bold text-brand-300">★ Aortic Stenosis Clinical Triad:</div>
                        <p className="text-slate-300">SAD = Syncope, Angina, Dyspnea. Crescendo-decrescendo systolic murmur radiating to carotids.</p>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 w-3/4 rounded-full" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Includes 12 colored histological microphotographs</span>
                      <button className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold">
                        <Download className="w-3.5 h-3.5" />
                        <span>Sample PDF</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Video Lecture Preview Mockup */}
                {selectedFacility === 'video-lectures' && (
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 animate-in fade-in">
                    <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group">
                      <img 
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80" 
                        alt="Lecture preview" 
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                      <div className="relative z-10 w-14 h-14 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded backdrop-blur-sm">
                        <span>Renal Acid-Base Balance & Compensation</span>
                        <span className="text-brand-400 font-bold">24:18 / 42:00</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Taught by Dr. Rajiv Mehta (MD, DM Nephrology)
                      </span>
                      <span className="text-slate-400">1080p 60FPS</span>
                    </div>
                  </div>
                )}

                {/* 3. Flashcards Interactive Mockup */}
                {selectedFacility === 'flashcards' && (
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-slate-300">Anki-Style Active Recall Card #428</span>
                      <button 
                        onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                        className="text-xs font-semibold text-brand-400 flex items-center gap-1 hover:text-brand-300"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Flip Card</span>
                      </button>
                    </div>

                    <div 
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className="bg-slate-950 p-6 rounded-xl border border-slate-800 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-brand-500/50"
                    >
                      {!flashcardFlipped ? (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Question Prompt</span>
                          <p className="text-sm font-semibold text-slate-100">
                            What is the mechanism of action and primary clinical toxicity of Bleomycin?
                          </p>
                          <span className="text-xs text-slate-500 block pt-2">Click or tap anywhere to reveal answer</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Correct Clinical Answer</span>
                          <p className="text-sm font-semibold text-emerald-200">
                            Induces free radicals → DNA strand breaks.<br/>
                            <span className="font-bold text-amber-300">Toxicity: Pulmonary fibrosis & hyperpigmentation.</span>
                          </p>
                          <span className="text-xs text-slate-500 block pt-1">Next review interval: 4 days (SRS)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center gap-2 pt-1">
                      <span className="px-3 py-1 bg-red-950/60 text-red-300 border border-red-800/50 rounded text-xs font-medium">Again (1d)</span>
                      <span className="px-3 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/50 rounded text-xs font-medium">Good (4d)</span>
                      <span className="px-3 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 rounded text-xs font-medium">Easy (7d)</span>
                    </div>
                  </div>
                )}

                {/* 4. Live Sessions Mockup */}
                {selectedFacility === 'live-sessions' && (
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Next Live Grand Round</span>
                      </div>
                      <span className="text-xs text-slate-400">Today @ 8:00 PM IST</span>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <h5 className="text-sm font-bold text-slate-100">
                        Emergency Medicine: Acute Chest Pain & STEMI Management
                      </h5>
                      <p className="text-xs text-slate-400">
                        Interactive ECG interpretation with Dr. Siddharth V. (Senior Consultant Interventional Cardiologist)
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        <span>👥 320 Doctors Registered</span>
                        <span>⏱ 75 mins</span>
                      </div>
                    </div>

                    <button className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors">
                      Reserve Demo Seat
                    </button>
                  </div>
                )}

                {/* 5. Test Series Mockup */}
                {selectedFacility === 'test-series' && (
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-slate-200">National Grand Test #07 Analytics</span>
                      <span className="text-xs font-bold text-emerald-400">Score: 684/800</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">National Percentile:</span>
                        <span className="font-extrabold text-brand-400 text-base">99.2%ile</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Pathology & Pharmacology</span>
                          <span className="text-emerald-400 font-bold">94% Correct</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[94%]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Obstetrics & Gynaecology</span>
                          <span className="text-brand-400 font-bold">88% Correct</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 w-[88%]" />
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 text-center">
                      AI weakness analysis automatically generates personalized revision tests
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
