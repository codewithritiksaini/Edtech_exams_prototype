// =============================================================================
// QUESTION SERVICE — PROTOTYPE CANONICAL DATA LAYER
// Manages questions independently of tests/sections for the future Question Bank.
// =============================================================================

import { PROTOTYPE_STORAGE_KEYS, getStoredData, setStoredData } from '../utils/examStorage.js';
import { validateQuestion, detectDuplicateIds } from '../utils/examValidation.js';
import { DEMO_QUESTIONS } from '../data/exam/examDemoData.js';

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

  resetToDefaults() {
    setStoredData(this.storageKey, [...DEMO_QUESTIONS]);
    return [...DEMO_QUESTIONS];
  }

  /**
   * Retrieves all questions currently in storage.
   * @returns {Array<object>}
   */
  getQuestions() {
    const questions = getStoredData(this.storageKey, DEMO_QUESTIONS);
    detectDuplicateIds(questions, 'questionService.getQuestions');
    return Array.isArray(questions) ? questions : [];
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
   * Simple prototype search and filter across questions.
   * @param {object} filters - { type, subject, topic, difficulty, query }
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
    if (filters.query && typeof filters.query === 'string' && filters.query.trim()) {
      const qLower = filters.query.toLowerCase().trim();
      list = list.filter(q => {
        const prompt = q.content?.prompt?.toLowerCase() || '';
        const vignette = q.content?.vignette?.toLowerCase() || '';
        const expl = q.explanation?.toLowerCase() || '';
        return prompt.includes(qLower) || vignette.includes(qLower) || expl.includes(qLower);
      });
    }

    return list;
  }
}

export const questionService = new QuestionService();
