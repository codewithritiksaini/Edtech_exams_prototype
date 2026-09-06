import React from 'react';
import { Star, Quote, ShieldCheck, Award } from 'lucide-react';
import { testimonials } from '../data/mockData';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Proven Track Record</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Our Students Say
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Hear from international medical graduates and resident physicians who achieved their dream scores.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="bg-slate-50 rounded-2xl p-7 border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                
                {/* Rating & Exam Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center text-amber-400 gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-white rounded-md border border-slate-200 text-slate-700">
                    {review.exam}
                  </span>
                </div>

                {/* Quote text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-6">
                  "{review.quote}"
                </p>
              </div>

              {/* Student Bio */}
              <div className="pt-4 border-t border-slate-200/70 flex items-center gap-3.5">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">
                      {review.name}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Candidate" />
                  </div>
                  <p className="text-xs font-semibold text-brand-700">
                    {review.role}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {review.college}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
