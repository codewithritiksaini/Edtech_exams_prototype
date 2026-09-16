# Phase 3: Question Bank & Question Authoring

> **Document Status:** Complete & Verified  
> **Source of Truth:** Implemented in `src/pages/QuestionBankPage.jsx`, `src/pages/QuestionEditorPage.jsx`, `src/pages/QuestionPreviewPage.jsx`, `src/components/questions/`, `src/services/questionService.js`, `src/utils/questionTypes.js`, `src/utils/examValidation.js`, `src/data/exam/examDemoData.js`.  
> **Repository:** `medprep-prototype`

---

## 1. Architecture Overview

Phase 3 establishes a standalone, reusable **Question Bank** and **Item Authoring** subsystem on top of the canonical data model introduced in Phase 2.

Previously, questions were directly embedded inside monolithic mock tests (`test.questions[]`), making them inaccessible for cross-exam reuse, independent search, or curriculum auditing. Phase 3 decouples questions completely into first-class items managed by `questionService`.

```
Question Bank (/admin/questions & /faculty/questions)
│
├── Inventory Management (Search, Filters, KPIs)
│     ├── Dynamic KPI Cards (Total, Published, Review, Approved, Draft, Archived)
│     ├── Full-Text Search Engine (ID, Prompt, Vignette, Subject, Topic, Tags)
│     └── Faceted Filters (Type, Subject, Difficulty, Status)
│
├── Canonical Storage (medprep_prototype_questions_v1)
│     └── questionService (CRUD, Clone, Archive, Usage Tracking)
│
├── Stepped Question Editor (/questions/new & /questions/:id/edit)
│     ├── Section A: Type & Workflow Status (Draft, Review, Approved, Published)
│     ├── Section B: Clinical Stem & Interrogative Prompt
│     ├── Section C: Type-Specific Response Config (5 Authoring Types)
│     ├── Section D: Scoring Configuration (+Marks, -Penalties)
│     ├── Section E: Pedagogical Explanation & Clinical Rationale
│     └── Section F: Subject Taxonomy & Tagging
│
└── Instructor Audit Preview (/questions/:id/preview)
      ├── Response key indicators & highlighted answers
      ├── Assessment dependency links (usage tracking)
      └── Live editor preview toggle
```

---

## 2. Supported Question Types in Authoring

Phase 3 introduces specialized authoring forms for 5 primary question interaction formats:

| Format ID | Display Label | Response Schema | Answer Configuration |
|---|---|---|---|
| `single_choice` | Single Best Answer (MCQ) | Dynamic options (`A`, `B`, `C`, `D`, ...), minimum 2 | Exactly one correct option (`answer.correct: ['A']`) |
| `multiple_choice` | Multiple Choice (Multi-Select) | Dynamic options with checkboxes, minimum 2 | One or more correct options (`answer.correct: ['A', 'C']`) |
| `true_false` | True / False | Binary options (`true`, `false`) | Exactly one selection (`answer.correct: ['true']`) |
| `short_answer` | Short Answer | Free-text placeholder, case sensitivity toggle | Array of accepted synonyms (`answer.correct: ['MI', 'Myocardial Infarction']`) |
| `fill_blank` | Fill in the Blank | Target blank placeholder description | Array of accepted values (`answer.correct: ['2.5 to 3.5']`) |

### Future Formats Graceful Degradation
Advanced formats recognized in `src/utils/questionTypes.js` (`matching`, `ordering`, `dropdown`, `hotspot`, `drag_drop`, `audio_response`, `video_response`, `long_answer`) are preserved in the schema. In the authoring editor, selecting these formats renders an informative alert ("*Authoring for this format will be available in Phase 5*") without crashing or corrupting data.

---

## 3. Question Editor Behavior

The editor (`src/pages/QuestionEditorPage.jsx`) provides a structured 6-section interface:
1. **Section A — Basic Information & Type:**
   - Visual cards for selecting the question format.
   - Preserves entered text/options when switching between compatible formats.
   - Configures lifecycle status and pedagogical difficulty (`easy`, `medium`, `hard`).
2. **Section B — Stem & Prompt:**
   - Optional clinical vignette stem for patient presentation/history.
   - Mandatory interrogative statement prompt.
