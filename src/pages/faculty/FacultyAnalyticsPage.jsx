import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Star, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Brain,
  Video
} from 'lucide-react';

export default function FacultyAnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Teaching Analytics
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              Department Performance
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Curriculum & Retention Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Inspect candidate retention across Cardiology modules, video completion drop-offs, and active recall mastery scores.
          </p>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Grand Test Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">74.2%</div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+4.2% from previous cohort</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Flashcard Recall Rate</span>
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">88.6%</div>
          <span className="text-xs text-slate-500 font-medium">Avg review interval: 4.2 days</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Live Grand Round Attendance</span>
            <Video className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">91.4%</div>
          <span className="text-xs text-indigo-600 font-medium">Over 380 doctors per clinic</span>
        </div>
      </div>

      {/* Topic Accuracy Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-black text-slate-900">Subject Accuracy & Mastery Breakdown</h3>
          <p className="text-xs text-slate-500">Candidate comprehension rate per chapter in Cardiology & Hemodynamics</p>
        </div>

        <div className="space-y-4">
          {[
            { topic: 'Atrial Fibrillation & Anticoagulation (CHA2DS2-VASc)', accuracy: 88, cohort: '1,380 Doctors Tested' },
            { topic: 'Monomorphic vs Polymorphic Ventricular Tachycardia', accuracy: 82, cohort: '1,290 Doctors Tested' },
            { topic: 'Heart Failure with Reduced Ejection Fraction (HFrEF - 4 Pillars)', accuracy: 79, cohort: '1,410 Doctors Tested' },
            { topic: 'Aortic Stenosis: Classical Triad & TAVR Indications', accuracy: 74, cohort: '1,150 Doctors Tested' },
            { topic: 'AV Blocks: Mobitz Type I vs Mobitz Type II & Pacemaker Criteria', accuracy: 89, cohort: '1,340 Doctors Tested' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{item.topic}</span>
                <span className="font-black text-indigo-600">{item.accuracy}% Accuracy</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">{item.cohort}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
