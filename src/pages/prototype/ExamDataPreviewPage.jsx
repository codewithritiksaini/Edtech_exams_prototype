import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  FolderTree,
  Volume2,
  Tag,
  Award,
  ChevronRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';
import { questionService } from '../../services/questionService';
import { stimulusService } from '../../services/stimulusService';
import { legacyTestToAssessment } from '../../utils/examDataHelpers';
import { phase6InitialTests } from '../../data/mockData';
import { QUESTION_TYPE_LABELS } from '../../utils/questionTypes';

export default function ExamDataPreviewPage() {
  const [assessments, setAssessments] = useState(() => assessmentService.getAssessments());
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(() => assessments[0]?.id || 'assessment-neet-pg-demo');
  const [resolvedData, setResolvedData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showLegacyAdapterDemo, setShowLegacyAdapterDemo] = useState(false);
  const [adaptedLegacyResult, setAdaptedLegacyResult] = useState(null);

  // Sync / Load resolved assessment
  useEffect(() => {
    if (selectedAssessmentId) {
      const resolved = assessmentService.resolveFullAssessment(selectedAssessmentId);
      setResolvedData(resolved);
    }
  }, [selectedAssessmentId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleResetData = () => {
    assessmentService.resetPrototypeExamData();
    const refreshed = assessmentService.getAssessments();
    setAssessments(refreshed);
    if (refreshed[0]) {
      setSelectedAssessmentId(refreshed[0].id);
      setResolvedData(assessmentService.resolveFullAssessment(refreshed[0].id));
    }
    showToast('✅ Reset prototype stores to default canonical fixtures. (Legacy stores untouched)');
  };

  const handleTestLegacyAdapter = () => {
    const legacy = phase6InitialTests[0]; // Cardiology Grand Mock Test #01
    const adapted = legacyTestToAssessment(legacy);
    setAdaptedLegacyResult(adapted);
    setShowLegacyAdapterDemo(true);
    showToast(`Converted legacy "${legacy.name}" into canonical Assessment -> Version -> Section -> Questions!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <FolderTree className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phase 2 Development Verification Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Canonical Assessment Data Model Preview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Validating: Assessment → Version → Sections → Items → [Question \| QuestionGroup → Stimulus].
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset only prototype exam data keys"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Prototype Data</span>
            </button>
            <button
              onClick={handleTestLegacyAdapter}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test Legacy Adapter</span>
            </button>
            <Link
              to="/admin/tests"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Tests</span>
            </Link>
          </div>
        </div>

        {/* Legacy Adapter Result Drawer/Card */}
        {showLegacyAdapterDemo && adaptedLegacyResult && (
          <div className="bg-emerald-50/70 border border-emerald-300 rounded-3xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Legacy Adapter Verification
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Adapted from "{adaptedLegacyResult.assessment.metadata.legacyId}"
                </span>
              </div>
              <button
                onClick={() => setShowLegacyAdapterDemo(false)}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Hide Adapter Result
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                <span className="text-slate-400 block font-bold text-[10px]">NEW ASSESSMENT ID</span>
                <span className="font-mono font-bold text-slate-900">{adaptedLegacyResult.assessment.id}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                <span className="text-slate-400 block font-bold text-[10px]">ACTIVE VERSION</span>
                <span className="font-mono font-bold text-slate-900">{adaptedLegacyResult.assessment.activeVersionId}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                <span className="text-slate-400 block font-bold text-[10px]">EXTRACTED QUESTIONS</span>
                <span className="font-bold text-emerald-700">{adaptedLegacyResult.extractedQuestions.length} Questions Normalized</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-900 leading-relaxed">
              * The original legacy test in <code>medprep_phase6_tests</code> remains completely untouched and functional.
            </p>
          </div>
        )}

        {/* Assessment Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {assessments.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAssessmentId(a.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                selectedAssessmentId === a.id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{a.title}</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
                selectedAssessmentId === a.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {a.category}
              </span>
            </button>
          ))}
        </div>

        {/* Resolved Content Tree */}
        {resolvedData ? (
          <div className="space-y-6">
            
            {/* Top Level Assessment Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {resolvedData.assessment.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {resolvedData.assessment.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {resolvedData.assessment.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {resolvedData.assessment.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">ACTIVE VERSION</span>
                    <strong className="font-mono text-slate-900">{resolvedData.activeVersion.id} (v{resolvedData.activeVersion.version})</strong>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <span className="text-[10px] text-slate-400 block font-semibold">PASS CUTOFF</span>
                    <strong className="text-emerald-700">{resolvedData.activeVersion.evaluationRules?.passingPercentage}%</strong>
                  </div>
                </div>
              </div>

              {/* Settings strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">DURATION</span>
                  <span className="font-bold text-slate-800">{resolvedData.assessment.settings?.durationMinutes} Minutes</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">MAX ATTEMPTS</span>
                  <span className="font-bold text-slate-800">{resolvedData.assessment.settings?.attempt?.maxAttempts}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">CORRECT / WRONG</span>
                  <span className="font-bold text-emerald-700">+{resolvedData.activeVersion.evaluationRules?.marksPerCorrect} / {resolvedData.activeVersion.evaluationRules?.marksPerIncorrect}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">SECTIONS COUNT</span>
                  <span className="font-bold text-slate-800">{resolvedData.sections.length} Section(s)</span>
                </div>
              </div>
            </div>

            {/* Render Sections */}
            {resolvedData.sections.map((section, sIdx) => (
              <div key={section.id || sIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Section {section.order || sIdx + 1}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {section.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {section.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {section.instructions}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    {section.items?.length || 0} Items
                  </span>
                </div>

                {/* Section Items */}
                <div className="space-y-4">
                  {section.items?.map((item, iIdx) => {
                    // Case A: Question Reference
                    if (item.type === 'question' && item.question) {
                      const q = item.question;
                      return (
                        <div key={item.id || iIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-brand-100 text-brand-800 px-2 py-0.5 rounded">
                                Item {item.order} • {QUESTION_TYPE_LABELS[q.type] || q.type}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">Ref: {item.refId}</span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700">
                              Marks: +{q.scoring?.marks} | {q.scoring?.negativeMarks}
                            </span>
                          </div>

                          {q.content?.vignette && (
                            <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 italic leading-relaxed">
                              {q.content.vignette}
                            </p>
                          )}

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {q.content?.prompt}
                          </h4>

                          {/* Options if Single Choice */}
                          {q.responseSchema?.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.responseSchema.options.map((opt) => {
                                const isCorrect = q.answer?.correct?.includes(opt.id);
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                                        : 'bg-white border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {opt.id}
                                    </span>
                                    <span className="text-[11px] leading-tight">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                              <strong>Clinical Rationale:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Case B: Question Group with Shared Stimulus
                    if (item.type === 'question_group' && item.group) {
                      const grp = item.group;
                      const stimulus = item.stimulus;
                      const questions = item.questions || [];

                      return (
                        <div key={item.id || iIdx} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                                Question Group • {grp.type}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{grp.title}</span>
                            </div>
                            <span className="text-xs font-mono text-slate-500">{questions.length} Linked Questions</span>
                          </div>

                          {/* Stimulus Card */}
                          {stimulus && (
                            <div className="p-4 bg-white rounded-xl border border-amber-200/80 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                                  {stimulus.type === 'audio' ? <Volume2 className="w-4 h-4 text-amber-600" /> : <FileText className="w-4 h-4 text-amber-600" />}
                                  <span>Stimulus: {stimulus.title}</span>
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  Type: {stimulus.type}
                                </span>
                              </div>

                              {stimulus.content?.text && (
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  {stimulus.content.text}
                                </p>
                              )}

                              {stimulus.content?.transcript && (
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  {stimulus.content.transcript}
                                </p>
                              )}

                              {stimulus.media && stimulus.media.length > 0 && (
                                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <Volume2 className="w-4 h-4 text-indigo-600" />
                                    <span>Track: {stimulus.media[0].title} ({stimulus.media[0].durationSeconds}s)</span>
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">{stimulus.media[0].url}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Group Questions */}
                          <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-amber-300">
                            <span className="text-xs font-bold text-amber-900 block">
                              Group Questions ({questions.length}):
                            </span>

                            {questions.map((gq, gIdx) => (
                              <div key={gq.id || gIdx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">
                                    Q{gIdx + 1}: {gq.content?.prompt}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700">+{gq.scoring?.marks} Marks</span>
                                </div>

                                {gq.responseSchema?.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                    {gq.responseSchema.options.map((opt) => {
                                      const isCorrect = gq.answer?.correct?.includes(opt.id);
                                      return (
                                        <div
                                          key={opt.id}
                                          className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                                            isCorrect ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-100'
                                          }`}
                                        >
                                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-200 shrink-0">
                                            {opt.id}
                                          </span>
                                          <span className="text-[11px]">{opt.text}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {gq.explanation && (
                                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                                    {gq.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-200">
            Select an assessment above to inspect its resolved canonical data structure.
          </div>
        )}

      </div>
    </div>
  );
}
