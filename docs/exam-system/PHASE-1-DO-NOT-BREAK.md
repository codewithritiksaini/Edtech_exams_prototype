# Phase 1: Do-Not-Break Invariants & Critical Dependencies

> **Document Status:** Baseline Complete  
> **Source of Truth:** Verified across repository routing, component bindings, and storage dependencies.  
> **Repository:** `medprep-prototype`

---

## 1. Critical User Workflows That Must Not Break

Any future architectural improvements in Phase 2 and beyond must preserve or provide seamless compatibility shims for the following workflows:

### 1.1 The `/test/:testId` Student Examination Route
- **Component File:** `src/pages/TestExperiencePage.jsx`
- **Route Declaration:** `src/App.jsx:L134-136`
- **Critical Invariants:**
  - Route pattern must remain `/test/:testId`.
  - Must accept existing test IDs (e.g. `test-cardio-01`, `test-full-08`, and dynamic timestamps).
  - Must support active attempt restoration from `localStorage` on page refresh.
  - Must respect exam timing (`startedAt`, `endAt`) and auto-submit when countdown hits zero.
  - Must preserve pause / resume overlay functionality.
  - Must preserve the anti-cheat tab-switch tracking (`visibilitychange`).

### 1.2 Student Dashboard Upcoming Test Widget (`AssessmentCard.jsx`)
- **Component File:** `src/components/student/dashboard/AssessmentCard.jsx`
- **Consumed By:** `src/pages/student/StudentDashboardPage.jsx`
- **Critical Invariants:**
  - Consumes `cbtTestService.getAllTests('neet-pg')` and `getTestStatus(test, currentTime)`.
  - Must continue to show active assessment states: `TEST IN PROGRESS`, `AVAILABLE NOW`, `UPCOMING`, `TEST COMPLETED`, `WINDOW CLOSED`.
  - Clicking "Start Examination Now" must launch `/test/:testId`.
  - Clicking "View Details" must open `TestDetailsModal.jsx`.

### 1.3 Pre-Test Instructions Modal (`TestDetailsModal.jsx`)
- **Component File:** `src/components/student/dashboard/TestDetailsModal.jsx`
- **Critical Invariants:**
  - Expects `test.name` or `test.title`, `test.formattedWindow`, `test.durationMinutes`, `test.totalQuestions`, `test.marksPerCorrect`, `test.marksPerIncorrect`.
  - Must accurately reflect the test's scheduled window and proctoring constraints.

### 1.4 Student CBT Test Center Schedule (`StudentTestsPage.jsx`)
- **Component File:** `src/pages/student/StudentTestsPage.jsx`
- **Route Declaration:** `src/App.jsx:L262` (`/student/tests`)
- **Critical Invariants:**
  - Real-time countdown timer updating every 10 seconds.
  - Filter tabs: `All Tests`, `Available Now`, `Upcoming`, `Completed Tests`, `Closed Windows`.
  - Test sorting: Active / In-progress first, upcoming second, completed third, closed last.
  - Clicking a test card opens confirmation and navigates to `/test/:testId`.

### 1.5 Admin Test Management (`/admin/tests` -> `ManageTestsTab.jsx`)
- **Component File:** `src/components/admin/ManageTestsTab.jsx`
- **Route Declaration:** `src/App.jsx:L180`
- **Critical Invariants:**
  - Creating a test must validate required fields and persist.
  - Cascading curriculum select (Exam Track -> Subject -> Module -> Lecture) must function.
  - Question Manager Drawer must continue to allow viewing, drafting, and deleting test questions.
  - Cohort Results Drawer must continue to display average score, pass percentage, and candidate roster.

### 1.6 Faculty Assessment Schedule (`/faculty/tests` -> `FacultyTestsPage.jsx`)
- **Component File:** `src/pages/faculty/FacultyTestsPage.jsx`
- **Route Declaration:** `src/App.jsx:L225`
- **Critical Invariants:**
  - Must display scheduled tests for faculty-assigned tracks.
  - Modal quick creation must work and call `testService.addTest`.
  - Test deletion must invoke `testService.deleteTest(id)` without throwing runtime exceptions.

### 1.7 Result Scorecard & Review Accordion
- **Component File:** `src/pages/TestExperiencePage.jsx:L1081-1393`
- **Critical Invariants:**
  - Completed attempts must show metrics: Score, Percentage, Pass/Fail, Time Taken, AIR Rank, Percentile.
  - Must allow filtering review questions by: `All`, `Correct`, `Incorrect`, `Unattempted`.
  - Question accordion must highlight correct choice vs candidate's choice and render clinical rationale.

---

## 2. Storage & Service Contracts That Must Not Break

### 2.1 Existing Storage Key Invariants
Do **NOT** arbitrarily delete or rename these keys without providing backward-compatible migration fallbacks:
- `medprep_phase6_tests`: Read by Admin and Faculty pages.
- `medprep_phase6_results`: Read by Admin cohort results modal.
- `medprep_cbt_tests_v2`: Read by Student exam center and dashboard card.
- `medprep_cbt_attempts_v2`: Read by Student exam player for attempt state and scorecards.
- `medprep_auth_user`: Active user role authentication session.

### 2.2 Existing Event Bus Signatures
The application uses DOM CustomEvents on `window` for cross-component reactivity. These event names and payload conventions must be preserved:
- `medprep-tests-updated`: Dispatched when tests change in `testService`.
- `medprep-cbt-tests-updated`: Dispatched when tests change in `cbtTestService`.
- `medprep-cbt-attempts-updated`: Dispatched when an attempt is created, answered, paused, or submitted.
- `medprep-results-updated`: Dispatched when cohort results are recalculated.

---

## 3. Peripheral Dependencies

1. **Breadcrumbs Routing Generator (`src/components/common/Breadcrumbs.jsx`):**
   - Matches routes with segment `:testId` (e.g. `/faculty/tests/:testId/questions`).
   - Route path structures must remain intact or breadcrumb segment resolution must be updated simultaneously.
2. **Faculty Dashboard Overview (`src/pages/faculty/FacultyOverviewPage.jsx`):**
   - Calls `testService.getTests()` to display the number of active assessments on the overview metric cards.
3. **Admin Mission Control Overview (`src/pages/admin/AdminOverviewPage.jsx`):**
   - Displays scheduled test counters on the executive metric cards.
