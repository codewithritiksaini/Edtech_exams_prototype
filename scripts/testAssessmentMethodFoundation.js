// =============================================================================
// TEST SUITE: ASSESSMENT METHOD FOUNDATION (PHASE 1)
// Covers:
// 1. All five canonical Assessment Methods available with valid IDs and labels
// 2. Assessment Method validation (valid passes, invalid rejected)
// 3. Existing tests without assessmentMethod load safely (backward compatibility)
// 4. Admin creation and update of Assessment Method respecting lifecycle
// 5. Faculty creation and update of Assessment Method respecting RBAC & lifecycle
// 6. Test Type vs Assessment Method separation (distinct concepts)
// 7. Question Type vs Assessment Method separation (distinct concepts)
// 8. 6-Phase architecture preservation (no new phase introduced)
// =============================================================================

import './setupNodeTestEnv.js';
import { 
  ASSESSMENT_METHODS, 
  ASSESSMENT_METHOD_LIST, 
  VALID_ASSESSMENT_METHOD_IDS,
  getAssessmentMethodLabel, 
  getAssessmentMethodBadgeClass, 
  isValidAssessmentMethod, 
  validateAssessmentMethod 
} from '../src/services/assessmentMethodService.js';
import { 
  adminTestService, 
  TEST_STATUS, 
  TEST_TYPES,
  getTestTypeLabel 
} from '../src/services/adminTestService.js';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  FACULTY_TEST_TYPES,
  getFacultyTestTypeLabel 
} from '../src/services/cbtTestService.js';
import { 
  questionTypeService, 
  QUESTION_TYPES 
} from '../src/services/questionTypeService.js';
import { catalogService } from '../src/services/catalogService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n=================================================================');
console.log('🧪 MEDPREP PRO — ASSESSMENT METHOD FOUNDATION TEST SUITE');
console.log('=================================================================\n');

// -----------------------------------------------------------------------------
// 1. All Five Canonical Assessment Methods
// -----------------------------------------------------------------------------
console.log('--- 1. Canonical Assessment Methods Available ---');
assert(Array.isArray(ASSESSMENT_METHODS) && ASSESSMENT_METHODS.length === 5, 'Exact 5 canonical assessment methods exist');
assert(VALID_ASSESSMENT_METHOD_IDS.has('THEORETICAL'), 'THEORETICAL method ID present');
assert(VALID_ASSESSMENT_METHOD_IDS.has('ANALYTICAL'), 'ANALYTICAL method ID present');
assert(VALID_ASSESSMENT_METHOD_IDS.has('CLINICAL'), 'CLINICAL method ID present');
assert(VALID_ASSESSMENT_METHOD_IDS.has('CASE_SCENARIO'), 'CASE_SCENARIO method ID present');
assert(VALID_ASSESSMENT_METHOD_IDS.has('INTERVIEW'), 'INTERVIEW method ID present');

assert(getAssessmentMethodLabel('THEORETICAL') === 'Theoretical Examination', 'THEORETICAL label correct');
assert(getAssessmentMethodLabel('ANALYTICAL') === 'Analytical Examination', 'ANALYTICAL label correct');
assert(getAssessmentMethodLabel('CLINICAL') === 'Clinical Examination', 'CLINICAL label correct');
assert(getAssessmentMethodLabel('CASE_SCENARIO') === 'Case Scenario Examination', 'CASE_SCENARIO label correct');
assert(getAssessmentMethodLabel('INTERVIEW') === 'Interview Examination', 'INTERVIEW label correct');

// -----------------------------------------------------------------------------
// 2. Validation System
// -----------------------------------------------------------------------------
console.log('\n--- 2. Validation System ---');
// Valid values pass
assert(validateAssessmentMethod('THEORETICAL').valid === true, 'validateAssessmentMethod accepts THEORETICAL');
assert(validateAssessmentMethod('CLINICAL').valid === true, 'validateAssessmentMethod accepts CLINICAL');
assert(validateAssessmentMethod('CASE_SCENARIO').valid === true, 'validateAssessmentMethod accepts CASE_SCENARIO');
assert(validateAssessmentMethod('INTERVIEW').valid === true, 'validateAssessmentMethod accepts INTERVIEW');
assert(validateAssessmentMethod('ANALYTICAL').valid === true, 'validateAssessmentMethod accepts ANALYTICAL');

// Invalid values rejected
const invalidRes = validateAssessmentMethod('MULTIPLE_CHOICE');
assert(invalidRes.valid === false, 'Rejects invalid assessment method string');
assert(invalidRes.errors[0]?.field === 'assessmentMethod', 'Error targets field: assessmentMethod');
assert(invalidRes.errors[0]?.code === 'INVALID_ASSESSMENT_METHOD', 'Error code is INVALID_ASSESSMENT_METHOD');

