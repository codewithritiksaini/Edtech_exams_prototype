import React from 'react';
import { 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Award, 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  BookOpenCheck,
  Sparkles
} from 'lucide-react';

export default function HeroSection({ onWatchDemo, onExploreCourses }) {
  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-white via-blue-50/30 to-slate-50">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 hero-glow pointer-events-none -z-10" />
      <div className="absolute -top-24 right-10 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 -left-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs sm:text-sm font-semibold shadow-sm hover:bg-brand-100/70 transition-all cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-ping" />
            <span className="font-bold">New 2026 Curriculum Updated</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium hidden sm:inline">Clinical Vignette QBanks & Live Grand Rounds</span>
          </div>
        </div>

        {/* Main Headings */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Your One Platform for{' '}
            <span className="text-gradient">Every Medical Licensing Exam</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            Comprehensive clinical prep tailored for{' '}
            <span className="font-semibold text-slate-900 underline decoration-brand-400 decoration-2 underline-offset-4">NEET PG (India)</span>,{' '}
            <span className="font-semibold text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-4">USMLE (USA)</span>,{' '}
            <span className="font-semibold text-slate-900 underline decoration-red-400 decoration-2 underline-offset-4">PLAB / UKMLA (UK)</span>, and{' '}
            <span className="font-semibold text-slate-900 underline decoration-emerald-400 decoration-2 underline-offset-4">Europe Medical Exams</span>. 
            Master clinical concepts with week-wise roadmaps and top specialist faculty.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreCourses}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-98 rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onWatchDemo}
              className="w-full sm:w-auto px-7 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 active:scale-98 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span>Watch Platform Demo</span>
            </button>
          </div>

          {/* Trust-Indicator Banner */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-2xl sm:text-3xl">
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
