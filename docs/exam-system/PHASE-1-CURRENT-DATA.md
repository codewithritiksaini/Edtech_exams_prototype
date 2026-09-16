# Phase 1: Current Test Data & Model Documentation

> **Document Status:** Baseline Complete  
> **Source of Truth:** Verified directly from code in `src/data/mockData.js`, `src/services/cbtTestService.js`, and `src/components/admin/ManageTestsTab.jsx`.  
> **Repository:** `medprep-prototype`

---

## 1. Test Object Schemas (The Dual Model Reality)

The codebase currently contains two concurrent test schemas depending on which service manages the test:

### 1.1 Model A: Admin / Faculty Schema (`testService` / `medprep_phase6_tests`)
Used by `ManageTestsTab.jsx`, `FacultyTestsPage.jsx`, and `mockData.js`.

```javascript
{
  // Identification
  id: "test-cardio-01",                       // string, primary key (e.g. 'test-' + Date.now())
  name: "Cardiology Grand Mock Test #01",      // string, assessment title

  // Course & Hierarchy Scoping
  courseId: "neet-pg",                        // string, foreign key to catalog exam ('neet-pg', 'usmle', 'plab')
  course: "NEET PG & NExT 2026",               // string, human-readable course track name
  subjectId: null,                            // string | null, optional curriculum subject foreign key
  moduleId: null,                             // string | null, optional curriculum module foreign key
  lectureId: null,                            // string | null, optional curriculum lecture foreign key
  batch: "All Enrolled Students",             // string, candidate tier ('All Enrolled Students', 'Standard & Premium Only', 'All Premium Students')

  // Schedule & Timing
  date: "Today",                              // string, display date
  time: "18:00 IST",                          // string, display time
  duration: "45 mins",                        // string, formatted duration
  durationSeconds: 2700,                      // number, total duration in seconds

  // Scoring & Volume
  totalMarks: 100,                            // number, maximum obtainable score
  questionsCount: 20,                         // number, total question count
  status: "Live",                             // string, 'Scheduled' | 'Live' | 'Upcoming' | 'Completed'
  
  // UI Display Badges
  badge: "Active Today • Window Live",        // string, decorative status badge
  pattern: "NExT Aligned Clinical Vignettes", // string, test format descriptor
  startsIn: "Test Window is LIVE",            // string, countdown banner text

  // Nested Collections
  instructions: [                             // string[], candidate exam rules
    "This examination consists of 20 high-yield clinical vignette multiple choice questions.",
    "Marking Scheme: +5 marks for each correct answer; -1 mark negative marking for incorrect responses."
  ],
  questions: [ ... ]                          // Question[], embedded question objects
}
```

### 1.2 Model B: Student CBT Engine Schema (`cbtTestService` / `medprep_cbt_tests_v2`)
Used by `StudentTestsPage.jsx` and `TestExperiencePage.jsx`.

```javascript
{
  id: "test-cardio-01",                       // string, primary key
  name: "Cardiology Grand Mock Test #01",      // string, test title
  title: "Cardiology Grand Mock Test #01",     // string, alias for name
  examTrack: "neet-pg",                       // string, alias for courseId
  courseId: "neet-pg",                        // string, catalog exam identifier
  course: "NEET PG & NExT 2026",               // string, track title
  batch: "All Enrolled Candidates",           // string, batch tier

  // Timing Attributes
  durationMinutes: 45,                        // number, duration in integer minutes
  durationSeconds: 2700,                      // number, duration in seconds
  startOffsetMinutes: -15,                    // number | undefined, relative start offset from prototype epoch
  endOffsetMinutes: 90,                       // number | undefined, relative end offset from prototype epoch
  startIso: "2026-09-15T18:00:00Z",           // string | undefined, absolute ISO start timestamp
  endIso: "2026-09-15T19:45:00Z",             // string | undefined, absolute ISO end timestamp
  formattedWindow: "Today • 6:00 PM – 7:45 PM IST", // string, human display window

  // Scoring Rules
  totalQuestions: 20,                         // number, question count
  totalMarks: 100,                            // number, total marks
  passingScore: 50,                           // number, passing percentage threshold (default 50)
  negativeMarking: true,                      // boolean, whether negative marking applies
  marksPerCorrect: 5,                         // number, marks awarded per correct response
  marksPerIncorrect: -1,                      // number, marks deducted per incorrect response
  marksUnanswered: 0,                         // number, marks for unattempted questions

  pattern: "NExT Aligned Clinical Vignettes", // string, pattern description
  instructions: [ ... ],                      // string[], bulleted instructions
  questions: [ ... ]                          // Question[], embedded question items
}
```

