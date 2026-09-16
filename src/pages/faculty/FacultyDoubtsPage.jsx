import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Check, 
  Clock, 
  AlertCircle, 
  GraduationCap, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  User
} from 'lucide-react';
import { doubtsService } from '../../services/doubtsService';
import { peopleService } from '../../services/peopleService';

export default function FacultyDoubtsPage() {
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = currentFaculty?.assignedExams || ['neet-pg'];

  const [doubts, setDoubts] = useState(() => doubtsService.getDoubtsForFacultyScope(assignedExamIds, currentFaculty?.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unresolved' | 'resolved'
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const [replyingDoubtId, setReplyingDoubtId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Subscribe to real-time doubt updates
  useEffect(() => {
    const unsub = doubtsService.subscribe(() => {
      setDoubts(doubtsService.getDoubtsForFacultyScope(assignedExamIds, currentFaculty?.id));
    });
    return unsub;
  }, [assignedExamIds, currentFaculty?.id]);

  // Derived counts
  const stats = useMemo(() => {
    const pending = doubts.filter(d => d.status === 'unresolved' || d.status === 'OPEN').length;
    const resolved = doubts.filter(d => d.status === 'resolved' || d.status === 'ANSWERED').length;
    return {
      total: doubts.length,
      pending,
      resolved
    };
  }, [doubts]);

  // Filtered doubts
  const filteredDoubts = useMemo(() => {
    return doubts.filter(d => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        d.title?.toLowerCase().includes(q) ||
        d.question?.toLowerCase().includes(q) ||
        d.studentName?.toLowerCase().includes(q) ||
        d.topic?.toLowerCase().includes(q);

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'unresolved' && (d.status === 'unresolved' || d.status === 'OPEN')) ||
        (statusFilter === 'resolved' && (d.status === 'resolved' || d.status === 'ANSWERED'));

      const matchesExam = 
        selectedExamFilter === 'all' || 
        d.examId === selectedExamFilter;

      const matchesUrgency = 
        urgencyFilter === 'all' || 
        d.urgency === urgencyFilter;

      return matchesSearch && matchesStatus && matchesExam && matchesUrgency;
    });
  }, [doubts, searchTerm, statusFilter, selectedExamFilter, urgencyFilter]);

  // Submit reply
  const handleSubmitReply = (doubtId) => {
    if (!replyText.trim()) return;

    doubtsService.replyToDoubt(
      doubtId,
      replyText.trim(),
      `${currentFaculty?.name || 'Faculty Lead'} (${currentFaculty?.specialty || 'Lead Mentor'})`,
      currentFaculty?.id
    );

    setToastMessage('Clinical Pearl dispatched to candidate LMS room!');
    setReplyText('');
    setReplyingDoubtId(null);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Support Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{currentFaculty?.name || 'Faculty Member'}</span>
            </span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
              {stats.pending} Doubts Pending Response
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Clinical Doubts & Q&A Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Answer questions submitted by enrolled doctors during their clinical lectures and study plan days. Published Clinical Pearls appear directly in the student's study rooms.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl shrink-0">
          <div className="px-3.5 py-1.5 bg-white rounded-xl shadow-2xs text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total</div>
            <div className="text-lg font-black text-slate-900">{stats.total}</div>
          </div>
          <div className="px-3.5 py-1.5 bg-rose-50 rounded-xl border border-rose-200 text-center">
            <div className="text-[10px] font-bold uppercase text-rose-600">Pending</div>
            <div className="text-lg font-black text-rose-700">{stats.pending}</div>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <div className="text-[10px] font-bold uppercase text-emerald-600">Resolved</div>
            <div className="text-lg font-black text-emerald-700">{stats.resolved}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doubt, question, student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            {[
              { id: 'all', label: 'All Queries' },
              { id: 'unresolved', label: `Pending (${stats.pending})` },
              { id: 'resolved', label: 'Answered' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Exam Scope Filter */}
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">All Assigned Tracks</option>
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
        </div>

        {toastMessage && (
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Doubts Feed */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No doubts pending in this view</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All questions matching this criteria are currently answered or no new queries have been submitted.
            </p>
          </div>
        ) : (
          filteredDoubts.map(doubt => {
            const isResolved = doubt.status === 'resolved' || doubt.status === 'ANSWERED';
            const isReplying = replyingDoubtId === doubt.id;

            return (
              <div
                key={doubt.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all space-y-4 shadow-2xs ${
                  isResolved ? 'border-slate-200/80' : 'border-rose-200/80 bg-rose-50/10'
                }`}
              >
                {/* Header: Student info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={doubt.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={doubt.studentName}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/faculty/students/${doubt.studentId}`}
                          className="font-black text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                        >
                          {doubt.studentName}
                        </Link>
                        <span className="text-[11px] text-slate-400">• Day {doubt.dayNumber || 1}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{doubt.topic}</span>
                        <span>•</span>
                        <span className="font-bold text-indigo-600">{doubt.course || doubt.examId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      isResolved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
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

                {/* Question Details */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-slate-900">{doubt.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 font-normal">
                    "{doubt.question}"
                  </p>
                </div>

                {/* Academic Context Navigation */}
                {doubt.lectureId && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Academic Context:</span>
                    <Link
                      to={`/faculty/exams/${doubt.examId || 'neet-pg'}/subjects`}
                      className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>View in Curriculum</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

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
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
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
    </div>
  );
}
