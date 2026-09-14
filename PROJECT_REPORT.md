# MedPrep Pro — Comprehensive Project Audit & Strategic Roadmap Report

**Document Version:** 1.0.0  
**Project Name:** MedPrep Pro (`Edtech_exams_prototype`)  
**Target Domain:** Medical Licensing & Postgraduate Exam Preparation Platform  
**Target Examinations:** NEET PG & NExT (India), USMLE Step 1 & 2 (USA), PLAB & UKMLA (UK), European Approbation (Germany/EU)  
**Stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, Lucide Icons, LocalStorage-backed Service Architecture  

---

## Executive Summary

**MedPrep Pro** is an enterprise-grade EdTech platform prototype engineered specifically for medical doctors, interns, and MBBS graduates preparing for high-stakes medical licensing and postgraduate residency entrance examinations worldwide.

Unlike generic LMS (Learning Management Systems), MedPrep Pro is customized around the rigor of clinical medical education. It encompasses:
1. **Hierarchical Curriculum Engine:** 5-tier academic hierarchy (*Exam Track → Subject → Clinical Module → Structured Lecture → Multi-Format Content Studio*).
2. **Clinical Timetable & Slot Allocator:** 6 daily clinical slot windows with conflict-free scheduling and real-time faculty availability matrix tracking.
3. **Computer-Based Testing (CBT) Assessment Engine:** Clinical vignette authoring with patient cases, differential options, marking schemes (+5/-1), and real-time score/percentile calculation.
4. **Tri-Portal Unified Ecosystem:** Dedicated, highly customized interfaces for **Students** (LMS), **Faculty** (Educator Studio & Question Authoring), and **Administrators** (HQ Operations, Scheduling, Catalog, and Scoping).

The prototype currently operates as a feature-complete client-side application with simulated persistence through an event-driven service layer storing state in `localStorage`.

---

## 1. System Architecture & Tech Stack

### 1.1 Technology Choices
| Layer | Technologies | Purpose / Rationale |
| :--- | :--- | :--- |
| **Build & Bundling** | `Vite 5.4.3` | Instant HMR (Hot Module Replacement), ultra-fast dev server, and optimized Rollup production builds. |
| **Frontend Framework** | `React 18.3.1` | Component-driven declarative UI, modern hook patterns (`useState`, `useEffect`, `useMemo`, `useCallback`). |
| **Routing** | `React-Router-DOM v6.26.2` | Nested route layouts, dynamic path parameters (`:examId`, `:subjectId`, `:moduleId`, `:lectureId`), and breadcrumb navigation. |
| **Design & Styling** | `Tailwind CSS 3.4.10`, `PostCSS` | Utility-first responsive design, customized medical theme color palette (`brand`, `rose`, `sky`, `amber`, `emerald`, `indigo`, `purple`). |
| **Iconography** | `Lucide React 0.441.0` | Comprehensive clinical and operational icon set. |
| **Data & Persistence Layer** | Custom JS Services + Browser `localStorage` | Self-contained, zero-setup prototype architecture enabling instant data persistence and reactivity across tabs and components without backend setup. |

---

### 1.2 Multi-Portal Architecture & Layout Design

- **Public Routes:** `HomePage.jsx`, `PackageSelectionPage.jsx`, `LoginPage.jsx`
- **Admin Portal (`/admin/*`):** Wrapped in `AdminLayout.jsx` with persistent sidebar, breadcrumbs, and role detection.
- **Faculty Portal (`/faculty/*`):** Wrapped in `FacultyLayout.jsx`, scoping views to the instructor's assigned specialty and subjects.
- **Student LMS Portal (`/student/*`):** Wrapped in `StudentLayout.jsx`, providing focused clinical preparation modules, study roadmaps, and timed CBT tests.

---

### 1.3 Service Architecture & State Synchronization

The application relies on 7 cohesive services in `src/services/` that manage data and dispatch cross-component events (`window.dispatchEvent(new CustomEvent(...))`):

1. **`catalogService.js`**: Manages the 4 Exam Tracks (NEET PG, USMLE, PLAB, European Approbation) with detailed exam metadata, eligibility, and fees. Manages Package Tiers (Basic, Standard, Master/Pro) with feature flags.
2. **`curriculumService.js`**: Primary backbone storing the 5-tier academic hierarchy (`Exams` → `Subjects` → `Modules` → `Lectures` → `Lecture Content Studio`). Dispatches `medprep_curriculum_updated` for real-time reactivity.
3. **`scheduleSlotUtils.js` & Schedule Engine**: Standardized 6 daily clinical slots:
   - `slot-morning` (09:00 AM - 10:30 AM IST)
   - `slot-midday` (11:30 AM - 01:00 PM IST)
   - `slot-afternoon` (02:00 PM - 03:30 PM IST)
   - `slot-evening` (04:00 PM - 05:30 PM IST)
   - `slot-late-evening` (06:00 PM - 07:30 PM IST)
   - `slot-night` (07:30 PM - 09:00 PM IST)
   Provides conflict detection engine preventing double-booking of faculty across subjects/exams on the same day and slot.
