// =============================================================================
// QUESTION BANK SERVICE — PHASE 3 CONTENT DATA LAYER
// Provides read, filter, search, inspection, and test-scoping operations around
// the canonical questionService repository. Does NOT store duplicate questions.
// =============================================================================

import { questionService } from './questionService.js';
import { curriculumService } from './curriculumService.js';
import { 
  questionTypeService, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from './questionTypeService.js';
import { peopleService } from './peopleService.js';

class QuestionBankService {
  /**
   * Retrieves questions with flexible composable filters.
   * @param {object} filters
   * @returns {Array<object>}
   */
  getQuestions(filters = {}) {
    const allQuestions = questionService.getQuestions();
    return this.applyFilters(allQuestions, filters);
  }

  /**
   * Retrieves a single question by ID.
   * @param {string|number} id
   * @returns {object|null}
   */
  getQuestion(id) {
    return questionService.getQuestionById(id);
  }

  /**
   * Retrieves multiple questions in exact order of requested IDs.
   * @param {Array<string|number>} ids
   * @returns {Array<object>}
   */
  getQuestionsByIds(ids = []) {
    return questionService.getQuestionsByIds(ids);
  }

  /**
   * Searches questions case-insensitively across text, options, vignette, topic, subject, and tags.
   * @param {string} query
   * @param {object} filters
   * @returns {Array<object>}
   */
  searchQuestions(query = '', filters = {}) {
    let list = this.getQuestions(filters);

    if (!query || typeof query !== 'string' || !query.trim()) {
      return list;
    }

    const cleanQuery = query.toLowerCase().trim();

    return list.filter(q => {
      // 1. Check ID
      if (String(q.id).toLowerCase().includes(cleanQuery)) return true;

      // 2. Check Prompts and Vignettes
      const prompt = (q.content?.prompt || q.question || '').toLowerCase();
      if (prompt.includes(cleanQuery)) return true;

      const vignette = (q.content?.vignette || q.vignette || '').toLowerCase();
      if (vignette.includes(cleanQuery)) return true;

      const explanation = (q.explanation || '').toLowerCase();
      if (explanation.includes(cleanQuery)) return true;

      // 3. Check Metadata: Subject, Topic, Tags
      const subject = (q.metadata?.subject || '').toLowerCase();
      if (subject.includes(cleanQuery)) return true;

      const topic = (q.metadata?.topic || '').toLowerCase();
      if (topic.includes(cleanQuery)) return true;

      const tags = Array.isArray(q.metadata?.tags) 
        ? q.metadata.tags.map(t => String(t).toLowerCase()) 
        : [];
      if (tags.some(t => t.includes(cleanQuery))) return true;

      // 4. Check Response Options
      const options = q.responseSchema?.options || q.options || [];
      if (Array.isArray(options)) {
        for (const opt of options) {
          const optText = (opt.text || opt.label || '').toLowerCase();
          if (optText.includes(cleanQuery)) return true;
        }
      }

      return false;
    });
  }

  /**
   * Internal filter engine.
   * @param {Array<object>} questions
   * @param {object} filters
   * @returns {Array<object>}
   */
  applyFilters(questions, filters = {}) {
    const {
      examId,
      subjectId,
      moduleId,
      chapterId,
      topic,
      difficulty,
      type,
      types,
      status,
      tags,
      allowedTypes,
      excludeArchived = true
    } = filters;

    return questions.filter(q => {
      // Status filter
      if (status && status !== 'all') {
        const qStatus = (q.status || 'published').toLowerCase();
        if (qStatus !== String(status).toLowerCase()) return false;
      } else if (excludeArchived) {
        if ((q.status || '').toLowerCase() === 'archived') return false;
      }

      // Exam filter
      if (examId && examId !== 'all') {
        const qExamId = q.examId || q.metadata?.examId || q.courseId;
        if (qExamId) {
          const cleanQExam = String(qExamId).toLowerCase();
          const cleanExam = String(examId).toLowerCase();
          if (!cleanQExam.includes(cleanExam) && !cleanExam.includes(cleanQExam)) {
            return false;
          }
        }
      }

      // Subject filter
      if (subjectId && subjectId !== 'all') {
        const qSubId = q.metadata?.subjectId || q.subjectId;
        const qSubName = (q.metadata?.subject || '').toLowerCase();
        const subjectObj = curriculumService.getSubjectById(subjectId);
        const subName = (subjectObj?.name || '').toLowerCase();

        if (qSubId) {
          if (String(qSubId).toLowerCase() !== String(subjectId).toLowerCase()) {
            return false;
          }
        } else if (subName && qSubName) {
          if (!subName.includes(qSubName) && !qSubName.includes(subName)) {
            return false;
          }
        }
      }

      // Module / Chapter filter
      const targetModule = moduleId || chapterId;
      if (targetModule && targetModule !== 'all') {
        const qModId = q.metadata?.moduleId || q.metadata?.chapterId || q.moduleId || q.chapterId;
        if (qModId && String(qModId) !== String(targetModule)) {
          return false;
        }
      }

      // Topic filter
      if (topic && topic !== 'all') {
        const qTopic = (q.metadata?.topic || '').toLowerCase();
        const cleanTopic = String(topic).toLowerCase();
        if (qTopic !== cleanTopic) return false;
      }

      // Difficulty filter
      if (difficulty && difficulty !== 'all') {
        const qDiff = (q.metadata?.difficulty || '').toLowerCase();
        const cleanDiff = String(difficulty).toLowerCase();
        if (qDiff !== cleanDiff) return false;
      }

      // Question Type filter
      if (type && type !== 'all') {
        const normQType = questionTypeService.normalizeQuestionTypeId(q.type);
        const normFilterType = questionTypeService.normalizeQuestionTypeId(type);
        if (normQType !== normFilterType) return false;
      }

      // Multiple Question Types filter
      if (Array.isArray(types) && types.length > 0) {
        const normQType = questionTypeService.normalizeQuestionTypeId(q.type);
        const normTypes = types.map(t => questionTypeService.normalizeQuestionTypeId(t));
        if (!normTypes.includes(normQType)) return false;
      }

      // Allowed types filter (enforces test-level allowed question types)
      if (Array.isArray(allowedTypes) && allowedTypes.length > 0) {
        const normQType = questionTypeService.normalizeQuestionTypeId(q.type);
        const normAllowed = allowedTypes.map(t => questionTypeService.normalizeQuestionTypeId(t));
        if (!normAllowed.includes(normQType)) return false;
      }

      // Tags filter (requires at least one matching tag)
      if (Array.isArray(tags) && tags.length > 0) {
        const qTags = Array.isArray(q.metadata?.tags) 
          ? q.metadata.tags.map(t => String(t).toLowerCase()) 
          : [];
        const cleanTags = tags.map(t => String(t).toLowerCase());
        const hasMatch = cleanTags.some(t => qTags.includes(t));
        if (!hasMatch) return false;
      }

      return true;
    });
  }

  /**
   * Generates summary metrics across a filtered set of questions.
   * @param {object} filters
   * @returns {{ total: number, byDifficulty: object, byType: object, bySubject: object, byStatus: object }}
   */
  getQuestionStats(filters = {}) {
    const questions = this.getQuestions(filters);

    const stats = {
      total: questions.length,
      byDifficulty: { easy: 0, medium: 0, hard: 0, unset: 0 },
      byType: {},
      bySubject: {},
      byStatus: {}
    };

    questions.forEach(q => {
      // Difficulty
      const diff = (q.metadata?.difficulty || 'unset').toLowerCase();
      if (stats.byDifficulty[diff] !== undefined) {
        stats.byDifficulty[diff]++;
      } else {
        stats.byDifficulty.unset++;
      }

      // Question Type
      const normType = questionTypeService.normalizeQuestionTypeId(q.type);
      stats.byType[normType] = (stats.byType[normType] || 0) + 1;

      // Subject
      const sub = q.metadata?.subject || 'General';
      stats.bySubject[sub] = (stats.bySubject[sub] || 0) + 1;

      // Status
      const st = q.status || 'published';
      stats.byStatus[st] = (stats.byStatus[st] || 0) + 1;
    });

    return stats;
  }

  /**
   * Checks if a question's type is compatible with a test's allowed types.
   * @param {object} question
   * @param {Array<string>} testAllowedTypes
   * @returns {{ compatible: boolean, normalizedType: string, error?: string }}
   */
  checkQuestionTypeCompatibility(question, testAllowedTypes = []) {
    if (!question) return { compatible: false, error: 'Question not found' };

    const normType = questionTypeService.normalizeQuestionTypeId(question.type);
    if (!normType) {
      return { 
        compatible: false, 
        normalizedType: 'unknown', 
        error: `Question type "${question.type}" is not recognized on MedPrep Pro.` 
      };
    }

    if (!Array.isArray(testAllowedTypes) || testAllowedTypes.length === 0) {
      return { compatible: true, normalizedType: normType };
    }

    const normAllowed = testAllowedTypes.map(t => questionTypeService.normalizeQuestionTypeId(t));
    const isAllowed = normAllowed.includes(normType);

    if (!isAllowed) {
      const typeDef = questionTypeService.getQuestionTypeById(normType);
      return {
        compatible: false,
        normalizedType: normType,
        error: `Question format "${typeDef?.name || normType}" is not permitted by this test's Question Type configuration.`
      };
    }

    return { compatible: true, normalizedType: normType };
  }

  /**
   * Scopes questions for a specific Test based on Exam track, Question Type settings,
   * and (for faculty) authorized curriculum permissions.
   * Annotates questions with `isAttached`, `isCompatible`, and `compatibilityReason`.
   * @param {object} test
   * @param {object} filters
   * @param {'admin'|'faculty'} role
   * @param {object|null} requestingFaculty
   * @returns {Array<object>}
   */
  getAvailableQuestionsForTest(test, filters = {}, role = 'admin', requestingFaculty = null) {
    if (!test) return [];

    const testExamId = test.examId || test.examTrack || test.courseId || 'neet-pg';
    const testAllowedTypes = test.questionTypeConfig?.allowedTypes || DEFAULT_TEST_ALLOWED_QUESTION_TYPES;

    // Attached Question IDs
    const attachedIds = new Set(
      (Array.isArray(test.content?.questionIds)
        ? test.content.questionIds
        : (Array.isArray(test.questionIds) ? test.questionIds : [])
      ).map(String)
    );

    // Apply base filters scoped to test exam
    const effectiveFilters = {
      ...filters,
      examId: filters.examId || testExamId
    };

    // Faculty RBAC restrictions
    if (role === 'faculty') {
      const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
      if (faculty) {
        // Enforce Exam Assignment
        const assignedExams = faculty.assignedExams || [];
        if (!assignedExams.includes(testExamId)) {
          return []; // Not assigned to this exam
        }

        // Enforce Subject Assignment if test is subject-locked
        const assignedSubjects = faculty.assignedSubjects || [];
        if (test.subjectId && test.subjectId !== 'all' && assignedSubjects.length > 0) {
          if (!assignedSubjects.includes(test.subjectId)) {
            return []; // Not assigned to this subject
          }
        }
      }
    }

    // Retrieve questions matching filters
    const matched = this.getQuestions(effectiveFilters);

    // Annotate questions with metadata
    return matched.map(q => {
      const isAttached = attachedIds.has(String(q.id));
      const typeCheck = this.checkQuestionTypeCompatibility(q, testAllowedTypes);

      return {
        ...q,
        isAttached,
        isCompatible: typeCheck.compatible,
        compatibilityReason: typeCheck.error || null,
        normalizedType: typeCheck.normalizedType
      };
    });
  }
}

export const questionBankService = new QuestionBankService();