---

## 2. Question Data Schemas & Variations

### 2.1 Standard Question Shape (Admin & Student CBT Engine)
Directly verified from `ManageTestsTab.jsx:L192-205` and `mockData.js:L1213-1250`.

```javascript
{
  id: "fq-1726388400000-a1b2",               // string or number, question identifier
  vignette: "A 62-year-old male presents...",  // string, clinical case background / patient stem
  question: "Which coronary artery is most likely occluded?", // string, interrogative prompt
  options: [                                  // Array of exactly 4 options
    { key: "A", text: "Left Anterior Descending (LAD) artery" },
    { key: "B", text: "Right Coronary Artery (RCA)" },
    { key: "C", text: "Left Circumflex (LCx) artery" },
    { key: "D", text: "Left Main Coronary Artery" }
  ],
  correct: "A",                               // string enum: 'A' | 'B' | 'C' | 'D'
  explanation: "ST elevation in leads V2-V5 indicates an acute anterior STEMI..." // string, rationale
}
```

### 2.2 Variation in Faculty Authoring Studio (`FacultyQuestionAuthoringPage.jsx:L32-58`)
The faculty question authoring studio uses a slightly conflicting schema:
- Options use `id` instead of `key`: `{ id: 'A', text: '...' }`
- The correct answer key is named `correctOption` instead of `correct`.
- An extra field `guidelineRef` (e.g. `'ACC/AHA 2023 STEMI Guidelines'`) is added.
- **Critical Note:** This page maintains this structure in detached local state and does not persist to storage.

---

## 3. Attempt Data Schema (`medprep_cbt_attempts_v2`)

Directly verified from `cbtTestService.js:L472-485` and `L575-593`.

```javascript
{
  // Identification
  testId: "test-cardio-01",                   // string, foreign key to test
  attemptId: "attempt-test-cardio-01-1726388400000", // string, unique attempt identifier

  // State & Timing
  status: "submitted",                        // string: 'in-progress' | 'paused' | 'submitted'
  startedAt: 1726388400000,                   // number, timestamp ms when attempt was started
  endAt: 1726391100000,                       // number, timestamp ms when attempt must expire
  pausedAt: 1726389200000,                    // number | undefined, timestamp ms when paused
  remainingMs: 1900000,                       // number | undefined, frozen remaining time in ms while paused
  currentQuestionIndex: 3,                    // number, 0-indexed cursor for current active question

  // Candidate Choices
  answers: {                                  // Record<questionId, optionKey>
    "1": "A",
    "2": "C"
  },
  markedForReview: {                          // Record<questionId, boolean>
    "1": false,
    "2": true
  },

  // Integrity & Submission
  tabSwitchCount: 1,                          // number, count of visibilitychange blur events
  submissionReason: "normal",                 // string: 'normal' | 'time-expired' | 'navigation-exit'
  submittedAt: "18:42 IST",                   // string, human-readable submission timestamp

  // Evaluation & Metrics
  score: 85,                                  // number, raw score earned
  totalMarks: 100,                            // number, maximum attainable marks
  percentage: 85,                             // number, score as percentage (0-100)
  statusLabel: "Pass",                        // string: 'Pass' | 'Fail'
  percentile: "97.4%ile",                     // string, mock percentile calculation
  rank: "AIR 34",                             // string, mock All India Rank
  correctCount: 18,                           // number, count of correctly answered questions
  incorrectCount: 2,                          // number, count of incorrectly answered questions
  unattemptedCount: 0,                        // number, count of unanswered questions
  accuracy: 90,                               // number, percentage of attempted questions that were correct
  timeTakenFormatted: "32m 14s"               // string, elapsed time formatted
}
```

---

## 4. Current Scoring Logic & Formulas

Located in `src/services/cbtTestService.js:L549-565`:

