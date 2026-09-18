// =============================================================================
// QUESTION SERVICE — PROTOTYPE CANONICAL DATA LAYER
// Manages questions independently of tests/sections for the future Question Bank.
// =============================================================================

import { PROTOTYPE_STORAGE_KEYS, getStoredData, setStoredData } from '../utils/examStorage.js';
import { validateQuestion, detectDuplicateIds } from '../utils/examValidation.js';
import { DEMO_QUESTIONS } from '../data/exam/examDemoData.js';
import { sampleCbtQuestionBank } from '../data/cbtQuestionBankData.js';
import { curriculumService } from './curriculumService.js';

export function normalizeCbtQuestions(cbtQuestions = sampleCbtQuestionBank) {
  const subjectMap = {
    1: 'Medicine', 2: 'Medicine', 3: 'Medicine', 4: 'Medicine',
    5: 'Surgery', 6: 'Medicine', 7: 'Medicine', 8: 'Pharmacology',
    9: 'Pharmacology', 10: 'Pediatrics', 11: 'Medicine', 12: 'Medicine',
    13: 'Pharmacology', 14: 'Medicine', 15: 'Medicine', 16: 'Surgery',
    17: 'Medicine', 18: 'Pediatrics', 19: 'Medicine', 20: 'Pediatrics'
  };
  const diffMap = {
    1: 'easy', 2: 'medium', 3: 'hard', 4: 'medium',
    5: 'hard', 6: 'medium', 7: 'medium', 8: 'hard',
    9: 'medium', 10: 'medium', 11: 'easy', 12: 'medium',
    13: 'hard', 14: 'hard', 15: 'medium', 16: 'hard',
    17: 'medium', 18: 'medium', 19: 'easy', 20: 'medium'
  };
  const topicMap = {
    1: 'Cardiology', 2: 'Cardiology', 3: 'Critical Care', 4: 'Cardiology',
    5: 'Trauma & Emergency', 6: 'Infectious Disease', 7: 'Cardiology', 8: 'Cardiology',
    9: 'Toxicology', 10: 'Cardiology', 11: 'Cardiology', 12: 'Cardiology',
    13: 'Oncology', 14: 'Cardiology', 15: 'Cardiology', 16: 'Vascular Surgery',
    17: 'Cardiology', 18: 'Neonatology', 19: 'Nephrology', 20: 'Cardiology'
  };

  return cbtQuestions.map((q, idx) => {
    const qNum = q.id || idx + 1;
    const id = `q-cbt-${String(qNum).padStart(2, '0')}`;
    return {
      id,
      type: 'single_choice',
      content: {
        vignette: q.vignette || '',
        prompt: q.question || ''
      },
      responseSchema: {
        options: (q.options || []).map((opt, oIdx) => ({
          id: opt.key || opt.id || String.fromCharCode(65 + oIdx),
          text: opt.text || ''
        }))
      },
      answer: {
        correct: [q.correct || 'A']
      },
      scoring: {
        marks: 4,
        negativeMarks: -1
      },
      metadata: {
        subject: subjectMap[qNum] || 'Medicine',
        topic: topicMap[qNum] || 'Cardiology',
        difficulty: diffMap[qNum] || 'medium',
        tags: ['CBT', 'Clinical Vignette', 'High-Yield'],
        examId: 'neet-pg'
      },
      explanation: q.explanation || '',
      status: 'published',
      createdAt: '2026-09-16T10:00:00.000Z',
      updatedAt: '2026-09-16T10:00:00.000Z'
    };
  });
}

export const ALL_CANONICAL_QUESTIONS = [
  ...DEMO_QUESTIONS,
  ...normalizeCbtQuestions(sampleCbtQuestionBank)
];

class QuestionService {
  constructor() {
    this.storageKey = PROTOTYPE_STORAGE_KEYS.QUESTIONS;
    this.init();
  }

  init() {
    const existing = getStoredData(this.storageKey, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this.resetToDefaults();
    }
  }