3. **Section C — Type-Specific Response Config:**
   - Dynamic option list with add/remove actions (enforcing a minimum of 2 options).
   - Radio selection for single choice; multi-select checkboxes for multiple choice.
   - Tag/pill list input for short answer synonyms and fill-blank targets.
4. **Section D — Scoring Rules:**
   - Configurable positive mark (default: 5) and negative penalty (default: -1).
5. **Section E — Explanation:**
   - Detailed clinical rationale, pathophysiological context, and guideline citations.
6. **Section F — Metadata:**
   - Subject and topic categorization.
   - Interactive tag input pill manager (`TagInput.jsx`).
7. **Live Preview Toggle:**
   - Real-time instructor preview panel embedded directly in the editor to inspect the rendered item while typing.

---

## 4. Status Workflow & Validation Rules

Questions support a 5-stage lifecycle state:
$$\text{Draft} \longrightarrow \text{Under Review} \longrightarrow \text{Approved} \longrightarrow \text{Published} \longrightarrow \text{Archived}$$

### Status-Aware Validation (`validateQuestionAuthoring`)
- **`draft`**: Forgiving validation. Allows authors to save work-in-progress stems or draft questions with missing options or unassigned keys. Soft warnings are displayed in the UI.
- **`review` / `approved` / `published`**: Strict validation. Enforces:
  - Prompt cannot be empty.
  - `single_choice`: At least 2 non-empty options; exactly 1 valid correct option selected.
  - `multiple_choice`: At least 2 non-empty options; at least 1 valid correct option selected.
  - `true_false`: Exactly one boolean choice (`true` or `false`).
  - `short_answer`: At least 1 non-empty accepted answer phrase.
  - `fill_blank`: At least 1 non-empty accepted target value.
  - Scoring marks must be a positive number $> 0$.

---

## 5. Question Duplication & Cloning

The Question Bank provides a one-click **Duplicate / Clone** action:
- Deep copies all content, options, scoring, metadata, and explanations.
- Appends `(Copy)` to the prompt.
- Generates an independent unique ID: `${originalId}-clone-${timestamp}`.
- Sets the status to `draft` for safe editing.
- Mutating the cloned question has zero side effects on the original item.

---

## 6. Question Usage Resolution

`questionService.getQuestionUsage(questionId)` inspects active assessments in `assessmentService`:
- Checks direct section question references (`type: "question"`, `refId: questionId`).
- Checks grouped stimulus references (`type: "question_group"`, where `questionIds` includes `questionId`).
- Returns `{ count: number, assessments: Array<{ id, title }> }`.
- Displayed in the Question Bank table and preview banner to prevent accidental deletion of questions active in live exams.

---

## 7. Storage Isolation

All Phase 3 data operations persist under the isolated Phase 2 prototype storage key:
- **`medprep_prototype_questions_v1`**: Stored in browser `localStorage` with in-memory fallback for Node environments.

Legacy storage keys remain 100% untouched:
- `medprep_phase6_tests`
- `medprep_cbt_tests_v2`
- `medprep_cbt_attempts_v2`

---

## 8. Role Access & Routing

- **Admin Portal (`/admin/questions*`)**:
  - Full Question Bank access, authoring, editing, duplication, archiving, and deletion.
  - Linked in `AdminSidebar.jsx` under *Content & Schedule*.
- **Faculty Portal (`/faculty/questions*`)**:
  - Full Question Bank access, authoring, editing, duplication, and review.
  - Linked in `FacultySidebar.jsx` under *Live & Assessments*.
- **Student LMS Guard (`/student/*`)**:
  - Navigating to `/questions`, `/admin/questions`, or `/faculty/questions` automatically redirects students to `/student/dashboard`.
- **Legacy Faculty Authoring**:
  - `/faculty/tests/:testId/questions` (`FacultyQuestionAuthoringPage.jsx`) remains preserved and operational for legacy tests.

---

## 9. Known Limitations & Deferred Work

- **Assessment Builder Integration:** Phase 3 only creates and manages reusable questions. Composing assessments with sections, drag-and-drop item selection, and group stimulus creation belongs to **Phase 4 (Assessment Builder)**.
- **Student Exam Player:** Student exam execution continues running on the legacy player; rendering new item types in the player belongs to **Phase 5 (Question Renderers)**.
- **Media Upload:** Audio/video media referenced in questions are URLs/mock pointers; live file uploads are deferred to Phase 7.
