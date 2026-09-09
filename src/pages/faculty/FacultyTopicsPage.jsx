import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderTree, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Search, 
  Clock, 
  Sparkles, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Brain, 
  Radio, 
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function FacultyTopicsPage() {
  const { examId = 'neet-pg', subjectId = 'sub-neet-cardio', chapterId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapter, setChapter] = useState(() => curriculumService.getChapterById(chapterId));
  const [topics, setTopics] = useState(() => curriculumService.getTopicsByChapter(chapterId));
  const [searchQuery, setSearchQuery] = useState('');

  // Add Topic Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('45 mins');
  const [newDifficulty, setNewDifficulty] = useState('High-Yield');

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSubject = curriculumService.getSubjectById(subjectId);
    if (foundSubject) setSubject(foundSubject);
    const foundChapter = curriculumService.getChapterById(chapterId);
    if (foundChapter) setChapter(foundChapter);
    const topicList = curriculumService.getTopicsByChapter(chapterId);
    setTopics(topicList || []);
  }, [examId, subjectId, chapterId]);

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTopic = {
      id: `top-${Date.now()}`,
      chapterId: chapterId,
      title: newTitle.trim(),
      duration: newDuration.trim() || '45 mins',
      difficulty: newDifficulty,
      content: {
        pdfList: [],
        images: [],
        video: null,
        flashcards: [],
        liveClasses: [],
        clinicalNotes: 'Initial guideline summary drafted.'
      }
    };

    curriculumService.saveTopic(newTopic);
    const updated = curriculumService.getTopicsByChapter(chapterId);
    setTopics(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDuration('45 mins');
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={`/faculty/exams/${examId}/subjects/${subjectId}/chapters`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Chapters</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 4 • Topic Roster
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase">
                {exam.name} ➡️ {subject?.name} ➡️ Unit #{chapter?.chapterNumber || 1}: {chapter?.title}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Interactive Topics & Content Studios
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Each topic provides a dedicated 6-channel Content Studio for PDF notes, high-res ECG diagrams, video lectures, and active recall flashcards.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Topic</span>
          </button>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((top, idx) => {
          const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
          const imgCount = top.content?.images?.length || 0;
          const hasVideo = Boolean(top.content?.video);
          const flashCount = top.content?.flashcards?.length || 0;

          return (
            <div
              key={top.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {top.title}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {top.difficulty || 'High-Yield'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{top.duration || '45 mins'}</span>
                  </span>
                  <span>•</span>
                  {/* Channels Status */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      pdfCount > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <FileText className="w-3 h-3" />
                      <span>{pdfCount} PDFs</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      imgCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <ImageIcon className="w-3 h-3" />
                      <span>{imgCount} Diagrams</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      hasVideo ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Video className="w-3 h-3" />
                      <span>{hasVideo ? 'Video' : 'No Video'}</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      flashCount > 0 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Brain className="w-3 h-3" />
                      <span>{flashCount} Flashcards</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Launch Content Studio */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/faculty/exams/${examId}/subjects/${subjectId}/chapters/${chapterId}/topics/${top.id}/content`}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Content Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Topic</h3>
                  <p className="text-xs text-slate-500">Add to Unit #{chapter?.chapterNumber || 1}: {chapter?.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ventricular Tachycardia: Brugada vs Vereckei Criteria"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Estimated Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Difficulty / Priority</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="High-Yield">High-Yield</option>
                    <option value="Essential">Essential</option>
                    <option value="Advanced / Super-Specialty">Advanced / Super-Specialty</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  Create Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
