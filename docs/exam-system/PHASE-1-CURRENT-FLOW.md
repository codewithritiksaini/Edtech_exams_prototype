# Phase 1: Current Examination Flow Architecture

> **Document Status:** Baseline Complete  
> **Source of Truth:** Verified from React components, services, and event dispatchers.  
> **Repository:** `medprep-prototype`

---

## 1. High-Level Flow Overview

The existing examination system operates in two disconnected lifecycle loops bridged by a single student-submission event:
1. **Admin / Faculty Management Loop:** Scheduled via `testService` in `src/data/mockData.js`, reading and writing to `localStorage['medprep_phase6_tests']`.
2. **Student CBT Examination Loop:** Delivered via `cbtTestService` in `src/services/cbtTestService.js`, reading and writing to `localStorage['medprep_cbt_tests_v2']` and `localStorage['medprep_cbt_attempts_v2']`.

```
========================= CURRENT ACTUAL LIFECYCLE =========================

ADMIN / FACULTY FLOW:
  Admin / Faculty User
          │
          ▼
  [/admin/tests] (AdminTestsPage -> ManageTestsTab)
  [/faculty/tests] (FacultyTestsPage)
          │
          ├── Authoring: Question Composer / Preset Seeder
          │
          ▼
  testService.addTest() / testService.updateTestQuestions()
          │
          ▼
  localStorage['medprep_phase6_tests']
          │
          ▼
  Window CustomEvent: 'medprep-tests-updated'
          │
          ▼
  Roster Table Re-renders (ManageTestsTab / FacultyTestsPage)


STUDENT EXAMINATION FLOW:
  Student User
          │
          ▼
  [/student/tests] (StudentTestsPage)  OR  [/dashboard] (AssessmentCard)
          │
          ▼
  cbtTestService.getAllTests() ◄── reads from localStorage['medprep_cbt_tests_v2']
          │
          ├── Evaluates: getTestStatus(test, currentTime)
          │     ├── 'upcoming'   ──► Countdown ticker active (Window locked)
          │     ├── 'available'  ──► "Start Examination Now" unlocked
          │     ├── 'in-progress'──► "Resume Exam" unlocked
          │     ├── 'submitted'  ──► "View Scorecard" unlocked
          │     └── 'expired'    ──► "Window Closed"
          │
          ▼ (Student clicks "Start Examination")
  Route Navigation: [/test/:testId] (TestExperiencePage)
          │
          ├── 1. Barrier Check: Verify test availability / completion
          ├── 2. Instructions Screen: Candidate card, test specs (+5 / -1)
          │
          ▼ (Student clicks "Start Examination Now")
  cbtTestService.startAttempt(testId)
          │
          ├── Initializes Attempt object with startedAt, endAt
          ├── Writes to localStorage['medprep_cbt_attempts_v2']
          │
          ▼
  Timed Exam Workspace (CBT Mode):
          ├── Real-time Countdown Clock (Auto-submits at 00:00)
          ├── Left Column:
          │     ├── Clinical Vignette Text
          │     ├── Question Stem
          │     ├── 4 Radio-like Option Buttons (A, B, C, D)
          │     ├── "Previous", "Clear Response", "Save & Next"
          │     └── "Mark for Review" Toggle
          ├── Right Column:
          │     └── Question Palette (5-column grid: Answered, Review, Unanswered)
          ├── Anti-Cheat:
          │     └── visibilitychange listener increments tabSwitchCount
          ├── Browser Interception:
          │     └── popstate + beforeunload intercepted with Pause/Submit modal
          │
          ├── Real-Time Autosave on Choice Selection:
          │     cbtTestService.saveAnswer(testId, questionId, optionKey)
          │     └── Writes immediately to localStorage['medprep_cbt_attempts_v2']
          │
          ▼ (Student clicks "Submit Test" OR Timer hits 00:00)
  cbtTestService.submitAttempt(testId, reason)
          │
          ├── Computes correctCount, incorrectCount, unattemptedCount
          ├── Computes rawScore = Math.max(0, (correct*5) + (incorrect*-1))
          ├── Computes percentage, pass/fail, percentile, rank
          ├── Writes completed attempt to localStorage['medprep_cbt_attempts_v2']
          │
          ▼ [FRAGILE BRIDGE]
  testService.submitStudentAttempt(testId, { score, ... })
          │
          ├── Updates medprep_phase6_tests (sets status to 'Completed')
          ├── Prepends mock entry for "Dr. Ritik Saini" to medprep_phase6_results
          │
          ▼
  [/test/:testId] Renders Result Screen:
          ├── Top KPI Cards: Score, Percentage, AIR Rank, Percentile, Time
          ├── Filter Tabs: All / Correct / Incorrect / Unattempted
          └── Question-by-Question Accordion with Guideline Explanations
```

---

## 2. Step-by-Step Flow Breakdown

