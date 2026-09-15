import React from 'react';
import { Calendar, Radio, FileText, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpNextTimeline({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>UP NEXT</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Upcoming Milestones Queue
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.slice(0, 5).map((item, idx) => {
          const isLive = item.type === 'live';
          const isTest = item.type === 'test';
          const isDay = item.type === 'day';

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:bg-slate-100/70 transition-colors"
            >
              <div 
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isLive 
                    ? 'bg-red-100 text-red-700' 
                    : isTest 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-brand-100 text-brand-700'
                }`}
              >
                {isLive ? (
                  <Radio className="w-4 h-4" />
                ) : isTest ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{item.when}</span>
                  <span className={`px-1.5 py-0.2 rounded font-semibold ${
                    isLive ? 'bg-red-50 text-red-700' : isTest ? 'bg-indigo-50 text-indigo-700' : 'bg-brand-50 text-brand-700'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-500 truncate">
                  {item.subtitle}
                </p>

                {item.link && (
                  <div className="pt-1">
                    <Link
                      to={item.link}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
                    >
                      <span>{item.linkText || 'Details'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
