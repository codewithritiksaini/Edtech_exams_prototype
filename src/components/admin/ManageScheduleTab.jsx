import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  FolderTree, 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Eye, 
  ArrowRight, 
  Filter, 
  Video, 
  Brain, 
  FileText, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function ManageScheduleTab() {
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [selectedExamId, setSelectedExamId] = useState('neet-pg');

  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());
  const [schedule, setSchedule] = useState(() => curriculumService.getSchedule('neet-pg'));

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Form State
  const [formWeekNumber, setFormWeekNumber] = useState(1);
  const [formDayNumber, setFormDayNumber] = useState(1);
  const [formDayTitle, setFormDayTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formSelectedTopicIds, setFormSelectedTopicIds] = useState([]);
  const [formDate, setFormDate] = useState('2026-09-08');
  const [formDuration, setFormDuration] = useState('1.5 hours');
  const [formHasLive, setFormHasLive] = useState(false);
  const [formHasTest, setFormHasTest] = useState(false);
  const [formStatus, setFormStatus] = useState('Active');

  // Delete Confirmation
  const [deletingSlot, setDeletingSlot] = useState(null);

  // Synchronize state from services
  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setChapters(curriculumService.getChapters());
      setTopics(curriculumService.getTopics());
    });
    const unsubSchedule = curriculumService.subscribeSchedule(() => {
      setSchedule(curriculumService.getSchedule(selectedExamId));
    });
    return () => {
      unsubCurriculum();
      unsubSchedule();
    };
  }, [selectedExamId]);

  // Update schedule when exam selector changes
  useEffect(() => {
    setSchedule(curriculumService.getSchedule(selectedExamId));
  }, [selectedExamId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Available weeks from the exam (e.g. 1 to 4)
  const availableWeeks = useMemo(() => {
    const maxWeeks = selectedExam.weeks || 4;
    return Array.from({ length: maxWeeks }, (_, i) => i + 1);
  }, [selectedExam]);

  // Days for currently selected week
  const weekSlots = useMemo(() => {
    return schedule.filter(s => s.weekNumber === selectedWeek);
  }, [schedule, selectedWeek]);

  // Available subjects for the form dropdown
  const examSubjects = useMemo(() => {
    return subjects.filter(s => s.examId === selectedExamId);
  }, [subjects, selectedExamId]);

  // Available chapters based on formSubjectId
  const subjectChapters = useMemo(() => {
    if (!formSubjectId) return [];
    return chapters.filter(c => c.subjectId === formSubjectId);
  }, [chapters, formSubjectId]);

  // Available topics based on formChapterId
  const chapterTopics = useMemo(() => {
    if (!formChapterId) return [];
    return topics.filter(t => t.chapterId === formChapterId);
  }, [topics, formChapterId]);

  // Open Modal
  const handleOpenModal = (slot = null, targetDay = null) => {
    if (slot) {
      setEditingSlot(slot);
      setFormWeekNumber(slot.weekNumber);
      setFormDayNumber(slot.dayNumber);
      setFormDayTitle(slot.dayTitle);
      setFormSubjectId(slot.subjectId || examSubjects[0]?.id || '');
      setFormChapterId(slot.chapterId || '');
      setFormSelectedTopicIds(slot.topicIds || []);
      setFormDate(slot.scheduledDate || new Date().toISOString().split('T')[0]);
      setFormDuration(slot.estimatedTime || '1.5 hours');
      setFormHasLive(Boolean(slot.hasLive));
      setFormHasTest(Boolean(slot.hasTest));
      setFormStatus(slot.status || 'Active');
    } else {
      setEditingSlot(null);
      const nextDay = targetDay || ((selectedWeek - 1) * 7 + (weekSlots.length + 1));
      setFormWeekNumber(selectedWeek);
      setFormDayNumber(nextDay);
      setFormDayTitle(`Day ${nextDay} — Core Clinical Study`);
      const defaultSub = examSubjects[0]?.id || '';
      setFormSubjectId(defaultSub);
      const defaultChaps = chapters.filter(c => c.subjectId === defaultSub);
      setFormChapterId(defaultChaps[0]?.id || '');
      setFormSelectedTopicIds([]);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormDuration('1.5 hours');
      setFormHasLive(false);
      setFormHasTest(false);
      setFormStatus('Active');
    }
    setIsModalOpen(true);
  };

  const handleToggleTopicSelection = (topicId) => {
    setFormSelectedTopicIds(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSaveSlot = (e) => {
    e.preventDefault();
    if (!formDayNumber || !formSubjectId) {
      alert('Please specify day number and subject.');
      return;
    }

    curriculumService.saveScheduleSlot({
      ...(editingSlot ? { id: editingSlot.id } : {}),
      examId: selectedExamId,
      weekNumber: Number(formWeekNumber),
      weekTitle: `Week ${formWeekNumber}`,
      dayNumber: Number(formDayNumber),
      dayTitle: formDayTitle.trim() || `Day ${formDayNumber}`,
      subjectId: formSubjectId,
      chapterId: formChapterId,
      topicIds: formSelectedTopicIds,
      scheduledDate: formDate,
      estimatedTime: formDuration,
      hasLive: formHasLive,
      hasTest: formHasTest,
      status: formStatus
    });

    setSchedule(curriculumService.getSchedule(selectedExamId));
    setIsModalOpen(false);
    showToast(editingSlot ? `Day ${formDayNumber} schedule updated!` : `Day ${formDayNumber} scheduled with selected topics!`);
  };

  const handleDeleteSlot = () => {
    if (!deletingSlot) return;
    curriculumService.deleteScheduleSlot(deletingSlot.id);
    setSchedule(curriculumService.getSchedule(selectedExamId));
    setDeletingSlot(null);
    showToast('Schedule slot removed.');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Curriculum Release & Drip Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Study Schedule & Day Mapping
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Link chapters and topics to specific Weeks and Days. Students will see these exact topics, PDFs, clinical diagrams, videos, and flashcards when they open their daily study plan.
          </p>
        </div>

        <button
          id="btn-schedule-day"
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all hover:shadow-emerald-500/20 active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Day / Link Topic</span>
        </button>
      </div>

      {/* Exam & Week Track Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        
        {/* Exam Pills Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
            <Filter className="w-3 h-3" />
            Exam Track:
          </span>
          {exams.map(exam => (
            <button
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                selectedExamId === exam.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{exam.flag}</span>
              <span>{exam.name}</span>
            </button>
          ))}
        </div>

        {/* Week Selector Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
            <Calendar className="w-3 h-3" />
            Select Week:
          </span>
          {availableWeeks.map(wk => {
            const count = schedule.filter(s => s.weekNumber === wk).length;
            return (
              <button
                key={wk}
                onClick={() => setSelectedWeek(wk)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  selectedWeek === wk
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>Week {wk}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedWeek === wk ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count} {count === 1 ? 'Day' : 'Days'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Timeline / Days Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Week {selectedWeek} Schedule Timeline
            </h3>
            <span className="text-xs text-slate-400 font-medium">({weekSlots.length} Scheduled Days)</span>
          </div>

          <span className="text-xs text-slate-500 italic hidden sm:inline">
            Topics linked here instantly feed the Student LMS Daily Room
          </span>
        </div>

        {weekSlots.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No days scheduled in Week {selectedWeek}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click below to map Day {(selectedWeek - 1) * 7 + 1} to a subject chapter and topics.
            </p>
            <button
              onClick={() => handleOpenModal(null, (selectedWeek - 1) * 7 + 1)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule Day {(selectedWeek - 1) * 7 + 1}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {weekSlots.map((slot) => {
              const subject = subjects.find(s => s.id === slot.subjectId);
              const chapter = chapters.find(c => c.id === slot.chapterId);
              const linkedTopics = topics.filter(t => (slot.topicIds || []).includes(t.id));

              // Compute total content assets
              let totalPdfs = 0;
              let totalImgs = 0;
              let hasVideo = false;
              let totalCards = 0;

              linkedTopics.forEach(t => {
                if (t.content) {
                  totalPdfs += (t.content.pdfList?.length || (t.content.pdf ? 1 : 0));
                  totalImgs += (t.content.images?.length || 0);
                  if (t.content.video) hasVideo = true;
                  totalCards += (t.content.flashcards?.length || 0);
                }
              });

              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Row: Day Pill + Date + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white shadow-2xs">
                        Day {slot.dayNumber}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {slot.scheduledDate}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slot.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {slot.status}
                        </span>
                      </div>
                    </div>

                    {/* Day Title */}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 line-clamp-2">
                        {slot.dayTitle}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {slot.estimatedTime || '1.5 hours'}
                      </span>
                    </div>

                    {/* Hierarchy Breadcrumb: Subject -> Chapter */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Subject: {subject?.name || slot.subjectName || 'Unassigned'}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <FolderTree className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{chapter?.title || slot.chapterTitle || 'Unassigned Chapter'}</span>
                      </div>
                    </div>

                    {/* Linked Topics List */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Linked Topics ({linkedTopics.length})</span>
                      </div>

                      {linkedTopics.length === 0 ? (
                        <p className="text-xs text-amber-600 italic flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          No topics linked to this day slot yet.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {linkedTopics.map(t => (
                            <div key={t.id} className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl truncate">
                              • {t.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content Assets Summary Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" />
                        {totalPdfs} PDF
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                        {totalImgs} Images
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        hasVideo ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Video className="w-2.5 h-2.5" />
                        {hasVideo ? 'Video' : 'No Video'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <Brain className="w-2.5 h-2.5" />
                        {totalCards} Cards
                      </span>

                      {slot.hasLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          🔴 Live Rounds
                        </span>
                      )}
                      {slot.hasTest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                          📝 CBT Test
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(slot)}
                        title="Edit Day Schedule"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSlot(slot)}
                        title="Remove Day Schedule"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Direct Student View Preview */}
                    <a
                      href={`/day/${slot.dayNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                    >
                      <span>Preview Student View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE DAY / LINK TOPICS                                         */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingSlot ? `Edit Schedule Slot — Day ${editingSlot.dayNumber}` : 'Schedule New Day / Link Content'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Map Exam {selectedExam.name} to Week {formWeekNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              
              {/* Week & Day numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Week Number
                  </label>
                  <select
                    value={formWeekNumber}
                    onChange={(e) => setFormWeekNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {availableWeeks.map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Day Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDayNumber}
                    onChange={(e) => setFormDayNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Day Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Day Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Day 3 — Cardiac Arrhythmias & ECG Interpretation"
                  value={formDayTitle}
                  onChange={(e) => setFormDayTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Cascade: Select Subject -> Select Chapter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    1. Select Subject *
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => {
                      setFormSubjectId(e.target.value);
                      const chaps = chapters.filter(c => c.subjectId === e.target.value);
                      setFormChapterId(chaps[0]?.id || '');
                      setFormSelectedTopicIds([]);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {examSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-sky-600" />
                    2. Select Chapter
                  </label>
                  <select
                    value={formChapterId}
                    onChange={(e) => {
                      setFormChapterId(e.target.value);
                      setFormSelectedTopicIds([]);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose Chapter --</option>
                    {subjectChapters.map(c => (
                      <option key={c.id} value={c.id}>Ch {c.chapterNumber}: {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Link Topics from Chapter */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Link Topics to this Day ({formSelectedTopicIds.length} Selected)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Check topics to include in this daily study session</span>
                </label>

                {chapterTopics.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    No topics created in this chapter yet. You can create topics in the "Chapters & Topics" menu.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {chapterTopics.map(top => {
                      const isSelected = formSelectedTopicIds.includes(top.id);
                      return (
                        <label
                          key={top.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTopicSelection(top.id)}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900">{top.title}</div>
                            <div className="text-[10px] text-slate-400">
                              Topic {top.topicNumber} • {top.duration} • {top.difficulty}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live and Test Attachments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasLive}
                    onChange={(e) => setFormHasLive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Include Live Grand Rounds</div>
                    <div className="text-[10px] text-slate-400">Nightly faculty zoom session</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasTest}
                    onChange={(e) => setFormHasTest(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Include Timed CBT Test</div>
                    <div className="text-[10px] text-slate-400">Clinical vignette exam mode</div>
                  </div>
                </label>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Drip Status
                </label>
                <div className="flex items-center gap-4">
                  {['Active', 'Scheduled', 'Locked'].map(st => (
                    <label key={st} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="slotStatus"
                        checked={formStatus === st}
                        onChange={() => setFormStatus(st)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingSlot ? 'Save Changes' : 'Publish to Schedule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deletingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Remove Day Schedule?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove the schedule mapping for <span className="font-bold text-slate-800">Day {deletingSlot.dayNumber}</span>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSlot(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSlot}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
