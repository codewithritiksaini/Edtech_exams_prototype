// =============================================================================
// QUESTION TYPE REGISTRY — CANONICAL DEFINITIONS
// Lightweight registry for question interaction and response formats.
// =============================================================================

export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  LONG_ANSWER: 'long_answer',
  FILL_BLANK: 'fill_blank',
  MATCHING: 'matching',
  ORDERING: 'ordering',
  DROPDOWN: 'dropdown',
  HOTSPOT: 'hotspot',
  DRAG_DROP: 'drag_drop',
  AUDIO_RESPONSE: 'audio_response',
  VIDEO_RESPONSE: 'video_response'
};

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Single Best Answer (MCQ)',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice (Multi-Select)',
  [QUESTION_TYPES.TRUE_FALSE]: 'True / False',
  [QUESTION_TYPES.SHORT_ANSWER]: 'Short Answer',
  [QUESTION_TYPES.LONG_ANSWER]: 'Long Answer / Essay',
  [QUESTION_TYPES.FILL_BLANK]: 'Fill in the Blank',
  [QUESTION_TYPES.MATCHING]: 'Matching Pairs',
  [QUESTION_TYPES.ORDERING]: 'Sequential Ordering',
  [QUESTION_TYPES.DROPDOWN]: 'Dropdown Selection',
  [QUESTION_TYPES.HOTSPOT]: 'Image Hotspot',
  [QUESTION_TYPES.DRAG_DROP]: 'Drag & Drop Labeling',
  [QUESTION_TYPES.AUDIO_RESPONSE]: 'Audio Response / Oral Viva',
  [QUESTION_TYPES.VIDEO_RESPONSE]: 'Video Response / Practical'
};

export const QUESTION_CATEGORIES = {
  OBJECTIVE: [
    QUESTION_TYPES.SINGLE_CHOICE,
    QUESTION_TYPES.MULTIPLE_CHOICE,
    QUESTION_TYPES.TRUE_FALSE,
    QUESTION_TYPES.DROPDOWN,
    QUESTION_TYPES.FILL_BLANK,
    QUESTION_TYPES.MATCHING,
    QUESTION_TYPES.ORDERING
  ],
  INTERACTIVE: [
    QUESTION_TYPES.HOTSPOT,
    QUESTION_TYPES.DRAG_DROP
  ],
  SUBJECTIVE: [
    QUESTION_TYPES.SHORT_ANSWER,
    QUESTION_TYPES.LONG_ANSWER,
    QUESTION_TYPES.AUDIO_RESPONSE,
    QUESTION_TYPES.VIDEO_RESPONSE
  ]
};

export const STIMULUS_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document'
};

export const STIMULUS_TYPE_LABELS = {
  [STIMULUS_TYPES.TEXT]: 'Clinical Case / Reading Passage (Text)',
  [STIMULUS_TYPES.IMAGE]: 'Diagnostic Image / Diagram',
  [STIMULUS_TYPES.AUDIO]: 'Audio Track / Murmur / Listening',
  [STIMULUS_TYPES.VIDEO]: 'Clinical Examination Video',
  [STIMULUS_TYPES.DOCUMENT]: 'Lab Report / Medical Chart (PDF/Doc)'
};

export const ITEM_TYPES = {
  QUESTION: 'question',
  QUESTION_GROUP: 'question_group'
};
