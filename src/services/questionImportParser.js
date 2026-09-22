// =============================================================================
// QUESTION IMPORT PARSER SERVICE — TYPE-AWARE SYMBOL-BASED PARSER
// Provides bulk question parsing, type resolution, symbol detection (^ and `),
// schema validation, and canonical normalization for Admin and Faculty uploads.
// =============================================================================

import { 
  questionTypeService, 
  QUESTION_TYPES, 
  getQuestionTypeSchema,
  validateQuestionByType 
} from './questionTypeService.js';

// -----------------------------------------------------------------------------
// CONSTANTS & IMPORT CONVENTIONS
// -----------------------------------------------------------------------------

export const IMPORT_SYNTAX = {
  correctOptionMarker: '^',
  fillBlankDelimiter: '`'
};

export const IMPORT_ERROR_CODES = {
  MISSING_QUESTION_TYPE: 'MISSING_QUESTION_TYPE',
  INVALID_QUESTION_TYPE: 'INVALID_QUESTION_TYPE',
  MISSING_CORRECT_OPTION: 'MISSING_CORRECT_OPTION',
  MULTIPLE_CORRECT_OPTIONS_FOR_SBA: 'MULTIPLE_CORRECT_OPTIONS_FOR_SBA',
  MISSING_FILL_BLANK_ANSWER: 'MISSING_FILL_BLANK_ANSWER',
  INVALID_QUESTION_SCHEMA: 'INVALID_QUESTION_SCHEMA',
  INVALID_OPTION_STRUCTURE: 'INVALID_OPTION_STRUCTURE',
  INSUFFICIENT_OPTIONS: 'INSUFFICIENT_OPTIONS',
  EMPTY_OPTION_TEXT: 'EMPTY_OPTION_TEXT',
  MISSING_PROMPT: 'MISSING_PROMPT'
};

export const ROW_STATUS = {
  VALID: 'VALID',
  INVALID: 'INVALID',
  REQUIRES_ACTION: 'REQUIRES_ACTION'
};

// -----------------------------------------------------------------------------
// HELPER: ROBUST OPTION PARSING
// -----------------------------------------------------------------------------

/**
 * Parses a raw option string, checking for a leading `^` marker.
 * Supports optional leading/trailing whitespace around `^` (e.g. `   ^ Paris` or `^   Paris`).
 * Supports lettered prefixes like `A) ^ Paris` or `A. ^ Paris`.
 * Leaves literal carets inside text (e.g. `Paris ^ France`) intact as non-markers.
 *
 * @param {string|object} rawOption
 * @returns {{ text: string, isCorrect: boolean, originalText: string }}
 */
export function parseOptionText(rawOption) {
  if (rawOption === null || rawOption === undefined) {
    return { text: '', isCorrect: false, originalText: '' };
  }

  const rawString = typeof rawOption === 'object' 
    ? (rawOption.text || rawOption.value || '') 
    : String(rawOption);

  const trimmed = rawString.trim();

  // Case 1: Option begins directly with `^` (with optional whitespace afterwards)
  // e.g. "^ Paris", "   ^   Paris"
  if (trimmed.startsWith(IMPORT_SYNTAX.correctOptionMarker)) {
    const cleanText = trimmed.slice(IMPORT_SYNTAX.correctOptionMarker.length).trim();
    return {
      text: cleanText,
      isCorrect: true,
      originalText: rawString
    };
  }

  // Case 2: Option begins with letter prefix followed by `^`
  // e.g. "A) ^ Paris", "(B) ^ London", "1. ^ Berlin"
  const prefixCaretMatch = trimmed.match(/^(\(?[A-Za-z0-9]+[\.\)]\s*)\^\s*(.*)$/);
  if (prefixCaretMatch) {
    const cleanText = prefixCaretMatch[2].trim();
    return {
      text: cleanText,
      isCorrect: true,
      originalText: rawString
    };
  }

  // Case 3: Option begins with letter prefix without `^`
  // e.g. "A) Paris", "A. Paris"
  const prefixMatch = trimmed.match(/^(\(?[A-Za-z0-9]+[\.\)]\s*)(.*)$/);
  if (prefixMatch) {
    const cleanText = prefixMatch[2].trim();
    return {
      text: cleanText,
      isCorrect: false,
      originalText: rawString
    };
  }

  // Case 4: Normal option text without marker.
  // Note: Literal carets inside text like "Paris ^ France" will NOT match leading caret.
  return {
    text: trimmed,
    isCorrect: false,
    originalText: rawString
  };
}

