import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  Award, 
  Download, 
  Search, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { cbtTestService } from '../../services/cbtTestService';
import { peopleService } from '../../services/peopleService';

export default function FacultyTestResultsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [currentFaculty] = useState(() => peopleService.getCurrentFacultyProfile());
  const assignedExamIds = currentFaculty?.assignedExams || ['neet-pg', 'usmle'];

  const [attemptsData, setAttemptsData] = useState(() => cbtTestService.getAttemptsForTest(testId));

  useEffect(() => {
    const unsubscribe = cbtTestService.subscribe(() => {
      setAttemptsData(cbtTestService.getAttemptsForTest(testId));
    });
    return unsubscribe;
  }, [testId]);

  const currentTest = attemptsData.test || {
    id: testId,
    name: 'Clinical Mock Assessment',
    title: 'Clinical Mock Assessment',
    course: 'NEET PG & NExT 2026',
    totalMarks: 100
  };

  const testTrack = currentTest?.examTrack || currentTest?.courseId || 'neet-pg';
  const isOutOfScope = !assignedExamIds.includes(testTrack) && testTrack !== 'all';

  const candidatesList = attemptsData.candidates || [];
  const summary = attemptsData.summary || {
    totalAppeared: '384 Doctors',
    batchMeanScore: '78.4 / 100',
    passingPercentage: '88.5% Pass',
    highestMark: '96 / 100'
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const filteredCandidates = candidatesList.filter(c => {
    const matchesName = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesName && matchesStatus;
  });

  const handleExportCSV = () => {
    setToastMessage('Exporting Cohort Scorecard CSV...');
    setTimeout(() => setToastMessage('Scorecard CSV downloaded successfully!'), 1500);
    setTimeout(() => setToastMessage(''), 4500);
  };

  if (isOutOfScope) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Assessment Results Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The cohort results for assessment <strong className="text-slate-800">"{currentTest?.name || testId}"</strong> belong to program track <strong className="text-slate-800">{testTrack.toUpperCase()}</strong>, which is outside your assigned teaching scope ({assignedExamIds.join(', ').toUpperCase()}).
        </p>
        <div className="pt-2">
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Assessments</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              to="/faculty/tests"
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Assessments</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Cohort Scorecard & Ranks
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentTest.name} — Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Course Track: {currentTest.course} • Total Marks: {currentTest.totalMarks || 100}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Scorecard CSV</span>
        </button>
      </div>

      {/* Performance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Appeared', val: summary.totalAppeared || '384 Doctors', color: 'text-indigo-600' },
          { label: 'Batch Mean Score', val: summary.batchMeanScore || '78.4 / 100', color: 'text-emerald-600' },
          { label: 'Passing Percentage', val: summary.passingPercentage || '88.5% Pass', color: 'text-blue-600' },
          { label: 'Highest Mark', val: summary.highestMark || '96 / 100', color: 'text-amber-600' }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
            <div className={`text-2xl font-black ${item.color} tracking-tight`}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Ranks & Scorecard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-black text-slate-900">
            Candidate Leaderboard & Score Records ({filteredCandidates.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              <option value="all">All Candidates</option>
              <option value="pass">Passed</option>
              <option value="fail">Failed</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Doctor Candidate</th>
                <th className="pb-3">Score & Percentage</th>
                <th className="pb-3">Percentile</th>
                <th className="pb-3">Time Taken</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((c) => (
                <tr key={c.rank} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 pr-3">
                    <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                      c.rank === 1
                        ? 'bg-amber-100 text-amber-800'
                        : c.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : c.rank === 3
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{c.rank}
                    </span>
                  </td>

                  <td className="py-4 pr-3 font-bold text-slate-900">
                    <div>{c.name}</div>
                    <span className="text-[11px] text-slate-400 font-medium">{c.email}</span>
                  </td>

                  <td className="py-4 pr-3">
                    <span className="font-bold text-slate-900">{c.score}</span>
                    <span className="text-slate-400 ml-1.5">({c.percentage})</span>
                  </td>

                  <td className="py-4 pr-3 font-extrabold text-indigo-600">
                    {c.percentile}
                  </td>

                  <td className="py-4 pr-3 text-slate-500 flex items-center gap-1 mt-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.timeTaken}</span>
                  </td>

                  <td className="py-4 pr-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      c.status === 'Pass'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  <td className="py-4 text-right text-slate-400 text-[11px]">
                    {c.submittedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
