import React from 'react';
import { 
  Play, 
  ArrowRight, 
  Star
} from 'lucide-react';

export default function HeroSection({ onWatchDemo, onExploreCourses }) {
  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-slate-50/80 via-white to-blue-50/25">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 hero-glow pointer-events-none -z-10" />
      <div className="absolute -top-24 right-10 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 -left-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 medical-grid opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-200/90 text-brand-700 text-xs sm:text-sm font-semibold shadow-xs hover:border-brand-300 transition-all cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
            </span>
            <span className="font-extrabold text-brand-800">New 2026 Curriculum Updated</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium hidden sm:inline">Clinical Vignette QBanks & Live Grand Rounds</span>
          </div>
        </div>

        {/* Main Headings */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.14]">
            Your One Platform for{' '}
            <span className="bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Every Medical Licensing Exam
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            Comprehensive clinical prep tailored for{' '}
            <span className="font-bold text-amber-600">NEET PG (India)</span>,{' '}
            <span className="font-bold text-blue-600">USMLE (USA)</span>,{' '}
            <span className="font-bold text-rose-600">PLAB / UKMLA (UK)</span>, and{' '}
            <span className="font-bold text-emerald-600">Europe Medical Exams</span>.{' '}
            Master clinical concepts with week-wise roadmaps and top specialist faculty.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreCourses}
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 active:scale-98 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onWatchDemo}
              className="w-full sm:w-auto px-7 py-4 text-base font-extrabold text-slate-800 bg-white/95 hover:bg-white border border-slate-200/90 hover:border-slate-300 active:scale-98 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer backdrop-blur-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span>Watch Platform Demo</span>
            </button>
          </div>

          {/* Trust-Indicator Banner */}
          <div className="mt-14 max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-slate-900 font-extrabold text-2xl sm:text-3xl">
                  <span>10,000+</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Students Enrolled</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-2xl sm:text-3xl">
                  <span>4</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Global Exam Categories</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-2xl sm:text-3xl">
                  <span>98.4%</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">First-Attempt Pass Rate</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-2xl sm:text-3xl">
                  <span>50+</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Specialist MD Faculty</span>
              </div>

            </div>

            {/* Social proof avatar row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-600">
              <div className="flex -space-x-2">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1594824813689-13e64883395b?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80" alt="Student" />
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-slate-900 ml-1">4.9/5</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="font-medium text-slate-600">Trusted by aspirants from 24+ countries</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
