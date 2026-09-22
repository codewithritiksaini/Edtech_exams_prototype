// =============================================================================
// TEST PRESENTATION SERVICE — SHARED PRESENTATION & READ MODEL
// Transforms canonical 5-Phase Test configurations (Foundation, Structure,
// Rules, Content & Build, Review & Publish) into UI-consumable presentation
// structures for Admin Preview, Faculty Preview, and the Student Test Window.
//
// Does NOT create a second Test data model. Canonical sources remain:
// adminTestService, cbtTestService, questionService, catalogService.
// =============================================================================

import { adminTestService } from './adminTestService.js';
import { cbtTestService } from './cbtTestService.js';
import { questionService } from './questionService.js';
import { catalogService } from './catalogService.js';
import { questionTypeService, QUESTION_TYPES } from './questionTypeService.js';

class TestPresentationService {
  /**
   * Resolves a Test definition across Admin and Faculty stores.
   * @param {string} testId
   * @returns {object|null}
   */
  getTestById(testId) {
    if (!testId) return null;
    const cleanId = String(testId).trim();

    // 1. Check Admin tests
    const adminTest = adminTestService.getTest ? adminTestService.getTest(cleanId) : adminTestService.getTestById(cleanId);
    if (adminTest) return adminTest;

    // 2. Check Faculty / CBT tests
    const facultyTest = cbtTestService.getTestById(cleanId);
    if (facultyTest) return facultyTest;

    return null;
  }

  /**
   * Resolves the canonical questions roster for a test based on test.content.questionIds.
   * Strictly preserves question sequence order.
   * @param {object} test
   * @param {string} targetAudience 'preview' | 'student'
   * @returns {Array<object>} Ordered array of resolved delivery questions
   */
  getTestQuestions(test, targetAudience = 'preview') {
    if (!test) return [];

    const questionIds = test.content?.questionIds || test.questionIds || [];
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return [];
    }

    const allQuestions = questionService.getQuestions();
    const map = new Map(allQuestions.map(q => [String(q.id), q]));

