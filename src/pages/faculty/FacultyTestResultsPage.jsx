import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { testService, initialCohortTestResults } from '../../data/mockData';

export default function FacultyTestResultsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [tests] = useState(() => testService.getTests());
  const currentTest = tests.find(t => t.id === testId) || {
    id: testId,
    name: 'Cardiology Mock Test 1',
    course: 'NEET PG & NExT 2026',
    totalMarks: 100
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const candidatesList = [
    { rank: 1, name: 'Dr. Priya Sharma', email: 'priya.s@medprep.com', score: '96/100', percentage: '96.0%', percentile: '99.8%', timeTaken: '34m 12s', status: 'Pass', submittedAt: 'Sep 06, 19:42' },
    { rank: 2, name: 'Dr. Rohan Verma', email: 'rohan.v@medprep.com', score: '92/100', percentage: '92.0%', percentile: '99.1%', timeTaken: '38m 05s', status: 'Pass', submittedAt: 'Sep 06, 19:45' },
    { rank: 3, name: 'Dr. Ananya Joshi', email: 'ananya.j@medprep.com', score: '88/100', percentage: '88.0%', percentile: '98.4%', timeTaken: '41m 20s', status: 'Pass', submittedAt: 'Sep 06, 19:50' },
    { rank: 4, name: 'Dr. Michael Chen', email: 'm.chen@medprep.com', score: '86/100', percentage: '86.0%', percentile: '97.2%', timeTaken: '42m 10s', status: 'Pass', submittedAt: 'Sep 06, 19:51' },
    { rank: 5, name: 'Dr. Emily Watson', email: 'emily.w@medprep.com', score: '84/100', percentage: '84.0%', percentile: '95.6%', timeTaken: '44m 30s', status: 'Pass', submittedAt: 'Sep 06, 19:54' },
    { rank: 6, name: 'Dr. Ritik Saini', email: 'student@demo.com', score: '80/100', percentage: '80.0%', percentile: '91.8%', timeTaken: '43m 15s', status: 'Pass', submittedAt: 'Sep 06, 19:55' },
    { rank: 7, name: 'Dr. Arjun Patel', email: 'arjun.p@medprep.com', score: '76/100', percentage: '76.0%', percentile: '86.5%', timeTaken: '44m 50s', status: 'Pass', submittedAt: 'Sep 06, 19:56' },
    { rank: 8, name: 'Dr. Fatima Noor', email: 'fatima.n@medprep.com', score: '68/100', percentage: '68.0%', percentile: '74.2%', timeTaken: '45m 00s', status: 'Pass', submittedAt: 'Sep 06, 19:58' },
    { rank: 9, name: 'Dr. David Miller', email: 'david.m@medprep.com', score: '52/100', percentage: '52.0%', percentile: '51.0%', timeTaken: '45m 00s', status: 'Fail', submittedAt: 'Sep 06, 19:59' },
    { rank: 10, name: 'Dr. Kavita Singh', email: 'kavita.s@medprep.com', score: '44/100', percentage: '44.0%', percentile: '38.5%', timeTaken: '45m 00s', status: 'Fail', submittedAt: 'Sep 06, 20:00' }
  ];

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
          { label: 'Total Appeared', val: '384 Doctors', color: 'text-indigo-600' },
          { label: 'Batch Mean Score', val: '78.4 / 100', color: 'text-emerald-600' },
          { label: 'Passing Percentage', val: '88.5% Pass', color: 'text-blue-600' },
          { label: 'Highest Mark', val: '96 / 100', color: 'text-amber-600' }
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
