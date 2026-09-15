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

export const QUESTION_TYPE_CONFIG = {
  [QUESTION_TYPES.SINGLE_CHOICE]: {
    label: 'Single Best Answer (MCQ)',
    shortLabel: 'Single Choice',
    description: 'Vignette with variable options and exactly one correct answer.',
    supportsAuthoring: true,
    supportsPreview: true,
    category: 'Objective',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  [QUESTION_TYPES.MULTIPLE_CHOICE]: {
    label: 'Multiple Choice (Multi-Select)',
    shortLabel: 'Multi-Select',
    description: 'Options with one or more correct answers; checkbox selection.',
    supportsAuthoring: true,
    supportsPreview: true,
    category: 'Objective',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  [QUESTION_TYPES.TRUE_FALSE]: {
    label: 'True / False',
    shortLabel: 'True / False',
    description: 'Clinical assertion requiring a binary True or False judgment.',
    supportsAuthoring: true,
    supportsPreview: true,
    category: 'Objective',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  [QUESTION_TYPES.SHORT_ANSWER]: {
    label: 'Short Answer',
    shortLabel: 'Short Answer',
    description: 'Free-text response evaluated against a list of accepted keywords/phrases.',
    supportsAuthoring: true,
    supportsPreview: true,
    category: 'Subjective',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  [QUESTION_TYPES.FILL_BLANK]: {
    label: 'Fill in the Blank',
    shortLabel: 'Fill Blank',
    description: 'Statement with missing target term(s) matched against accepted values.',
    supportsAuthoring: true,
    supportsPreview: true,
    category: 'Objective',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  [QUESTION_TYPES.LONG_ANSWER]: {
    label: 'Long Answer / Essay',
    shortLabel: 'Essay',
    description: 'In-depth clinical rationale or thesis. Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: true,
    category: 'Subjective',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200'
  },
  [QUESTION_TYPES.MATCHING]: {
    label: 'Matching Pairs',
    shortLabel: 'Matching',
    description: 'Premises paired to target items (e.g. drug to mechanism). Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: true,
    category: 'Objective',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  [QUESTION_TYPES.ORDERING]: {
    label: 'Sequential Ordering',
    shortLabel: 'Ordering',
    description: 'Sequence arrangement (e.g. resuscitation steps). Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: false,
    category: 'Objective',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  [QUESTION_TYPES.DROPDOWN]: {
    label: 'Dropdown Selection',
    shortLabel: 'Dropdown',
    description: 'Inline dropdown options. Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: false,
    category: 'Objective',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  [QUESTION_TYPES.HOTSPOT]: {
    label: 'Image Hotspot',
    shortLabel: 'Hotspot',
    description: 'Interactive click on diagnostic image/CT scan. Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: false,
    category: 'Interactive',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  [QUESTION_TYPES.DRAG_DROP]: {
    label: 'Drag & Drop Labeling',
    shortLabel: 'Drag & Drop',
    description: 'Anatomical diagram labeling. Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: false,
    category: 'Interactive',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  [QUESTION_TYPES.AUDIO_RESPONSE]: {
    label: 'Audio Response / Oral Viva',
    shortLabel: 'Audio Viva',
    description: 'Audio recording submission. Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: false,
    category: 'Subjective',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  [QUESTION_TYPES.VIDEO_RESPONSE]: {
    label: 'Video Response / Practical',
    shortLabel: 'OSCE Video',
    description: 'OSCE procedural video submission. Authoring coming soon.',
    supportsAuthoring: false,
    supportsPreview: false,
    category: 'Subjective',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  }
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

export const QUESTION_STATUSES = {
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

export const QUESTION_STATUS_LABELS = {
  [QUESTION_STATUSES.DRAFT]: 'Draft',
  [QUESTION_STATUSES.REVIEW]: 'Under Review',
  [QUESTION_STATUSES.APPROVED]: 'Approved',
  [QUESTION_STATUSES.PUBLISHED]: 'Published',
  [QUESTION_STATUSES.ARCHIVED]: 'Archived'
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

/**
 * Creates default responseSchema and answer structure for a chosen question type.
 * @param {string} type
 * @returns {{ responseSchema: object, answer: object }}
 */
export function getDefaultQuestionStructure(type) {
  switch (type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        responseSchema: {
          options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' }
          ]
        },
        answer: { correct: [] }
      };

    case QUESTION_TYPES.TRUE_FALSE:
      return {
        responseSchema: {
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' }
          ]
        },
        answer: { correct: ['true'] }
      };

    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        responseSchema: {
          placeholder: 'Enter candidate response...',
          caseSensitive: false
        },
        answer: { correct: [] }
      };

    case QUESTION_TYPES.FILL_BLANK:
      return {
        responseSchema: {
          placeholder: 'Missing keyword or value'
        },
        answer: { correct: [] }
      };

    case QUESTION_TYPES.SINGLE_CHOICE:
    default:
      return {
        responseSchema: {
          options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' }
          ]
        },
        answer: { correct: ['A'] }
      };
  }
}

