import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderTree, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Trash2, 
  X,
  GraduationCap
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function FacultyChaptersPage() {
  const { examId = 'neet-pg', subjectId = 'sub-neet-cardio' } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapters, setChapters] = useState(() => curriculumService.getChaptersBySubject(subjectId));
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newChapterNum, setNewChapterNum] = useState(1);

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSubject = curriculumService.getSubjectById(subjectId);
    if (foundSubject) setSubject(foundSubject);
    const chapList = curriculumService.getChaptersBySubject(subjectId);
    setChapters(chapList || []);
    if (chapList && chapList.length > 0) {
      setNewChapterNum(chapList.length + 1);
    }
  }, [examId, subjectId]);

  const handleCreateChapter = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newChapter = {
      id: `chap-${Date.now()}`,
      subjectId: subjectId,
      chapterNumber: Number(newChapterNum) || (chapters.length + 1),
      title: newTitle.trim(),
      description: newDesc.trim() || 'Clinical foundations and high-yield examination pearls.',
      topicsCount: 0,
      totalDuration: '0 mins'
    };

    curriculumService.saveChapter(newChapter);
    const updated = curriculumService.getChaptersBySubject(subjectId);
    setChapters(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewChapterNum(updated.length + 1);
  };

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={`/faculty/exams/${examId}/subjects`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Subjects</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 3 • Unit Chapters
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase">
                {exam.name} • {subject?.name || 'Department Subject'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Curriculum Chapters & Syllabus
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Author and sequence unit chapters. Click on any chapter to view its topics, question links, and content studios.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chapters..."
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
            <span>+ Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Chapters Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredChapters.map((chap, idx) => {
          const topics = curriculumService.getTopicsByChapter(chap.id) || [];

          return (
            <div
              key={chap.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                {/* Chapter Number Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    Unit #{chap.chapterNumber || (idx + 1)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{chap.totalDuration || '3.5 hrs'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {chap.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {chap.description || 'Clinical diagnostics, pathophysiology, guideline pharmacological regimens.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{topics.length || chap.topicsCount || 3} Topics</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Authored</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Hierarchy Level 4 ➡️ Topics
                </span>
                <Link
                  to={`/faculty/exams/${examId}/subjects/${subjectId}/chapters/${chap.id}/topics`}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 group/btn cursor-pointer shadow-2xs"
                >
                  <span>View Topics</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Chapter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Unit Chapter</h3>
                  <p className="text-xs text-slate-500">Add to {subject?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChapter} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Chapter / Unit Number</label>
                <input
                  type="number"
                  min="1"
                  value={newChapterNum}
                  onChange={(e) => setNewChapterNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Chapter Title</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Coronary Syndromes & Cardiac Biomarkers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description / Clinical Focus</label>
                <textarea
                  rows="3"
                  placeholder="High-yield guideline topics, diagnostic criteria, ECG pearls..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
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
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
