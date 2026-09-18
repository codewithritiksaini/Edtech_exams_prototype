import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Globe, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  FolderTree, 
  Info,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { getExamPattern } from '../../services/examPatternHelper.js';

export default function ExamPatternPreview({ examId, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState('stages'); // 'stages' | 'subjects'

  if (!examId) return null;

  const pattern = getExamPattern(examId);
  if (!pattern) return null;

  const { exam, stages, subjects, capabilities } = pattern;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
              Exam Pattern & Curriculum
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {exam.code}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            {exam.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
            {exam.examStructure || exam.fullName}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="text-right hidden sm:block text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Country & Authority</span>
            <span className="text-slate-200 font-semibold">{exam.country} • {exam.authority}</span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors border border-white/10 shadow-sm"
          >
            {expanded ? (
              <><span>Hide Pattern</span><ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <><span>Inspect Pattern</span><ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Sub-tabs: Stages vs Subjects */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('stages')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'stages'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Exam Stages ({stages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subjects')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'subjects'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                Curriculum Subjects ({subjects.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-500" />
              Source: Canonical Exam Catalog & Curriculum
            </span>
          </div>

          {/* Tab 1: Exam Stages */}
          {activeTab === 'stages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stages.length === 0 ? (
                <div className="col-span-3 text-center py-6 text-xs text-slate-400 italic">
                  No discrete stages defined for this exam track.
                </div>
              ) : (
                stages.map((st, idx) => (
                  <div 
                    key={st.id} 
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-indigo-200 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Stage {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {st.id}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {st.name}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {st.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Curriculum Subjects */}
          {activeTab === 'subjects' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.length === 0 ? (
                <div className="col-span-3 text-center py-6 text-xs text-slate-400 italic">
                  No subjects associated with this exam track yet.
                </div>
              ) : (
                subjects.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-indigo-200 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {sub.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 ml-2">
                        {sub.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {sub.description || 'Curriculum subject for assessment scoping.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Educational Callout */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-[11px] text-indigo-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Test Structure Context: </span>
              In Phase 2, you can map your Test sections, blocks, or phases directly to an <strong>Exam Stage</strong> (e.g. Step 1 / Clinical Specialties) or a <strong>Curriculum Subject</strong> (e.g. Cardiology & Hemodynamics). This allows future question blueprinting and scoring rules to strictly follow the medical track.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