// -----------------------------------------------------------------------------
// OPTION-BASED QUESTION PARSER (SBA / MCQ / TRUE_FALSE / EMQ)
// -----------------------------------------------------------------------------

/**
 * Parses options for option-based questions and validates correct option markers.
 *
 * @param {Array<string|object>} rawOptions
 * @param {string} questionType Canonical question type ID
 * @returns {{ parsedOptions: Array<{ id: string, text: string, isCorrect: boolean, originalText: string }>, correctAnswers: string[], correctOptionIds: string[], errors: Array<{ code: string, message: string }> }}
 */
export function parseCorrectOptions(rawOptions, questionType) {
  const errors = [];
  const optionsList = Array.isArray(rawOptions) ? rawOptions : [];

  if (optionsList.length === 0) {
    errors.push({
      code: IMPORT_ERROR_CODES.INVALID_OPTION_STRUCTURE,
      message: 'Question must have options defined.'
    });
    return { parsedOptions: [], correctAnswers: [], correctOptionIds: [], errors };
  }

  const parsedOptions = optionsList.map((opt, idx) => {
    const parsed = parseOptionText(opt);
    const id = String.fromCharCode(65 + idx); // 'A', 'B', 'C', etc.
    return {
      id,
      text: parsed.text,
      isCorrect: parsed.isCorrect,
      originalText: parsed.originalText
    };
  });

  const correctParsed = parsedOptions.filter(o => o.isCorrect);
  const correctOptionIds = correctParsed.map(o => o.id);
  const correctAnswers = correctParsed.map(o => o.text);

  // Schema-specific validation
  const canonType = questionTypeService.normalizeQuestionTypeId(questionType);

  if (canonType === QUESTION_TYPES.SINGLE_BEST_ANSWER) {
    if (correctParsed.length === 0) {
      errors.push({
        code: IMPORT_ERROR_CODES.MISSING_CORRECT_OPTION,
        message: 'No correct option identified. Use ^ before the correct option.'
      });
    } else if (correctParsed.length > 1) {
      errors.push({
        code: IMPORT_ERROR_CODES.MULTIPLE_CORRECT_OPTIONS_FOR_SBA,
        message: `SBA requires exactly one correct option. Found: ${correctParsed.length}`
      });
    }
  } else if (canonType === QUESTION_TYPES.MULTIPLE_CHOICE) {
    if (correctParsed.length === 0) {
      errors.push({
        code: IMPORT_ERROR_CODES.MISSING_CORRECT_OPTION,
        message: 'No correct option identified. Use ^ before the correct option.'
      });
    }
  } else {
    // For other option types like TRUE_FALSE, require at least one if options exist
    if (correctParsed.length === 0) {
      errors.push({
        code: IMPORT_ERROR_CODES.MISSING_CORRECT_OPTION,
        message: 'No correct option identified. Use ^ before the correct option.'
      });
    }
  }

  // Check for empty option texts
  const emptyOptions = parsedOptions.filter(o => !o.text || !o.text.trim());
  if (emptyOptions.length > 0) {
    errors.push({
      code: IMPORT_ERROR_CODES.EMPTY_OPTION_TEXT,
      message: 'All options must have non-empty text.'
    });
  }

  // Check minimum options constraint
  const schema = getQuestionTypeSchema(canonType || QUESTION_TYPES.SINGLE_BEST_ANSWER);
  if (schema && schema.minOptions && parsedOptions.length < schema.minOptions) {
    errors.push({
      code: IMPORT_ERROR_CODES.INSUFFICIENT_OPTIONS,
      message: `At least ${schema.minOptions} options are required for ${schema.name}. Found: ${parsedOptions.length}`
    });
  }

  return {
    parsedOptions,
    correctAnswers,
    correctOptionIds,
    errors
  };
}

// -----------------------------------------------------------------------------
// FILL-IN-THE-BLANK PARSER (SHORT_ANSWER)
// -----------------------------------------------------------------------------

