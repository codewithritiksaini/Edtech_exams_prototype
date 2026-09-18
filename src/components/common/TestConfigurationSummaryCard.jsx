import React from 'react';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  Sliders, 
  Cpu, 
  Clock, 
  Award, 
  Compass, 
  BookOpen, 
  Globe, 
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { questionTypeService } from '../../services/questionTypeService.js';
import { getTestTypeLabel } from '../../services/adminTestService.js';
import { getAssessmentMethodLabel, getAssessmentMethodBadgeClass } from '../../services/assessmentMethodService.js';

export default function TestConfigurationSummaryCard({ test, exam, questions = [] }) {
  if (!test) return null;

  // Breakdown questions by type and difficulty
  const typeStats = {};
  const diffStats = { easy: 0, medium: 0, hard: 0 };

  questions.forEach(q => {
    const t = q.type || 'single-best-answer';
    typeStats[t] = (typeStats[t] || 0) + 1;

    const d = (q.difficulty || 'medium').toLowerCase();
    if (diffStats[d] !== undefined) {
      diffStats[d]++;
    } else {
      diffStats.medium++;
    }
  });

  const structure = test.structure || {};
  const units = structure.units || [];
  const rules = test.rules || {};
  const scoring = rules.scoring || { correct: test.marksPerCorrect || 4, incorrect: test.marksPerIncorrect || -1 };
  const timing = rules.timing || { mode: 'TOTAL_TIME', durationMinutes: test.durationMinutes || 60 };
  const navigation = rules.navigation || { mode: 'FREE' };
  const build = test.build || {};

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            Full Specification Review
          </span>
          <h3 className="text-base font-black text-slate-900 mt-1">
            Test Configuration Blueprint
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            {test.code}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
            {getTestTypeLabel(test.testType)}
          </span>
          {test.assessmentMethod && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getAssessmentMethodBadgeClass(test.assessmentMethod)}`}>
              {getAssessmentMethodLabel(test.assessmentMethod)}
            </span>
          )}
        </div>
      </div>

      {/* 4-Card Multi-Dimensional Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Foundation */}
        <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>1. Foundation</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Associated Exam</span>
              <strong className="text-slate-900 font-bold">{exam?.name || test.examId}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Assessment Method</span>
              <span className="font-bold text-slate-800">
                {test.assessmentMethod ? getAssessmentMethodLabel(test.assessmentMethod) : <span className="text-slate-400 font-normal italic">Unspecified</span>}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Duration</span>
              <span className="font-medium text-slate-800">{test.durationMinutes || test.targetDuration || 60} Minutes</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Primary Language</span>
              <span className="font-medium text-slate-800">{test.language || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Structure */}
        <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>2. Structure</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Container Mode</span>
              <strong className="text-slate-900 font-bold">
                {structure.mode === 'MULTI_UNIT' ? 'Multi-Section' : 'Single Section'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Active Units</span>
              <span className="font-medium text-slate-800">{units.length} Section(s)</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {units.map(u => u.name || u.title).slice(0, 2).join(', ')}
              {units.length > 2 ? ` +${units.length - 2} more` : ''}
            </div>
          </div>
        </div>

        {/* Card 3: Rules & Scoring */}
        <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>4. Rules</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Scoring Formula</span>
              <strong className="text-slate-900 font-bold">
                +{scoring.correct || 4} / {scoring.incorrect !== undefined ? scoring.incorrect : -1} Marks
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Timing Strategy</span>
              <span className="font-medium text-slate-800">
                {timing.mode === 'PER_SECTION' ? 'Per-Section Timers' : 'Overall Countdown'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Navigation</span>
              <span className="font-medium text-slate-800">
                {navigation.mode === 'LINEAR' ? 'Strict Linear Sequence' : 'Free Section Jump'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Build & Inventory */}
        <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-900 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span>5. Build Status</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Build Mode</span>
              <strong className="text-slate-900 font-bold">
                {build.mode === 'BLUEPRINT' ? 'Blueprint Auto-Generated' : 'Manual Question Assembly'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total Assembled</span>
              <span className="text-base font-black text-cyan-950">{questions.length} Items</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {build.generatedAt ? `Built ${new Date(build.generatedAt).toLocaleDateString()}` : 'Live in-memory'}
            </div>
          </div>
        </div>
      </div>

      {/* Content Question Bank Analytics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* By Question Type */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Distribution By Question Type
            </span>
            <span className="font-semibold text-slate-500">{Object.keys(typeStats).length} Format(s)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeStats).map(([tId, count]) => {
              const def = questionTypeService.getQuestionTypeById(tId);
              return (
                <div 
                  key={tId}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs"
                >
                  <span className="font-bold text-slate-800">{def?.name || tId}:</span>
                  <span className="font-black text-indigo-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Difficulty */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Difficulty Distribution
            </span>
            <span className="font-semibold text-slate-500">100% Calibrated</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/70">
              <span className="text-[10px] uppercase font-bold block">Easy</span>
              <strong className="text-sm font-black">{diffStats.easy}</strong>
            </div>
            <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/70">
              <span className="text-[10px] uppercase font-bold block">Medium</span>
              <strong className="text-sm font-black">{diffStats.medium}</strong>
            </div>
            <div className="p-2 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/70">
              <span className="text-[10px] uppercase font-bold block">Hard</span>
              <strong className="text-sm font-black">{diffStats.hard}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
