import React, { useState } from 'react';
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Download, 
  FileText, 
  Sparkles, 
  User, 
  Layers, 
  ExternalLink,
  Minimize2
} from 'lucide-react';

export default function PptViewer({ pptData }) {
  const defaultSlides = [
    {
      slideNumber: 1,
      title: 'Clinical Case Presentation: Severe Symptomatic Aortic Stenosis',
      bullets: [
        'Patient Profile: 72-year-old male with exertional syncope and dyspnea',
        'Physical Exam: Harsh crescendo-decrescendo systolic murmur at RUSB with radiation to carotids',
        'Parvus et tardus pulse contour noted on palpation',
        'Electrocardiogram: Left ventricular hypertrophy with lateral repolarization strain'
      ],
      keyNotes: 'Key Exam Trap: In severe low-flow low-gradient aortic stenosis, murmur intensity may paradoxically diminish due to severely reduced stroke volume.'
    },
    {
      slideNumber: 2,
      title: 'Hemodynamic Assessment: Gorlin Equation & Doppler Profiles',
      bullets: [
        'Continuous-Wave Doppler: Peak Aortic Jet Velocity = 4.6 m/s (Threshold > 4.0 m/s)',
        'Mean Transvalvular Gradient = 48 mmHg (Severe threshold > 40 mmHg)',
        'Calculated Aortic Valve Area (AVA) by continuity equation = 0.65 cm² (Severe threshold < 1.0 cm²)',
        'Indexed AVA = 0.38 cm²/m² (Severe < 0.6 cm²/m²)'
      ],
      keyNotes: 'Continuity equation relies on Conservation of Mass: Area(LVOT) × VTI(LVOT) = Area(AV) × VTI(AV).'
    },
    {
      slideNumber: 3,
      title: 'Intervention Decision Algorithm: SAVR vs TAVR (ACC/AHA 2024)',
      bullets: [
        'Age > 65 with transfemoral candidacy favors TAVR',
        'STS-PROM Risk Score: 3.4% (Intermediate-to-Low Surgical Risk)',
        'Multi-disciplinary Heart Team consensus: Transfemoral TAVR with balloon-expandable valve',
        'Coronary height > 12 mm; low risk of acute coronary ostial occlusion'
      ],
      keyNotes: 'TAVR requires rigorous pre-procedural MDCT to evaluate annular dimensions, calcification burden, and peripheral vascular access caliber.'
    },
    {
      slideNumber: 4,
      title: 'Post-Procedural Management & High-Yield Examination Pearls',
      bullets: [
        'Monitor for conduction abnormalities: Complete Heart Block incidence 8-12%',
        'Antithrombotic therapy: Single antiplatelet therapy (Aspirin 81 mg) in absence of OAC indication',
        'Infective endocarditis prophylaxis required for dental procedures involving gingival manipulation',
        'Serial echocardiogram at 30 days and 1 year to ensure prosthetic valve stability'
      ],
      keyNotes: 'Membranous ventricular septum length predicts permanent pacemaker dependency after balloon-expandable valve deployment.'
    }
  ];

  const slides = pptData?.slides && pptData.slides.length > 0 ? pptData.slides : defaultSlides;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const totalSlides = pptData?.slide_count || pptData?.slideCount || slides.length;

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto' : ''}`}>
      
      {/* PPT Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
        isFullscreen 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold truncate max-w-md">
              {pptData?.title || 'Clinical Slide Presentation Deck'}
            </h4>
            <p className="text-xs text-slate-500">
              {pptData?.file_name || pptData?.fileName || 'Presentation_Deck.pptx'} • {totalSlides} Slides • {pptData?.presenter || 'Specialist Faculty'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = pptData?.ppt_url || '#';
              link.download = pptData?.file_name || 'Clinical_Deck.pptx';
              alert('Downloading presentation deck (.pptx)...');
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Download PPT</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Slide Canvas Display */}
      <div className={`relative rounded-3xl border transition-all overflow-hidden shadow-sm flex flex-col justify-between ${
        isFullscreen 
          ? 'bg-slate-900 border-slate-800 text-white min-h-[480px] flex-grow p-8' 
          : 'bg-white border-slate-200 min-h-[380px] p-6 sm:p-8'
      }`}>
        
        {/* Slide Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 tracking-wider">
              Slide {currentSlide.slideNumber || currentSlideIndex + 1} of {slides.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Cardiology Residency Grand Rounds
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            MedPrep Pro SlideViewer™
          </span>
        </div>

        {/* Slide Core Content */}
        <div className="my-6 space-y-4 max-w-3xl">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h3>

          {currentSlide.bullets ? (
            <ul className="space-y-2.5 mt-4">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentSlide.keyNotes}
            </p>
          )}
        </div>

        {/* Presenter Speaker Notes Drawer */}
        {currentSlide.keyNotes && (
          <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Faculty Speaker Notes & High-Yield Examination Pearl:</span>
            </div>
            <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed">
              {currentSlide.keyNotes}
            </p>
          </div>
        )}

        {/* Slide Navigation Bar */}
        <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentSlideIndex > 0
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                : 'bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          {/* Quick Slide Dots / Progress */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlideIndex === idx
                    ? 'w-6 bg-amber-500'
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`Jump to Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentSlideIndex < slides.length - 1
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                : 'bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
