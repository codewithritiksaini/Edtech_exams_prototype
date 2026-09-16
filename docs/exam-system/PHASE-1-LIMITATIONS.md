# Phase 1: Limitations, Known Issues & Bug Inventory

> **Document Status:** Baseline Complete  
> **Source of Truth:** Verified directly from project source code.  
> **Repository:** `medprep-prototype`

---

## 1. Architectural & Functional Limitations

| Feature / Architecture Area | Current Status | Description & Impact |
|---|:---:|---|
| **Single-Choice MCQ Only** | **CURRENTLY WORKING** | Only 4-option Single Best Answer MCQs are supported. No Multiple Choice (multi-select), True/False, Fill in Blank, Matching, Dropdown, Ordering, Hotspot, Essay, or Audio/Video response types exist. |
| **Fixed 4-Option Assumption** | **CURRENTLY WORKING** | Form state and database representations hardcode options `A`, `B`, `C`, `D`. Questions cannot have 3, 5, or variable number of options. |
| **Section Architecture** | **NOT SUPPORTED** | Tests hold a single flat array of questions. There are no section entities, section-level timers, section instructions, or section cutoffs. |
| **Question Group / Stimulus** | **NOT SUPPORTED** | Common stimuli (passages, clinical case scenarios, audio clips, video clips, ECG diagrams) shared across multiple questions cannot be defined. Each question holds an independent text string `vignette`. |
| **Media Attachments in Tests**| **NOT SUPPORTED** | Questions and tests contain zero media fields. Images, audio clips, and video cannot be embedded inside assessment questions. |
| **Restricted Audio Controls** | **NOT SUPPORTED** | No audio player, playback counter, or replay restriction mechanism exists in the exam subsystem. |
| **Subjective / Manual Grading**| **NOT SUPPORTED** | No instructor review queue, subjective grading forms, rubric scoring, or partial credit scoring exists. Scoring is 100% automated binary evaluation. |
| **Test Category Taxonomy** | **NOT SUPPORTED** | Tests can only be categorized by high-level course track string (`'neet-pg'`, `'usmle'`). Categories such as *Theoretical*, *Clinical*, *Practical*, *Viva*, *Case Scenario* do not exist. |
| **Reusable Question Bank** | **PARTIALLY WORKING** | A static mock array `sampleCbtQuestionBank` exists in memory, but there is no centralized database-driven question bank with searching, tagging, versioning, or cross-test linking. |
| **Question Randomization** | **NOT SUPPORTED** | Questions and options are delivered strictly in fixed array order. No shuffling or dynamic question pulling exists. |
| **Test Versioning** | **NOT SUPPORTED** | Editing an existing test mutates the record directly in storage. Active student attempts on earlier revisions of the test are not isolated. |
| **Dual Engine Storage Split** | **PARTIALLY WORKING** | Admin tests write to `medprep_phase6_tests`, while student CBT exams read from `medprep_cbt_tests_v2`. Tests created in the Admin portal do not automatically populate the student CBT test room. |
| **Storage Quota Vulnerability**| **PARTIALLY WORKING** | Storing all attempts and tests inside single serialized JSON objects in `localStorage` creates a risk of exceeding the browser's 5MB quota as question and attempt volumes grow. |

---

## 2. Bug & Known Issue Inventory

### Issue 1: Missing `testService.deleteTest()` Method
- **Status:** **BUGGY**
- **Classification:** **SAFE TO FIX NOW (FIXED)**
- **Code Location:** `src/pages/faculty/FacultyTestsPage.jsx:L86-88`
- **Description:** `FacultyTestsPage.jsx` invoked `testService.deleteTest(id)`. Because `deleteTest` was not implemented on `testService` in `src/data/mockData.js`, clicking the delete button in the faculty portal threw `TypeError: testService.deleteTest is not a function`.
- **Resolution:** Added `deleteTest(testId)` to `testService` in `src/data/mockData.js` during Phase 1.