/**
 * Parses Fill-in-the-Blank text, extracting backtick-delimited answers
 * and replacing them with canonical blanks (`______`).
 *
 * @param {string} rawPrompt
 * @returns {{ cleanPrompt: string, answers: string[], errors: Array<{ code: string, message: string }> }}
 */
export function parseFillInTheBlank(rawPrompt) {
  const errors = [];
  if (typeof rawPrompt !== 'string' || !rawPrompt.trim()) {
    errors.push({
      code: IMPORT_ERROR_CODES.MISSING_PROMPT,
      message: 'Question prompt text is required.'
    });
    return { cleanPrompt: '', answers: [], errors };
  }

  const regex = /`([^`]+)`/g;
  const answers = [];
  let match;

  while ((match = regex.exec(rawPrompt)) !== null) {
    const ans = match[1].trim();
    if (ans) {
      answers.push(ans);
    }
  }

  if (answers.length === 0) {
    errors.push({
      code: IMPORT_ERROR_CODES.MISSING_FILL_BLANK_ANSWER,
      message: 'No answer delimiter found. Expected: `answer`'
    });
    return {
      cleanPrompt: rawPrompt.trim(),
      answers: [],
      errors
    };
  }

  // Replace each backtick match with standard blank line ______
  const cleanPrompt = rawPrompt.replace(/`([^`]+)`/g, '______').trim();

  return {
    cleanPrompt,
    answers,
    errors
  };
}

// -----------------------------------------------------------------------------
// QUESTION NORMALIZATION & VALIDATION
// -----------------------------------------------------------------------------

/**
 * Normalizes parsed row data into a canonical Question object ready for persistence.
 *
 * @param {object} parsedData
 * @param {object} context
 * @returns {object} Canonical question object
 */
export function normalizeImportedQuestion(parsedData, context = {}) {
  const {
    id,
    type,
    prompt,
    vignette = '',
    options = [],
    correctAnswers = [],
    correctOptionIds = [],
    explanation = '',
    subject = context.defaultSubject || 'Medicine',
    topic = 'General',
    examId = context.examId || 'neet-pg',
    defaultMarks = 4,
    defaultNegativeMarks = -1
  } = parsedData;

  const canonType = questionTypeService.normalizeQuestionTypeId(type) || QUESTION_TYPES.SINGLE_BEST_ANSWER;
  const schema = getQuestionTypeSchema(canonType);
  const isTextAnswer = schema ? schema.requiresTextAnswer : false;

  const questionId = id || `q-import-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  if (isTextAnswer) {
    return {
      id: questionId,
      type: canonType,
      content: {
        prompt: prompt.trim(),
        vignette: vignette.trim()
      },
      responseSchema: {
        options: []
      },
      answer: {
        correct: correctAnswers,
        textAnswer: correctAnswers.join(', ')
      },
      scoring: {
        marks: defaultMarks,
        negativeMarks: 0
      },
      metadata: {
        subject,
        topic,
        difficulty: 'medium',
        tags: ['Uploaded Document', canonType, 'Bulk Import'],
        examId
      },
      explanation: explanation.trim(),
      status: 'published'
    };
  }

  // Option-based Question Model
  return {
    id: questionId,
    type: canonType,
    content: {
      prompt: prompt.trim(),
      vignette: vignette.trim()
    },
    responseSchema: {
      options: options.map(o => ({
        id: o.id,
        text: o.text
      }))
    },
    answer: {
      correct: correctOptionIds.length > 0 ? correctOptionIds : correctAnswers
    },
    scoring: {
      marks: defaultMarks,
      negativeMarks: defaultNegativeMarks
    },
    metadata: {
      subject,
      topic,
      difficulty: 'medium',
      tags: ['Uploaded Document', canonType, 'Bulk Import'],
      examId
    },
    explanation: explanation.trim(),
    status: 'published'
  };
}

/**
 * Validates a normalized question using questionTypeService.
 *
 * @param {object} question
 * @returns {{ valid: boolean, errors: Array<{ code: string, message: string }>, warnings: Array<{ code: string, message: string }> }}
 */
export function validateImportedQuestion(question) {
  const result = validateQuestionByType(question);
  const structuredErrors = (result.errors || []).map(err => {
    if (typeof err === 'object' && err.code) return err;
    return {
      code: IMPORT_ERROR_CODES.INVALID_QUESTION_SCHEMA,
      message: String(err)
    };
  });

  return {
    valid: result.valid,
    errors: structuredErrors,
    warnings: []
  };
}

// -----------------------------------------------------------------------------
// ROW PARSING: TYPE RESOLUTION & TYPE-SPECIFIC PARSER
// -----------------------------------------------------------------------------

/**
 * Parses a single question row or raw block.
 *
 * Sequence:
 * 1. Raw Row
 * 2. Resolve Question Type (Do NOT silently default!)
 * 3. Select Type-Specific Parser (^ or `)
 * 4. Parse Answer Markers
 * 5. Normalize
 * 6. Validate
 *
 * @param {object|string} rawRow
 * @param {object} context
 * @returns {object} Parsed row item with status and validation
 */
