// =============================================================================
// CURRICULUM HIERARCHY SERVICE — PHASE 1 REACTIVE STORE
// Manages: Exam -> Curriculum -> Chapter -> Topic -> Content (+ 1:1 Schedule)
// Persists in localStorage and provides real-time event broadcasting
// =============================================================================

import {
  SEED_EXAMS,
  SEED_CURRICULUMS,
  SEED_CHAPTERS,
  SEED_SCHEDULES,
  SEED_TOPICS,
  SEED_CONTENTS
} from '../data/curriculumHierarchyMockData';

const STORAGE_KEY = 'medprep_curriculum_hierarchy_v2';
const EVENT_NAME = 'medprep-hierarchy-updated';

class CurriculumHierarchyService {
  constructor() {
    this.store = this.loadStore();
  }

  loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.exams) &&
          Array.isArray(parsed.curriculums) &&
          Array.isArray(parsed.chapters) &&
          Array.isArray(parsed.schedules) &&
          Array.isArray(parsed.topics) &&
          Array.isArray(parsed.contents)
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Hierarchy store read error, falling back to seed:', e);
    }
    return this.getFreshSeed();
  }

  getFreshSeed() {
    return {
      exams: JSON.parse(JSON.stringify(SEED_EXAMS)),
      curriculums: JSON.parse(JSON.stringify(SEED_CURRICULUMS)),
      chapters: JSON.parse(JSON.stringify(SEED_CHAPTERS)),
      schedules: JSON.parse(JSON.stringify(SEED_SCHEDULES)),
      topics: JSON.parse(JSON.stringify(SEED_TOPICS)),
      contents: JSON.parse(JSON.stringify(SEED_CONTENTS))
    };
  }

  saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: this.store }));
    } catch (e) {
      console.error('Failed to persist hierarchy store to localStorage:', e);
    }
  }

  resetToSeed() {
    this.store = this.getFreshSeed();
    this.saveStore();
    return this.store;
  }

  // ===========================================================================
  // 1. EXAMS
  // ===========================================================================
  getExams() {
    return [...this.store.exams];
  }

  getExam(examId) {
    return this.store.exams.find(e => e.id === examId || e.slug === examId) || null;
  }

  // ===========================================================================
  // 2. CURRICULUMS (1 Exam -> Many Curriculums)
  // ===========================================================================
  getCurriculums(examId = null) {
    if (!examId) return [...this.store.curriculums];
    const exam = this.getExam(examId);
    const targetId = exam ? exam.id : examId;
    return this.store.curriculums
      .filter(c => c.exam_id === targetId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  getCurriculum(curriculumId) {
    return this.store.curriculums.find(c => c.id === curriculumId) || null;
  }

  createCurriculum(data) {
    const exam = this.getExam(data.exam_id);
    const newId = `curr-${Date.now()}`;
    const newCurriculum = {
      id: newId,
      exam_id: exam ? exam.id : data.exam_id,
      title: data.title || 'New Academic Curriculum',
      version: data.version || 'v1.0',
      description: data.description || '',
      is_default: Boolean(data.is_default),
      status: data.status || 'published',
      order_index: this.getCurriculums(data.exam_id).length + 1,
      created_at: new Date().toISOString()
    };
    this.store.curriculums.push(newCurriculum);
    this.saveStore();
    return newCurriculum;
  }

  updateCurriculum(curriculumId, updates) {
    const idx = this.store.curriculums.findIndex(c => c.id === curriculumId);
    if (idx === -1) return null;
    this.store.curriculums[idx] = {
      ...this.store.curriculums[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveStore();
    return this.store.curriculums[idx];
  }

  deleteCurriculum(curriculumId) {
    // Cascade delete chapters, topics, contents, schedules
    const chapters = this.getChapters(curriculumId);
    chapters.forEach(ch => this.deleteChapter(ch.id, false));
    this.store.curriculums = this.store.curriculums.filter(c => c.id !== curriculumId);
    this.saveStore();
    return true;
  }

  // ===========================================================================
  // 3. CHAPTERS (1 Curriculum -> Many Chapters)
  // ===========================================================================
  getChapters(curriculumId) {
    return this.store.chapters
      .filter(ch => ch.curriculum_id === curriculumId)
      .sort((a, b) => (a.chapter_number || a.order_index || 0) - (b.chapter_number || b.order_index || 0));
  }

  getChapter(chapterId) {
    return this.store.chapters.find(ch => ch.id === chapterId) || null;
  }

  createChapter(data) {
    const existing = this.getChapters(data.curriculum_id);
    const newId = `chap-${Date.now()}`;
    const chapterNum = data.chapter_number || existing.length + 1;
    const newChapter = {
      id: newId,
      curriculum_id: data.curriculum_id,
      title: data.title || `Chapter ${chapterNum}`,
      chapter_number: chapterNum,
      description: data.description || '',
      estimated_duration_hours: Number(data.estimated_duration_hours) || 12.0,
      order_index: existing.length + 1,
      status: data.status || 'active',
      created_at: new Date().toISOString()
    };
    this.store.chapters.push(newChapter);

    // Automatically create a default 1:1 Schedule for this Chapter
    const defaultSchedule = {
      id: `sched-${newId}`,
      chapter_id: newId,
      schedule_type: data.schedule_type || 'fixed_dates',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      target_duration_days: Number(data.target_duration_days) || 7,
      recommended_study_hours: Number(data.recommended_study_hours) || 14,
      milestone_name: data.milestone_name || `${newChapter.title} Benchmark Assessment`,
      unlock_at: new Date().toISOString()
    };
    this.store.schedules.push(defaultSchedule);

    this.saveStore();
    return newChapter;
  }

  updateChapter(chapterId, updates) {
    const idx = this.store.chapters.findIndex(ch => ch.id === chapterId);
    if (idx === -1) return null;
    this.store.chapters[idx] = {
      ...this.store.chapters[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveStore();
    return this.store.chapters[idx];
  }

  deleteChapter(chapterId, autoSave = true) {
    // Delete topics & contents
    const topics = this.getTopics(chapterId);
    topics.forEach(top => this.deleteTopic(top.id, false));
    // Delete 1:1 schedule
    this.store.schedules = this.store.schedules.filter(s => s.chapter_id !== chapterId);
    // Delete chapter
    this.store.chapters = this.store.chapters.filter(ch => ch.id !== chapterId);
    if (autoSave) this.saveStore();
    return true;
  }

  // ===========================================================================
  // 4. CHAPTER SCHEDULE (Exactly 1 Schedule per Chapter)
  // ===========================================================================
  getChapterSchedule(chapterId) {
    let schedule = this.store.schedules.find(s => s.chapter_id === chapterId);
    if (!schedule) {
      // Ensure 1:1 invariant
      schedule = {
        id: `sched-${chapterId}`,
        chapter_id: chapterId,
        schedule_type: 'fixed_dates',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        target_duration_days: 7,
        recommended_study_hours: 14,
        milestone_name: 'Chapter Milestone Assessment',
        unlock_at: new Date().toISOString()
      };
      this.store.schedules.push(schedule);
      this.saveStore();
    }
    return schedule;
  }

  setChapterSchedule(chapterId, scheduleData) {
    const idx = this.store.schedules.findIndex(s => s.chapter_id === chapterId);
    const updated = {
      id: idx !== -1 ? this.store.schedules[idx].id : `sched-${chapterId}`,
      chapter_id: chapterId,
      schedule_type: scheduleData.schedule_type || 'fixed_dates',
      start_date: scheduleData.start_date || new Date().toISOString().split('T')[0],
      end_date: scheduleData.end_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      target_duration_days: Number(scheduleData.target_duration_days) || 7,
      recommended_study_hours: Number(scheduleData.recommended_study_hours) || 14,
      milestone_name: scheduleData.milestone_name || 'Chapter Milestone Review',
      unlock_at: scheduleData.unlock_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (idx !== -1) {
      this.store.schedules[idx] = updated;
    } else {
      this.store.schedules.push(updated);
    }
    this.saveStore();
    return updated;
  }

  // ===========================================================================
  // 5. TOPICS (1 Chapter -> Many Topics)
  // ===========================================================================
  getTopics(chapterId) {
    return this.store.topics
      .filter(t => t.chapter_id === chapterId)
      .sort((a, b) => (a.topic_number || a.order_index || 0) - (b.topic_number || b.order_index || 0));
  }

  getTopic(topicId) {
    return this.store.topics.find(t => t.id === topicId) || null;
  }

  createTopic(data) {
    const existing = this.getTopics(data.chapter_id);
    const newId = `top-${Date.now()}`;
    const topicNum = data.topic_number || existing.length + 1;
    const newTopic = {
      id: newId,
      chapter_id: data.chapter_id,
      title: data.title || `Topic ${topicNum}`,
      topic_number: topicNum,
      summary: data.summary || '',
      order_index: existing.length + 1,
      estimated_minutes: Number(data.estimated_minutes) || 90,
      created_at: new Date().toISOString()
    };
    this.store.topics.push(newTopic);
    this.saveStore();
    return newTopic;
  }

  updateTopic(topicId, updates) {
    const idx = this.store.topics.findIndex(t => t.id === topicId);
    if (idx === -1) return null;
    this.store.topics[idx] = {
      ...this.store.topics[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveStore();
    return this.store.topics[idx];
  }

  deleteTopic(topicId, autoSave = true) {
    this.store.contents = this.store.contents.filter(c => c.topic_id !== topicId);
    this.store.topics = this.store.topics.filter(t => t.id !== topicId);
    if (autoSave) this.saveStore();
    return true;
  }

  // ===========================================================================
  // 6. CONTENTS (1 Topic -> Many Mixed Content items)
  // Supported types: 'video' | 'photo' | 'pdf' | 'ppt' | 'live_session'
  // ===========================================================================
  getContents(topicId) {
    return this.store.contents
      .filter(c => c.topic_id === topicId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  getContent(contentId) {
    return this.store.contents.find(c => c.id === contentId) || null;
  }

  createContent(data) {
    const allowedTypes = ['video', 'photo', 'pdf', 'ppt', 'live_session'];
    const type = allowedTypes.includes(data.content_type) ? data.content_type : 'video';
    const existing = this.getContents(data.topic_id);
    const newId = `cnt-${type}-${Date.now()}`;

    const newContent = {
      id: newId,
      topic_id: data.topic_id,
      content_type: type,
      title: data.title || `Untitled ${type.toUpperCase()} Item`,
      description: data.description || '',
      order_index: existing.length + 1,
      is_free_preview: Boolean(data.is_free_preview),
      media_url: data.media_url || '',
      meta: data.meta || {},
      created_at: new Date().toISOString()
    };

    this.store.contents.push(newContent);
    this.saveStore();
    return newContent;
  }

  updateContent(contentId, updates) {
    const idx = this.store.contents.findIndex(c => c.id === contentId);
    if (idx === -1) return null;
    this.store.contents[idx] = {
      ...this.store.contents[idx],
      ...updates,
      meta: {
        ...(this.store.contents[idx].meta || {}),
        ...(updates.meta || {})
      },
      updated_at: new Date().toISOString()
    };
    this.saveStore();
    return this.store.contents[idx];
  }

  deleteContent(contentId) {
    this.store.contents = this.store.contents.filter(c => c.id !== contentId);
    this.saveStore();
    return true;
  }

  // ===========================================================================
  // 7. COMPREHENSIVE QUERY & AGGREGATION HELPERS
  // ===========================================================================

  // Flattened Content List for Admin Content Library with full hierarchy paths
  getAllContentFlat(filterExamId = null) {
    const results = [];
    const exams = filterExamId ? [this.getExam(filterExamId)].filter(Boolean) : this.getExams();

    exams.forEach(exam => {
      const curriculums = this.getCurriculums(exam.id);
      curriculums.forEach(curriculum => {
        const chapters = this.getChapters(curriculum.id);
        chapters.forEach(chapter => {
          const schedule = this.getChapterSchedule(chapter.id);
          const topics = this.getTopics(chapter.id);
          topics.forEach(topic => {
            const contents = this.getContents(topic.id);
            contents.forEach(content => {
              results.push({
                id: content.id,
                title: content.title,
                contentType: content.content_type,
                typeLabel: this.getContentTypeLabel(content.content_type),
                description: content.description,
                mediaUrl: content.media_url,
                meta: content.meta || {},
                isFreePreview: content.is_free_preview,
                // Hierarchy lineage
                examId: exam.id,
                examTitle: exam.title,
                curriculumId: curriculum.id,
                curriculumTitle: curriculum.title,
                curriculumVersion: curriculum.version,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                chapterNumber: chapter.chapter_number,
                topicId: topic.id,
                topicTitle: topic.title,
                topicNumber: topic.topic_number,
                // Chapter Schedule
                schedule
              });
            });
          });
        });
      });
    });

    return results;
  }

  // Full Hierarchy Tree for a given Exam
  getFullHierarchyTree(examId) {
    const exam = this.getExam(examId) || this.getExams()[0];
    if (!exam) return null;

    const curriculums = this.getCurriculums(exam.id).map(curr => {
      const chapters = this.getChapters(curr.id).map(chap => {
        const schedule = this.getChapterSchedule(chap.id);
        const topics = this.getTopics(chap.id).map(top => {
          const contents = this.getContents(top.id);
          return {
            ...top,
            contents
          };
        });

        return {
          ...chap,
          schedule,
          topics
        };
      });

      return {
        ...curr,
        chapters
      };
    });

    return {
      ...exam,
      curriculums
    };
  }

  getContentTypeLabel(type) {
    switch (type) {
      case 'video': return 'Video Lecture';
      case 'photo': return 'Clinical Photo / Image';
      case 'pdf': return 'PDF Document';
      case 'ppt': return 'PPT Presentation';
      case 'live_session': return 'Live Interactive Session';
      default: return type?.toUpperCase() || 'Content';
    }
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.store);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }
}

export const curriculumHierarchyService = new CurriculumHierarchyService();
