# Phase 1: Prototype Regression & Smoke Test Checklist

> **Document Status:** Baseline Complete  
> **Purpose:** Step-by-step verification checklist to ensure no existing functionality breaks during iterative prototype development.  
> **Repository:** `medprep-prototype`

---

## 1. Admin Test Management (`/admin/tests`)

- [ ] **Open Admin Test Management:**
  - Navigate to `/admin/tests` or `/admin/dashboard` (Manage Tests tab).
  - Verify header renders: `"Manage Tests & Mock Assessments"`.
  - Verify active tests count badge displays correctly.
- [ ] **Cascading Curriculum Scoping:**
  - Select Target Exam Course (e.g. `'neet-pg'`).
  - Verify "Scope to Subject" populates subjects for the selected exam.
  - Select a Subject -> Verify "Scope to Module" enables and filters modules.
  - Select a Module -> Verify "Scope to Lecture" enables and filters lectures.
- [ ] **Question Composer in Create Form:**
  - Click `"+ Author Question"`.
  - Enter Vignette, Question, Option A, Option B, Option C, Option D.
  - Select correct radio button (e.g. 'B').
  - Click `"Add Question to Test Draft"` -> Verify Question appears in drafted list with badge.
- [ ] **Preset Clinical Questions Seeder:**
  - Click `"⚡ Load 3 High-Yield Questions"`.
  - Verify 3 sample clinical questions are added to draft list.
  - Remove a drafted question using the trash icon -> Verify question count updates.
- [ ] **Schedule New Assessment:**
  - Enter Test Title (e.g. `"Sprint Drill 01"`).
  - Select Date, Time, Duration, Total Marks.
  - Click `"Schedule Proctored CBT Test"`.
  - Verify green success toast appears.
  - Verify newly scheduled test appears in the assessment table below.
- [ ] **Table Filter & Actions:**
  - Filter table by Exam Track (e.g. `"NEET PG"`).
  - Filter table by Status (`"Scheduled"` vs `"Completed"`).
- [ ] **Question Bank Manager Drawer:**
  - Click `"Questions (<count>)"` button on any row.
  - Verify slide-over drawer opens showing current assessment items.
  - Click `"+ Add Question"` in drawer, author question, and click `"Save Question to Assessment"`.
  - Verify question is appended and saved immediately.
  - Click delete icon on a question -> Verify question is removed.
  - Click `"Done Managing Questions"` to close drawer.
- [ ] **Cohort Evaluation Drawer:**
  - Click `"View Results"` button on any row.
  - Verify slide-over drawer opens showing Average Score, Highest Score, Students Attempted, Pass %.
  - Search candidates by student name or roll number.
  - Verify Dr. Ritik Saini submission is highlighted.
- [ ] **Cancel / Delete Test:**
  - Click trash icon on an assessment row.
  - Confirm browser prompt -> Verify test is removed from table and toast appears.

---

## 2. Faculty Assessment Portal (`/faculty/tests`)

- [ ] **Access Faculty Tests:**
  - Navigate to `/faculty/tests`.
  - Verify exams are scoped to faculty-assigned courses (`['neet-pg', 'usmle']`).
- [ ] **Quick Create Test:**
  - Click `"+ Schedule Assessment"`.
  - Fill modal fields and click `"Schedule Assessment"`.
  - Verify success toast and table refresh.
- [ ] **Delete Test (Previously Broken, Fixed in Phase 1):**
  - Click trash icon on an assessment row.
  - Verify `testService.deleteTest` executes cleanly without throwing `TypeError`.
- [ ] **Faculty Results Page:**
  - Navigate to `/faculty/tests/:testId/results`.
  - Verify candidate scorecard table loads.
  - Click `"Export Scorecard CSV"` -> Verify success toast.

---

## 3. Student Assessment Schedule (`/student/tests`)

- [ ] **Access CBT Assessment Schedule:**
  - Navigate to `/student/tests` or open student LMS dashboard.
  - Verify active exam track header shows `"National Medical CBT Assessment Center"`.