4. **`peopleService.js`**: Faculty Directory (profiles, qualifications, assigned exams/subjects) and Student Directory (enrollment tracks, package tiers, progress).
5. **`authService.js`**: Multi-role credential system with automatic role routing (`student@demo.com`, `faculty@demo.com`, `admin@demo.com`).
6. **`samplePaperService.js`**: Mock papers, sectional tests, and past-year clinical exam archives.
7. **`liveSessionsService.js`**: Clinical Grand Rounds scheduling, meeting URLs, faculty hosts, status tracking, and recorded masterclass archives.

---

## 2. Complete Inventory: What Has Been Built Till Date

### 2.1 Public & Marketing Front-End
- **Responsive Landing Page (`HomePage.jsx`)**: Hero section, exam category tabs, feature badges, medical testimonials, and call-to-actions.
- **Package Selection & Pricing (`PackageSelectionPage.jsx`)**: Dynamic pricing switch by exam, feature comparison matrix, and instant enrollment triggers.
- **Role-Aware Authentication Modal (`LoginModal.jsx` & `LoginPage.jsx`)**: 1-click test credential auto-fill for Admin, Faculty, and Student personas.

### 2.2 Administrator Portal (`/admin/*`)
- **Admin HQ Mission Control (`AdminOverviewPage.jsx`)**: Global KPIs, student enrollment numbers, active faculty stats, and quick shortcuts.
- **Full 5-Tier Curriculum Management**:
  - `AdminExamsPage.jsx` (Level 1: Exams)
  - `AdminSubjectsPage.jsx` (Level 2: Subjects with color codes, icons, faculty leads)
  - `AdminModulesPage.jsx` (Level 3: Modules with study hour estimates)
  - `AdminLecturesPage.jsx` (Level 4: Lectures with high-yield flags)
  - `AdminContentStudioPage.jsx` (Level 5: Content Studio with Video, PDF Notes, ECG Lightbox, Flashcards, and Key Takeaway Pearls)
- **Clinical Scheduling & Faculty Slot System (`ManageScheduleTab.jsx`)**:
  - **Full Timetable Grid**: Week-by-week calendar with lecture cards.
  - **List View**: Sortable and searchable table of scheduled classes.
  - **Faculty Slot Overview Matrix (`FacultySlotMatrixView.jsx`)**: Real-time matrix displaying all faculty members across the 6 daily slots for each day of the week, with color-coded badges for booked lectures and available openings.
  - **Interactive Faculty Slot Detail Modal (`FacultySlotDetailModal.jsx`)**: 6-slot day-by-day availability analysis (Total slots: 42/week, Occupied slots, Free slots) with 1-click scheduling.
  - **Conflict-Free Booking**: Dynamic filtering showing only free slots for chosen faculty and live conflict collision alerts.
- **Operations Sub-Tabs**: Faculty Directory, Student Directory, Packages & Pricing, Test Management, Live Sessions Manager, Sample Papers Manager, Reports & Analytics.

### 2.3 Faculty Educator Portal (`/faculty/*`)
- **Faculty Overview (`FacultyOverviewPage.jsx`)**: Teaching statistics, assigned subjects, and student counts.
- **Scoped Curriculum Navigator**: Strict isolation allowing educators to only view and edit modules/lectures for their assigned specialties.
- **Direct Curriculum Upload Hub (`FacultyDirectUploadPage.jsx`)**: List-first master repository of all faculty uploads with a step-by-step upload modal.
- **CBT Question Authoring & Assessment Manager (`FacultyTestsPage.jsx` & `FacultyQuestionAuthoringPage.jsx`)**: Clinical vignette authoring (patient history, findings, options A-D, rationale, correct answer picker) and 1-click "⚡ Load 3 High-Yield Questions" preset.
- **CBT Question Bank Manager Modal**: Review, edit, and delete questions attached to any scheduled test.
- **CBT Test Results (`FacultyTestResultsPage.jsx`)**: Real-time leaderboard, score distributions, and topic-wise accuracy breakdowns.

