# Phase 2: Canonical Examination Data Model & Lightweight Data Layer

> **Document Status:** Complete & Verified  
> **Source of Truth:** Implemented in `src/utils/questionTypes.js`, `src/utils/examStorage.js`, `src/utils/examValidation.js`, `src/utils/examDataHelpers.js`, `src/data/exam/examDemoData.js`, `src/services/assessmentService.js`, `src/services/questionService.js`, `src/services/stimulusService.js`.  
> **Repository:** `medprep-prototype`

---

## 1. Why the New Canonical Model Was Introduced

Prior to Phase 2, the exam platform was constrained by a flat, tightly coupled structure:
$$\text{Test} \longrightarrow \text{questions}[\, ] \text{ (Single Choice MCQ Only)}$$

This created severe architectural bottlenecks:
1. **No Section Hierarchy:** Mock exams could not represent multi-subject divisions, section-level time management, or forward-only section locking.
2. **No Shared Stimulus:** Clinical scenarios, audio tracks (IELTS listening), reading passages, and diagrammatic cases had to be redundantly duplicated inside every question's `vignette`.
3. **Hardcoded 4-Option MCQ:** Questions could not represent variable option counts, multi-select questions, matching pairs, fill-in-the-blank, or subjective formats.
4. **Direct Embedding vs. References:** Questions were embedded directly inside tests rather than referenced by ID, preventing the creation of a reusable Question Bank.
5. **Dual Storage Split:** Admin management (`medprep_phase6_tests`) and student CBT examination (`medprep_cbt_tests_v2`) ran on separate disconnected services.

Phase 2 introduces a **lightweight, extensible, canonical prototype data model** that coexists safely with legacy services without breaking any existing student or admin workflows.

---

## 2. Conceptual Architecture Diagram

```
Assessment
│
├── metadata (subject, tags, courseId)
├── settings (durationMinutes, navigation, display)
├── status ('draft' | 'published')
└── versions[]
       │
       └── AssessmentVersion
             │
             ├── version (integer, e.g. 1)
             ├── evaluationRules (marksPerCorrect, negativeMarks, passingCutoff)
             └── sections[]
                    │
                    └── Section
                          │
                          ├── metadata (title, description, order)
                          ├── settings (durationMinutes: null | number, scoring)
                          ├── instructions (string)
                          └── items[]
                                │
                                ├── QuestionReference
                                │      ├── type: "question"
                                │      ├── refId: "q-neet-01"
                                │      └── order: 1
                                │             │
                                │             ▼
                                │          Question (questionService)
                                │
                                └── QuestionGroupReference
                                       ├── type: "question_group"
                                       ├── refId: "group-cardio-case-001"
                                       └── order: 2
                                              │
                                              ▼
                                           QuestionGroup (stimulusService)
                                              ├── stimulusId ──► Stimulus (text, audio, image)
                                              └── questionIds ──► [Question, Question, ...]
```

---

## 3. Data Model Specifications

### 3.1 Assessment Model
Top-level container representing an exam offering (e.g. NEET PG Grand Mock, IELTS Academic Listening).

```javascript
{
  id: "assessment-neet-pg-demo",               // string, unique identifier
  title: "NEET PG High-Yield Grand Mock",      // string, display title
  description: "NExT-aligned clinical mock",   // string, description
  category: "Theoretical Exam",                // string, pedagogical category
  examType: "mock",                            // string: 'mock' | 'practice' | 'clinical'
  status: "published",                         // string: 'draft' | 'published' | 'archived'
  version: 1,                                  // number, active version number
  activeVersionId: "assessment-neet-pg-demo-v1", // string, pointer to active version
  metadata: {
    courseId: "neet-pg",
    subject: "Clinical Medicine",
    tags: ["NEET PG", "NExT"]
  },
  settings: {
    durationMinutes: 45,                       // number, global exam countdown
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
  versions: [ ... ],                           // AssessmentVersion[]
  createdAt: "2026-09-15T08:00:00.000Z",
  updatedAt: "2026-09-15T08:00:00.000Z"
}
```

### 3.2 AssessmentVersion Model
Supports immutable snapshots and drafts. Allows upgrading an assessment to v2 without mutating in-progress attempts.