- [ ] **Status Filtering & Sorting:**
  - Click filter tabs: `"All Tests"`, `"Available Now"`, `"Upcoming"`, `"Completed"`, `"Closed Windows"`.
  - Verify counts in tab badges match table contents.
  - Verify active/in-progress tests rank first in list.
- [ ] **Test Details Modal:**
  - Click `"View Details"` on an upcoming test.
  - Verify window timing, question count, duration, and marking scheme (+5 / -1) are displayed.
  - Verify modal closes on `"Close Details"` or backdrop click.

---

## 4. Student CBT Examination Player (`/test/:testId`)

- [ ] **Gatekeeper & Window Lock:**
  - Attempt opening an expired test URL -> Verify "Window Closed" screen renders.
- [ ] **Pre-Test Readiness Screen:**
  - Open an available test (e.g. `/test/test-cardio-01`).
  - Verify rules, duration, question count, marking scheme (+5 / -1) are displayed.
  - Verify Candidate Verification card shows "Dr. Ritik Saini".
- [ ] **Start Exam & Timer:**
  - Click `"Start Examination Now"`.
  - Verify full-screen distraction-free CBT mode activates.
  - Verify continuous countdown clock starts ticking down every second.
- [ ] **Question Display & Vignette:**
  - Verify Question 1 of N badge is visible.
  - Verify Clinical Vignette text is rendered in styled card.
  - Verify 4 option cards (`A`, `B`, `C`, `D`) render with radio pills.
- [ ] **Selecting an Answer & Autosave:**
  - Click Option A -> Verify selection highlights with blue border and radio fill.
  - Inspect `localStorage['medprep_cbt_attempts_v2']` -> Verify `answers[qId]` equals `'A'`.
- [ ] **Changing & Clearing Answer:**
  - Click Option C -> Verify selection immediately switches to Option C.
  - Click `"Clear Response"` -> Verify selection is cleared and palette changes back to gray.
- [ ] **Marking for Review:**
  - Click `"Mark for Review"` -> Verify flag highlights amber.
  - Verify corresponding palette circle turns amber.
- [ ] **Question Palette Navigation:**
  - Click Question 5 in palette -> Verify player navigates directly to Question 5.
  - Click `"Previous"` -> Verify navigates to Question 4.
  - Click `"Save & Next"` -> Verify navigates to Question 5.
- [ ] **Pause / Freeze Feature:**
  - Click `"Pause Test"`.
  - Verify countdown timer freezes.
  - Verify blur overlay veils questions to protect integrity.
  - Click `"Resume Examination Now"` -> Verify overlay dismisses and timer resumes smoothly.
- [ ] **Page Refresh Recovery:**
  - While exam is in-progress, press browser reload (F5).
  - Verify exam state, chosen answers, review flags, and remaining timer are accurately restored.
- [ ] **Navigation Trap (Back Button):**
  - Click browser "Back" button -> Verify confirmation modal intercepts navigation.
  - Verify options: `"Pause Test & Return"` and `"Submit & Exit"`.
- [ ] **Anti-Cheat Tab Switch Tracking:**
  - Switch to another browser tab and return.
  - Verify `attempt.tabSwitchCount` increments in state.

---

## 5. Submission & Result Scorecard Review

- [ ] **Final Submission Warning:**
  - Navigate to final question and click `"Review & Submit"`.
  - Verify modal warns if unanswered questions remain.
  - Click `"Confirm & Submit"`.
- [ ] **Scorecard Evaluation:**
  - Verify Result Screen renders immediately.
  - Verify Score, Percentage, AIR Rank, and Percentile cards render.
  - Verify Correct, Incorrect, and Unattempted counts sum to total questions.
- [ ] **Question-by-Question Review Accordion:**
  - Filter review by: `"All"`, `"Correct"`, `"Incorrect"`, `"Unattempted"`.
  - Verify candidate's selected choice is highlighted.
  - Verify correct answer key is highlighted in green.
  - Click to expand Guideline Rationale -> Verify clinical textbook reference is displayed.
