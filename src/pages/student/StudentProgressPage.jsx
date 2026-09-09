import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Flame, 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function StudentProgressPage() {
  const navigate = useNavigate();

  const subjectAccuracies = [
    { subject: 'Cardiology & Hemodynamics', accuracy: 92, questions: 340, status: 'Strong', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { subject: 'Systemic Pathology & Neoplasia', accuracy: 84, questions: 280, status: 'Proficient', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { subject: 'Neurology & Neuroanatomy', accuracy: 71, questions: 210, status: 'Moderate', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { subject: 'Clinical Pharmacology & Pharmacokinetics', accuracy: 58, questions: 195, status: 'Needs Revision', badgeColor: 'bg-rose-50 text-rose-800 border-rose-200' },
  ];

  const weeklyHours = [
    { day: 'Mon', hours: 4.2, goal: 3.5 },
    { day: 'Tue', hours: 3.8, goal: 3.5 },
    { day: 'Wed', hours: 4.5, goal: 3.5 },
    { day: 'Thu', hours: 3.2, goal: 3.5 },
    { day: 'Fri', hours: 4.0, goal: 3.5 },
    { day: 'Sat', hours: 5.1, goal: 3.5 },
    { day: 'Sun', hours: 3.9, goal: 3.5 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Clinical Diagnostic Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Performance & Learning Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          Real-time tracking of clinical accuracy, spaced repetition retention rates, mock exam percentiles, and personalized AI weak-area diagnostics.
        </p>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Curriculum Completed</span>
          <div className="text-3xl font-black text-slate-900">32%</div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8% pace this week</span>
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Active Study Streak</span>
          <div className="text-3xl font-black text-amber-600 flex items-center gap-2">
            <span>14 Days</span>
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <span className="text-xs text-slate-500">Target: 3.5 hrs / day</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Flashcards Mastered</span>
          <div className="text-3xl font-black text-brand-600">1,420</div>
          <span className="text-xs text-brand-600 font-bold">92% Long-Term Recall</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Mock CBT Average</span>
          <div className="text-3xl font-black text-indigo-600">76.4%</div>
          <span className="text-xs text-indigo-600 font-bold">Top 8% National Rank</span>
        </div>
      </div>

      {/* Subject Accuracy Matrix & Weekly Hours Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject Accuracy Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Subject Accuracy Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Based on 1,025 Q-Bank & drill vignette attempts</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Target: &ge;80%</span>
          </div>

          <div className="space-y-5">
            {subjectAccuracies.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{item.subject}</span>
                    <span className="text-slate-400 text-[11px]">{item.questions} Questions Attempted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.status}
                    </span>
                    <span className="font-black text-slate-900 text-sm">{item.accuracy}%</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.accuracy >= 80 ? 'bg-emerald-500' : item.accuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need revision in Clinical Pharmacology?</span>
            <button
              onClick={() => navigate('/student/courses')}
              className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Practice Pharmacology Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekly Study Hours Activity (1 col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Study Hours This Week</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total: 28.7 hrs • Average: 4.1 hrs/day</p>
            </div>

            {/* Simple CSS Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2">
              {weeklyHours.map((wh, i) => {
                const heightPct = Math.min(100, Math.round((wh.hours / 6) * 100));
                const isTargetMet = wh.hours >= wh.goal;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                      {wh.hours}h
                    </span>
                    <div 
                      className={`w-full rounded-xl transition-all ${
                        isTargetMet ? 'bg-brand-600 group-hover:bg-brand-500' : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{wh.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Goal: 24.5 hrs / week</span>
              <span className="text-emerald-600">Goal Exceeded!</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Consistent pace improves active recall retention by 3.2x compared to last-minute cramming.
            </p>
          </div>
        </div>

      </div>

      {/* AI High-Yield Diagnostic Recommendations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Personalized High-Yield Recommendations</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <span className="font-bold text-amber-900 block text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pharmacology Alert
            </span>
            <p className="text-slate-600 leading-relaxed">
              Review Vaughan-Williams Class I-IV antiarrhythmic agents before tomorrow's live class. Accuracy dropped to 58% on Na+ channel blockers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <span className="font-bold text-emerald-900 block text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cardiology Mastery
            </span>
            <p className="text-slate-600 leading-relaxed">
              Scored 94% on Valvular Murmurs! Excellent clinical comprehension of phonocardiograms, radiation patterns, and dynamic maneuvers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
            <span className="font-bold text-indigo-900 block text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Mock Readiness
            </span>
            <p className="text-slate-600 leading-relaxed">
              On track for Sunday's Grand Mock CBT. Complete the Day 3 ECG Arrhythmias Drill today to ensure full Week 1 syllabus readiness.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