### Step 1: Admin Assessment Authoring & Scheduling
1. Administrator navigates to `/admin/tests` (rendered by `AdminTestsPage.jsx` which wraps `ManageTestsTab.jsx`).
2. Admin fills out the creation form: Exam Track (`formExam`), Title (`formTestName`), optional Subject/Module/Lecture scoping, Batch Tier (`formBatch`), Date (`formDate`), Time (`formTime`), Duration (`formDuration`), Total Marks (`formTotalMarks`), and Question Count (`formQuestions`).
3. Admin optionally drafts custom Single Choice MCQs using the inline Question Composer (`handleAddQuestionToForm`), seeds sample clinical questions (`handleLoadSamplePresetToForm`), or leaves it blank (which will trigger fallback to `sampleCbtQuestionBank`).
4. Admin clicks "Schedule Proctored CBT Test".
5. `handleScheduleTest` invokes `testService.addTest()`, saving to `localStorage['medprep_phase6_tests']` and broadcasting `medprep-tests-updated`.

### Step 2: Student Discovery & Window Verification
1. Student views tests on `/student/tests` (`StudentTestsPage.jsx`) or on the home dashboard (`AssessmentCard.jsx`).
2. `cbtTestService.getAllTests()` loads tests from `localStorage['medprep_cbt_tests_v2']`.
3. The reactive clock runs every 10 seconds (or every 1 second in details modal), evaluating `getTestStatus(test, currentTime)`:
   - If current time is before `startTime`, the test displays a live countdown: `Starts in Xm` or `Starts in Xh Ym`.
   - If current time is within `[startTime, endTime]`, status transitions to `available`.
   - If a previous attempt was paused, status transitions to `paused`.
   - If an active attempt exists and is unexpired, status is `in-progress`.
   - If submitted, status is `submitted`.

### Step 3: Candidate Verification & Entry Gate
1. When status is `available`, the student clicks "Start Test".
2. The user navigates to `/test/:testId` (`TestExperiencePage.jsx`).
3. If no active attempt exists, the page renders the **Instructions / Readiness Check Screen**:
   - Displays duration, questions count, marking scheme (+5 / -1), rules list.
   - Shows candidate verification badge (Dr. Ritik Saini, Roll No: MEDPREP-0428).
4. Student clicks **"Start Examination Now"**.
5. Invokes `cbtTestService.startAttempt(testId)`, calculating:
   - `startedAt = Date.now()`
   - `endAt = Math.min(startedAt + durationMs, windowEndMs)`
   - `status = 'in-progress'`

### Step 4: Active Timed Examination Experience
1. Full-screen distraction-free CBT environment activates.
2. Top header renders continuous countdown timer `formatClock(remainingSeconds)` updating every second.
3. Left panel renders the active question:
   - Clinical vignette text box.
   - Interrogative question prompt.
   - 4 clickable option buttons (`A`, `B`, `C`, `D`).
4. Right panel renders Question Palette with color-coded status badges:
   - Green: Answered (`attempt.answers[qId]`).
   - Amber: Marked for Review (`attempt.markedForReview[qId]`).
   - Slate: Unanswered.
5. Autosave:
   - Clicking an option immediately calls `cbtTestService.saveAnswer(testId, qId, optionKey)`.
   - Changes write synchronously to `localStorage['medprep_cbt_attempts_v2']`.
6. Navigation:
   - "Previous", "Save & Next", or direct clicks on palette numbers change `attempt.currentQuestionIndex`.
   - "Clear Response" deletes the answer key for the current question.
   - "Mark for Review" toggles review flag.
7. Pause & Anti-Cheat:
   - Clicking "Pause Test" freezes timer (`remainingMs`), sets status to `'paused'`, and overlays a blur screen to prevent viewing questions while paused.
   - Switching browser tabs increments `attempt.tabSwitchCount`.
   - Clicking browser "Back" triggers navigation trap (`popstate`), presenting a modal offering "Pause & Return" or "Submit & Exit".

### Step 5: Submission & Instant Evaluation
1. Submission triggers either when:
   - Student clicks "Submit Test" -> confirms in modal.
   - Remaining countdown time hits `00:00` (auto-submit).
   - Student exits via navigation trap with "Submit & Exit".
2. `cbtTestService.submitAttempt(testId, reason)` executes:
   - Compares candidate answers against `question.correct`.
   - Calculates raw marks: `(correctCount * 5) + (incorrectCount * -1)`.
   - Computes integer percentage: `Math.round((rawScore / maxMarks) * 100)`.
   - Determines pass/fail against `passingScore` (default 50%).
   - Generates mock rank and percentile.
3. Bridge Synchronization:
   - Calls `testService.submitStudentAttempt(testId, attemptData)`.
   - Stores submission under "Dr. Ritik Saini" in `localStorage['medprep_phase6_results']`.

### Step 6: Post-Exam Scorecard & Review
1. `TestExperiencePage.jsx` transitions to the Result View:
   - Summary cards: Total Marks, Score, Accuracy %, AIR Rank, Percentile.
   - Breakdown: Correct, Incorrect, Unattempted counts.
   - Filterable question roster (All / Correct / Incorrect / Unattempted).
   - Question cards reveal the candidate's chosen answer vs the correct answer key, along with clinical guideline rationales and textbook references.