```javascript
// 1. Response Categorization
questions.forEach((q) => {
  const chosen = userAnswers[q.id];
  if (!chosen) {
    unattemptedCount++;
  } else if (chosen === q.correct) {
    correctCount++;
  } else {
    incorrectCount++;
  }
});

// 2. Raw Mark Calculation (+5 correct, -1 incorrect, 0 unattempted)
const marksCorrect = test.marksPerCorrect || 5;
const marksIncorrect = test.marksPerIncorrect || -1;
const rawScore = Math.max(0, (correctCount * marksCorrect) + (incorrectCount * marksIncorrect));

// 3. Percentage Calculation
const maxMarks = totalQuestions * marksCorrect;
const percentage = Math.round((rawScore / maxMarks) * 100);

// 4. Pass / Fail Determination
const passed = percentage >= (test.passingScore || 50);

// 5. Accuracy Percentage
const accuracy = (correctCount + incorrectCount) > 0 
  ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
  : 0;
```

---

## 5. LocalStorage Keys Inventory

| Key Name | Primary Managing Service | Description / Content |
|---|---|---|
| `medprep_phase6_tests` | `testService` (`mockData.js`) | Stores Admin/Faculty scheduled tests array |
| `medprep_phase6_results` | `testService` (`mockData.js`) | Stores test submission rosters and cohort analytics |
| `medprep_cbt_tests_v2` | `cbtTestService` (`cbtTestService.js`) | Stores CBT tests delivered to students |
| `medprep_cbt_attempts_v2`| `cbtTestService` (`cbtTestService.js`) | Stores dictionary of student attempts keyed by `testId` |
| `medprep_auth_user` | `authService` (`authService.js`) | Stores active user session (`role`, `email`, `name`) |
| `medprep_curriculum_*` | `curriculumService.js` | Curriculum subjects, modules, and lectures |
| `medprep_sample_papers_v1`| `samplePaperService.js` | Downloadable practice paper PDFs |

---

## 6. Deterministic Baseline Test Fixture (For Verification)

This deterministic fixture can be used to manually or programmatically verify scoring formulas without altering existing mock tests:

```javascript
export const prototypeBaselineExamFixture = {
  id: "test-baseline-fixture-01",
  name: "Prototype Baseline Exam (Deterministic Fixture)",
  courseId: "neet-pg",
  durationMinutes: 30,
  totalQuestions: 4,
  totalMarks: 20,
  marksPerCorrect: 5,
  marksPerIncorrect: -1,
  passingScore: 50,
  questions: [
    {
      id: "bf-q1",
      question: "Q1: Test correct answer (Target: Candidate answers A)",
      options: [
        { key: "A", text: "Correct Option A" },
        { key: "B", text: "Distractor B" },
        { key: "C", text: "Distractor C" },
        { key: "D", text: "Distractor D" }
      ],
      correct: "A"
    },
    {
      id: "bf-q2",
      question: "Q2: Test incorrect answer (Target: Candidate answers B, Correct is A)",
      options: [
        { key: "A", text: "Correct Option A" },
        { key: "B", text: "Distractor B" },
        { key: "C", text: "Distractor C" },
        { key: "D", text: "Distractor D" }
      ],
      correct: "A"
    },
    {
      id: "bf-q3",
      question: "Q3: Test unattempted answer (Target: Candidate leaves blank)",
      options: [
        { key: "A", text: "Correct Option A" },
        { key: "B", text: "Distractor B" },
        { key: "C", text: "Distractor C" },
        { key: "D", text: "Distractor D" }
      ],
      correct: "A"
    },
    {
      id: "bf-q4",
      question: "Q4: Test second correct answer (Target: Candidate answers A)",
      options: [
        { key: "A", text: "Correct Option A" },
        { key: "B", text: "Distractor B" },
        { key: "C", text: "Distractor C" },
        { key: "D", text: "Distractor D" }
      ],
      correct: "A"
    }
  ]
};

// Expected Deterministic Evaluation:
// Candidate choices: { "bf-q1": "A", "bf-q2": "B", "bf-q4": "A" } (Q3 left blank)
// Correct: 2 (Q1, Q4) -> +10 marks
// Incorrect: 1 (Q2)   -> -1 mark
// Unattempted: 1 (Q3) -> 0 marks
// Raw Score: 9 / 20
// Percentage: 45% (Fail, < 50% cutoff)
```