  /**
   * Validates that subject, module, and lecture belong to the correct curriculum hierarchy.
   * @param {{ examId?: string, subjectId?: string, moduleId?: string, lectureId?: string }} scope
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validateCurriculumHierarchy(scope = {}) {
    const errors = [];
    const { examId, subjectId, moduleId, lectureId } = scope;

    if (subjectId && subjectId !== 'all') {
      const subject = curriculumService.getSubjectById(subjectId);
      if (!subject) {
        errors.push(`Subject "${subjectId}" not found in curriculum.`);
      } else if (examId && examId !== 'all' && subject.examId && subject.examId !== examId) {
        errors.push(`Subject "${subject.name || subjectId}" belongs to exam "${subject.examId}", not "${examId}".`);
      }
    }

    if (moduleId && moduleId !== 'all') {
      const moduleObj = curriculumService.getModuleById(moduleId);
      if (!moduleObj) {
        errors.push(`Module "${moduleId}" not found in curriculum.`);
      } else {
        if (subjectId && subjectId !== 'all' && moduleObj.subjectId && moduleObj.subjectId !== subjectId) {
          errors.push(`Module "${moduleObj.name || moduleId}" belongs to subject "${moduleObj.subjectId}", not "${subjectId}".`);
        }
        if (examId && examId !== 'all' && moduleObj.examId && moduleObj.examId !== examId) {
          errors.push(`Module "${moduleObj.name || moduleId}" belongs to exam "${moduleObj.examId}", not "${examId}".`);
        }
      }
    }

    if (lectureId && lectureId !== 'all') {
      const lecture = curriculumService.getLectureById(lectureId);
      if (!lecture) {
        errors.push(`Lecture "${lectureId}" not found in curriculum.`);
      } else if (moduleId && moduleId !== 'all' && lecture.moduleId && lecture.moduleId !== moduleId) {
        errors.push(`Lecture "${lecture.name || lectureId}" belongs to module "${lecture.moduleId}", not "${moduleId}".`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  resetToDefaults() {
    setStoredData(this.storageKey, [...ALL_CANONICAL_QUESTIONS]);
    return [...ALL_CANONICAL_QUESTIONS];
  }

  /**
   * Retrieves all questions currently in storage.
   * @returns {Array<object>}
   */
  getQuestions() {
    const questions = getStoredData(this.storageKey, ALL_CANONICAL_QUESTIONS);
    const defaultMap = new Map(ALL_CANONICAL_QUESTIONS.map(q => [String(q.id), q]));
    const storedIds = new Set((Array.isArray(questions) ? questions : []).map(q => String(q.id)));
    let merged = Array.isArray(questions) ? [...questions] : [];
    let added = false;
    for (const [id, defQ] of defaultMap) {
      if (!storedIds.has(id)) {
        merged.push(defQ);
        added = true;
      }
    }
    if (added) {
      setStoredData(this.storageKey, merged);
    }
    detectDuplicateIds(merged, 'questionService.getQuestions');
    return merged;
  }

  /**
   * Retrieves a single question by its ID.
   * @param {string|number} id
   * @returns {object|null}
   */
  getQuestionById(id) {
    if (id === undefined || id === null) return null;
    const questions = this.getQuestions();
    return questions.find(q => String(q.id) === String(id)) || null;
  }

