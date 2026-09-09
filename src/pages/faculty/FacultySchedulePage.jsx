import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileText,
  UploadCloud
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

export default function FacultySchedulePage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();

  const [exams] = useState(() => catalogService.getExams());
  const [currentExam, setCurrentExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [selectedWeek, setSelectedWeek] = useState(1);

  // 4 Weeks / 28 Days Teaching Schedule with Faculty Assignments
  const weeksData = [
    {
      weekNumber: 1,
      title: 'Week 1: Cardiology & Hemodynamics',
      specialty: 'Cardiology (Your Specialty)',
      assignedToMe: true,
      days: [
        { day: 1, title: 'Valvular Heart Diseases & Murmurs', type: 'Clinical Theory & Echo', live: false, assigned: true, status: 'Released' },
        { day: 2, title: 'Heart Failure & Guideline Pharmacotherapy', type: '4 Pillars of HFrEF', live: false, assigned: true, status: 'Released' },
        { day: 3, title: 'Cardiac Arrhythmias & ECG Interpretation', type: 'Brugada / Vereckei', live: true, liveTime: '8:00 PM Tonight', assigned: true, status: 'Live Tonight' },
        { day: 4, title: 'Acute Coronary Syndromes (STEMI / NSTEMI)', type: 'PCI vs Thrombolysis', live: false, assigned: true, status: 'Scheduled' },
        { day: 5, title: 'Congenital Heart Defects & Shunts', type: 'Cyanotic vs Acyanotic', live: false, assigned: true, status: 'Scheduled' },
        { day: 6, title: 'Active Recall Spaced Repetition Sprint', type: '120 Flashcards Deck', live: false, assigned: true, status: 'Drafting' },
        { day: 7, title: 'Cardiology Subject Grand Mock Test', type: 'CBT 100 Marks (NEET Pattern)', live: false, assigned: true, status: 'Scheduled' },
      ]
    },
    {
      weekNumber: 2,
      title: 'Week 2: Respiratory Medicine & Pulmonology',
      specialty: 'Pulmonology Lead',
      assignedToMe: false,
      days: [
        { day: 8, title: 'COPD & Asthma Guidelines (GOLD / GINA)', type: 'Spirometry Patterns', live: false, assigned: false, status: 'Upcoming' },
        { day: 9, title: 'Interstitial Lung Diseases & Sarcoidosis', type: 'HRCT Interpretation', live: false, assigned: false, status: 'Upcoming' },
        { day: 10, title: 'Pneumonia & Pulmonary Tuberculosis', type: 'DOTS / NTEP Regimens', live: true, liveTime: '8:00 PM', assigned: false, status: 'Upcoming' },
        { day: 11, title: 'Pulmonary Embolism & DVT', type: 'Wells Score & CTPA', live: false, assigned: false, status: 'Upcoming' },
        { day: 12, title: 'Pleural Diseases: Effusion & Pneumothorax', type: 'Light Criteria', live: false, assigned: false, status: 'Upcoming' },
        { day: 13, title: 'Chest X-Ray & Arterial Blood Gas Workshop', type: 'ABG Stepwise Algorithm', live: false, assigned: false, status: 'Upcoming' },
        { day: 14, title: 'Respiratory Grand CBT Assessment', type: 'CBT 100 Marks', live: false, assigned: false, status: 'Upcoming' },
      ]
    },
    {
      weekNumber: 3,
      title: 'Week 3: Nephrology & Fluid-Electrolyte Disorders',
      specialty: 'Nephrology Lead',
      assignedToMe: false,
      days: [
        { day: 15, title: 'Acute Kidney Injury (KDIGO Criteria)', type: 'Pre-Renal vs ATN', live: false, assigned: false, status: 'Upcoming' },
        { day: 16, title: 'Glomerular Diseases: Nephrotic vs Nephritic', type: 'Biopsy Pathology', live: false, assigned: false, status: 'Upcoming' },
        { day: 17, title: 'Hyponatremia & Potassium Disorders', type: 'Emergency Protocols', live: true, liveTime: '8:00 PM', assigned: false, status: 'Upcoming' },
        { day: 18, title: 'Acid-Base Balance: Anion Gap Metabolic Acidosis', type: 'Winters Formula', live: false, assigned: false, status: 'Upcoming' },
        { day: 19, title: 'Chronic Kidney Disease & Dialysis', type: 'Calcium-Phosphate Axis', live: false, assigned: false, status: 'Upcoming' },
        { day: 20, title: 'Urinary Sediment Mastery & Case Vignettes', type: 'Microscopy Lightbox', live: false, assigned: false, status: 'Upcoming' },
        { day: 21, title: 'Nephrology Grand CBT Assessment', type: 'CBT 100 Marks', live: false, assigned: false, status: 'Upcoming' },
      ]
    },
    {
      weekNumber: 4,
      title: 'Week 4: Gastroenterology & Hepatology',
      specialty: 'GI & Hepatology Lead',
      assignedToMe: false,
      days: [
        { day: 22, title: 'Cirrhosis, Portal Hypertension & Ascites', type: 'SAAG Calculation', live: false, assigned: false, status: 'Upcoming' },
        { day: 23, title: 'Acute Pancreatitis & Biliary Emergencies', type: 'Ransons Score', live: false, assigned: false, status: 'Upcoming' },
        { day: 24, title: 'Viral Hepatitis (Serology Interpretation)', type: 'HBsAg, Anti-HBc Panel', live: true, liveTime: '8:00 PM', assigned: false, status: 'Upcoming' },
        { day: 25, title: 'Inflammatory Bowel Disease (Crohns vs UC)', type: 'Biologics & Endoscopy', live: false, assigned: false, status: 'Upcoming' },
        { day: 26, title: 'Peptic Ulcer Disease & GI Bleeding', type: 'Rockall & Blatchford', live: false, assigned: false, status: 'Upcoming' },
        { day: 27, title: 'GI Pathology & Endoscopy Lightbox Case Studies', type: 'Image Quiz', live: false, assigned: false, status: 'Upcoming' },
        { day: 28, title: 'Gastroenterology Grand CBT Assessment', type: 'CBT 100 Marks', live: false, assigned: false, status: 'Upcoming' },
      ]
    }
  ];

  const currentWeekData = weeksData.find(w => w.weekNumber === selectedWeek) || weeksData[0];

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Exam Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exams.map((ex) => {
          const isCurrent = ex.id === examId;
          return (
            <button
              key={ex.id}
              onClick={() => {
                navigate(`/faculty/schedule/${ex.id}`);
                setCurrentExam(ex);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-white text-indigo-700 border-indigo-300 shadow-sm ring-2 ring-indigo-500/10'
                  : 'bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span className="text-base">{ex.flag}</span>
              <span>{ex.name}</span>
            </button>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Teaching Timetable
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              4-Week Curriculum Drip
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentExam.name} — Teaching Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            View scheduled live clinics, content releases, and mock examinations across the 28-day curriculum cycle.
          </p>
        </div>

        {/* Quick Upload Button */}
        <Link
          to="/faculty/upload"
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload for Day Slot</span>
        </Link>
      </div>

      {/* Week Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {weeksData.map((wk) => {
          const isSelected = selectedWeek === wk.weekNumber;
          return (
            <button
              key={wk.weekNumber}
              onClick={() => setSelectedWeek(wk.weekNumber)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase">
                <span className={isSelected ? 'text-indigo-200' : 'text-slate-400'}>
                  Week {wk.weekNumber}
                </span>
                {wk.assignedToMe && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    Your Dept
                  </span>
                )}
              </div>
              <div className="text-xs font-black mt-1 line-clamp-1">
                {wk.title.replace(`Week ${wk.weekNumber}: `, '')}
              </div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                7 Daily Learning Modules
              </div>
            </button>
          );
        })}
      </div>

      {/* Days Table / Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {currentWeekData.title}
            </h2>
            <p className="text-xs text-slate-500">
              Department Specialty: <span className="font-bold text-slate-700">{currentWeekData.specialty}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {currentWeekData.days.map((d) => (
            <div
              key={d.day}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 group ${
                d.live
                  ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-indigo-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg">
                    Day #{d.day}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {d.live && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        <span>{d.liveTime || 'Live Clinic'}</span>
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'Released'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'Live Tonight'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{d.type}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {d.assigned ? 'Faculty Lead: Dr. Sarah Jenkins' : 'Specialist Assigned'}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/day/${d.day}`}
                    target="_blank"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>LMS View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
