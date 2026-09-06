import React, { useState } from 'react';
import { 
  Stethoscope, 
  PackageCheck, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { howItWorksSteps } from '../data/mockData';

export default function HowItWorks({ onExploreCourses }) {
  const [activeStep, setActiveStep] = useState(0);

  const getStepIcon = (iconName) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6" />;
      case 'PackageCheck':
        return <PackageCheck className="w-6 h-6" />;
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <CheckCircle2 className="w-6 h-6" />;
    }
  };

  return (
    <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Structured Path to Success</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-600">
            A frictionless, streamlined journey from zero prep to passing your medical licensing exam on day one.
          </p>
        </div>

        {/* 4-Step Process Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Subtle connecting line across cards on desktop */}
          <div className="hidden lg:block absolute top-1/3 left-12 right-12 h-0.5 bg-slate-200 -z-0" />

          {howItWorksSteps.map((item, index) => {
            const isSelected = activeStep === index;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={`relative z-10 bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'border-brand-500 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/20 translate-y-[-4px]'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-600'
                    }`}>
                      {getStepIcon(item.icon)}
                    </div>
                    <span className="text-3xl font-extrabold text-slate-200 font-sans group-hover:text-brand-200 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Sub-bullet points */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {item.bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* Interactive Step Spotlight Preview */}
        <div className="mt-12 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Step Spotlight: {howItWorksSteps[activeStep].step} — {howItWorksSteps[activeStep].title}
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-white">
                {activeStep === 0 && "Select your exam to unlock personalized question banks."}
                {activeStep === 1 && "Select the plan that matches your study timeline (6 to 24 mos)."}
                {activeStep === 2 && "Get immediate access to your tailored study calendar & tests."}
                {activeStep === 3 && "Daily 45-minute high-yield modules, Anki flashcards & live faculty cases."}
              </h4>
              <p className="text-sm text-slate-300">
                {howItWorksSteps[activeStep].description}
              </p>
            </div>

            <button
              onClick={onExploreCourses}
              className="shrink-0 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/30 flex items-center gap-2"
            >
              <span>Start with Step 1</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
