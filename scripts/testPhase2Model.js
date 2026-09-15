// =============================================================================
// PHASE 2 DATA MODEL TEST SUITE
// Verifies all 15 requirements for the canonical prototype data layer.
// =============================================================================

import { assessmentService } from '../src/services/assessmentService.js';
import { questionService } from '../src/services/questionService.js';
import { stimulusService } from '../src/services/stimulusService.js';
import { 
  resolveAssessment, 
  resolveSectionItems, 
  resolveQuestionReference, 
  resolveQuestionGroup, 
  legacyTestToAssessment 
} from '../src/utils/examDataHelpers.js';
import { 
  validateAssessment, 
  validateAssessmentVersion, 
  validateQuestion, 
  validateQuestionGroup, 
  validateStimulus, 
  detectDuplicateIds 
} from '../src/utils/examValidation.js';
import { QUESTION_TYPES, STIMULUS_TYPES, ITEM_TYPES } from '../src/utils/questionTypes.js';
import { DEMO_ASSESSMENTS, DEMO_QUESTIONS, DEMO_STIMULI, DEMO_QUESTION_GROUPS } from '../src/data/exam/examDemoData.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n==================================================');
console.log('RUNNING PHASE 2 CANONICAL EXAM DATA MODEL TESTS');
console.log('==================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Seed Prototype Data
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Seeding & Retrieval ---');
const seededAssessments = assessmentService.seedPrototypeExamData();
assert(Array.isArray(seededAssessments) && seededAssessments.length === 3, 'Seed prototype assessments (3 demo assessments loaded)');

// -----------------------------------------------------------------------------
// Test 2: Retrieve Assessment by ID
// -----------------------------------------------------------------------------
const neetAssessment = assessmentService.getAssessmentById('assessment-neet-pg-demo');
assert(neetAssessment !== null && neetAssessment.title.includes('NEET PG'), 'Retrieve assessment by ID (assessment-neet-pg-demo)');

// -----------------------------------------------------------------------------
// Test 3: Retrieve Active Assessment Version
// -----------------------------------------------------------------------------
const activeVersion = assessmentService.getActiveVersion('assessment-neet-pg-demo');
assert(activeVersion !== null && activeVersion.id === 'assessment-neet-pg-demo-v1' && activeVersion.version === 1, 'Retrieve active assessment version (v1)');

// -----------------------------------------------------------------------------
// Test 4: Create Question
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Question Operations ---');
const createdQResult = questionService.createQuestion({
  id: 'q-test-unit-01',
  type: QUESTION_TYPES.SINGLE_CHOICE,
  content: { prompt: 'Unit test question prompt?' },
  responseSchema: {
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' }
    ]
  },
  answer: { correct: ['A'] },
  scoring: { marks: 5, negativeMarks: -1 },
  metadata: { subject: 'Medicine', topic: 'Testing', difficulty: 'easy' }
});
assert(createdQResult.success && createdQResult.question.id === 'q-test-unit-01', 'Create standalone question in questionService');

// -----------------------------------------------------------------------------
// Test 5: Retrieve Question by ID
// -----------------------------------------------------------------------------
const retrievedQ = questionService.getQuestionById('q-test-unit-01');
assert(retrievedQ !== null && retrievedQ.content.prompt === 'Unit test question prompt?', 'Retrieve question by ID');

// -----------------------------------------------------------------------------
// Test 6: Search & Filter Questions
// -----------------------------------------------------------------------------
const searchResult = questionService.searchQuestions({ subject: 'Medicine', difficulty: 'easy' });
assert(searchResult.length > 0 && searchResult.some(q => q.id === 'q-test-unit-01'), 'Search & filter questions by metadata (subject & difficulty)');

// -----------------------------------------------------------------------------
// Test 7: Create Question Group & Stimulus
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Question Groups & Stimuli ---');
const stimulusRes = stimulusService.createStimulus({
  id: 'stimulus-test-unit-01',
  type: STIMULUS_TYPES.TEXT,
  title: 'Unit Test Stimulus',
  content: { text: 'Test stimulus patient case details.' }
});
const groupRes = stimulusService.createQuestionGroup({
  id: 'group-test-unit-01',
  type: 'clinical_case',
  title: 'Unit Test Question Group',
  stimulusId: 'stimulus-test-unit-01',
  questionIds: ['q-test-unit-01']
});
assert(stimulusRes.success && groupRes.success, 'Create QuestionGroup and associated Stimulus in stimulusService');

// -----------------------------------------------------------------------------
// Test 8: Resolve Question Reference
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Resolution Helpers ---');
const resolvedSingleQ = resolveQuestionReference('q-neet-01');
assert(resolvedSingleQ !== null && resolvedSingleQ.id === 'q-neet-01' && resolvedSingleQ.scoring.marks === 5, 'Resolve Question Reference (refId: q-neet-01)');