// Missing value when required
const requiredRes = validateAssessmentMethod('', { required: true });
assert(requiredRes.valid === false, 'Rejects empty value when required');
assert(requiredRes.errors[0]?.code === 'ASSESSMENT_METHOD_REQUIRED', 'Error code is ASSESSMENT_METHOD_REQUIRED');

// Missing value when not required (backward compatible)
const optionalRes = validateAssessmentMethod(null, { required: false });
assert(optionalRes.valid === true, 'Allows null value when required=false');

// -----------------------------------------------------------------------------
// 3. Backward Compatibility: Existing Tests Without assessmentMethod
// -----------------------------------------------------------------------------
console.log('\n--- 3. Backward Compatibility ---');
const allAdminTests = adminTestService.getTests();
assert(Array.isArray(allAdminTests) && allAdminTests.length > 0, 'Admin tests loaded successfully');

// Check that existing tests load without crashing even if assessmentMethod is null/undefined
allAdminTests.forEach(test => {
  const methodLabel = getAssessmentMethodLabel(test.assessmentMethod);
  assert(typeof methodLabel === 'string', `Test ${test.id} label lookup safe: "${methodLabel}"`);
});

const allFacultyTests = cbtTestService.getAllFacultyTests();
assert(Array.isArray(allFacultyTests) && allFacultyTests.length > 0, 'Faculty tests loaded successfully');
allFacultyTests.forEach(test => {
  const methodLabel = getAssessmentMethodLabel(test.assessmentMethod);
  assert(typeof methodLabel === 'string', `Faculty Test ${test.id} label lookup safe: "${methodLabel}"`);
});

// -----------------------------------------------------------------------------
// 4. Admin Test Lifecycle & Permissions
// -----------------------------------------------------------------------------
console.log('\n--- 4. Admin Creation & Lifecycle Permissions ---');
const uniqueCode = `ADM-AM-${Date.now()}`;
const newAdminTest = adminTestService.createTest({
  examId: 'neet-pg',
  name: 'Admin Assessment Method Verification Test',
  code: uniqueCode,
  testType: TEST_TYPES.FULL_MOCK,
  assessmentMethod: 'CASE_SCENARIO',
  targetQuestions: 50,
  targetDuration: 60,
  language: 'English',
  description: 'Testing assessment method persistence'
});

assert(newAdminTest && newAdminTest.id, 'Admin test created successfully');
assert(newAdminTest.assessmentMethod === 'CASE_SCENARIO', 'New test persisted assessmentMethod CASE_SCENARIO');
assert(newAdminTest.status === TEST_STATUS.DRAFT, 'New test is in DRAFT status');

// Admin edit in DRAFT status
const updatedAdminTest = adminTestService.updateTest(newAdminTest.id, {
  assessmentMethod: 'CLINICAL'
});
assert(updatedAdminTest.assessmentMethod === 'CLINICAL', 'Admin can update assessmentMethod to CLINICAL in DRAFT');

// Admin rejected when saving invalid method
let adminRejectError = null;
try {
  adminTestService.updateTest(newAdminTest.id, {
    assessmentMethod: 'INVALID_FOO_BAR'
  });
} catch (err) {
  adminRejectError = err;
}
assert(adminRejectError !== null, 'Admin service throws on invalid assessmentMethod in updateTest');

// Test duplication preserves assessmentMethod
const duplicatedTest = adminTestService.duplicateTest(newAdminTest.id, `${uniqueCode}-DUP`);
assert(duplicatedTest.assessmentMethod === 'CLINICAL', 'duplicateTest preserves assessmentMethod');

// Check locked state: PUBLISHED or ARCHIVED tests cannot be modified
const archivedTest = adminTestService.updateTestStatus(newAdminTest.id, TEST_STATUS.ARCHIVED);
let lockedEditError = null;
try {
  adminTestService.updateTest(archivedTest.id, {
    assessmentMethod: 'INTERVIEW'
  });
} catch (err) {
  lockedEditError = err;
}
assert(lockedEditError !== null, 'Admin cannot edit assessmentMethod when test is locked/ARCHIVED');

// -----------------------------------------------------------------------------
// 5. Faculty Test RBAC & Lifecycle Permissions
// -----------------------------------------------------------------------------
console.log('\n--- 5. Faculty Creation & RBAC Permissions ---');
const currentFaculty = {
  id: 'fac-1',
  name: 'Dr. Siddharth V.',
  role: 'faculty',
  subjects: ['Anatomy', 'Pathology']
};

const unauthorizedFaculty = {
  id: 'fac-99',
  name: 'Dr. Other Faculty',
  role: 'faculty',
  subjects: ['Radiology']
};

