import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Filter, 
  Sparkles, 
  HelpCircle,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { testService } from '../../data/mockData';

export default function StudentTestsPage() {
  const navigate = useNavigate();

  // Reactive Tests Store
  const [testsList, setTestsList] = useState(() => testService.getTests());
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const handleTestsUpdate = () => {
      setTestsList(testService.getTests());
    };
    window.addEventListener('medprep-tests-updated', handleTestsUpdate);
    return () => window.removeEventListener('medprep-tests-updated', handleTestsUpdate);
  }, []);

  const completedCount = testsList.filter(t => t.status === 'Completed').length;
  const scheduledCount = testsList.filter(t => t.status !== 'Completed').length;

  const filteredTests = testsList.filter(test => {
    if (activeFilter === 'completed') return test.status === 'Completed';
    if (activeFilter === 'scheduled') return test.status !== 'Completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>National Standard Assessment Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CBT Test Series & Mock Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Simulated proctored examinations with All India Rank (AIR), percentile metrics, and question-by-question explanations with high-yield clinical rationales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <strong className="text-emerald-600">{completedCount}</strong> Completed • <strong className="text-brand-600">{scheduledCount}</strong> Scheduled
          </span>
        </div>
      </div>

      {/* Test List Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">National Medical Mock Assessments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Synchronized with Faculty Question Authoring Bank</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({testsList.length})
            </button>
            <button
              onClick={() => setActiveFilter('scheduled')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'scheduled' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({scheduledCount})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'completed' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Tests Listing */}
        <div className="divide-y divide-slate-100">
          {filteredTests.map((test) => {
            const isCompleted = test.status === 'Completed';

            return (
              <div
                key={test.id}
                className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 sm:p-4 rounded-2xl transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-brand-50 text-brand-600 border border-brand-200'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">
                        {test.name}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {test.status}
                      </span>
                      {test.subject && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {test.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {test.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {test.duration}
                      </span>
                      <span>•</span>
                      <span>📝 {test.questionsCount || (test.questions && test.questions.length) || 20} Questions</span>
                      {test.score && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-emerald-600">
                            Score: {test.score} ({test.percentile || '94.2%ile'})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                  {isCompleted ? (
                    <button
                      onClick={() => navigate(`/test/${test.id}`)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Review Results & Answers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/test/${test.id}`)}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Attempt Proctored Test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CBT Engine Guide Banner */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
            <Award className="w-4 h-4 text-brand-600" />
            National Marking Scheme
          </span>
          <p className="text-slate-600 leading-relaxed">
            +5 Marks for every correct answer, -1 Mark penalty for incorrect attempts. Zero marks for unattempted questions.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Proctored CBT Palette
          </span>
          <p className="text-slate-600 leading-relaxed">
            Full color-coded Question Palette with quick review flagging: Green (Answered), Purple (Marked for Review), Gray (Unvisited).
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Dynamic Faculty Questions
          </span>
          <p className="text-slate-600 leading-relaxed">
            Questions authored and revised by Faculty in the Exam Management Studio automatically sync to your test terminal.
          </p>
        </div>
      </div>

    </div>
  );
}