// -----------------------------------------------------------------------------
// Test 9: Resolve Question Group
// -----------------------------------------------------------------------------
const resolvedGroup = resolveQuestionGroup('group-cardio-case-001');
assert(
  resolvedGroup !== null &&
  resolvedGroup.group.id === 'group-cardio-case-001' &&
  resolvedGroup.stimulus !== null &&
  resolvedGroup.stimulus.id === 'stimulus-cardio-case-001' &&
  resolvedGroup.questions.length === 3,
  'Resolve Question Group (stimulus + 3 child questions resolved)'
);

// -----------------------------------------------------------------------------
// Test 10: Validate Malformed Assessment
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Validation & Integrity ---');
const malformedAssessment = { id: 'invalid', title: 123 }; // missing version, activeVersionId, invalid title type
const validationResult = validateAssessment(malformedAssessment);
assert(!validationResult.isValid && validationResult.errors.length > 0, 'Validate malformed assessment catches missing/invalid fields');

// -----------------------------------------------------------------------------
// Test 11: Detect Duplicate IDs
// -----------------------------------------------------------------------------
const duplicateList = [
  { id: 'q-dup-1' },
  { id: 'q-dup-2' },
  { id: 'q-dup-1' } // Duplicate!
];
const detectedDups = detectDuplicateIds(duplicateList, 'testSuite');
assert(detectedDups.includes('q-dup-1'), 'Detect duplicate IDs in collections without crashing');

// -----------------------------------------------------------------------------
// Test 12: Reset Prototype Data
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Reset & Lifecycle ---');
questionService.deleteQuestion('q-test-unit-01');
assert(questionService.getQuestionById('q-test-unit-01') === null, 'Delete transient test question');
assessmentService.resetPrototypeExamData();
const resetQuestions = questionService.getQuestions();
assert(resetQuestions.length === DEMO_QUESTIONS.length, 'Reset prototype exam data restores initial clean fixtures');

// -----------------------------------------------------------------------------
// Test 13: Create Assessment & Version
// -----------------------------------------------------------------------------
const newAssessmentRes = assessmentService.createAssessment({
  id: 'assessment-unit-test-custom',
  title: 'Custom Unit Test Assessment',
  category: 'Practical Exam',
  durationMinutes: 40
});
const createdAssessment = assessmentService.getAssessmentById('assessment-unit-test-custom');
assert(
  newAssessmentRes.success &&
  createdAssessment !== null &&
  createdAssessment.versions.length === 1 &&
  createdAssessment.activeVersionId === 'assessment-unit-test-custom-v1',
  'Create new Assessment with initialized active AssessmentVersion'
);
assessmentService.deleteAssessment('assessment-unit-test-custom');

// -----------------------------------------------------------------------------
// Test 14: Legacy Test -> Assessment Adapter
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Legacy Adapter ---');
const legacyMock = {
  id: 'test-legacy-sample',
  name: 'Cardiology Mini Mock',
  courseId: 'neet-pg',
  durationMinutes: 45,
  marksPerCorrect: 5,
  marksPerIncorrect: -1,
  instructions: ['Rule 1', 'Rule 2'],
  questions: [
    {
      id: 'legacy-q1',
      question: 'Which valve is affected in mitral stenosis?',
      options: [
        { key: 'A', text: 'Mitral valve' },
        { key: 'B', text: 'Aortic valve' }
      ],
      correct: 'A',
      explanation: 'Mitral stenosis affects the mitral valve.'
    }
  ]
};

const adapted = legacyTestToAssessment(legacyMock);
assert(
  adapted !== null &&
  adapted.assessment.id === 'assessment-adapted-test-legacy-sample' &&
  adapted.assessment.activeVersionId === 'assessment-adapted-test-legacy-sample-v1' &&
  adapted.assessment.versions[0].sections[0].items[0].refId === 'legacy-q1' &&
  adapted.extractedQuestions[0].answer.correct[0] === 'A',
  'Legacy test to canonical Assessment adapter preserves question IDs and formats'
);

// -----------------------------------------------------------------------------
// Test 15: End-to-End Clinical Case Assessment Resolution
// -----------------------------------------------------------------------------
console.log('\n--- Suite 8: END-TO-END DATA MODEL PROOF (Clinical Case) ---');
const fullClinicalExam = resolveAssessment('assessment-clinical-case-demo');
const caseSection = fullClinicalExam?.sections?.[0];
const groupItem = caseSection?.items?.[0];

assert(
  fullClinicalExam !== null &&
  fullClinicalExam.assessment.id === 'assessment-clinical-case-demo' &&
  fullClinicalExam.activeVersion.version === 1 &&
  caseSection.title.includes('Acute Aortic Syndromes') &&
  groupItem.type === 'question_group' &&
  groupItem.group.id === 'group-cardio-case-001' &&
  groupItem.stimulus !== null &&
  groupItem.stimulus.title.includes('Tearing Interscapular Pain') &&
  groupItem.questions.length === 3 &&
  groupItem.questions[0].id === 'q-case-01' &&
  groupItem.questions[1].id === 'q-case-02' &&
  groupItem.questions[2].id === 'q-case-03',
  'END-TO-END: Assessment -> Active Version -> Section -> Question Group -> Stimulus -> (Q1, Q2, Q3)'
);

console.log('\n==================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