### 2.4 Student Learning Management System (`/student/*`)
- **Student Dashboard (`StudentDashboardPage.jsx`)**: Target exam countdown, daily clinical timeline, study streak tracker, and 4 KPI quick-launch cards.
- **Academic Course Hierarchy**: Subjects (`StudentSubjectsPage.jsx`) → Modules (`StudentModulesPage.jsx`) → Lectures (`StudentLecturesPage.jsx`) → Study Room (`StudentLectureLearnPage.jsx` with video, PDF notes, ECG viewer, and flashcards).
- **Interactive 28-Day Study Plan (`StudentStudyPlanPage.jsx` & `DayContentView.jsx`)**: 4-week structured clinical roadmap with daily milestones.
- **Computer-Based Testing (CBT) Center (`StudentTestsPage.jsx` & `TestExperiencePage.jsx`)**: Authentically timed NBE/USMLE examination interface, question palette, review flags, strike-through elimination, automated scoring (+5/-1 scheme), and instant percentile/AIR calculation.
- **Live Grand Rounds Hub (`StudentLiveSessionsPage.jsx`)**: Live broadcast rooms, countdown timers, and past recorded lecture archives.
- **Diagnostic Progress & Analytics (`StudentProgressPage.jsx`)**: Subject accuracy matrix, flashcard retention rates, and weak-area clinical revision guidance.
- **Doctor Profile & Settings (`StudentSettingsPage.jsx`)**: Candidate credentials, study notification preferences, and subscription receipts.

---

## 3. Current State Assessment: Strengths & Technical Debt

### 3.1 Key Strengths
1. **Clinical Authenticity:** Terminology, subjects, clinical vignettes, and CBT formats closely mirror actual medical licensing exams.
2. **Comprehensive Feature Scope:** Complete end-to-end user journeys for Admin, Faculty, and Student personas.
3. **Instant Reactivity:** Real-time synchronization across modules and pages using clean custom event buses and localStorage persistence.
4. **Visual Polish:** Medical aesthetic, clean typography, responsive layouts, and robust conflict prevention modals.

### 3.2 Technical Debt & Prototype Boundaries
1. **LocalStorage Persistence:** Data is local to the current browser and resets if browser cache is cleared.
2. **Mock Authentication:** Passwordless auto-routing based on demo email addresses.
3. **Mock Media URLs:** Images and videos point to Unsplash/external samples rather than dedicated cloud buckets.
4. **Simulated WebRTC:** Live classes use timer countdowns rather than an interactive video stream.
5. **No Automated Test Coverage:** Needs Vitest and Playwright integration for automated regression testing.

---

## 4. Strategic Forward Roadmap: What to Build & What to Improve

### Phase 1: Production Backend & Cloud Storage (Priority 1)
- **Database & API:** Migrate from `localStorage` to a hosted database (PostgreSQL / Supabase or Node.js/Express) with relational tables for curriculum, schedules, users, and tests.
- **Real Authentication & RBAC:** Implement JWT tokens with refresh cookies and server-side role authorization guards.
- **Cloud Object Storage (S3 / Cloudflare R2):** Presigned URL uploads for clinical PDFs, high-res ECG/radiology scans, and HLS adaptive bitrate video streaming.

### Phase 2: Advanced CBT & Clinical Engine (Priority 2)
- **Multi-Block Exam Simulation:** NEET PG / USMLE 3-block examination mode with scheduled break timers.
- **CBT Tools:** Standard laboratory reference value popups, formula sheets, and clinical calculators.
- **Bulk Question Import:** CSV, Excel, and QTI import formats for faculty and question banks.
- **Psychometric Analytics:** Item Response Theory (IRT) difficulty and discrimination indices ($p$-value and $r$-value).

### Phase 3: Real-Time Interactive Classroom & Communications (Priority 3)
- **Live Video SDK:** Agora or 100ms WebRTC integration for real-time Grand Rounds, screen sharing, and ECG annotation.
- **Clinical Doubt Resolution Forum:** Timestamp-linked question threads with verified faculty response badges.
- **Multi-Channel Notifications:** WhatsApp Business API & Web Push alerts for class schedules and CBT test releases.

### Phase 4: AI Clinical Tutor & Mobile Expansion (Priority 4)
- **Spaced Repetition Algorithm (SM-2):** Adaptive flashcard scheduling based on candidate recall performance.
- **AI Clinical Vignette Generator:** LLM integration to assist faculty in generating patient scenarios and clinical distractors based on medical guidelines.
- **Cross-Platform Mobile App:** PWA or React Native mobile app for on-the-go hospital intern studying.

---

## 5. Summary Recommendation for Immediate Next Steps

| Step | Recommendation | Impact | Effort |
| :---: | :--- | :---: | :---: |
| **1** | **Persist to Database (Supabase / PostgreSQL):** Connect the current service layer to a hosted database so test data and schedules persist globally. | 🔴 High | 🟡 Medium |
| **2** | **Production Auth Integration:** Enforce real login credentials with password recovery and distinct roles. | 🔴 High | 🟢 Low-Medium |
| **3** | **CBT Engine Hardening:** Add lab reference values, multi-block timed exams, and bulk question upload. | 🟡 Medium | 🟡 Medium |
| **4** | **Live Video SDK Integration:** Connect Agora or 100ms for real interactive clinical lectures. | 🟡 Medium | 🟡 Medium |
| **5** | **Automated Testing Suite:** Introduce Vitest and Playwright to guarantee zero regressions during future scaling. | 🟢 Medium | 🟢 Low |

---
*Report prepared for MedPrep Pro Product & Engineering Leadership.*
