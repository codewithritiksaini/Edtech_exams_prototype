import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Layers,
  BookOpen,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function AdminChaptersPage() {
  const { examId = 'neet-pg', subjectId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase(), flag: '🩺' });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapters, setChapters] = useState(() => curriculumService.getChapters(subjectId, examId));
  const [topics, setTopics] = useState(() => curriculumService.getTopics(null, subjectId, examId));

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Add / Edit Chapter Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formNumber, setFormNumber] = useState(1);
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  useEffect(() => {
    const unsub = curriculumService.subscribeCurriculum(() => {
      setSubject(curriculumService.getSubjectById(subjectId));
      setChapters(curriculumService.getChapters(subjectId, examId));
      setTopics(curriculumService.getTopics(null, subjectId, examId));
    });
    return unsub;
  }, [subjectId, examId]);

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSub = curriculumService.getSubjectById(subjectId);
    if (foundSub) setSubject(foundSub);
  }, [examId, subjectId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted chapters
  const filteredChapters = useMemo(() => {
    return chapters
      .filter(c => {
        if (!searchQuery.trim()) return true;
        return c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      })
      .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
  }, [chapters, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingChapter(null);
    setFormTitle('');
    setFormNumber(chapters.length + 1);
    setFormDesc('Core clinical unit focusing on clinical diagnostic pearls, pathology, and therapy.');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chap) => {
    setEditingChapter(chap);
    setFormTitle(chap.title);
    setFormNumber(chap.chapterNumber || 1);
    setFormDesc(chap.description || '');
    setFormStatus(chap.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveChapter = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingChapter) {
      curriculumService.saveChapter({
        ...editingChapter,
        title: formTitle.trim(),
        chapterNumber: Number(formNumber),
        description: formDesc.trim(),
        status: formStatus
      });
      showToast(`Chapter "${formTitle}" updated successfully!`);
    } else {
      curriculumService.saveChapter({
        examId,
        subjectId,
        title: formTitle.trim(),
        chapterNumber: Number(formNumber),
        description: formDesc.trim(),
        status: formStatus
      });
      showToast(`New chapter "${formTitle}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteChapter = (chapId, chapTitle) => {
    if (window.confirm(`Are you sure you want to delete "${chapTitle}"? All topics inside it will also be deleted.`)) {
      curriculumService.deleteChapter(chapId);
      showToast(`Chapter "${chapTitle}" deleted.`);
    }
  };

  const handleMoveOrder = (chapId, direction) => {
    curriculumService.moveChapterOrder(chapId, direction);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={`/admin/subjects?exam=${examId}`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Subjects</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 3 • Syllabus Chapters
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {subject?.name || 'Subject'} — Chapters
              </h1>
              <p className="text-xs text-slate-400">
                Exam Track: <strong className="text-slate-700">{exam?.name}</strong> • Subject Code: <strong className="text-slate-700">{subject?.code || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Organize study units for <strong>{subject?.name}</strong>. Click <strong>"Manage Topics ➡️"</strong> on any chapter to author clinical scenarios, upload PDFs, and set up live grand rounds.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Chapter Unit</span>
        </button>
      </div>

      {/* Toolbar: Search + Quick Stats */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chapter title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            {filteredChapters.length} Chapters Available
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            {topics.length} Total Topics
          </span>
        </div>
      </div>

      {/* Chapters Cards List */}
      <div className="space-y-4">
        {filteredChapters.map((chap, idx) => {
          const chapTopics = topics.filter(t => t.chapterId === chap.id);

          return (
            <div
              key={chap.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
            >
              <div className="flex items-start gap-4 min-w-0">
                {/* Chapter Number Badge */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Unit</span>
                  <span className="text-base font-black leading-tight">{chap.chapterNumber || idx + 1}</span>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {chap.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {chap.status || 'Active'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {chapTopics.length} Topics
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                    {chap.description || 'Clinical topics, diagnostic pearls, and active recall practice.'}
                  </p>

                  {/* Topic previews list pill */}
                  {chapTopics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {chapTopics.slice(0, 3).map((t, i) => (
                        <span key={t.id} className="text-[10.5px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {t.topicNumber ? `#${t.topicNumber}: ` : ''}{t.title}
                        </span>
                      ))}
                      {chapTopics.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          +{chapTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Reorder Buttons */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <button
                    onClick={() => handleMoveOrder(chap.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Unit Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(chap.id, 'down')}
                    disabled={idx === filteredChapters.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Unit Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEditModal(chap)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Edit Chapter"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteChapter(chap.id, chap.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Chapter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* LEVEL 4 DRILLDOWN ACTION */}
                <Link
                  to={`/admin/exams/${examId}/subjects/${subjectId}/chapters/${chap.id}/topics`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>Manage Topics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No Chapters Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No syllabus chapters currently exist under {subject?.name || 'this subject'}.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              + Create First Chapter
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Chapter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingChapter ? 'Edit Chapter Unit' : `Add Chapter to ${subject?.name}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <label className="font-bold text-slate-700">Unit #</label>
                  <input
                    type="number"
                    min="1"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-center"
                  />
                </div>
                <div className="space-y-1.5 col-span-3">
                  <label className="font-bold text-slate-700">Chapter Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acute Coronary Syndromes & STEMI Pathways"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Learning Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Outline key learning objectives, clinical maneuvers, guidelines..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  {editingChapter ? 'Save Changes' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
