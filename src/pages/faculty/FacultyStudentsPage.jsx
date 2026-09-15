import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Award, 
  CheckCircle2, 
  Filter, 
  ExternalLink,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Send,
  Clock,
  Check,
  AlertCircle,
  X,
  GraduationCap
} from 'lucide-react';
import { facultyStudentDirectory } from '../../data/mockData';
import { peopleService } from '../../services/peopleService';
import { doubtsService } from '../../services/doubtsService';

export default function FacultyStudentsPage() {
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = currentFaculty?.assignedExams || ['neet-pg'];

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'doubts'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [doubtStatusFilter, setDoubtStatusFilter] = useState('all'); // 'all' | 'unresolved' | 'resolved'

  // Doubts state
  const [doubts, setDoubts] = useState(() => doubtsService.getAllDoubts());
  const [replyingDoubtId, setReplyingDoubtId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccessMessage, setReplySuccessMessage] = useState('');

  // Selected candidate detail modal
  const [inspectingStudent, setInspectingStudent] = useState(null);

  useEffect(() => {
    const unsub = doubtsService.subscribe((updatedDoubts) => {
      setDoubts(updatedDoubts);
    });
    return unsub;
  }, []);

  // Filter students by assigned faculty scope & search terms
  const filteredStudents = useMemo(() => {
    return facultyStudentDirectory.filter((st) => {
      const matchesSearch = 
        st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.course.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTrack = 
        selectedTrack === 'all' || 
        st.course.toLowerCase().includes(selectedTrack.toLowerCase());

      return matchesSearch && matchesTrack;
    });
  }, [searchTerm, selectedTrack]);

  // Filter doubts by status and search
  const filteredDoubts = useMemo(() => {
    return doubts.filter(d => {
      const matchesStatus = 
        doubtStatusFilter === 'all' || 
        d.status === doubtStatusFilter;

      const matchesSearch = 
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.topic.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTrack = 
        selectedTrack === 'all' || 
        d.course.toLowerCase().includes(selectedTrack.toLowerCase()) ||
        (d.examId && d.examId.toLowerCase().includes(selectedTrack.toLowerCase()));

      return matchesStatus && matchesSearch && matchesTrack;
    });
  }, [doubts, doubtStatusFilter, searchTerm, selectedTrack]);

  const unresolvedDoubtsCount = useMemo(() => {
    return doubts.filter(d => d.status === 'unresolved').length;
  }, [doubts]);

  // Handle reply submission
  const handleSubmitReply = (doubtId) => {
    if (!replyText.trim()) return;

    doubtsService.replyToDoubt(
      doubtId, 
      replyText.trim(), 
      `${currentFaculty?.name || 'Faculty Specialist'} (${currentFaculty?.specialty || 'Lead'})`
    );

    setReplySuccessMessage('Clinical pearl dispatched to candidate LMS room!');
    setReplyText('');
    setReplyingDoubtId(null);
    setTimeout(() => setReplySuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Department Roster & Support
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{currentFaculty?.name || 'Faculty Member'}</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {filteredStudents.length} Assigned Candidates
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Enrolled Candidates & Clinical Doubts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Monitor candidate study pace and Q-bank performance across your assigned licensing tracks. Answer clinical doubts submitted from lecture rooms with structured pearls.
          </p>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Candidate Directory ({filteredStudents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'doubts'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clinical Doubts Hub</span>
            {unresolvedDoubtsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {unresolvedDoubtsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'directory' ? "Search doctor by name, email..." : "Search doubt topic, question..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-56 sm:w-64"
            />
          </div>

          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">All Assigned Tracks</option>
            <option value="neet">NEET PG & NExT</option>
            <option value="usmle">USMLE Step 1</option>
            <option value="plab">PLAB 1</option>
          </select>

          {activeTab === 'doubts' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All Doubts' },
                { id: 'unresolved', label: `Pending (${unresolvedDoubtsCount})` },
                { id: 'resolved', label: 'Answered' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDoubtStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    doubtStatusFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {replySuccessMessage && (
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{replySuccessMessage}</span>
          </div>
        )}
      </div>

      {/* TAB 1: CANDIDATE DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">
              Department Candidate Roster ({filteredStudents.length} Doctors)
            </h2>
            <span className="text-xs text-slate-400">
              Scoped to your assigned exam curricula
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Doctor Candidate</th>
                  <th className="pb-3">Course / Track</th>
                  <th className="pb-3">Enrolled Tier</th>
                  <th className="pb-3">Syllabus Completion</th>
                  <th className="pb-3">Q-Bank Accuracy</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={st.name}
                          className="w-9 h-9 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{st.name}</span>
                          <span className="text-[11px] text-slate-400">{st.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-3 font-semibold text-slate-700">
                      {st.course}
                    </td>

                    <td className="py-4 pr-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {st.packageTier || 'Full Prep Pro'}
                      </span>
                    </td>

                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${st.progress || 60}%` }} />
                        </div>
                        <span className="font-bold text-emerald-600">{st.progress || 60}%</span>
                      </div>
                    </td>

                    <td className="py-4 pr-3 font-bold text-indigo-600">
                      {st.qbankAccuracy || '82%'}
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => setInspectingStudent(st)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Inspect Pace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL DOUBTS & Q&A HUB */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          {filteredDoubts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">All Doubts Resolved!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no pending questions matching this filter. Candidates will see your answered pearls directly in their study rooms.
              </p>
            </div>
          ) : (
            filteredDoubts.map(doubt => {
              const isReplying = replyingDoubtId === doubt.id;
              const isResolved = doubt.status === 'resolved';

              return (
                <div
                  key={doubt.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all space-y-4 shadow-2xs ${
                    isResolved ? 'border-slate-200/80' : 'border-rose-200/80 bg-rose-50/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={doubt.studentAvatar}
                        alt={doubt.studentName}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{doubt.studentName}</span>
                          <span className="text-[11px] text-slate-400">• Day {doubt.dayNumber}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{doubt.topic}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        isResolved 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      }`}>
                        {isResolved ? '✓ Pearl Answered' : 'Pending Response'}
                      </span>
                      {doubt.urgency === 'high' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                          High Yield
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-slate-900">{doubt.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      "{doubt.question}"
                    </p>
                  </div>

                  {/* Existing Clinical Pearl Reply */}
                  {isResolved && doubt.facultyReply && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-black text-indigo-950">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Specialist Clinical Pearl:</span>
                        </span>
                        <span className="text-indigo-400 font-normal">
                          Replied by {doubt.repliedBy || 'Faculty Specialist'}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                        {doubt.facultyReply}
                      </p>
                    </div>
                  )}

                  {/* Reply Composer */}
                  {isReplying ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                      <label className="text-xs font-black text-slate-700 block">
                        Write Clinical Explanation / Pearl:
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Provide high-yield diagnostic pearls, guidelines (ACC/AHA, ESC), and memory hooks for this clinical query..."
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingDoubtId(null);
                            setReplyText('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitReply(doubt.id)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Pearl</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingDoubtId(doubt.id);
                          setReplyText(doubt.facultyReply || '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isResolved ? 'Edit Pearl' : 'Answer with Clinical Pearl'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Inspect Candidate Modal */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingStudent.avatar}
                  alt={inspectingStudent.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base">{inspectingStudent.name}</h3>
                  <span className="text-xs text-slate-400">{inspectingStudent.email}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Track</div>
                  <div className="font-bold text-slate-800 mt-0.5">{inspectingStudent.course}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Enrolled Tier</div>
                  <div className="font-bold text-indigo-700 mt-0.5">{inspectingStudent.packageTier}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Syllabus Completion</span>
                  <span className="font-black text-emerald-600">{inspectingStudent.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${inspectingStudent.progress}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Q-Bank Accuracy</div>
                  <div className="text-sm font-black text-indigo-600 mt-0.5">{inspectingStudent.qbankAccuracy}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  On Pace for Rank 1
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setInspectingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