export function parseQuestionRow(rawRow, context = {}) {
  const rowNumber = context.rowNumber || 1;
  const errors = [];
  const warnings = [];

  let rawType = null;
  let rawPrompt = '';
  let rawOptions = [];
  let explanation = '';
  let vignette = '';
  let rawText = '';

  if (typeof rawRow === 'string') {
    rawText = rawRow;
    const extracted = extractFieldsFromTextBlock(rawRow);
    rawType = extracted.type;
    rawPrompt = extracted.prompt;
    rawOptions = extracted.options;
    explanation = extracted.explanation;
    vignette = extracted.vignette;
  } else if (typeof rawRow === 'object' && rawRow !== null) {
    rawText = JSON.stringify(rawRow);
    rawType = rawRow.type || rawRow.questionType || rawRow.format;
    rawPrompt = rawRow.prompt || rawRow.question || rawRow.stem || '';
    rawOptions = rawRow.options || [];
    explanation = rawRow.explanation || rawRow.rationale || '';
    vignette = rawRow.vignette || '';
  }

  // 1. Resolve Question Type
  if (!rawType || !String(rawType).trim()) {
    errors.push({
      code: IMPORT_ERROR_CODES.MISSING_QUESTION_TYPE,
      message: 'Question Type is missing. Please select or map a question type.'
    });

    return {
      rowNumber,
      rawInput: rawRow,
      type: null,
      rawType: null,
      status: ROW_STATUS.REQUIRES_ACTION,
      original: {
        prompt: rawPrompt,
        options: rawOptions.map(o => parseOptionText(o)),
        explanation,
        vignette,
        rawText
      },
      normalizedQuestion: null,
      parsedAnswerSummary: '—',
      validation: {
        valid: false,
        errors,
        warnings
      }
    };
  }

  const canonType = questionTypeService.normalizeQuestionTypeId(rawType);
  if (!canonType) {
    errors.push({
      code: IMPORT_ERROR_CODES.INVALID_QUESTION_TYPE,
      message: `Unrecognized question type "${rawType}".`
    });

    return {
      rowNumber,
      rawInput: rawRow,
      type: null,
      rawType,
      status: ROW_STATUS.INVALID,
      original: {
        prompt: rawPrompt,
        options: rawOptions.map(o => parseOptionText(o)),
        explanation,
        vignette,
        rawText
      },
      normalizedQuestion: null,
      parsedAnswerSummary: '—',
      validation: {
        valid: false,
        errors,
        warnings
      }
    };
  }

  // 2. Select Type-Specific Parser
  const schema = getQuestionTypeSchema(canonType);
  let cleanPrompt = rawPrompt;
  let parsedOptions = [];
  let correctAnswers = [];
  let correctOptionIds = [];
  let answerSummary = '';

  if (schema && schema.requiresTextAnswer) {
    // Fill-in-the-Blank / Short Answer parser: uses backticks `answer`
    const fitbResult = parseFillInTheBlank(rawPrompt);
    cleanPrompt = fitbResult.cleanPrompt;
    correctAnswers = fitbResult.answers;
    answerSummary = correctAnswers.join(', ') || 'No answer marked';
    if (fitbResult.errors && fitbResult.errors.length > 0) {
      errors.push(...fitbResult.errors);
    }
  } else {
    // Option-based parser (SBA, MCQ, TRUE_FALSE, etc.): uses leading `^`
    const optResult = parseCorrectOptions(rawOptions, canonType);
    parsedOptions = optResult.parsedOptions;
    correctAnswers = optResult.correctAnswers;
    correctOptionIds = optResult.correctOptionIds;
    answerSummary = correctAnswers.join(', ') || 'No correct option marked';
    if (optResult.errors && optResult.errors.length > 0) {
      errors.push(...optResult.errors);
    }
  }

  if (!cleanPrompt || !cleanPrompt.trim()) {
    errors.push({
      code: IMPORT_ERROR_CODES.MISSING_PROMPT,
      message: 'Question prompt text is required.'
    });
  }

  // 3. Normalize to Canonical Model
  const normalizedQuestion = normalizeImportedQuestion({
    type: canonType,
    prompt: cleanPrompt,
    vignette,
    options: parsedOptions,
    correctAnswers,
    correctOptionIds,
    explanation,
    subject: context.defaultSubject || context.subject || 'Medicine',
    topic: context.topic || 'General',
    examId: context.examId || 'neet-pg'
  }, context);

  // 4. Validate Question with Canonical Schema
  if (errors.length === 0) {
    const qValidation = validateImportedQuestion(normalizedQuestion);
    if (!qValidation.valid) {
      errors.push(...qValidation.errors);
    }
  }

  const isValid = errors.length === 0;

  return {
    rowNumber,
    rawInput: rawRow,
    type: canonType,
    rawType,
    status: isValid ? ROW_STATUS.VALID : ROW_STATUS.INVALID,
    original: {
      prompt: rawPrompt,
      options: parsedOptions.length > 0 ? parsedOptions : rawOptions.map(o => parseOptionText(o)),
      explanation,
      vignette,
      rawText
    },
    normalizedQuestion: isValid ? normalizedQuestion : null,
    parsedAnswerSummary: answerSummary,
    validation: {
      valid: isValid,
      errors,
      warnings
    }
  };
}

