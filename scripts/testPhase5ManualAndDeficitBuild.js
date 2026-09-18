// =============================================================================
// TEST SUITE: PHASE 5 MANUAL QUESTION AUTHORING, UPLOAD & DEFICIT RESOLUTION
// =============================================================================

import assert from 'assert';
import { 
  parseRawTextToQuestions, 
  SAMPLE_MCQ_DOCUMENT_TEXT 
} from '../src/services/questionFileParserService.js';
import { questionService } from '../src/services/questionService.js';
import { adminTestService } from '../src/services/adminTestService.js';
import { cbtTestService } from '../src/services/cbtTestService.js';
import { testBuildService, BUILD_MODES } from '../src/services/testBuildService.js';

let passed = 0;
let total = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${e.message}`);
    throw e;
  }
}

console.log('\n======================================================');
console.log('RUNNING PHASE 5 MANUAL & DEFICIT BUILD TEST SUITE');
console.log('======================================================\n');

// 1. Document parser tests
console.log('--- 1. Document / File Parsing Engine ---');

it('Parses sample MCQ document text correctly', () => {
  const parsed = parseRawTextToQuestions(SAMPLE_MCQ_DOCUMENT_TEXT, {
    subject: 'Cardiology',
    examId: 'neet-pg'
  });

  assert(Array.isArray(parsed), 'Parsed output must be an array');
  assert.strictEqual(parsed.length, 4, 'Should detect exactly 4 MCQs from sample text');

  // Check Question 1
  const q1 = parsed[0];
  assert(q1.content.prompt.includes('hypertension'), 'Prompt should contain vignette text');
  assert.strictEqual(q1.responseSchema.options.length, 4, 'Should extract 4 options');
  assert.strictEqual(q1.answer.correct[0], 'B', 'Correct answer should be B');
  assert(q1.explanation.includes('anteroseptal'), 'Explanation should be extracted');
  assert.strictEqual(q1.metadata.subject, 'Cardiology');
});

it('Handles numbered questions with various formats (e.g. Q1:, 1), Answer: X)', () => {
  const customText = `
  Q1: What is the primary excitatory neurotransmitter in the central nervous system?
  (A) GABA
  (B) Glycine
  (C) Glutamate
  (D) Dopamine
  Ans: C
  Rationale: Glutamate is the principal excitatory neurotransmitter in the mammalian brain.

  Question 2: Which cranial nerve provides parasympathetic innervation to the heart?
  A. Trigeminal nerve
  B. Vagus nerve
  C. Glossopharyngeal nerve
  D. Hypoglossal nerve
  Answer: B
  Explanation: The vagus nerve (CN X) provides parasympathetic preganglionic fibers.
  `;

  const parsed = parseRawTextToQuestions(customText, { subject: 'Neurology' });
  assert.strictEqual(parsed.length, 2);
  assert.strictEqual(parsed[0].answer.correct[0], 'C');
  assert.strictEqual(parsed[1].answer.correct[0], 'B');
  assert(parsed[0].explanation.includes('mammalian brain'));
});

it('Returns empty array for empty or whitespace-only input', () => {
  const res1 = parseRawTextToQuestions('');
  const res2 = parseRawTextToQuestions('   \n  \n');
  assert.strictEqual(res1.length, 0);
  assert.strictEqual(res2.length, 0);
});

// 2. Manual question creation in questionService
console.log('\n--- 2. Manual Question Creation in questionService ---');

it('Creates valid question entity and persists in questionService', () => {
  const newQ = {
    id: `q-manual-test-${Date.now()}`,
    type: 'single_choice',
    content: {
      prompt: 'A patient with STEMI is scheduled for primary PCI. What is the target door-to-balloon time?',
      vignette: 'Clinical Emergency Vignette'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Within 30 minutes' },
        { id: 'B', text: 'Within 90 minutes' },
        { id: 'C', text: 'Within 120 minutes' },
        { id: 'D', text: 'Within 180 minutes' }
      ]
    },
    answer: { correct: ['B'] },
    scoring: { marks: 4, negativeMarks: -1 },
    metadata: {
      subject: 'Cardiology',
      topic: 'Acute Coronary Syndromes',
      difficulty: 'medium',
      examId: 'neet-pg'
    },
    explanation: 'ACC/AHA guidelines recommend door-to-balloon time < 90 minutes for primary PCI in STEMI.',
    status: 'published'
  };

  const res = questionService.createQuestion(newQ);
  assert(res.success, 'Question creation must succeed');
  assert.strictEqual(res.question.id, newQ.id);

  // Retrieve
  const fetched = questionService.getQuestionById(newQ.id);
  assert(fetched !== null, 'Created question must be retrievable');
  assert.strictEqual(fetched.content.prompt, newQ.content.prompt);
});

// 3. Manual build attachment to test
console.log('\n--- 3. Phase 5 Manual Build & Test Attachment ---');

it('Admin can attach manually created questions to test in Manual Build mode', () => {
  const testId = 'test-neetpg-mock-01';
  const qId = `q-manual-test-${Date.now()}`;

  questionService.createQuestion({
    id: qId,
    type: 'single_choice',
    content: { prompt: 'Test question for manual build' },
    responseSchema: { options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }] },
    answer: { correct: ['A'] },
    scoring: { marks: 4, negativeMarks: -1 },
    metadata: { subject: 'Medicine', examId: 'neet-pg' }
  });

  const updatedTest = testBuildService.buildManually(testId, [qId], 'admin');
  assert(updatedTest.content.questionIds.includes(qId), 'Question must be attached to test');
  assert.strictEqual(updatedTest.build.mode, BUILD_MODES.MANUAL);
});

it('Faculty can attach manually created questions to faculty test in Manual Build mode', () => {
  const facultyTests = cbtTestService.getAllTests();
  const facTest = facultyTests[0];

  if (facTest) {
    const faculty = { id: facTest.facultyId || 'fac-01', name: 'Dr. Siddharth' };
    const qId = `q-fac-manual-${Date.now()}`;

    questionService.createQuestion({
      id: qId,
      type: 'single_choice',
      content: { prompt: 'Faculty test question for manual build' },
      responseSchema: { options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }] },
      answer: { correct: ['A'] },
      scoring: { marks: 4, negativeMarks: -1 },
      metadata: { subject: 'Cardiology', examId: 'neet-pg' }
    });

    const updated = testBuildService.buildManually(facTest.id, [qId], 'faculty', faculty);
    assert(updated.content.questionIds.includes(qId), 'Faculty test must have attached question');
    assert.strictEqual(updated.build.mode, BUILD_MODES.MANUAL);
  }
});

// 4. Deficit resolution tests
console.log('\n--- 4. Blueprint Build Deficit Resolution ---');

it('Adding deficit questions expands the available question inventory', () => {
  const testId = 'test-neetpg-mock-01';
  const test = adminTestService.getTest(testId);

  const initialEligible = testBuildService.getEligibleQuestions(test, 'admin');

  // Add 2 new deficit questions in the test exam scope
  const dQ1 = `q-deficit-1-${Date.now()}`;
  const dQ2 = `q-deficit-2-${Date.now()}`;

  questionService.createQuestion({
    id: dQ1,
    type: 'single_choice',
    content: { prompt: 'Deficit Question 1' },
    responseSchema: { options: [{ id: 'A', text: 'Opt' }, { id: 'B', text: 'Opt' }] },
    answer: { correct: ['A'] },
    scoring: { marks: 4, negativeMarks: -1 },
    metadata: { subject: 'Medicine', difficulty: 'hard', examId: test.examId }
  });

  questionService.createQuestion({
    id: dQ2,
    type: 'single_choice',
    content: { prompt: 'Deficit Question 2' },
    responseSchema: { options: [{ id: 'A', text: 'Opt' }, { id: 'B', text: 'Opt' }] },
    answer: { correct: ['B'] },
    scoring: { marks: 4, negativeMarks: -1 },
    metadata: { subject: 'Medicine', difficulty: 'hard', examId: test.examId }
  });

  const nextEligible = testBuildService.getEligibleQuestions(test, 'admin');
  assert(nextEligible.length >= initialEligible.length + 2, 'Inventory must expand with new deficit questions');
});

console.log(`\n======================================================`);
console.log(`ALL ${passed} / ${total} TESTS PASSED SUCCESSFULLY!`);
console.log(`======================================================\n`);