  /**
   * Retrieves multiple questions matching an array of IDs in requested order.
   * @param {Array<string|number>} ids
   * @returns {Array<object>}
   */
  getQuestionsByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const questions = this.getQuestions();
    const map = new Map(questions.map(q => [String(q.id), q]));
    return ids.map(id => map.get(String(id))).filter(Boolean);
  }

  /**
   * Creates and stores a new question.
   * @param {object} questionData
   * @returns {{ success: boolean, question?: object, errors?: string[] }}
   */
  createQuestion(questionData) {
    const newQuestion = {
      ...questionData,
      id: questionData.id || `q-proto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: questionData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const validation = validateQuestion(newQuestion);
    if (!validation.isValid) {
      console.warn('[questionService.createQuestion] Validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    const current = this.getQuestions();
    const updated = [newQuestion, ...current.filter(q => String(q.id) !== String(newQuestion.id))];
    setStoredData(this.storageKey, updated);
    return { success: true, question: newQuestion };
  }

  /**
   * Updates an existing question.
   * @param {string|number} id
   * @param {object} updates
   * @returns {object|null} Updated question or null if not found
   */
  updateQuestion(id, updates = {}) {
    if (!id) return null;
    const questions = this.getQuestions();
    const index = questions.findIndex(q => String(q.id) === String(id));
    if (index === -1) {
      console.warn(`[questionService.updateQuestion] Question "${id}" not found.`);
      return null;
    }

    const updatedQuestion = {
      ...questions[index],
      ...updates,
      id: questions[index].id, // Protect ID immutability
      updatedAt: new Date().toISOString()
    };

    questions[index] = updatedQuestion;
    setStoredData(this.storageKey, questions);
    return updatedQuestion;
  }

  /**
   * Duplicates/clones an existing question.
   * Creates an independent copy with a new unique ID and draft status.
   * @param {string|number} id
   * @returns {{ success: boolean, question?: object, error?: string }}
   */
  cloneQuestion(id) {
    const original = this.getQuestionById(id);
    if (!original) {
      return { success: false, error: `Question "${id}" not found.` };
    }

    const cloneId = `${original.id}-clone-${Date.now().toString(36).slice(-4)}`;
    const clonedQuestion = {
      ...JSON.parse(JSON.stringify(original)),
      id: cloneId,
      status: 'draft',
      content: {
        ...original.content,
        prompt: `${original.content?.prompt || ''} (Copy)`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = this.createQuestion(clonedQuestion);
    return result;
  }

  /**
   * Changes the status of a question (e.g. draft -> review -> published -> archived).
   * @param {string|number} id
   * @param {string} newStatus
   * @returns {object|null}
   */
  changeQuestionStatus(id, newStatus) {
    if (!id || !newStatus) return null;
    return this.updateQuestion(id, { status: newStatus });
  }

  /**
   * Soft-archives a question.
   * @param {string|number} id
   * @returns {object|null}
   */
  archiveQuestion(id) {
    return this.changeQuestionStatus(id, 'archived');
  }

  /**
   * Deletes a question by ID.
   * @param {string|number} id
   * @returns {boolean} True if deleted
   */
  deleteQuestion(id) {
    if (!id) return false;
    const questions = this.getQuestions();
    const filtered = questions.filter(q => String(q.id) !== String(id));
    if (filtered.length === questions.length) return false;
    setStoredData(this.storageKey, filtered);
    return true;
  }

  /**
   * Calculates usage of a question across active assessments.
   * @param {string|number} questionId
   * @returns {{ count: number, assessments: Array<{ id: string, title: string }> }}
   */
  getQuestionUsage(questionId) {
    if (!questionId) return { count: 0, assessments: [] };
    const cleanId = String(questionId);
    const assessments = getStoredData(PROTOTYPE_STORAGE_KEYS.ASSESSMENTS, []) || [];
    const groups = getStoredData(PROTOTYPE_STORAGE_KEYS.GROUPS, []) || [];

    // Find group IDs that contain this question
    const matchingGroupIds = new Set(
      groups
        .filter(g => Array.isArray(g.questionIds) && g.questionIds.map(String).includes(cleanId))
        .map(g => String(g.id))
    );

    const usedInAssessments = new Map();

    for (const assessment of assessments) {
      const versions = assessment.versions || [];
      let isReferenced = false;

      for (const version of versions) {
        const sections = version.sections || [];
        for (const section of sections) {
          const items = section.items || [];
          for (const item of items) {
            if (item.type === 'question' && String(item.refId) === cleanId) {
              isReferenced = true;
              break;
            }
            if (item.type === 'question_group' && matchingGroupIds.has(String(item.refId))) {
              isReferenced = true;
              break;
            }
          }
          if (isReferenced) break;
        }
        if (isReferenced) break;
      }

      if (isReferenced) {
        usedInAssessments.set(assessment.id, {
          id: assessment.id,
          title: assessment.title || assessment.id
        });
      }
    }

    const list = Array.from(usedInAssessments.values());
    return {
      count: list.length,
      assessments: list
    };
  }

  /**
   * Computes dynamic KPI summary statistics for Question Bank dashboard.
   * @returns {{ total: number, published: number, review: number, approved: number, draft: number, archived: number }}
   */
  getSummaryStats() {
    const questions = this.getQuestions();
    const stats = {
      total: questions.length,
      published: 0,
      review: 0,
      approved: 0,
      draft: 0,
      archived: 0
    };

    for (const q of questions) {
      const status = q.status || 'draft';
      if (stats[status] !== undefined) {
        stats[status]++;
      } else {
        stats.draft++;
      }
    }

    return stats;
  }

  /**
   * Prototype search and multi-criteria filtering across questions.
   * @param {object} filters - { search, query, type, subject, topic, difficulty, status, tag }
   * @returns {Array<object>}
   */
  searchQuestions(filters = {}) {
    let list = this.getQuestions();

    if (filters.type && filters.type !== 'all') {
      list = list.filter(q => q.type === filters.type);
    }
    if (filters.subject && filters.subject !== 'all') {
      list = list.filter(q => q.metadata?.subject === filters.subject);
    }
    if (filters.topic && filters.topic !== 'all') {
      list = list.filter(q => q.metadata?.topic === filters.topic);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      list = list.filter(q => q.metadata?.difficulty === filters.difficulty);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(q => (q.status || 'draft') === filters.status);
    }
    if (filters.tag && filters.tag !== 'all') {
      list = list.filter(q => Array.isArray(q.metadata?.tags) && q.metadata.tags.includes(filters.tag));
    }

    const searchTerm = (filters.search || filters.query || '').trim().toLowerCase();
    if (searchTerm) {
      list = list.filter(q => {
        const id = String(q.id).toLowerCase();
        const prompt = q.content?.prompt?.toLowerCase() || '';
        const vignette = q.content?.vignette?.toLowerCase() || '';
        const expl = q.explanation?.toLowerCase() || '';
        const subject = q.metadata?.subject?.toLowerCase() || '';
        const topic = q.metadata?.topic?.toLowerCase() || '';
        const tags = Array.isArray(q.metadata?.tags) ? q.metadata.tags.join(' ').toLowerCase() : '';

        return (
          id.includes(searchTerm) ||
          prompt.includes(searchTerm) ||
          vignette.includes(searchTerm) ||
          expl.includes(searchTerm) ||
          subject.includes(searchTerm) ||
          topic.includes(searchTerm) ||
          tags.includes(searchTerm)
        );
      });
    }

    return list;
  }

  /**
   * Retrieves all questions that are published and eligible for inclusion in official tests.
   * @param {object} filters
   * @returns {Array<object>}
   */
  getPublishedQuestions(filters = {}) {
    return this.searchQuestions({
      ...filters,
      status: 'published'
    });
  }

  /**
   * Canonical authoring bridge: converts simple authoring form inputs
   * into a standardized Question Bank item and persists it.
   * @param {object} authoringData
   * @returns {{ success: boolean, question?: object, errors?: string[] }}
   */
  createFromAuthoring(authoringData) {
    const rawOptions = authoringData.options || [
      { id: 'A', text: authoringData.optA || '' },
      { id: 'B', text: authoringData.optB || '' },
      { id: 'C', text: authoringData.optC || '' },
      { id: 'D', text: authoringData.optD || '' }
    ];

    const options = rawOptions.map((opt, idx) => ({
      id: opt.id || opt.key || String.fromCharCode(65 + idx),
      text: opt.text || ''
    }));

    const correctKey = authoringData.correct || authoringData.correctOption || 'A';

    // Validate curriculum hierarchy if provided
    if (authoringData.examId || authoringData.subjectId || authoringData.moduleId) {
      const hierVal = this.validateCurriculumHierarchy({
        examId: authoringData.examId,
        subjectId: authoringData.subjectId,
        moduleId: authoringData.moduleId,
        lectureId: authoringData.lectureId
      });
      if (!hierVal.isValid) {
        return { success: false, errors: hierVal.errors };
      }
    }

    const questionItem = {
      id: authoringData.id || `q-auth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: authoringData.type || 'single_choice',
      status: authoringData.status || 'published',
      content: {
        vignette: (authoringData.vignette || '').trim(),
        prompt: (authoringData.question || authoringData.prompt || 'What is the most appropriate next clinical step or diagnosis?').trim()
      },
      responseSchema: {
        options
      },
      answer: {
        correct: [correctKey]
      },
      scoring: {
        marks: Number(authoringData.marks) || 5,
        negativeMarks: Number(authoringData.negativeMarks) !== undefined ? Number(authoringData.negativeMarks) : -1
      },
      explanation: (authoringData.explanation || authoringData.rationale || '').trim(),
      metadata: {
        examId: authoringData.examId || 'neet-pg',
        subjectId: authoringData.subjectId || null,
        moduleId: authoringData.moduleId || null,
        lectureId: authoringData.lectureId || null,
        subject: authoringData.subject || 'Medicine',
        topic: authoringData.topic || 'Clinical Vignettes',
        difficulty: authoringData.difficulty || 'medium',
        guidelineRef: authoringData.guidelineRef || 'National Medical Curriculum Guidelines',
        tags: Array.isArray(authoringData.tags) ? authoringData.tags : ['Clinical Vignette', 'High-Yield']
      }
    };

    return this.createQuestion(questionItem);
  }
}

export const questionService = new QuestionService();

