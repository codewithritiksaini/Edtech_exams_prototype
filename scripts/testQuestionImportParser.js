// =============================================================================
// TEST SUITE: BULK QUESTION UPLOAD SYMBOL-BASED ANSWER PARSER
// Verifies type-aware symbol parsing (^ for options, ` for blanks),
// strict schema validation, whitespace handling, literal caret preservation,
// unresolved type detection, and clean data persistence in questionService.
//
// Run with: node -r ./scripts/setupNodeTestEnv.js scripts/testQuestionImportParser.js
// =============================================================================

import assert from 'assert';
import { 
  parseOptionText,
  parseCorrectOptions,
  parseFillInTheBlank,
  parseQuestionRow,
  parseQuestionRows,
  updateParsedRowType,
  normalizeImportedQuestion,
  validateImportedQuestion,
  IMPORT_SYNTAX,
  IMPORT_ERROR_CODES,
  ROW_STATUS
} from '../src/services/questionImportParser.js';
import { questionTypeService, QUESTION_TYPES } from '../src/services/questionTypeService.js';
import { questionService } from '../src/services/questionService.js';

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
console.log('RUNNING QUESTION IMPORT PARSER VERIFICATION SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. OPTION TEXT & CARET SYMBOL PARSING
// -----------------------------------------------------------------------------
console.log('--- 1. Option Text & Caret Symbol Parsing ---');

it('Detects leading caret marker and strips symbol from text', () => {
  const res = parseOptionText('^ Paris');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.text, 'Paris');
});

it('Handles leading whitespace before caret: "   ^ Paris"', () => {
  const res = parseOptionText('   ^ Paris');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.text, 'Paris');
});

it('Handles trailing whitespace after caret: "^    Paris"', () => {
  const res = parseOptionText('^    Paris');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.text, 'Paris');
});

it('Handles lettered prefix with caret: "A) ^ Paris" and "(B) ^ London"', () => {
  const res1 = parseOptionText('A) ^ Paris');
  assert.strictEqual(res1.isCorrect, true);
  assert.strictEqual(res1.text, 'Paris');

  const res2 = parseOptionText('(B) ^ London');
  assert.strictEqual(res2.isCorrect, true);
  assert.strictEqual(res2.text, 'London');
});

it('Does NOT treat literal carets inside text as markers: "Paris ^ France"', () => {
  const res = parseOptionText('Paris ^ France');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.text, 'Paris ^ France');
});

it('Normal option without caret is marked false: "London"', () => {
  const res = parseOptionText('London');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.text, 'London');
});

// -----------------------------------------------------------------------------
// 2. SBA (SINGLE BEST ANSWER) OPTION PARSING & VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. SBA (Single Best Answer) Parsing ---');

it('SBA with exactly one caret is valid and extracts single correct answer', () => {
  const options = ['^ Paris', 'London', 'Berlin', 'Madrid'];
  const res = parseCorrectOptions(options, QUESTION_TYPES.SINGLE_BEST_ANSWER);
  
  assert.strictEqual(res.errors.length, 0);
  assert.strictEqual(res.correctAnswers.length, 1);
  assert.strictEqual(res.correctAnswers[0], 'Paris');
  assert.strictEqual(res.correctOptionIds[0], 'A');
  assert.strictEqual(res.parsedOptions[0].text, 'Paris');
  assert.strictEqual(res.parsedOptions[0].isCorrect, true);
  assert.strictEqual(res.parsedOptions[1].text, 'London');
  assert.strictEqual(res.parsedOptions[1].isCorrect, false);
});

it('Invalid SBA with multiple carets produces MULTIPLE_CORRECT_OPTIONS_FOR_SBA error', () => {
  const options = ['^ Paris', '^ London', 'Berlin', 'Madrid'];
  const res = parseCorrectOptions(options, QUESTION_TYPES.SINGLE_BEST_ANSWER);
  
  assert.strictEqual(res.correctAnswers.length, 2);
  assert(res.errors.some(e => e.code === IMPORT_ERROR_CODES.MULTIPLE_CORRECT_OPTIONS_FOR_SBA));
});

it('SBA without any caret produces MISSING_CORRECT_OPTION error', () => {
  const options = ['Paris', 'London', 'Berlin', 'Madrid'];
  const res = parseCorrectOptions(options, QUESTION_TYPES.SINGLE_BEST_ANSWER);
  
  assert.strictEqual(res.correctAnswers.length, 0);
  assert(res.errors.some(e => e.code === IMPORT_ERROR_CODES.MISSING_CORRECT_OPTION));
});

// -----------------------------------------------------------------------------
// 3. MCQ (MULTIPLE CHOICE) OPTION PARSING & VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. MCQ (Multiple Choice Multi-Select) Parsing ---');