```javascript
{
  id: "assessment-neet-pg-demo-v1",            // string, version primary key
  assessmentId: "assessment-neet-pg-demo",     // string, foreign key
  version: 1,                                  // number, sequential integer
  status: "published",                         // string: 'draft' | 'published'
  evaluationRules: {
    marksPerCorrect: 5,                        // number, default marks per correct item
    marksPerIncorrect: -1,                     // number, negative marking deduction
    unattemptedMarks: 0,                       // number, mark for blank items
    minimumScore: 0,                           // number, floor score
    passingPercentage: 50                      // number, cutoff percentage
  },
  sections: [ ... ],                           // Section[]
  createdAt: "2026-09-15T08:00:00.000Z",
  updatedAt: "2026-09-15T08:00:00.000Z"
}
```

### 3.3 Section Model
Represents distinct examination divisions (e.g. Part 1 Listening, Section A Medicine).

```javascript
{
  id: "section-neet-clinical-medicine",        // string, section primary key
  title: "Section 1: Clinical Diagnostics",   // string, section title
  description: "Single best answer MCQs",      // string, description
  order: 1,                                    // number, display order
  settings: {
    durationMinutes: null,                     // number | null (null inherits global exam timer)
    navigation: {
      allowPrevious: true,
      allowNext: true,
      allowQuestionJump: true
    },
    scoring: {
      marksPerCorrect: 5,
      marksPerIncorrect: -1
    }
  },
  instructions: "Select the single best response for each scenario.",
  items: [                                     // SectionItem[] (Questions or Question Groups)
    { id: "item-01", type: "question", refId: "q-neet-01", order: 1 },
    { id: "item-02", type: "question_group", refId: "group-cardio-case-001", order: 2 }
  ]
}
```

### 3.4 Question Model (Reusable Item)
Decoupled from specific tests. Does **not** assume exactly 4 options. Generic `answer.correct` supports future multi-select, matching, and text inputs.

```javascript
{
  id: "q-neet-01",                             // string, unique question identifier
  type: "single_choice",                       // string enum from QUESTION_TYPES
  content: {
    vignette: "A 62-year-old male with hypertension...", // string, patient background (optional)
    prompt: "Which coronary artery is most likely occluded?" // string, interrogative statement
  },
  responseSchema: {
    options: [                                 // Array of options (any length, not restricted to 4)
      { id: "A", text: "Left Anterior Descending (LAD) artery" },
      { id: "B", text: "Right Coronary Artery (RCA)" },
      { id: "C", text: "Left Circumflex (LCx) artery" }
    ]
  },
  answer: {
    correct: ["A"]                             // Generic array: allows ["A", "C"], ["true"], etc.
  },
  scoring: {
    marks: 5,                                  // number, positive mark
    negativeMarks: -1                          // number, penalty mark
  },
  metadata: {
    subject: "Medicine",
    topic: "Cardiology",
    difficulty: "medium",                      // 'easy' | 'medium' | 'hard'
    tags: ["STEMI", "ECG", "Reperfusion"]
  },
  explanation: "ST elevation in leads V2-V5 indicates an acute anterior STEMI...",
  status: "published",
  createdAt: "2026-09-15T08:00:00.000Z",
  updatedAt: "2026-09-15T08:00:00.000Z"
}
```

### 3.5 QuestionGroup Model
Links a shared stimulus to one or multiple child questions.

```javascript
{
  id: "group-cardio-case-001",                 // string, group identifier
  type: "clinical_case",                       // string: 'clinical_case' | 'listening_section'
  title: "Cardiology Case: 58-Year-Old Male",  // string, group title
  description: "Evaluation and hemodynamic stabilization series.",
  stimulusId: "stimulus-cardio-case-001",      // string, foreign key to Stimulus
  questionIds: [                               // string[], ordered child question references
    "q-case-01",
    "q-case-02",
    "q-case-03"
  ],
  metadata: {
    subject: "Medicine",
    topic: "Aortic Emergencies"
  }
}
```

### 3.6 Stimulus Model
Represents the common stimulus material.

```javascript
{
  id: "stimulus-cardio-case-001",              // string, stimulus primary key
  type: "text",                                // string enum: 'text' | 'audio' | 'image' | 'video' | 'document'
  title: "Clinical Case: Tearing Interscapular Pain",
  content: {
    text: "A 58-year-old male with poorly controlled hypertension..."
  },
  media: [                                     // MediaReference[] (optional)
    {
      id: "media-audio-ielts-01",
      type: "audio",
      url: "/demo/audio/ielts-listening-section1.mp3",
      title: "Audio Track 1",
      durationSeconds: 240
    }
  ],
  metadata: {
    subject: "Medicine",
    topic: "Vascular Emergencies"
  }
}
```

---

## 4. Question Type Registry (`src/utils/questionTypes.js`)