// -----------------------------------------------------------------------------
// MULTI-ROW / DOCUMENT PARSER
// -----------------------------------------------------------------------------

/**
 * Parses multiple rows or an entire document text into parsed question items.
 *
 * @param {string|Array<object|string>} input
 * @param {object} context
 * @returns {Array<object>} Array of parsed question items
 */
export function parseQuestionRows(input, context = {}) {
  if (!input) return [];

  // Array input (e.g. CSV / JSON rows)
  if (Array.isArray(input)) {
    return input.map((row, idx) => parseQuestionRow(row, {
      ...context,
      rowNumber: idx + 1
    }));
  }

  // Raw text input (e.g. pasted text or docx text)
  if (typeof input === 'string') {
    const blocks = splitTextIntoQuestionBlocks(input);
    return blocks.map((block, idx) => parseQuestionRow(block, {
      ...context,
      rowNumber: idx + 1
    }));
  }

  return [];
}

/**
 * Allows updating the question type of an existing parsed row item.
 * Re-runs type-aware symbol parsing and schema validation.
 *
 * @param {object} parsedRow
 * @param {string} newType
 * @param {object} context
 * @returns {object} Updated parsed row item
 */
export function updateParsedRowType(parsedRow, newType, context = {}) {
  if (!parsedRow) return null;

  const updatedRaw = typeof parsedRow.rawInput === 'object' && parsedRow.rawInput !== null
    ? { ...parsedRow.rawInput, type: newType }
    : {
        type: newType,
        prompt: parsedRow.original?.prompt || '',
        options: (parsedRow.original?.options || []).map(o => o.originalText || o.text || ''),
        explanation: parsedRow.original?.explanation || '',
        vignette: parsedRow.original?.vignette || ''
      };

  return parseQuestionRow(updatedRaw, {
    ...context,
    rowNumber: parsedRow.rowNumber
  });
}

// -----------------------------------------------------------------------------
// TEXT EXTRACTION HELPERS
// -----------------------------------------------------------------------------

/**
 * Splits raw document text into distinct question blocks.
 * Supports "1.", "Q1:", "Question 1:", "Type: ...", or double newlines.
 *
 * @param {string} text
 * @returns {Array<string>}
 */