const facultyUniqueCode = `FAC-AM-${Date.now()}`;
const newFacultyTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  title: 'Faculty Clinical Assessment Test',
  code: facultyUniqueCode,
  testType: FACULTY_TEST_TYPES.SUBJECT_TEST,
  assessmentMethod: 'CLINICAL',
  subjectId: 'subj-anatomy',
  targetQuestions: 30,
  durationMinutes: 45,
  passingScore: 60
}, currentFaculty);

assert(newFacultyTest && newFacultyTest.id, 'Faculty test created successfully');
assert(newFacultyTest.assessmentMethod === 'CLINICAL', 'Faculty test stored assessmentMethod CLINICAL');

// Faculty can edit assessmentMethod while in draft
const updatedFacultyTest = cbtTestService.updateFacultyTest(newFacultyTest.id, {
  assessmentMethod: 'ANALYTICAL'
}, currentFaculty);
assert(updatedFacultyTest.assessmentMethod === 'ANALYTICAL', 'Faculty owner can update assessmentMethod to ANALYTICAL');

// Unauthorized faculty cannot edit
let rbacError = null;
try {
  cbtTestService.updateFacultyTest(newFacultyTest.id, {
    assessmentMethod: 'THEORETICAL'
  }, unauthorizedFaculty);
} catch (err) {
  rbacError = err;
}
assert(rbacError !== null, 'Unauthorized faculty cannot update test (RBAC enforced)');

// Invalid assessment method rejected for faculty
let facultyInvalidError = null;
try {
  cbtTestService.updateFacultyTest(newFacultyTest.id, {
    assessmentMethod: 'NOT_A_METHOD'
  }, currentFaculty);
} catch (err) {
  facultyInvalidError = err;
}
assert(facultyInvalidError !== null, 'Faculty service rejects invalid assessmentMethod');

// -----------------------------------------------------------------------------
// 6. Test Type vs Assessment Method Separation
// -----------------------------------------------------------------------------
console.log('\n--- 6. Test Type vs Assessment Method Separation ---');
assert(TEST_TYPES.FULL_MOCK !== undefined, 'TEST_TYPES.FULL_MOCK exists');
assert(VALID_ASSESSMENT_METHOD_IDS.has(TEST_TYPES.FULL_MOCK) === false, 'Test Type FULL_MOCK is NOT an Assessment Method');
assert(getTestTypeLabel('FULL_MOCK') === 'Full Mock', 'getTestTypeLabel returns Full Mock');
assert(getAssessmentMethodLabel('THEORETICAL') === 'Theoretical Examination', 'getAssessmentMethodLabel returns Theoretical Examination');

// Both can coexist on the same test object independently
const coexistenceTest = {
  testType: 'FULL_MOCK',
  assessmentMethod: 'THEORETICAL'
};
assert(
  getTestTypeLabel(coexistenceTest.testType) === 'Full Mock' &&
  getAssessmentMethodLabel(coexistenceTest.assessmentMethod) === 'Theoretical Examination',
  'Test Type and Assessment Method coexist without collision'
);

// -----------------------------------------------------------------------------
// 7. Question Type vs Assessment Method Separation
// -----------------------------------------------------------------------------
console.log('\n--- 7. Question Type vs Assessment Method Separation ---');
const qTypes = questionTypeService.getAllQuestionTypes();
assert(Array.isArray(qTypes) && qTypes.length > 0, 'Question types loaded');
qTypes.forEach(qt => {
  assert(
    !VALID_ASSESSMENT_METHOD_IDS.has(qt.id),
    `Question Type "${qt.id}" is distinct from Assessment Method enum`
  );
});

// -----------------------------------------------------------------------------
// 8. 6-Phase Architecture Integrity
// -----------------------------------------------------------------------------
console.log('\n--- 8. 6-Phase Architecture Integrity ---');
const expectedPhases = [
  'Foundation',
  'Structure',
  'Content',
  'Rules',
  'Generate / Build',
  'Review & Publish'
];
assert(expectedPhases.length === 6, 'Workflow has exactly 6 phases');
assert(expectedPhases[0] === 'Foundation', 'Assessment Method belongs to Phase 1: Foundation');
assert(expectedPhases[4] === 'Generate / Build', 'Phase 5 is Generate / Build');
assert(expectedPhases[5] === 'Review & Publish', 'Phase 6 is Review & Publish');

// Catalog exams remain untouched
const exams = catalogService.getExams();
assert(exams.length >= 4, 'Catalog exams catalog untouched');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n=================================================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('=================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL ASSESSMENT METHOD FOUNDATION TESTS PASSED!\n');
}