    return questionIds.map((id, index) => {
      const found = map.get(String(id));
      if (found) {
        return this.getQuestionForDelivery(found, index, targetAudience);
      }

      // Safe fallback placeholder if question not found in store
      return this.getQuestionForDelivery({
        id: String(id),
        type: QUESTION_TYPES.SINGLE_BEST_ANSWER,
        content: {
          prompt: `Clinical Assessment Item #${index + 1}`
        },
        responseSchema: {
          options: [
            { id: 'A', text: 'Option A' },
            { id: 'B', text: 'Option B' },
            { id: 'C', text: 'Option C' },
            { id: 'D', text: 'Option D' }
          ]
        },
        answer: { correct: ['A'] },
        correctOptionId: 'A',
        scoring: { marks: 4, negativeMarks: -1 },
        metadata: { subject: 'Medicine' }
      }, index, targetAudience);
    });
  }

  /**
   * Transforms a single Question into a standardized, clean delivery presentation object.
   * @param {object} rawQuestion
   * @param {number} sequenceIndex
   * @param {string} targetAudience 'preview' | 'student'
   * @returns {object} Standardized question for renderer
   */
  getQuestionForDelivery(rawQuestion, sequenceIndex = 0, targetAudience = 'preview') {
    if (!rawQuestion) return null;

    const seq = typeof sequenceIndex === 'number' ? sequenceIndex : 0;
    const audience = typeof sequenceIndex === 'string' ? sequenceIndex : targetAudience;

    const rawType = rawQuestion.type || rawQuestion.format || QUESTION_TYPES.SINGLE_BEST_ANSWER;
    const canonType = questionTypeService.normalizeQuestionTypeId(rawType) || QUESTION_TYPES.SINGLE_BEST_ANSWER;
    const typeDef = questionTypeService.getQuestionTypeById(canonType);

    // Extract prompt
    const prompt = rawQuestion.content?.prompt || rawQuestion.stem || rawQuestion.question || rawQuestion.prompt || '';
    const vignette = rawQuestion.content?.vignette || rawQuestion.vignette || '';
    const mediaUrl = rawQuestion.content?.mediaUrl || rawQuestion.mediaUrl || null;

    // Standardize options
    const rawOptions = rawQuestion.responseSchema?.options || rawQuestion.options || [];
    const formattedOptions = (Array.isArray(rawOptions) ? rawOptions : []).map((opt, oIdx) => {
      const id = opt.id || String.fromCharCode(65 + oIdx);
      const text = typeof opt === 'string' ? opt : (opt.text || opt.title || opt.statement || `Option ${id}`);
      return {
        id: String(id),
        text: String(text).trim()
      };
    });

    const isStudent = audience === 'student';

    // Extract scoring
    const scoring = {
      marks: rawQuestion.scoring?.marks ?? 4,
      negativeMarks: rawQuestion.scoring?.negativeMarks ?? -1
    };

    const result = {
      id: String(rawQuestion.id),
      sequenceNumber: seq + 1,
      type: canonType,
      typeShortName: typeDef?.shortName || 'Q',
      typeName: typeDef?.name || 'Question',
      prompt,
      vignette,
      mediaUrl,
      options: formattedOptions,
      scoring,
      metadata: {
        subject: rawQuestion.metadata?.subject || rawQuestion.subject || 'Medicine',
        topic: rawQuestion.metadata?.topic || 'General',
        difficulty: rawQuestion.metadata?.difficulty || rawQuestion.difficulty || 'medium',
        tags: rawQuestion.metadata?.tags || []
      }
    };

    if (!isStudent) {
      // Author / Preview metadata
      const rawCorrect = rawQuestion.answer?.correct || rawQuestion.correctAnswer || rawQuestion.correctOptionId || [];
      const correctAnswers = Array.isArray(rawCorrect) ? rawCorrect : (rawCorrect ? [rawCorrect] : []);
      const textAnswer = rawQuestion.answer?.textAnswer || (correctAnswers.length > 0 ? String(correctAnswers[0]) : '');
      result.correctAnswers = correctAnswers;
      result.correctOptionId = rawQuestion.correctOptionId || (correctAnswers.length > 0 ? correctAnswers[0] : undefined);
      result.textAnswer = textAnswer;
      result.explanation = rawQuestion.explanation || '';
    }

    return result;
  }

  /**
   * Partitions questions into structural sections/units if configured.
   * @param {object} test
   * @param {Array<object>|null} resolvedQuestions
   * @param {string} targetAudience 'preview' | 'student'
   * @returns {Array<object>} Sections array
   */
  getTestSections(test, resolvedQuestions = null, targetAudience = 'preview') {
    const questions = resolvedQuestions || this.getTestQuestions(test, targetAudience);
    const units = test?.structure?.sections || test?.structure?.units || [];

    if (units.length > 0) {
      let pointer = 0;
      const sections = units.map((unit, uIdx) => {
        let sectionQuestions = [];
        if (Array.isArray(unit.questionIds) && unit.questionIds.length > 0) {
          const idSet = new Set(unit.questionIds.map(String));
          sectionQuestions = questions.filter(q => idSet.has(String(q.id)));
        } else {
          const targetCount = Number(unit.targetQuestions || unit.questionCount || 0);
          sectionQuestions = targetCount > 0
            ? questions.slice(pointer, pointer + targetCount)
            : (uIdx === 0 ? questions : []);
          pointer += sectionQuestions.length;
        }

        return {
          id: unit.id || `sec-${uIdx + 1}`,
          name: unit.name || unit.title || `Section ${uIdx + 1}`,
          description: unit.description || '',
          required: unit.required !== false,
          questionIds: unit.questionIds || sectionQuestions.map(q => q.id),
          questions: sectionQuestions,
          questionCount: sectionQuestions.length
        };
      });

      return sections;
    }

    // Default single unified section
    return [{
      id: 'sec-all',
      name: 'All Questions',
      description: 'Complete examination question set',
      required: true,
      questionIds: questions.map(q => q.id),
      questions,
      questionCount: questions.length
    }];
  }

  /**
   * Normalizes Phase 3 Navigation Rules.
   * @param {object} test
   * @returns {object} Navigation model
   */
  getTestNavigationModel(test) {
    const navRules = test?.rules?.navigation || {};
    const mode = navRules.mode || 'FREE';

    return {
      mode, // 'FREE' | 'LINEAR' / 'SEQUENTIAL'
      allowBackNavigation: navRules.allowBackNavigation !== false && mode === 'FREE',
      allowSkip: navRules.allowSkip !== false && mode === 'FREE',
      allowQuestionReview: navRules.allowQuestionReview !== false,
      instantFeedback: navRules.instantFeedback === true
    };
  }

  /**
   * Normalizes Phase 3 Timing Rules.
   * Priority: test.rules.timing.totalDurationMinutes -> test.targetDuration -> 60 minutes
   * @param {object} test
   * @returns {object} Timing model
   */
  getTestTimingModel(test) {
    const timingRules = test?.rules?.timing || {};
    const totalMinutes = Number(
      timingRules.totalDurationMinutes || 
      test?.durationMinutes || 
      test?.targetDuration || 
      60
    );

    return {
      totalDurationMinutes: totalMinutes,
      totalSeconds: totalMinutes * 60,
      mode: timingRules.mode || 'TOTAL_TIME', // 'TOTAL_TIME' | 'PER_QUESTION' | 'PER_SECTION'
      autoSubmit: timingRules.autoSubmit !== false,
      allowPause: timingRules.allowPause !== false,
      warnRemainingMinutes: Number(timingRules.warnRemainingMinutes || 5)
    };
  }

  /**
   * Normalizes Phase 3 Scoring Rules.
   * @param {object} test
   * @returns {object} Scoring model
   */
  getTestScoringModel(test) {
    const scoringRules = test?.rules?.scoring || {};
    const marksPerQuestion = Number(scoringRules.marksPerQuestion || scoringRules.correct || test?.marksPerCorrect || 4);
    const penaltyPerWrong = Number(scoringRules.penaltyPerWrong !== undefined ? scoringRules.penaltyPerWrong : (scoringRules.negativeMarks !== undefined ? scoringRules.negativeMarks : (test?.marksPerIncorrect || 1)));
    const unansweredMarks = Number(scoringRules.unansweredMarks || 0);

    return {
      marksPerQuestion,
      penaltyPerWrong,
      negativeMarks: penaltyPerWrong,
      unansweredMarks
    };
  }

  /**
   * Normalizes delivery security & anti-cheating rules.
   * @param {object} test
   * @returns {object} Security model
   */
  getTestSecurityModel(test) {
    const secRules = test?.rules?.security || {};
    const timing = test?.rules?.timing || {};
    return {
      tabSwitchPolicy: secRules.tabSwitchPolicy || 'AUTO_SUBMIT',
      allowTabSwitching: false,
      allowPause: timing.allowPause !== false,
      autoSubmitOnViolation: true
    };
  }

  /**
   * Builds the complete read-model bundle for Admin & Faculty Preview (Non-Destructive).
   * @param {object|string} testOrId
   * @returns {object|null}
   */
  getTestPreviewModel(testOrId) {
    const test = typeof testOrId === 'string' ? this.getTestById(testOrId) : testOrId;
    if (!test) return null;

    const exam = test.examId ? catalogService.getExamById(test.examId) : null;
    const questions = this.getTestQuestions(test, 'preview');
    const sections = this.getTestSections(test, questions, 'preview');
    const navigation = this.getTestNavigationModel(test);
    const timing = this.getTestTimingModel(test);
    const scoring = this.getTestScoringModel(test);
    const security = this.getTestSecurityModel(test);

    return {
      test: {
        id: test.id,
        name: test.name,
        code: test.code,
        examId: test.examId,
        testType: test.testType,
        assessmentMethod: test.assessmentMethod,
        instructions: test.instructions || '',
        ...test
      },
      testId: test.id,
      testName: test.name,
      testCode: test.code,
      description: test.description || '',
      instructions: test.instructions || '',
      examName: exam?.name || test.examId || 'General Medical Licensing',
      testType: test.testType || 'MOCK_EXAM',
      assessmentMethod: test.assessmentMethod || 'CBT',
      status: test.status || 'draft',
      totalQuestions: questions.length,
      totalMarks: questions.length * scoring.marksPerQuestion,
      questions,
      sections,
      navigation,
      timing,
      scoring,
      security,
      isPreview: true
    };
  }

  /**
   * Builds the candidate delivery model for Student Test Window (Strip authoring secrets).
   * @param {object|string} testOrId
   * @returns {object|null}
   */
  getTestDeliveryModel(testOrId) {
    const previewModel = this.getTestPreviewModel(testOrId);
    if (!previewModel) return null;

    // Filter out authoring notes and answers for pure candidate delivery
    const deliveryQuestions = previewModel.questions.map(q => ({
      id: q.id,
      sequenceNumber: q.sequenceNumber,
      type: q.type,
      typeShortName: q.typeShortName,
      typeName: q.typeName,
      prompt: q.prompt,
      vignette: q.vignette,
      mediaUrl: q.mediaUrl,
      options: q.options,
      scoring: q.scoring,
      metadata: {
        subject: q.metadata.subject
      }
    }));

    return {
      ...previewModel,
      questions: deliveryQuestions,
      isPreview: false
    };
  }
}

export const testPresentationService = new TestPresentationService();
export default testPresentationService;