it('MCQ with multiple carets extracts all correct answers', () => {
  const options = ['^ Java', '^ Python', 'HTML', '^ C++', 'CSS'];
  const res = parseCorrectOptions(options, QUESTION_TYPES.MULTIPLE_CHOICE);
  
  assert.strictEqual(res.errors.length, 0);
  assert.strictEqual(res.correctAnswers.length, 3);
  assert.deepStrictEqual(res.correctAnswers, ['Java', 'Python', 'C++']);
  assert.deepStrictEqual(res.correctOptionIds, ['A', 'B', 'D']);
});

it('MCQ without any caret produces MISSING_CORRECT_OPTION error', () => {
  const options = ['Java', 'Python', 'HTML', 'C++', 'CSS'];
  const res = parseCorrectOptions(options, QUESTION_TYPES.MULTIPLE_CHOICE);
  
  assert.strictEqual(res.correctAnswers.length, 0);
  assert(res.errors.some(e => e.code === IMPORT_ERROR_CODES.MISSING_CORRECT_OPTION));
});

// -----------------------------------------------------------------------------
// 4. FILL-IN-THE-BLANK (SHORT ANSWER) PARSING
// -----------------------------------------------------------------------------
console.log('\n--- 4. Fill-in-the-Blank (Short Answer) Parsing ---');

it('Extracts single backtick answer and replaces prompt with blank line', () => {
  const raw = 'The process by which plants convert light energy into chemical energy is `photosynthesis`.';
  const res = parseFillInTheBlank(raw);
  
  assert.strictEqual(res.errors.length, 0);
  assert.strictEqual(res.answers.length, 1);
  assert.strictEqual(res.answers[0], 'photosynthesis');
  assert.strictEqual(res.cleanPrompt, 'The process by which plants convert light energy into chemical energy is ______.');
  assert(!res.cleanPrompt.includes('`'), 'Prompt must not contain backticks');
  assert(!res.answers[0].includes('`'), 'Answer must not contain backticks');
});

it('Extracts multiple backtick answers in order', () => {
  const raw = 'The capital of France is `Paris` and the capital of Germany is `Berlin`.';
  const res = parseFillInTheBlank(raw);
  
  assert.strictEqual(res.errors.length, 0);
  assert.strictEqual(res.answers.length, 2);
  assert.deepStrictEqual(res.answers, ['Paris', 'Berlin']);
  assert.strictEqual(res.cleanPrompt, 'The capital of France is ______ and the capital of Germany is ______.');
});

it('Fill-in-the-Blank without delimiter produces MISSING_FILL_BLANK_ANSWER error', () => {
  const raw = 'The capital of France is Paris.';
  const res = parseFillInTheBlank(raw);
  
  assert.strictEqual(res.answers.length, 0);
  assert(res.errors.some(e => e.code === IMPORT_ERROR_CODES.MISSING_FILL_BLANK_ANSWER));
});

// -----------------------------------------------------------------------------
// 5. QUESTION TYPE RESOLUTION & UNRESOLVED ROW HANDLING
// -----------------------------------------------------------------------------
console.log('\n--- 5. Question Type Resolution & Unresolved Row Handling ---');

it('Row with missing Question Type is marked REQUIRES_ACTION and not silently defaulted to SBA', () => {
  const rawRow = {
    prompt: 'What is the capital of France?',
    options: ['^ Paris', 'London', 'Berlin', 'Madrid']
  };
  
  const parsed = parseQuestionRow(rawRow);
  assert.strictEqual(parsed.status, ROW_STATUS.REQUIRES_ACTION);
  assert.strictEqual(parsed.type, null);
  assert.strictEqual(parsed.normalizedQuestion, null);
  assert(parsed.validation.errors.some(e => e.code === IMPORT_ERROR_CODES.MISSING_QUESTION_TYPE));
});

it('Row with invalid Question Type is marked INVALID', () => {
  const rawRow = {
    type: 'NON_EXISTENT_TYPE',
    prompt: 'What is the capital of France?',
    options: ['^ Paris', 'London', 'Berlin', 'Madrid']
  };
  
  const parsed = parseQuestionRow(rawRow);
  assert.strictEqual(parsed.status, ROW_STATUS.INVALID);
  assert(parsed.validation.errors.some(e => e.code === IMPORT_ERROR_CODES.INVALID_QUESTION_TYPE));
});

it('updateParsedRowType allows assigning type to unresolved row and re-evaluates validation', () => {
  const rawRow = {
    prompt: 'What is the capital of France?',
    options: ['^ Paris', 'London', 'Berlin', 'Madrid']
  };
  
  const unresolved = parseQuestionRow(rawRow);
  assert.strictEqual(unresolved.status, ROW_STATUS.REQUIRES_ACTION);
  
  // Assign SBA
  const resolved = updateParsedRowType(unresolved, QUESTION_TYPES.SINGLE_BEST_ANSWER);
  assert.strictEqual(resolved.status, ROW_STATUS.VALID);
  assert.strictEqual(resolved.type, QUESTION_TYPES.SINGLE_BEST_ANSWER);
  assert.strictEqual(resolved.parsedAnswerSummary, 'Paris');
  assert(resolved.normalizedQuestion !== null);
});

