// =============================================================================
// ASSESSMENT SERVICE — PROTOTYPE CANONICAL DATA LAYER
// Manages Assessments, AssessmentVersions, and Sections.
// Coexists cleanly with legacy testService & cbtTestService.
// =============================================================================

import { PROTOTYPE_STORAGE_KEYS, getStoredData, setStoredData } from '../utils/examStorage.js';
import { validateAssessment, validateAssessmentVersion, detectDuplicateIds } from '../utils/examValidation.js';
import { DEMO_ASSESSMENTS } from '../data/exam/examDemoData.js';
import { questionService } from './questionService.js';
import { stimulusService } from './stimulusService.js';

class AssessmentService {
  constructor() {
    this.storageKey = PROTOTYPE_STORAGE_KEYS.ASSESSMENTS;
    this.init();
  }

  init() {
    const existing = getStoredData(this.storageKey, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    setStoredData(this.storageKey, [...DEMO_ASSESSMENTS]);
    questionService.resetToDefaults();
    stimulusService.resetToDefaults();
    return [...DEMO_ASSESSMENTS];
  }

  /**
   * Resets all new prototype stores to clean demo fixtures.
   * STRICTLY DOES NOT TOUCH legacy keys: medprep_phase6_tests, medprep_cbt_tests_v2, medprep_cbt_attempts_v2.
   */
  resetPrototypeExamData() {
    return this.resetToDefaults();
  }

  /**
   * Seeds demo data into prototype stores.
   */
  seedPrototypeExamData() {
    return this.resetToDefaults();
  }

  /**
   * Retrieves all canonical assessments.
   * @returns {Array<object>}
   */
  getAssessments() {
    const assessments = getStoredData(this.storageKey, DEMO_ASSESSMENTS);
    detectDuplicateIds(assessments, 'assessmentService.getAssessments');
    return Array.isArray(assessments) ? assessments : [];
  }

  /**
   * Retrieves an assessment by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getAssessmentById(id) {
    if (!id) return null;
    const list = this.getAssessments();
    return list.find(a => String(a.id) === String(id)) || null;
  }

  /**
   * Retrieves the active AssessmentVersion object for an assessment.
   * @param {string} assessmentId
   * @returns {object|null}
   */
  getActiveVersion(assessmentId) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;

    const versions = assessment.versions || [];
    if (assessment.activeVersionId) {
      const active = versions.find(v => v.id === assessment.activeVersionId);
      if (active) return active;
    }

    // Fallback to highest version number or first version
    return versions[versions.length - 1] || null;
  }