Centralized registry providing canonical type identifiers and human-readable metadata:
- **Objective Types:** `single_choice`, `multiple_choice`, `true_false`, `dropdown`, `fill_blank`, `matching`, `ordering`.
- **Interactive Types:** `hotspot`, `drag_drop`.
- **Subjective Types:** `short_answer`, `long_answer`, `audio_response`, `video_response`.
- **Stimulus Types:** `text`, `image`, `audio`, `video`, `document`.

---

## 5. Prototype Storage Strategy

All Phase 2 canonical data lives in isolated `localStorage` keys with isomorphic in-memory fallbacks:

| Key Name | Managing Service | Purpose |
|---|---|---|
| `medprep_prototype_assessments_v1` | `assessmentService` | Stores canonical Assessments and AssessmentVersions |
| `medprep_prototype_questions_v1` | `questionService` | Stores standalone, reusable Question objects |
| `medprep_prototype_stimuli_v1` | `stimulusService` | Stores shared Stimuli (text passages, audio references) |
| `medprep_prototype_groups_v1` | `stimulusService` | Stores QuestionGroups linking stimuli to question IDs |

### Safe Coexistence Guarantee
Legacy keys (`medprep_phase6_tests`, `medprep_cbt_tests_v2`, `medprep_cbt_attempts_v2`) are **never touched, modified, or overwritten**. Calling `assessmentService.resetPrototypeExamData()` only cleans the `medprep_prototype_*` stores.

---

## 6. Lightweight Service Architecture

1. **`assessmentService` (`src/services/assessmentService.js`):**
   - CRUD for assessments and versions.
   - Active version management (`setActiveVersion`).
   - Resolves full hierarchy: `resolveFullAssessment(assessmentId)`.
   - Seed & Reset utilities: `resetPrototypeExamData()`, `seedPrototypeExamData()`.
2. **`questionService` (`src/services/questionService.js`):**
   - Independent question management.
   - Batch retrieval: `getQuestionsByIds(['q1', 'q2'])`.
   - Search & filtering by type, subject, topic, difficulty, or text query.
3. **`stimulusService` (`src/services/stimulusService.js`):**
   - CRUD for shared stimuli and question groups.
4. **`examDataHelpers` (`src/utils/examDataHelpers.js`):**
   - Item resolution helpers (`resolveSectionItems`, `resolveQuestionGroup`).
   - Non-destructive `legacyTestToAssessment(legacyTest)` adapter.

---

## 7. Demo Data Fixtures

Loaded automatically on initialization in `src/data/exam/examDemoData.js`:
1. **NEET PG Grand Mock Assessment (`assessment-neet-pg-demo`):**
   - Category: Theoretical Exam.
   - 5 Single Choice MCQs across Cardiology, Neurology, Pediatrics, Endocrinology, Pharmacology.
2. **IELTS Academic Listening Simulation (`assessment-ielts-listening-demo`):**
   - Category: Analytical Exam.
   - Audio Stimulus reference (`ielts-listening-section1.mp3`).
   - 4 questions: 2 Single Choice, 1 Matching Pairs, 1 Fill in the Blank.
3. **Clinical Cardiology Case Examination (`assessment-clinical-case-demo`):**
   - Category: Case Scenario.
   - Shared Case Stimulus (`stimulus-cardio-case-001`) with tearing chest pain clinical stem.
   - 1 Question Group (`group-cardio-case-001`) containing 3 progressive questions (Diagnosis, Imaging CTA, Beta-blocker Pharmacotherapy).

---

## 8. Non-Destructive Legacy Test Adapter

Implemented in `src/utils/examDataHelpers.js`:
```javascript
const { assessment, extractedQuestions } = legacyTestToAssessment(legacyTest);
```
- Converts legacy flat test into:
  $$\text{Assessment} \longrightarrow \text{AssessmentVersion} \longrightarrow \text{Section 1} \longrightarrow \text{Question References}$$
- Converts legacy 4 options into `responseSchema.options`.
- Converts scalar `correct: "A"` into `answer.correct: ["A"]`.
- The original legacy test in `medprep_phase6_tests` is **never mutated**.

---

## 9. What is Intentionally Deferred

To maintain prototype speed and avoid premature complexity, the following are intentionally deferred:
- **No Question Bank UI yet:** (Belongs to Phase 3).
- **No Assessment Builder UI yet:** (Belongs to Phase 4).
- **No Advanced Question Renderers yet:** (Belongs to Phase 5).
- **No Player Migration yet:** `TestExperiencePage.jsx` continues running on legacy tests (Belongs to Phase 6).
- **No Real Audio/Video playback engine:** (Belongs to Phase 7).
- **No Backend, Database, or ORM:** Pure client-side prototype.