// -----------------------------------------------------------------------------
// 6. MULTI-ROW DOCUMENT PARSING (TEXT BLOCKS)
// -----------------------------------------------------------------------------
console.log('\n--- 6. Multi-Row Document Parsing ---');

it('Parses mixed document with SBA, MCQ, and Fill-in-the-Blank text blocks', () => {
  const docText = `
Type: SBA
What is the capital of France?
^ Paris
London
Berlin
Madrid
Explanation: Paris is the capital.

Type: MCQ
Which are programming languages?
^ Java
^ Python
HTML
^ C++
CSS

Type: SHORT_ANSWER
The process by which plants convert light energy into chemical energy is \`photosynthesis\`.
Explanation: Chloroplasts perform photosynthesis.

What is the capital of Italy?
^ Rome
Milan
Naples
Turin
  `;

  const rows = parseQuestionRows(docText);
  assert.strictEqual(rows.length, 4);

  // Row 1: SBA
  assert.strictEqual(rows[0].type, QUESTION_TYPES.SINGLE_BEST_ANSWER);
  assert.strictEqual(rows[0].status, ROW_STATUS.VALID);
  assert.strictEqual(rows[0].parsedAnswerSummary, 'Paris');
  assert.strictEqual(rows[0].normalizedQuestion.content.prompt, 'What is the capital of France?');
  assert.strictEqual(rows[0].normalizedQuestion.responseSchema.options.length, 4);

  // Row 2: MCQ
  assert.strictEqual(rows[1].type, QUESTION_TYPES.MULTIPLE_CHOICE);
  assert.strictEqual(rows[1].status, ROW_STATUS.VALID);
  assert.strictEqual(rows[1].parsedAnswerSummary, 'Java, Python, C++');
  assert.strictEqual(rows[1].normalizedQuestion.answer.correct.length, 3);

  // Row 3: Fill-in-the-Blank
  assert.strictEqual(rows[2].type, QUESTION_TYPES.SHORT_ANSWER);
  assert.strictEqual(rows[2].status, ROW_STATUS.VALID);
  assert.strictEqual(rows[2].parsedAnswerSummary, 'photosynthesis');
  assert.strictEqual(rows[2].normalizedQuestion.answer.correct[0], 'photosynthesis');
  assert(!rows[2].normalizedQuestion.content.prompt.includes('`'));

  // Row 4: Untyped row -> REQUIRES_ACTION
  assert.strictEqual(rows[3].type, null);
  assert.strictEqual(rows[3].status, ROW_STATUS.REQUIRES_ACTION);
  assert(rows[3].validation.errors.some(e => e.code === IMPORT_ERROR_CODES.MISSING_QUESTION_TYPE));
});

// -----------------------------------------------------------------------------
// 7. END-TO-END PERSISTENCE & CLEAN DATA VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 7. End-to-End Persistence & Clean Data Verification ---');

it('Persists valid questions in questionService with clean data and no symbols', () => {
  const rawRow = {
    type: 'SBA',
    prompt: 'What is the first-line medication for anaphylaxis?',
    options: ['^ Intramuscular Epinephrine', 'Oral Diphenhydramine', 'Inhaled Albuterol', 'Intravenous Hydrocortisone'],
    explanation: 'Intramuscular epinephrine (1:1000) is the first-line treatment for anaphylaxis.'
  };

  const parsed = parseQuestionRow(rawRow, { defaultSubject: 'Emergency Medicine' });
  assert.strictEqual(parsed.status, ROW_STATUS.VALID);

  // Persistence boundary: questionService.createQuestion
  const res = questionService.createQuestion(parsed.normalizedQuestion);
  assert.strictEqual(res.success, true);
  assert(res.question && res.question.id);

  // Verify stored question contains NO caret symbols
  const stored = questionService.getQuestionById(res.question.id);
  assert(stored !== null);
  assert.strictEqual(stored.content.prompt, 'What is the first-line medication for anaphylaxis?');
  
  stored.responseSchema.options.forEach(opt => {
    assert(!opt.text.startsWith('^'), `Option text "${opt.text}" must not start with ^`);
    assert(!opt.text.includes('^'), `Option text "${opt.text}" must not contain ^`);
  });

  assert.strictEqual(stored.responseSchema.options[0].text, 'Intramuscular Epinephrine');
  assert.strictEqual(stored.answer.correct[0], 'A');
});

console.log('\n======================================================');
console.log(`ALL TESTS PASSED! (${passed}/${total})`);
console.log('======================================================\n');
