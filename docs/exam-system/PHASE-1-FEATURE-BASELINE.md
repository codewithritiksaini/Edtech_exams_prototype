# Phase 1: Feature Baseline & Verification Matrix

> **Document Status:** Baseline Complete  
> **Source of Truth:** Verified against real code executions, handlers, and event listeners.  
> **Repository:** `medprep-prototype`

---

## 1. Feature Matrix by User Role

### 1.1 Admin Features (`/admin/tests` & `ManageTestsTab.jsx`)

| Feature | Real Status | Code Location | Technical Verification Notes |
|---|:---:|---|---|
| **Schedule / Create Test** | **WORKING** | [ManageTestsTab.jsx:L233](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L233) | Form validates title, saves test to `localStorage['medprep_phase6_tests']`, and dispatches `medprep-tests-updated`. |
| **Optional Scoping** | **WORKING** | [ManageTestsTab.jsx:L151](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L151) | Cascading dropdowns dynamically scope test to Subject -> Module -> Lecture using `curriculumService`. |
| **Batch / Tier Target** | **WORKING** | [ManageTestsTab.jsx:L528](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L528) | Sets `batch` property ('All Enrolled', 'Standard & Premium', 'Premium VIP'). |
| **Inline Question Composer** | **WORKING** | [ManageTestsTab.jsx:L185](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L185) | Drafts questions in local state `formQuestionsList` with options A–D and correct key. |
| **Seed Preset Questions** | **WORKING** | [ManageTestsTab.jsx:L220](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L220) | Loads 3 clinical vignette questions from `samplePresetQuestions`. |
| **Question Bank Manager** | **WORKING** | [ManageTestsTab.jsx:L1095](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L1095) | Slide-over drawer allows adding/deleting questions from an existing test; immediately saves via `testService.updateTestQuestions`. |
| **Cancel / Delete Test** | **WORKING** | [ManageTestsTab.jsx:L273](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L273) | Prompts browser `confirm()`, deletes test from `medprep_phase6_tests`, dispatches update. |
| **Edit Test Metadata** | **PARTIAL** | [ManageTestsTab.jsx](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx) | Admin can edit questions, but cannot edit existing test title/date/duration in place without re-creating. |
| **View Cohort Results** | **WORKING** | [ManageTestsTab.jsx:L937](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L937) | Slide-over drawer displays pass rate, average score, candidate table, and search. |
| **Search & Filters** | **WORKING** | [ManageTestsTab.jsx:L810](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L810) | Filters tests roster by Course Track and Status. Search is supported in the results drawer. |
| **Pagination & Bulk Actions** | **NOT SUPPORTED** | N/A | Table renders entire array in a single DOM view without pagination or multi-select checkboxes. |

---

### 1.2 Faculty Features (`/faculty/tests`, `/faculty/tests/:id/questions`, etc.)