export function splitTextIntoQuestionBlocks(text) {
  if (!text || typeof text !== 'string') return [];

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  // 1. Initial split by double newlines (paragraphs)
  const rawParagraphs = normalized.split(/\n\s*\n+/);
  const blocks = [];

  const delimiterPattern = /(?:^|\n)\s*(?:(?:Question\s*#?\s*\d+|Q\s*#?\s*\d+|\d+[\.\)])\s*[:\-]?|(?:Type\s*:\s*[A-Za-z0-9_\-]+)|\[[A-Za-z0-9_\-\s]+\])/gi;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check if this paragraph contains multiple question headers
    const indices = [];
    let match;
    delimiterPattern.lastIndex = 0;
    while ((match = delimiterPattern.exec(trimmed)) !== null) {
      indices.push(match.index);
    }

    if (indices.length > 1) {
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i];
        const end = i < indices.length - 1 ? indices[i + 1] : trimmed.length;
        const sub = trimmed.substring(start, end).trim();
        if (sub.length > 5) blocks.push(sub);
      }
    } else {
      if (trimmed.length > 5) {
        blocks.push(trimmed);
      }
    }
  }

  return blocks;
}

/**
 * Extracts question fields from a raw text block.
 *
 * @param {string} block
 * @returns {{ type: string|null, prompt: string, options: string[], explanation: string, vignette: string }}
 */
export function extractFieldsFromTextBlock(block) {
  let clean = block.trim();
  let type = null;

  // 1. Detect explicit Type: ... or [Type]
  const typeMatch = clean.match(/(?:^|\n)\s*(?:Type|Format)\s*[:=\-]\s*([A-Za-z0-9_\-\s]+)(?:\n|$)/i);
  if (typeMatch) {
    type = typeMatch[1].trim();
    clean = clean.replace(typeMatch[0], '\n').trim();
  } else {
    const bracketMatch = clean.match(/(?:^|\n)\s*\[([A-Za-z0-9_\-\s]+)\]/i);
    if (bracketMatch) {
      const candidate = bracketMatch[1].trim();
      if (questionTypeService.isValidQuestionTypeId(candidate)) {
        type = candidate;
        clean = clean.replace(bracketMatch[0], '').trim();
      }
    }
  }

  // Remove leading question numbering (e.g. "1.", "Q1:", "Question 1:")
  clean = clean.replace(/^\s*(?:Question\s*#?\s*\d+|Q\s*#?\s*\d+|\d+[\.\)])\s*[:\-]?\s*/i, '').trim();

  // 2. Extract Explanation / Rationale if present
  let explanation = '';
  const explMatch = clean.match(/(?:^|\n)\s*(?:Explanation|Rationale|Reason|Notes?)\s*[:=\-]\s*([\s\S]+)$/i);
  if (explMatch) {
    explanation = explMatch[1].trim();
    clean = clean.substring(0, explMatch.index).trim();
  }

  // 3. Extract Options
  // Options can start with:
  // - caret `^` (e.g. `^ Paris`, `   ^ Paris`)
  // - letter prefix (e.g. `A) Paris`, `(A) Paris`, `A. Paris`, `A - Paris`)
  // - letter prefix with caret (e.g. `A) ^ Paris`)
  const lines = clean.split('\n');
  const optionLines = [];
  const stemLines = [];
  let inOptions = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line looks like an option:
    // 1. starts with `^`
    // 2. starts with `A)`, `(A)`, `A.`, `1)` etc.
    const isCaretOption = trimmed.startsWith(IMPORT_SYNTAX.correctOptionMarker);
    const isLetterOption = /^(\(?[A-Za-z0-9]+[\.\)]|\b[A-Za-z0-9]\))\s+/.test(trimmed);

    if (isCaretOption || isLetterOption) {
      inOptions = true;
      optionLines.push(line);
    } else if (inOptions) {
      // If we already started options and this line doesn't have a marker, check if it looks like an option continuation or a new option
      optionLines.push(line);
    } else {
      stemLines.push(line);
    }
  }

  const prompt = stemLines.join('\n').trim();

  return {
    type,
    prompt,
    options: optionLines,
    explanation,
    vignette: ''
  };
}
