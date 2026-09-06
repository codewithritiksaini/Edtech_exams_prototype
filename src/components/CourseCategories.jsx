import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Star, 
  Sparkles, 
  Globe2, 
  GraduationCap, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { examCategories } from '../data/mockData';

export default function CourseCategories() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Exams (4)' },
    { id: 'neet-pg', label: '🇮🇳 NEET PG' },
    { id: 'usmle', label: '🇺🇸 USMLE' },
    { id: 'plab', label: '🇬🇧 PLAB / UKMLA' },
    { id: 'europe', label: '🇪🇺 Europe' },
  ];

  const filteredCategories = selectedFilter === 'all' 
    ? examCategories 
    : examCategories.filter(cat => cat.id === selectedFilter);

  const handleSelectExam = (examId) => {
    navigate(`/packages/${examId}`);
  };

  return (
    <section id="courses" className="py-20 bg-slate-50 relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100/80 text-brand-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Globe2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Global Medical Licensing Pathways</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Exam
          </h2>
          
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Select your target licensing destination to explore tailored curriculum roadmaps, 
            clinical question banks, and faculty-led packages.
          </p>

          {/* Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {filterOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                  selectedFilter === option.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Course Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {filteredCategories.map((exam) => (
            <div
              key={exam.id}
              className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                exam.popular 
                  ? 'border-brand-300 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/20' 
                  : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-card-hover'
              }`}
            >
              
              {/* Popular / Recommended Badge */}
              {exam.popular && (
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-bold py-1 px-3 text-center flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>MOST ENROLLED COURSE</span>
                </div>
              )}

              {/* Top Card Content */}
              <div className="p-6">
                
                {/* Flag & Region Indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={exam.country}>
                      {exam.flag}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      {exam.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{exam.rating}</span>
                  </div>
                </div>

                {/* Exam Name */}
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {exam.name}
                </h3>

                {/* Tag / Accreditation info */}
                <p className="text-xs font-semibold text-brand-700 mt-1">
                  {exam.tag}
                </p>

                {/* 1-Line Short Description */}
                <p className="mt-3 text-sm text-slate-600 leading-relaxed min-h-[40px]">
                  {exam.description}
                </p>

                {/* Divider */}
                <div className="my-5 border-t border-slate-100" />

                {/* 3 Key Highlights / Bullet Points */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Program Highlights:
                  </div>
                  {exam.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-[13px] text-slate-700 font-medium leading-snug">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Card Footer with Starting Price & CTA */}
              <div className="p-6 pt-4 bg-slate-50/70 border-t border-slate-100 mt-auto">
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Starting at</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-slate-900 font-sans">
                          {exam.startingPrice}
                        </span>
                        {exam.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {exam.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    {exam.discount && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        {exam.discount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {exam.studentsEnrolled} candidates active
                  </p>
                </div>

                {/* "View Packages" Button (Phase 2 Link) */}
                <button
                  onClick={() => handleSelectExam(exam.id)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn ${
                    exam.popular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 active:scale-98'
                      : 'bg-white hover:bg-brand-600 text-slate-800 hover:text-white border border-slate-300 hover:border-brand-600 shadow-sm active:scale-98'
                  }`}
                >
                  <span>View Packages</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>

              </div>

            </div>
          ))}
        </div>

        {/* Comparison reassurance banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Unsure which pathway fits your career goals?
              </h4>
              <p className="text-sm text-slate-600">
                Speak directly with an IMG academic counselor for a free country eligibility & timeline audit.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/packages/neet-pg')}
            className="shrink-0 px-5 py-2.5 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors flex items-center gap-2"
          >
            <span>Compare All Packages</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </section>
  );
}