| Feature | Real Status | Code Location | Technical Verification Notes |
|---|:---:|---|---|
| **Assigned Exams Scoping** | **WORKING** | [ManageTestsTab.jsx:L85](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/admin/ManageTestsTab.jsx#L85) | When logged in as Faculty, course selection is restricted to assigned courses (`['neet-pg', 'usmle']`). |
| **Faculty Tests Roster** | **WORKING** | [FacultyTestsPage.jsx:L21](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/faculty/FacultyTestsPage.jsx#L21) | Lists tests from `testService.getTests()`. |
| **Faculty Quick Create Test** | **WORKING** | [FacultyTestsPage.jsx:L46](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/faculty/FacultyTestsPage.jsx#L46) | Modal creates test and calls `testService.addTest()`. |
| **Faculty Test Deletion** | **FIXED IN PHASE 1** | [FacultyTestsPage.jsx:L86](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/faculty/FacultyTestsPage.jsx#L86) | Previously called undefined `testService.deleteTest(id)` causing a page crash; fixed in Phase 1 by implementing `deleteTest` on `testService`. |
| **Question Authoring Studio** | **PARTIAL / DETACHED** | [FacultyQuestionAuthoringPage.jsx:L31](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/faculty/FacultyQuestionAuthoringPage.jsx#L31) | UI is fully rendered (12-column grid, live preview, options editor), but state is local component memory and **never written to localStorage or testService**. |
| **Cohort Scorecard Page** | **WORKING** | [FacultyTestResultsPage.jsx:L33](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/faculty/FacultyTestResultsPage.jsx#L33) | Displays candidate roster with search, filter, and mock CSV export. |

---

### 1.3 Student Features (`/student/tests` & `/test/:testId`)

| Feature | Real Status | Code Location | Technical Verification Notes |
|---|:---:|---|---|
| **Test Roster & Status** | **WORKING** | [StudentTestsPage.jsx:L68](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/student/StudentTestsPage.jsx#L68) | Displays active, upcoming, completed, and expired assessments with real-time status recalculation. |
| **Real-Time Countdown Ticker** | **WORKING** | [cbtTestService.js:L282](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/services/cbtTestService.js#L282) | Computes `Starts in Xm` or `Closes in Xh` using real clock timestamps. |
| **Test Details Modal** | **WORKING** | [TestDetailsModal.jsx:L5](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/components/student/dashboard/TestDetailsModal.jsx#L5) | Displays instructions, timing, specs, and proctoring rules before starting. |
| **Pre-Test Gatekeeper** | **WORKING** | [TestExperiencePage.jsx:L360](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L360) | Prevents starting tests whose window has expired; redirects completed tests to results. |
| **Candidate Readiness Screen** | **WORKING** | [TestExperiencePage.jsx:L409](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L409) | Displays candidate verification badge and starts timer on "Start Examination Now". |
| **Persistent Countdown Timer** | **WORKING** | [TestExperiencePage.jsx:L570](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L570) | Continuous timer derived from `attempt.endAt - now`. Shows color warnings at <10m, <5m, <1m. |
| **Answer Question (MCQ)** | **WORKING** | [TestExperiencePage.jsx:L173](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L173) | Clicking option button updates active selection and immediately writes to `localStorage`. |
| **Autosave** | **WORKING** | [cbtTestService.js:L490](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/services/cbtTestService.js#L490) | Saves synchronously on every option click; survives browser refresh. |
| **Clear Response** | **WORKING** | [TestExperiencePage.jsx:L180](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L180) | Removes candidate answer for active question. |
| **Mark for Review** | **WORKING** | [TestExperiencePage.jsx:L187](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L187) | Flags question with amber badge in question palette. |
| **Question Palette Navigation** | **WORKING** | [TestExperiencePage.jsx:L808](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L808) | 5-column grid showing Answered (Green), Review (Amber), and Unanswered (Slate); clicking jumps to question. |
| **Pause / Resume Examination** | **WORKING** | [TestExperiencePage.jsx:L208](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L208) | Freezes timer, veils question content with blur overlay, and saves `remainingMs`. |
| **Navigation Interception** | **WORKING** | [TestExperiencePage.jsx:L93](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L93) | Traps browser "Back" button; prompts with "Pause & Return" or "Submit & Exit". |
| **Anti-Cheat Tab Switch Log** | **WORKING** | [TestExperiencePage.jsx:L78](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L78) | Increments `attempt.tabSwitchCount` whenever document becomes hidden. |
| **Auto-Submit on Expiry** | **WORKING** | [TestExperiencePage.jsx:L147](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L147) | Automatically finalizes attempt when `remainingSeconds <= 0`. |
| **Manual Submission Modal** | **WORKING** | [TestExperiencePage.jsx:L853](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L853) | Warns candidate of remaining unanswered questions before final evaluation. |
| **Instant Result Scorecard** | **WORKING** | [TestExperiencePage.jsx:L1081](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L1081) | Displays score, total marks, percentage, AIR rank, percentile, time taken. |
| **Answer Key & Rationale Review**| **WORKING** | [TestExperiencePage.jsx:L1085](file:///home/ritiksaini/Desktop/localhost/britannica-overseas/prototype/src/pages/TestExperiencePage.jsx#L1085) | Filterable question accordion showing correct choice vs candidate choice with clinical justification. |
