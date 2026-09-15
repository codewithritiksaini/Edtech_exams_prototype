// =============================================================================
// EXAM DATA HELPERS & LEGACY ADAPTER
// Resolution functions and non-destructive legacy test converter.
// =============================================================================

import { assessmentService } from '../services/assessmentService.js';
import { questionService } from '../services/questionService.js';
import { stimulusService } from '../services/stimulusService.js';
import { QUESTION_TYPES, ITEM_TYPES } from './questionTypes.js';

/**
 * Resolves an Assessment into a complete runtime content structure.
 * @param {string} assessmentId
 * @returns {object|null}
 */
export function resolveAssessment(assessmentId) {
  return assessmentService.resolveFullAssessment(assessmentId);
}

/**
 * Resolves a single section's items into populated question/group objects.
 * @param {object} section
 * @returns {Array<object>}
 */
export function resolveSectionItems(section) {
  if (!section || !Array.isArray(section.items)) return [];

  return section.items.map(item => {
    if (item.type === ITEM_TYPES.QUESTION) {
      const question = questionService.getQuestionById(item.refId);
      return {
        ...item,
        question: question || null
      };
    }

    if (item.type === ITEM_TYPES.QUESTION_GROUP) {
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
}

/**
 * Resolves a question reference ID into the canonical question object.
 * @param {string|number} refId
 * @returns {object|null}
 */
export function resolveQuestionReference(refId) {
  return questionService.getQuestionById(refId);
}

/**
 * Resolves a question group ID into the group, stimulus, and questions.
 * @param {string} groupId
 * @returns {object|null}
 */
export function resolveQuestionGroup(groupId) {
  const group = stimulusService.getQuestionGroupById(groupId);
  if (!group) return null;
  const stimulus = stimulusService.getStimulusById(group.stimulusId);
  const questions = questionService.getQuestionsByIds(group.questionIds || []);
  return {
    group,
    stimulus: stimulus || null,
    questions
  };
}

/**
 * Resolves a stimulus ID into the stimulus object.
 * @param {string} stimulusId
 * @returns {object|null}
 */
export function resolveStimulus(stimulusId) {
  return stimulusService.getStimulusById(stimulusId);
}

/**
 * Non-destructive adapter that converts a legacy test object into the new
 * canonical Assessment -> AssessmentVersion -> Section -> Question hierarchy.
 * @param {object} legacyTest - Test from phase6InitialTests or INITIAL_CBT_TESTS
 * @returns {{ assessment: object, extractedQuestions: object[] }}
 */
export function legacyTestToAssessment(legacyTest) {
  if (!legacyTest || typeof legacyTest !== 'object') {
    return null;
  }

  const assessmentId = `assessment-adapted-${legacyTest.id}`;
  const versionId = `${assessmentId}-v1`;
  const sectionId = `sec-adapted-${legacyTest.id}-main`;

  const durationMins = legacyTest.durationMinutes ||
    (typeof legacyTest.duration === 'string' && legacyTest.duration.includes('min')
      ? parseInt(legacyTest.duration, 10)
      : 45);

  const marksPerCorrect = legacyTest.marksPerCorrect || 5;
  const marksPerIncorrect = legacyTest.marksPerIncorrect !== undefined ? legacyTest.marksPerIncorrect : -1;

  // Extract and normalize questions
  const rawQuestions = Array.isArray(legacyTest.questions) ? legacyTest.questions : [];
  const extractedQuestions = [];
  const sectionItems = [];

  rawQuestions.forEach((q, idx) => {
    const qId = q.id !== undefined ? String(q.id) : `q-adapted-${idx + 1}`;
    
    // Normalize options
    const normalizedOptions = (q.options || []).map((opt, oIdx) => {
      if (typeof opt === 'string') {
        const letter = String.fromCharCode(65 + oIdx);
        return { id: letter, text: opt };
      }
      return {
        id: opt.id || opt.key || String.fromCharCode(65 + oIdx),
        text: opt.text || ''
      };
    });

    // Normalize correct answer to array
    const rawCorrect = q.correct || q.correctOption || 'A';
    const correctArray = Array.isArray(rawCorrect) ? rawCorrect : [String(rawCorrect)];

    const canonicalQuestion = {
      id: qId,
      type: QUESTION_TYPES.SINGLE_CHOICE,
      content: {
        vignette: q.vignette || '',
        prompt: q.question || 'Clinical Question'
      },
      responseSchema: {
        options: normalizedOptions
      },
      answer: {
        correct: correctArray
      },
      scoring: {
        marks: marksPerCorrect,
        negativeMarks: marksPerIncorrect
      },
      metadata: {
        source: 'legacy-adapter',
        legacyTestId: legacyTest.id,
        courseId: legacyTest.courseId || legacyTest.examTrack || 'general'
      },
      explanation: q.explanation || '',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    extractedQuestions.push(canonicalQuestion);

    sectionItems.push({
      id: `item-adapted-${legacyTest.id}-${idx + 1}`,
      type: ITEM_TYPES.QUESTION,
      refId: qId,
      order: idx + 1
    });
  });

  const assessment = {
    id: assessmentId,
    title: legacyTest.name || legacyTest.title || 'Adapted Assessment',
    description: legacyTest.pattern || 'Adapted from legacy examination test fixture.',
    category: 'Theoretical Exam',
    examType: 'mock',
    status: 'published',
    version: 1,
    activeVersionId: versionId,
    metadata: {
      legacyId: legacyTest.id,
      courseId: legacyTest.courseId || legacyTest.examTrack || 'neet-pg',
      batch: legacyTest.batch || 'All Enrolled Candidates',
      adaptedAt: new Date().toISOString()
    },
    settings: {
      durationMinutes: durationMins,
      navigation: {
        allowPrevious: true,
        allowNext: true,
        allowQuestionJump: true
      },
      attempt: {
        maxAttempts: 3
      },
      display: {
        showQuestionPalette: true,
        showTimer: true,
        showReviewFlag: true
      }
    },
    versions: [
      {
        id: versionId,
        assessmentId,
        version: 1,
        status: 'published',
        evaluationRules: {
          marksPerCorrect,
          marksPerIncorrect,
          unattemptedMarks: 0,
          minimumScore: 0,
          passingPercentage: legacyTest.passingScore || 50
        },
        sections: [
          {
            id: sectionId,
            title: 'Section 1: General Examination Items',
            description: 'All questions in this examination section.',
            order: 1,
            settings: {
              durationMinutes: null,
              navigation: {
                allowPrevious: true,
                allowNext: true,
                allowQuestionJump: true
              },
              scoring: {
                marksPerCorrect,
                marksPerIncorrect
              }
            },
            instructions: Array.isArray(legacyTest.instructions)
              ? legacyTest.instructions.join(' ')
              : 'Answer all questions to the best of your ability.',
            items: sectionItems
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    assessment,
    extractedQuestions
  };
}