---

### Issue 2: Silent Fallback on Empty Test Questions
- **Status:** **PARTIALLY WORKING**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `src/components/admin/ManageTestsTab.jsx:L251-254` & `src/pages/TestExperiencePage.jsx:L121-124`
- **Description:** When an administrator schedules a test without drafting any questions, the test is created with `questions: []`. When a student launches this test in `TestExperiencePage.jsx`, the player detects an empty array and silently substitutes the 20 Cardiology questions from `sampleCbtQuestionBank`.
- **Architectural Action:** In Phase 2/3, enforce validation in the test builder requiring at least 1 question before publishing, and render an explicit empty state in the player if an unpublished test is opened.

---

### Issue 3: Non-Unique Question IDs
- **Status:** **PARTIALLY WORKING**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `src/components/admin/ManageTestsTab.jsx:L193`, `L307` vs `src/data/mockData.js:L1215`
- **Description:** Preset questions use integer IDs (`1`, `2`, `3`), composer draft questions use timestamp strings (`fq-1726...`), and modal questions use (`mq-1726...`). There is no global UUID generator, creating potential collisions across test merges.
- **Architectural Action:** Introduce a consistent UUID utility in Phase 2.

---

### Issue 4: Schema Discrepancies Between Authoring Views
- **Status:** **BUGGY**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `ManageTestsTab.jsx` vs `FacultyQuestionAuthoringPage.jsx`
- **Description:** 
  - `ManageTestsTab.jsx` uses: `options: [{ key: 'A', text: '' }]`, `correct: 'A'`.
  - `FacultyQuestionAuthoringPage.jsx` uses: `options: [{ id: 'A', text: '' }]`, `correctOption: 'A'`, and adds `guidelineRef`.
- **Architectural Action:** Standardize on a unified Question Schema in Phase 2.

---

### Issue 5: Hardcoded Student Identity in Submission Bridge
- **Status:** **BUGGY / HARDCODED**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `src/data/mockData.js:L1722-1738`
- **Description:** Inside `testService.submitStudentAttempt`, candidate name is hardcoded as `'Dr. Ritik Saini'` with avatar and roll number `MED-2026-904`, regardless of which user account is logged in.
- **Architectural Action:** Bind submission identity dynamically to `authService.getCurrentUser()` in Phase 3.

---

### Issue 6: Detached State in `FacultyQuestionAuthoringPage.jsx`
- **Status:** **BUGGY**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `src/pages/faculty/FacultyQuestionAuthoringPage.jsx:L31-135`
- **Description:** The full-page question authoring studio holds questions in isolated React `useState`. Clicking "Save Question" only updates local component state and does not persist to `localStorage` or either test service. On page refresh or navigation back, all drafted questions are lost.
- **Architectural Action:** Connect the question authoring studio to the centralized test service during Phase 2.

---

### Issue 7: Mutable Test Questions Corrupting Active Attempts
- **Status:** **PARTIALLY WORKING**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `src/services/cbtTestService.js:L541-550`
- **Description:** `attempt.answers` stores answers keyed by `question.id`. If an administrator edits or deletes questions while a student's attempt is in-progress, question references become broken or mismatch upon evaluation.
- **Architectural Action:** Introduce test snapshotting / versioning in Phase 2 so attempts freeze the question set at `startedAt`.

---

### Issue 8: LocalStorage Split Source of Truth
- **Status:** **PARTIALLY WORKING**
- **Classification:** **DEFER TO LATER PHASE**
- **Code Location:** `medprep_phase6_tests` vs `medprep_cbt_tests_v2`
- **Description:** Tests scheduled by admins in `ManageTestsTab.jsx` are stored in `medprep_phase6_tests`. Tests displayed on the student test roster come from `medprep_cbt_tests_v2`. The two stores are not automatically synchronized.
- **Architectural Action:** Consolidate both portals onto a single unified test service and storage key in Phase 2.
