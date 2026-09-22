import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Layers, 
  Sparkles,
  RefreshCw, 
  Info,
  Plus,
  UploadCloud
} from 'lucide-react';
import { BLUEPRINT_MODES } from '../../services/testRulesService.js';
import { generateQuestionsFromBlueprint } from '../../services/testBuildService.js';
import ManualQuestionModal from './ManualQuestionModal.jsx';
import UploadQuestionsModal from './UploadQuestionsModal.jsx';

export default function BlueprintBuildPanel({
  test,
  eligibleQuestions = [],
  role = 'admin',
  requestingFaculty = null,
  isLocked = false,
  onGenerationSuccess,
  onDeficitQuestionsAdded
}) {
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deficitTargetSubject, setDeficitTargetSubject] = useState('');
  const blueprint = test.rules?.blueprint || {
    mode: BLUEPRINT_MODES.WEIGHTED,
    subjectDistribution: []
  };

  const totalTarget = Number(test.targetQuestions) || Number(test.totalQuestions) || 20;

  // Group eligible questions by subject
  const subjectInventory = useMemo(() => {
    const map = new Map();
    eligibleQuestions.forEach(q => {
      const s = (q.metadata?.subject || 'General').trim();
      map.set(s, (map.get(s) || 0) + 1);
    });
    return map;
  }, [eligibleQuestions]);

  // Derive subjects to display: from blueprint subjectDistribution or from available subjects in exam
  const subjectRows = useMemo(() => {
    const rows = [];
    const configured = blueprint.subjectDistribution || [];

    if (configured.length > 0) {
      configured.forEach(c => {
        const name = (c.subjectName || c.subjectId || '').trim();
        let available = 0;
        for (const [subjName, count] of subjectInventory.entries()) {
          if (subjName.toLowerCase() === name.toLowerCase() ||
              subjName.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(subjName.toLowerCase())) {
            available += count;
          }
        }
        const required = Number(c.targetCount) || 0;
        const shortfall = Math.max(0, required - available);
        rows.push({
          subjectId: c.subjectId || name,
          name,
          required,
          available,
          shortfall,
          sufficient: available >= required
        });
      });
    } else {
      // If no explicit subject distribution, list unique subjects present in bank
      for (const [subjName, count] of subjectInventory.entries()) {
        rows.push({
          subjectId: subjName,
          name: subjName,
          required: 'Auto (Weighted)',
          available: count,
          shortfall: 0,
          sufficient: true
        });
      }
    }
    return rows;
  }, [blueprint, subjectInventory]);

  const [generationError, setGenerationError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationError(null);

    setTimeout(() => {
      try {
        const result = generateQuestionsFromBlueprint({
          test,
          questions: eligibleQuestions,
          blueprint,
          role,
          requestingFaculty
        });

        if (result.success) {
          onGenerationSuccess(result);
        } else {
          setGenerationError(result.errors || [{ message: 'Generation could not be satisfied.' }]);
        }
      } catch (err) {
        setGenerationError([{ message: err.message || 'Generation failed unexpectedly.' }]);
      } finally {
        setIsGenerating(false);
      }
    }, 280);
  };

  const overallAvailable = eligibleQuestions.length;
  const overallShortfall = Math.max(0, totalTarget - overallAvailable);
  const hasSubjectShortfall = subjectRows.some(r => r.shortfall > 0);
  const hasBlockingShortfall = overallShortfall > 0 || hasSubjectShortfall;

  return (
    <div className="space-y-6">
      {/* Blueprint Rules Summary Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Blueprint Generation Engine</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generates an ordered question set matching Phase 4 criteria deterministically from your authorized Question Bank.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold">
              Mode: {blueprint.mode || 'WEIGHTED'}
            </span>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold">
              Target: {totalTarget} Qs
            </span>
          </div>
        </div>

        {/* Blueprint Targets & Canonical Roster Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Target Questions</span>
            <span className="text-xl font-black text-indigo-950 mt-0.5 block">{totalTarget}</span>
            <span className="text-[10px] text-indigo-600/80 font-medium">Configured in Foundation</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Current Roster</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">
              {(test.content?.questionIds || []).length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Authored or attached</span>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Slots to Fulfill</span>
            <span className="text-xl font-black text-amber-950 mt-0.5 block">
              {Math.max(0, totalTarget - (test.content?.questionIds || []).length)}
            </span>
            <span className="text-[10px] text-amber-700/80 font-medium">Automatic deficit fill</span>
          </div>
        </div>
      </div>

      {/* Structured Shortfall Alert Banner */}
      {generationError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Generation Blocked: Insufficient Questions</span>
          </div>
          <p className="text-xs text-rose-700">
            The Question Bank cannot fulfill the requested Blueprint requirements. Review the shortfalls below and add more questions to the Question Bank or adjust the blueprint targets:
          </p>
          <div className="space-y-2">
            {generationError.map((err, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between font-medium"
              >
                <span>{err.message || err.code}</span>
                {err.shortfall !== undefined && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    Shortfall: {err.shortfall}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Flight Subject Inventory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Subject Quotas &amp; Bank Availability
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Eligible Questions in Scope: <strong className="text-slate-800">{overallAvailable}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Subject / Dimension</th>
                <th className="py-2.5 px-4 text-center">Required Target</th>
                <th className="py-2.5 px-4 text-center">Available in Bank</th>
                <th className="py-2.5 px-4 text-center">Deficit</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectRows.map((r, idx) => (
                <tr key={idx} className={r.shortfall > 0 ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}>
                  <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {r.name}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {r.required}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {r.available}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.shortfall > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                        -{r.shortfall}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.sufficient ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Sufficient
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Shortfall
                        </span>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeficitTargetSubject(r.name);
                              setManualModalOpen(true);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            title={`Add deficit question for ${r.name}`}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-50/70 font-bold border-t border-slate-200">
                <td className="py-3 px-4 text-slate-900">Total Overall Questions</td>
                <td className="py-3 px-4 text-center text-slate-900">{totalTarget}</td>
                <td className="py-3 px-4 text-center text-slate-900">{overallAvailable}</td>
                <td className="py-3 px-4 text-center">
                  {overallShortfall > 0 ? (
                    <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                      -{overallShortfall}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">0</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {overallAvailable >= totalTarget ? (
                    <span className="text-emerald-700 text-[10px] font-black uppercase">Ready</span>
                  ) : (
                    <span className="text-rose-700 text-[10px] font-black uppercase">Deficit</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Blueprint Deficit Resolution Banner */}
      {hasBlockingShortfall && !isLocked && (
        <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Question Deficit Detected
              </h4>
            </div>
            <p className="text-xs text-amber-800">
              Your Question Bank has a deficit of {overallShortfall > 0 ? `${overallShortfall} overall` : 'required subject'} questions. Add deficit questions manually or upload a PDF / Word document to satisfy blueprint generation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => { setDeficitTargetSubject(''); setUploadModalOpen(true); }}
              className="px-3.5 py-2 bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
              <span>Upload PDF / DOCX</span>
            </button>
            <button
              type="button"
              onClick={() => { setDeficitTargetSubject(''); setManualModalOpen(true); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Deficit Question</span>
            </button>
          </div>
        </div>
      )}

      {/* Generator Action Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Execute Blueprint Assembly
            </h4>
          </div>
          <p className="text-xs text-slate-600">
            Produces a reproducible candidate question set for your review before committing to the test.
          </p>
        </div>

        <button
          type="button"
          disabled={isLocked || isGenerating}
          onClick={handleGenerate}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Candidate Set…
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              Generate Candidate Question Set
            </>
          )}
        </button>
      </div>

      {/* Deficit Question Modals */}
      <ManualQuestionModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        test={test}
        defaultSubject={deficitTargetSubject}
        onQuestionCreated={(newQ) => {
          if (onDeficitQuestionsAdded) onDeficitQuestionsAdded([newQ.id]);
        }}
      />

      <UploadQuestionsModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        test={test}
        defaultSubject={deficitTargetSubject}
        onQuestionsImported={(newQuestions) => {
          if (onDeficitQuestionsAdded) onDeficitQuestionsAdded(newQuestions.map(q => q.id));
        }}
      />
    </div>
  );
}
