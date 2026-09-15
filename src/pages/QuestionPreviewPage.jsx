import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Copy, 
  CheckCircle2, 
  FileText, 
  Trash2, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { questionService } from '../services/questionService.js';
import QuestionPreview from '../components/questions/QuestionPreview.jsx';

export default function QuestionPreviewPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith('/faculty') ? '/faculty' : '/admin';
  const [question, setQuestion] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [usage, setUsage] = useState({ count: 0, assessments: [] });

  useEffect(() => {
    if (questionId) {
      const q = questionService.getQuestionById(questionId);
      setQuestion(q);
      const usageInfo = questionService.getQuestionUsage(questionId);
      setUsage(usageInfo);
    }
  }, [questionId]);

  const handleClone = () => {
    if (!questionId) return;
    const res = questionService.cloneQuestion(questionId);
    if (res.success && res.question) {
      setToastMessage(`Duplicated as new draft "${res.question.id}"!`);
      setTimeout(() => navigate(`${basePath}/questions/${res.question.id}/edit`), 1000);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!questionId) return;
    const updated = questionService.changeQuestionStatus(questionId, newStatus);
    if (updated) {
      setQuestion(updated);
      setToastMessage(`Question status updated to ${newStatus}!`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Question Not Found</h2>
        <p className="text-xs text-slate-500">The question "{questionId}" could not be located in the Question Bank.</p>
        <Link
          to={`${basePath}/questions`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Bank</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              to={`${basePath}/questions`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Question Bank</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {question.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Item Preview & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Instructor audit view with scoring rules, response key indicators, and assessment dependency links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleClone}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            <span>Duplicate / Clone</span>
          </button>

          <Link
            to={`${basePath}/questions/${question.id}/edit`}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Question</span>
          </Link>
        </div>
      </div>

      {/* Question Usage Information Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-950 font-bold">
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {usage.count > 0 
              ? `Referenced in ${usage.count} Assessment${usage.count === 1 ? '' : 's'}` 
              : 'Not currently included in any assessment offering'}
          </span>
        </div>
        {usage.assessments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {usage.assessments.map(a => (
              <span key={a.id} className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-800 font-semibold text-[11px] shadow-2xs">
                {a.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Preview Component */}
      <QuestionPreview question={question} />
    </div>
  );
}