  /**
   * Retrieves a specific AssessmentVersion by ID.
   * @param {string} assessmentId
   * @param {string} versionId
   * @returns {object|null}
   */
  getAssessmentVersion(assessmentId, versionId) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;
    return (assessment.versions || []).find(v => v.id === versionId) || null;
  }

  /**
   * Creates a new assessment and its initial version.
   * @param {object} data
   * @returns {{ success: boolean, assessment?: object, errors?: string[] }}
   */
  createAssessment(data) {
    const assessmentId = data.id || `assessment-proto-${Date.now()}`;
    const initialVersionId = `${assessmentId}-v1`;

    const initialVersion = {
      id: initialVersionId,
      assessmentId,
      version: 1,
      status: data.status || 'draft',
      evaluationRules: data.evaluationRules || {
        marksPerCorrect: 5,
        marksPerIncorrect: -1,
        unattemptedMarks: 0,
        minimumScore: 0,
        passingPercentage: 50
      },
      sections: data.sections || [
        {
          id: `sec-${Date.now()}-1`,
          title: 'Section 1: General',
          description: '',
          order: 1,
          settings: {
            durationMinutes: null,
            navigation: { allowPrevious: true, allowNext: true, allowQuestionJump: true },
            scoring: { marksPerCorrect: 5, marksPerIncorrect: -1 }
          },
          instructions: 'Answer all questions in this section.',
          items: []
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newAssessment = {
      id: assessmentId,
      title: data.title || 'Untitled Assessment',
      description: data.description || '',
      category: data.category || 'Theoretical Exam',
      examType: data.examType || 'mock',
      status: data.status || 'draft',
      version: 1,
      activeVersionId: initialVersionId,
      metadata: data.metadata || {},
      settings: {
        durationMinutes: data.durationMinutes || 60,
        navigation: { allowPrevious: true, allowNext: true, allowQuestionJump: true, ...(data.settings?.navigation || {}) },
        attempt: { maxAttempts: 1, ...(data.settings?.attempt || {}) },
        display: { showQuestionPalette: true, showTimer: true, showReviewFlag: true, ...(data.settings?.display || {}) }
      },
      versions: [initialVersion],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const validation = validateAssessment(newAssessment);
    if (!validation.isValid) {
      console.warn('[assessmentService.createAssessment] Validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    const current = this.getAssessments();
    const updated = [newAssessment, ...current.filter(a => a.id !== assessmentId)];
    setStoredData(this.storageKey, updated);
    return { success: true, assessment: newAssessment };
  }

  /**
   * Updates an existing assessment's metadata and top-level fields.
   * @param {string} id
   * @param {object} updates
   * @returns {object|null}
   */
  updateAssessment(id, updates = {}) {
    if (!id) return null;
    const list = this.getAssessments();
    const index = list.findIndex(a => a.id === id);
    if (index === -1) {
      console.warn(`[assessmentService.updateAssessment] Assessment "${id}" not found.`);
      return null;
    }

    const updated = {
      ...list[index],
      ...updates,
      id: list[index].id,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    setStoredData(this.storageKey, list);
    return updated;
  }

  /**
   * Sets the active version pointer for an assessment.
   * @param {string} assessmentId
   * @param {string} versionId
   * @returns {boolean}
   */
  setActiveVersion(assessmentId, versionId) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return false;
    const targetVersion = (assessment.versions || []).find(v => v.id === versionId);
    if (!targetVersion) return false;

    return Boolean(this.updateAssessment(assessmentId, {
      activeVersionId: versionId,
      version: targetVersion.version
    }));
  }

  /**
   * Creates a new version (e.g. v2) for an assessment.
   * @param {string} assessmentId
   * @param {object} versionData
   * @returns {object|null}
   */
  createAssessmentVersion(assessmentId, versionData = {}) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;

    const currentVersions = assessment.versions || [];
    const nextVersionNum = currentVersions.length + 1;
    const newVersionId = `${assessmentId}-v${nextVersionNum}`;

    const newVersion = {
      id: newVersionId,
      assessmentId,
      version: nextVersionNum,
      status: versionData.status || 'draft',
      evaluationRules: versionData.evaluationRules || currentVersions[currentVersions.length - 1]?.evaluationRules || {
        marksPerCorrect: 5,
        marksPerIncorrect: -1,
        unattemptedMarks: 0,
        minimumScore: 0,
        passingPercentage: 50
      },
      sections: versionData.sections || currentVersions[currentVersions.length - 1]?.sections || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const validation = validateAssessmentVersion(newVersion);
    if (!validation.isValid) {
      console.warn('[assessmentService.createAssessmentVersion] Validation failed:', validation.errors);
      return null;
    }

    const updatedVersions = [...currentVersions, newVersion];
    this.updateAssessment(assessmentId, {
      versions: updatedVersions,
      activeVersionId: newVersionId,
      version: nextVersionNum
    });

    return newVersion;
  }

  /**
   * Updates an existing version inside an assessment.
   * @param {string} assessmentId
   * @param {string} versionId
   * @param {object} updates
   * @returns {object|null}
   */
  updateAssessmentVersion(assessmentId, versionId, updates = {}) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;

    const versions = [...(assessment.versions || [])];
    const vIndex = versions.findIndex(v => v.id === versionId);
    if (vIndex === -1) return null;

    const updatedVersion = {
      ...versions[vIndex],
      ...updates,
      id: versions[vIndex].id,
      assessmentId,
      updatedAt: new Date().toISOString()
    };

    versions[vIndex] = updatedVersion;
    this.updateAssessment(assessmentId, { versions });
    return updatedVersion;
  }

  /**
   * Safely deletes an assessment from storage.
   * @param {string} id
   * @returns {boolean}
   */
  deleteAssessment(id) {
    if (!id) return false;
    const list = this.getAssessments();
    const filtered = list.filter(a => a.id !== id);
    if (filtered.length === list.length) return false;
    setStoredData(this.storageKey, filtered);
    return true;
  }

  /**
   * Conceptually resolves an Assessment into fully hydrated runtime exam content:
   * Assessment -> Active Version -> Sections -> Items -> (Questions | QuestionGroup -> Stimulus -> Questions)
   * @param {string} assessmentId
   * @returns {object|null} Fully resolved structure
   */
  resolveFullAssessment(assessmentId) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;

    const activeVersion = this.getActiveVersion(assessmentId);
    if (!activeVersion) return null;

    const resolvedSections = (activeVersion.sections || []).map(section => {
      const resolvedItems = (section.items || []).map(item => {
        if (item.type === 'question') {
          const question = questionService.getQuestionById(item.refId);
          return {
            ...item,
            question: question || null
          };
        } else if (item.type === 'question_group') {
          const group = stimulusService.getQuestionGroupById(item.refId);
          if (!group) {
            return { ...item, group: null, stimulus: null, questions: [] };
          }
          const stimulus = stimulusService.getStimulusById(group.stimulusId);
          const questions = questionService.getQuestionsByIds(group.questionIds || []);
          return {
            ...item,
            group,
            stimulus: stimulus || null,
            questions
          };
        }
        return item;
      });

      return {
        ...section,
        items: resolvedItems
      };
    });

    return {
      assessment,
      activeVersion,
      sections: resolvedSections
    };
  }
}

export const assessmentService = new AssessmentService();
