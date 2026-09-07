import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Presentation, 
  Radio, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Award,
  Layers,
  Compass
} from 'lucide-react';
import { curriculumHierarchyService } from '../services/curriculumHierarchyService';

export default function CurriculumRoadmapView({ defaultExamId = 'exam-neet-pg' }) {
  const navigate = useNavigate();
  const [exams, setExams] = useState(() => curriculumHierarchyService.getExams());
  const [selectedExamId, setSelectedExamId] = useState(defaultExamId);
  
  const [curriculums, setCurriculums] = useState(() => curriculumHierarchyService.getCurriculums(selectedExamId));
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(() => {
    const currs = curriculumHierarchyService.getCurriculums(selectedExamId);
    return currs.find(c => c.is_default)?.id || currs[0]?.id || '';
  });

  const [expandedChapters, setExpandedChapters] = useState({});

  // Sync state with hierarchy service updates
  useEffect(() => {
    const currs = curriculumHierarchyService.getCurriculums(selectedExamId);
    setCurriculums(currs);
    const def = currs.find(c => c.is_default) || currs[0];
    setSelectedCurriculumId(def?.id || '');
  }, [selectedExamId]);

  const chapters = selectedCurriculumId 
    ? curriculumHierarchyService.getChapters(selectedCurriculumId) 
    : [];

  useEffect(() => {
    if (chapters.length > 0 && Object.keys(expandedChapters).length === 0) {
      setExpandedChapters({ [chapters[0].id]: true });
    }
  }, [chapters]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleTopicClick = (chapter, topic) => {
    navigate(`/day/3?topicId=${topic.id}&chapterId=${chapter.id}&examId=${selectedExamId}`);
  };

  const activeCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

  return (
    <div className="space-y-6">
      
      {/* Hierarchy Header & Exam Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Product Target Structure
              </span>
              <span className="text-xs text-slate-400 font-medium">Exam ➔ Curriculum ➔ Chapter ➔ Topic ➔ Mixed Content</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Clinical Syllabus & Chapter Schedule Roadmap
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select your academic curriculum track to view structured chapters, pacing schedules, and topic content libraries.
            </p>
          </div>

          {/* Exam Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-2xl">
            {exams.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedExamId(e.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedExamId === e.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{e.country === 'India' ? '🇮🇳' : '🇺🇸'}</span>
                <span>{e.title.split('&')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum Versions Selector */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-brand-600" />
            <span>Available Curriculum Tracks ({curriculums.length}):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {curriculums.map(curr => {
              const isSelected = selectedCurriculumId === curr.id;
              const chapsCount = curriculumHierarchyService.getChapters(curr.id).length;

              return (
                <div
                  key={curr.id}
                  onClick={() => setSelectedCurriculumId(curr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/60 border-brand-400 shadow-xs ring-1 ring-brand-500/20'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{curr.title}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                          {curr.version}
                        </span>
                        {curr.is_default && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Core
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{curr.description}</p>
                    </div>

                    <span className="text-xs font-bold text-slate-600 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {chapsCount} Chapters
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chapters & 1:1 Schedules List */}
      <div className="space-y-4">
        {chapters.map((chapter, chapIdx) => {
          const schedule = curriculumHierarchyService.getChapterSchedule(chapter.id);
          const topics = curriculumHierarchyService.getTopics(chapter.id);
          const isExpanded = Boolean(expandedChapters[chapter.id]);
          const isCurrentChapter = chapIdx === 0;

          return (
            <div
              key={chapter.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isCurrentChapter
                  ? 'border-brand-300 shadow-md ring-1 ring-brand-500/10'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {/* Chapter Header Card with 1:1 Schedule */}
              <div
                onClick={() => toggleChapter(chapter.id)}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                    isCurrentChapter
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    <span className="text-[9px] uppercase font-bold opacity-80">CH</span>
                    <span className="text-base font-black leading-none">{chapter.chapter_number}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900">
                        {chapter.title}
                      </h4>
                      {isCurrentChapter && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 uppercase tracking-wide">
                          Active Chapter
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">{chapter.description}</p>
                  </div>
                </div>

                {/* 1:1 Schedule Pill */}
                <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold text-amber-900">
                        {schedule.start_date} – {schedule.end_date}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-200 text-amber-800">
                        {schedule.recommended_study_hours}h Pacing
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                      Milestone: {schedule.milestone_name}
                    </div>
                  </div>

                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50'
                  }`}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </span>
                </div>
              </div>

              {/* Topics & Mixed Content List (When Expanded) */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                  {topics.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No topics configured in this chapter yet.
                    </div>
                  ) : (
                    topics.map((topic, topIdx) => {
                      const contents = curriculumHierarchyService.getContents(topic.id);
                      
                      // Count content types
                      const hasVideo = contents.some(c => c.content_type === 'video');
                      const hasPdf = contents.some(c => c.content_type === 'pdf');
                      const hasPpt = contents.some(c => c.content_type === 'ppt');
                      const hasPhoto = contents.some(c => c.content_type === 'photo');
                      const hasLive = contents.some(c => c.content_type === 'live_session');

                      return (
                        <div
                          key={topic.id}
                          onClick={() => handleTopicClick(chapter, topic)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                              {topIdx + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                  Topic {topic.topic_number}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  ~{topic.estimated_minutes} mins
                                </span>
                              </div>

                              <h5 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors mt-0.5">
                                {topic.title}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1">{topic.summary}</p>
                            </div>
                          </div>

                          {/* Mixed Content Badges */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {hasVideo && (
                              <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                <span>Video</span>
                              </span>
                            )}
                            {hasPdf && (
                              <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>PDF Notes</span>
                              </span>
                            )}
                            {hasPpt && (
                              <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                                <Presentation className="w-3 h-3" />
                                <span>PPT Deck</span>
                              </span>
                            )}
                            {hasPhoto && (
                              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>ECG Strip</span>
                              </span>
                            )}
                            {hasLive && (
                              <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold flex items-center gap-1">
                                <Radio className="w-3 h-3" />
                                <span>Live Class</span>
                              </span>
                            )}

                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors ml-2">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
