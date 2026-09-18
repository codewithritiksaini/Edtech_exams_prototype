// =============================================================================
// TEST PREVIEW SERVICE — LIGHTWEIGHT CANDIDATE SIMULATION MODEL
// Prepares an in-memory, read-only simulation payload answering:
// "What will this Test look like to a candidate?"
// Does NOT create student attempts, store backend sessions, or run real timers.
// =============================================================================

import { questionService } from './questionService.js';
import { catalogService } from './catalogService.js';

class TestPreviewService {
  /**
   * Builds the preview data model for student simulation.
   * 
   * @param {object} test - Test definition object
   * @returns {object} Structured preview model
   */
  getPreviewModel(test) {
    if (!test) {
      throw new Error('Cannot build preview model: Test is undefined.');
    }

    const exam = test.examId ? catalogService.getExamById(test.examId) : null;
    const questionIds = test.content?.questionIds || test.questionIds || [];
    const allPool = questionService.getQuestions();
    const poolMap = new Map(allPool.map(q => [String(q.id), q]));

    // Resolve questions in explicit ordered sequence
    const resolvedQuestions = questionIds.map((id, idx) => {
      const canonical = poolMap.get(String(id));
      if (!canonical) {
        return {
          id: String(id),
          sequenceNumber: idx + 1,
          stem: `[Question Item ${id}]`,
          subject: 'General Medicine',
          difficulty: 'medium',
          type: 'single-best-answer',
          options: [
            { id: 'opt-a', label: 'A', text: 'Option A' },
            { id: 'opt-b', label: 'B', text: 'Option B' },
            { id: 'opt-c', label: 'C', text: 'Option C' },
            { id: 'opt-d', label: 'D', text: 'Option D' }
          ],
          correctAnswer: 'opt-a',
          explanation: 'Standard clinical rationale for prototype simulation.'
        };
      }

      // Format options into clean labeled array
      const rawOptions = Array.isArray(canonical.options) ? canonical.options : [];
      const formattedOptions = rawOptions.map((opt, optIdx) => {
        const defaultLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
        if (typeof opt === 'string') {
          return {
            id: `opt-${optIdx}`,
            label: defaultLabel,
            text: opt
          };
        }
        return {
          id: opt.id || `opt-${optIdx}`,
          label: opt.label || defaultLabel,
          text: opt.text || opt.statement || opt.title || `Option ${defaultLabel}`
        };
      });

      return {
        id: String(canonical.id),
        sequenceNumber: idx + 1,
        stem: canonical.stem || canonical.text || canonical.title || canonical.question || 'Clinical vignette details...',
        stimulus: canonical.stimulus || canonical.clinicalCase || null,
        subject: canonical.subject || 'Clinical Medicine',
        specialty: canonical.specialty || canonical.subject || 'General',
        difficulty: canonical.difficulty || 'medium',
        type: canonical.type || 'single-best-answer',
        options: formattedOptions,
        correctAnswer: canonical.correctAnswer || canonical.correctOptionId || (formattedOptions[0]?.id || 'opt-0'),
        explanation: canonical.explanation || canonical.rationale || 'Correct option selected based on diagnostic criteria.'
      };
    });

    // Map into structural sections
    const structureUnits = test.structure?.units || [];
    let sections = [];

    if (structureUnits.length > 0) {
      // Divide resolved questions across sections if configured, or show unified
      let qPointer = 0;
      sections = structureUnits.map((unit, uIdx) => {
        const targetQCount = Number(unit.targetQuestions || unit.questionCount || 0);
        const sectionQuestions = targetQCount > 0 
          ? resolvedQuestions.slice(qPointer, qPointer + targetQCount)
          : (uIdx === 0 ? resolvedQuestions : []);
        qPointer += sectionQuestions.length;

        return {
          id: unit.id,
          name: unit.name || unit.title || `Section ${uIdx + 1}`,
          description: unit.description || '',
          required: unit.required !== false,
          questions: sectionQuestions,
          questionCount: sectionQuestions.length
        };
      });

      // If any questions were not assigned to sections, allocate to first section
      const totalAllocated = sections.reduce((acc, s) => acc + s.questions.length, 0);
      if (totalAllocated < resolvedQuestions.length && sections.length > 0) {
        sections[0].questions = resolvedQuestions;
        sections[0].questionCount = resolvedQuestions.length;
      }
    } else {
      sections = [{
        id: 'sec-main',
        name: 'Main Assessment',
        description: 'Complete examination question set',
        required: true,
        questions: resolvedQuestions,
        questionCount: resolvedQuestions.length
      }];
    }

    // Rules summary
    const rules = test.rules || {};
    const navigationMode = rules.navigation?.mode || 'FREE';
    const allowJump = navigationMode === 'FREE';
    const allowReviewFlag = rules.navigation?.allowReviewFlag !== false;

    const scoring = {
      correct: rules.scoring?.correct || test.marksPerCorrect || 4,
      incorrect: rules.scoring?.incorrect !== undefined ? rules.scoring.incorrect : (test.marksPerIncorrect || -1),
      unanswered: rules.scoring?.unanswered || 0
    };

    const durationMinutes = Number(test.durationMinutes || test.targetDuration || test.scheduling?.durationMinutes || 60);

    return {
      testId: test.id,
      testName: test.name,
      testCode: test.code,
      examName: exam?.name || test.examId,
      durationMinutes,
      totalQuestions: resolvedQuestions.length,
      totalMarks: resolvedQuestions.length * scoring.correct,
      sections,
      questions: resolvedQuestions,
      navigation: {
        mode: navigationMode,
        allowJump,
        allowReviewFlag
      },
      scoring,
      isSimulation: true
    };
  }
}

export const testPreviewService = new TestPreviewService();
