import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Mail, 
  Award, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Clock,
  Check,
  AlertCircle,
  X,
  GraduationCap,
  ChevronRight,
  FileText
} from 'lucide-react';
import { peopleService } from '../../services/peopleService';
import { doubtsService } from '../../services/doubtsService';
import { cbtTestService } from '../../services/cbtTestService';
import { learningProgressService } from '../../services/learningProgressService';

export default function FacultyStudentsPage() {
  const navigate = useNavigate();
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = currentFaculty?.assignedExams || ['neet-pg'];

  const [students, setStudents] = useState(() => peopleService.getStudentsForScope(assignedExamIds));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Reactive subscription to peopleService updates
  useEffect(() => {
    const unsub = peopleService.subscribe(() => {
      setStudents(peopleService.getStudentsForScope(assignedExamIds));
    });
    return unsub;
  }, [assignedExamIds]);

  // Derive doubts count for faculty scope
  const doubtStats = useMemo(() => {
    return doubtsService.getDoubtStatsForScope(assignedExamIds);
  }, [assignedExamIds]);

  // Filter students based on search and selected track/status
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        st.name?.toLowerCase().includes(query) ||
        st.email?.toLowerCase().includes(query) ||
        st.roll?.toLowerCase().includes(query) ||
        st.examName?.toLowerCase().includes(query);

      const matchesTrack = 
        selectedExamFilter === 'all' || 
        st.examId === selectedExamFilter;

      const matchesStatus = 
        selectedStatusFilter === 'all' || 
        st.status?.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [students, searchTerm, selectedExamFilter, selectedStatusFilter]);

  // Helper to compute live student syllabus progress
  const getStudentLiveProgress = (student) => {
    if (student.id === 'std-1') {
      const completedLecs = learningProgressService.getCompletedLectures ? learningProgressService.getCompletedLectures() : [];
      if (completedLecs.length > 0) {
        return Math.min(100, Math.max(student.progress || 42, completedLecs.length * 15));
      }
    }
    return student.progress || 0;
  };

  // Helper to retrieve student test performance
  const getStudentScoreBadge = (student) => {
    if (student.id === 'std-1') {
      const attempt = cbtTestService.getCompletedAttempt ? cbtTestService.getCompletedAttempt('test-cardio-01') : null;
      if (attempt) {
        return `${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)`;
      }
    }
    return student.mockScore || 'Not attempted';
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Candidate Roster & Academic Supervision
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{currentFaculty?.name || 'Faculty Member'}</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {students.length} Enrolled in Scope
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Assigned Candidate Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Inspect real-time syllabus pacing, CBT evaluation benchmarks, and doubt activity for doctor candidates enrolled in your assigned exam tracks ({currentFaculty?.assignedExamsLabels?.join(', ') || 'NEET PG & NExT'}).
          </p>
        </div>

        {/* Quick Link to Doubts Queue */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/faculty/doubts"
            className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Doubts Queue</span>
            {doubtStats.unresolved > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {doubtStats.unresolved}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 sm:w-72"
            />
          </div>

          {/* Exam Track Filter (Scoped strictly to faculty assigned tracks) */}
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">All Assigned Tracks ({assignedExamIds.join(', ').toUpperCase()})</option>
            {assignedExamIds.includes('neet-pg') && (
              <option value="neet-pg">NEET PG & NExT</option>
            )}
            {assignedExamIds.includes('usmle') && (
              <option value="usmle">USMLE Step 1 & 2</option>
            )}
            {assignedExamIds.includes('plab') && (
              <option value="plab">PLAB 1 & 2 / UKMLA</option>
            )}
            {assignedExamIds.includes('europe') && (
              <option value="europe">Europe Medical Licensing</option>
            )}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Enrollment</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredStudents.length}</span> of {students.length} candidates
        </div>
      </div>

      {/* Candidate Directory Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Assigned Candidate Roster ({filteredStudents.length} Doctors)
            </h2>
            <p className="text-xs text-slate-400">
              Direct access is scoped exclusively to your authorized curriculum tracks
            </p>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No candidates found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No doctor candidates match your active search and filter criteria within your assigned teaching scope.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedExamFilter('all');
                setSelectedStatusFilter('all');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Doctor Candidate</th>
                  <th className="pb-3">Track / Roll No</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Syllabus Pace</th>
                  <th className="pb-3">Latest Assessment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const progressPct = getStudentLiveProgress(st);
                  const latestScore = getStudentScoreBadge(st);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={st.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{st.name}</span>
                            <span className="text-[11px] text-slate-400">{st.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-3">
                        <span className="font-bold text-slate-800 block">{st.examName || st.course}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{st.roll}</span>
                      </td>

                      <td className="py-4 pr-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {st.packageTier || 'Standard Tier'}
                        </span>
                      </td>

                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                              style={{ width: `${progressPct}%` }} 
                            />
                          </div>
                          <span className="font-bold text-emerald-600">{progressPct}%</span>
                        </div>
                      </td>

                      <td className="py-4 pr-3">
                        <span className="font-bold text-slate-700 block">{latestScore}</span>
                        <span className="text-[10px] text-slate-400">{st.percentile || 'Benchmark'}</span>
                      </td>

                      <td className="py-4 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {st.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-4 text-right">
                        <button
                          onClick={() => navigate(`/faculty/students/${st.id}`)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 ml-auto transition-colors cursor-pointer border border-indigo-200"
                        >
                          <span>View Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
