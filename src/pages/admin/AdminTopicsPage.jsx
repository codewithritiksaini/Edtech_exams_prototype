import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
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
  Clock, 
  Sparkles, 
  FolderTree, 
  Layers,
  Video, 
  Image as ImageIcon, 
  Brain, 
  Radio, 
  Check, 
  Filter
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function AdminTopicsPage() {
  const { examId = 'neet-pg', subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapter, setChapter] = useState(() => curriculumService.getChapterById(chapterId));
  const [topics, setTopics] = useState(() => curriculumService.getTopics(chapterId, subjectId, examId));

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Add / Edit Topic Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formNumber, setFormNumber] = useState(1);
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formDifficulty, setFormDifficulty] = useState('High-Yield');
  const [formStatus, setFormStatus] = useState('Published');

  useEffect(() => {
    const unsub = curriculumService.subscribeCurriculum(() => {
      setSubject(curriculumService.getSubjectById(subjectId));
      setChapter(curriculumService.getChapterById(chapterId));
      setTopics(curriculumService.getTopics(chapterId, subjectId, examId));
    });
    return unsub;
  }, [chapterId, subjectId, examId]);

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSub = curriculumService.getSubjectById(subjectId);
    if (foundSub) setSubject(foundSub);
    const foundChap = curriculumService.getChapterById(chapterId);
    if (foundChap) setChapter(foundChap);
  }, [examId, subjectId, chapterId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted topics
  const filteredTopics = useMemo(() => {
    return topics
      .filter(t => {
        if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
        if (!searchQuery.trim()) return true;
        return t.title.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => (a.topicNumber || 0) - (b.topicNumber || 0));
  }, [topics, difficultyFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingTopic(null);
    setFormTitle('');
    setFormNumber(topics.length + 1);
    setFormDuration('45 mins');
    setFormDifficulty('High-Yield');
    setFormStatus('Published');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (top) => {
    setEditingTopic(top);
    setFormTitle(top.title);
    setFormNumber(top.topicNumber || 1);
    setFormDuration(top.duration || '45 mins');
    setFormDifficulty(top.difficulty || 'High-Yield');
    setFormStatus(top.status || 'Published');
    setIsModalOpen(true);
  };

  const handleSaveTopic = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTopic) {
      curriculumService.saveTopic({
        ...editingTopic,
        title: formTitle.trim(),
        topicNumber: Number(formNumber),
        duration: formDuration,
        difficulty: formDifficulty,
        status: formStatus
      });
      showToast(`Topic "${formTitle}" updated successfully!`);
    } else {
      curriculumService.saveTopic({
        examId,
        subjectId,
        chapterId,
        title: formTitle.trim(),
        topicNumber: Number(formNumber),
        duration: formDuration,
        difficulty: formDifficulty,
        status: formStatus,
        content: {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          liveClasses: [],
          clinicalNotes: ''
        }
      });
      showToast(`New topic "${formTitle}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTopic = (topId, topTitle) => {
    if (window.confirm(`Are you sure you want to delete topic "${topTitle}"?`)) {
      curriculumService.deleteTopic(topId);
      showToast(`Topic "${topTitle}" deleted.`);
    }
  };

  const handleMoveOrder = (topId, direction) => {
    curriculumService.moveTopicOrder(topId, direction);
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
              to={`/admin/exams/${examId}/subjects/${subjectId}/chapters`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Chapters</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 4 • Learning Topics
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {chapter?.title || 'Chapter'} — Topics
              </h1>
              <p className="text-xs text-slate-400">
                Subject: <strong className="text-slate-700">{subject?.name}</strong> • Unit #{chapter?.chapterNumber || 1}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Clinical scenarios and topics under <strong>{chapter?.title}</strong>. Click <strong>"Launch Content Studio 🚀"</strong> to upload notes, ECG images, lecture videos, and flashcards.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Topic</span>
        </button>
      </div>

      {/* Toolbar: Search & Difficulty Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {['all', 'High-Yield', 'Core Clinical', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  difficultyFilter === diff
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((top, idx) => {
          const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
          const imgCount = top.content?.images?.length || 0;
          const hasVideo = Boolean(top.content?.video);
          const flashcardCount = top.content?.flashcards?.length || 0;
          const hasLive = (top.content?.liveClasses?.length || 0) > 0;

          return (
            <div
              key={top.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
            >
              <div className="flex items-start gap-4 min-w-0">
                {/* Topic Number */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Topic</span>
                  <span className="text-base font-black leading-tight">{top.topicNumber || idx + 1}</span>
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {top.title}
                    </h3>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                      top.difficulty === 'High-Yield'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {top.difficulty || 'High-Yield'}
                    </span>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{top.duration || '45 mins'}</span>
                    </span>
                  </div>

                  {/* Content Asset Indicators Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {pdfCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold text-[11px] border border-sky-200/60">
                        <FileText className="w-3 h-3 text-sky-600" />
                        <span>{pdfCount} PDF{pdfCount > 1 ? 's' : ''}</span>
                      </span>
                    )}

                    {imgCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
                        <ImageIcon className="w-3 h-3 text-emerald-600" />
                        <span>{imgCount} Diagram{imgCount > 1 ? 's' : ''}</span>
                      </span>
                    )}

                    {hasVideo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200/60">
                        <Video className="w-3 h-3 text-purple-600" />
                        <span>Lecture Video</span>
                      </span>
                    )}

                    {flashcardCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200/60">
                        <Brain className="w-3 h-3 text-amber-600" />
                        <span>{flashcardCount} Cards</span>
                      </span>
                    )}

                    {hasLive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold text-[11px] border border-red-200/60">
                        <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                        <span>Live Broadcast</span>
                      </span>
                    )}

                    {pdfCount === 0 && imgCount === 0 && !hasVideo && flashcardCount === 0 && (
                      <span className="text-[11px] text-slate-400 italic">
                        No assets uploaded yet. Open studio to add content.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Reorder Up / Down */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <button
                    onClick={() => handleMoveOrder(top.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Topic Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(top.id, 'down')}
                    disabled={idx === filteredTopics.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Topic Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEditModal(top)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Edit Topic Meta"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTopic(top.id, top.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* LEVEL 5 DRILLDOWN ACTION: LAUNCH CONTENT STUDIO */}
                <Link
                  to={`/admin/exams/${examId}/subjects/${subjectId}/chapters/${chapterId}/topics/${top.id}/content`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Content Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredTopics.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No Topics Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No clinical topics have been added under this chapter yet.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              + Create First Topic
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingTopic ? 'Edit Topic' : `Add Topic to Unit ${chapter?.chapterNumber || 1}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Topic Title / Clinical Presentation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aortic Stenosis & Regurgitation Auscultation Pearls"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Topic Order #</label>
                  <input
                    type="number"
                    min="1"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Estimated Duration</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="45 mins"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Yield / Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="High-Yield">High-Yield</option>
                    <option value="Core Clinical">Core Clinical</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
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
                  {editingTopic ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
