import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  GripVertical, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Info, 
  HelpCircle,
  Tag,
  BookOpen,
  FolderTree,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  Sliders,
  Check,
  Award,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  STRUCTURE_MODES, 
  UNIT_TYPES, 
  STRUCTURE_ITEM_TYPES,
  getExamPattern, 
  generateUnitId, 
  getExamStages,
  getStageSubjects,
  validateCurriculumScope,
  normalizeTestStructure,
  validateTestStructureHierarchy,
  isStructureReady
} from '../../services/examPatternHelper.js';
import { catalogService } from '../../services/catalogService.js';
import StructureItemModal from './StructureItemModal.jsx';

export default function TestStructureBuilder({
  test = {},
  examId = null,
  initialExamPattern = null,
  initialCurriculumScope = null,
  initialStructure = null,
  isEditable = true,
  onSaveExamPattern,
  onSaveCurriculumScope,
  onSaveStructure,
  role = 'admin',
  allowedSubjectIds = null,
  testAllowedQuestionTypes = null
}) {
  // Resolve exam ID
  const effectiveExamId = examId || test?.examId || test?.examTrack || test?.courseId || 'neet-pg';
  const exam = useMemo(() => catalogService.getExamById(effectiveExamId) || { name: effectiveExamId }, [effectiveExamId]);

  // Exam stages
  const availableStages = useMemo(() => getExamStages(effectiveExamId), [effectiveExamId]);

  // Working state for Step 1: Exam Stage
  const [selectedStageId, setSelectedStageId] = useState(() => {
    return initialExamPattern?.stageId || test?.examPattern?.stageId || (availableStages[0]?.id || null);
  });

  // Working state for Step 2: Curriculum Scope
  // format: { subjects: [{ subjectId, chapterIds: [] }] }
  const [curriculumScope, setCurriculumScope] = useState(() => {
    return initialCurriculumScope || test?.curriculumScope || { subjects: [] };
  });

  // Working state for Step 3: Test Structure
  const [structure, setStructure] = useState(() => {
    if (initialStructure) return normalizeTestStructure(initialStructure);
    if (test?.structure) return normalizeTestStructure(test.structure);
    return {
      mode: STRUCTURE_MODES.SINGLE_UNIT,
      phases: [],
      sections: [
        {
          id: generateUnitId(),
          type: STRUCTURE_ITEM_TYPES.SECTION,
          name: 'Section A — General Examination',
          code: 'SEC-A',
          order: 0,
          description: 'Primary assessment section',
          quota: 50,
          curriculumScope: null,
          blocks: []
        }
      ],
      units: []
    };
  });

  // Step navigation (1: Stage, 2: Curriculum, 3: Structure)
  const [activeStep, setActiveStep] = useState(1);

  // Expanded subjects in Step 2
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');

  // Modals & dirty tracking
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // StructureItemModal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    item: null,
    itemType: STRUCTURE_ITEM_TYPES.SECTION,
    parentId: null
  });

  // Sync state when props change externally
  useEffect(() => {
    if (initialExamPattern?.stageId) {
      setSelectedStageId(initialExamPattern.stageId);
    } else if (test?.examPattern?.stageId) {
      setSelectedStageId(test.examPattern.stageId);
    }
  }, [initialExamPattern, test?.examPattern]);

  useEffect(() => {
    if (initialCurriculumScope) {
      setCurriculumScope(initialCurriculumScope);
    } else if (test?.curriculumScope) {
      setCurriculumScope(test.curriculumScope);
    }
  }, [initialCurriculumScope, test?.curriculumScope]);

  useEffect(() => {
    if (initialStructure) {
      setStructure(normalizeTestStructure(initialStructure));
    } else if (test?.structure) {
      setStructure(normalizeTestStructure(test.structure));
    }
  }, [initialStructure, test?.structure]);

  // Retrieve Stage Subjects
  const stageSubjects = useMemo(() => {
    if (!selectedStageId) return [];
    const subs = getStageSubjects(effectiveExamId, selectedStageId);
    if (role === 'faculty' && allowedSubjectIds && Array.isArray(allowedSubjectIds) && !allowedSubjectIds.includes('all')) {
      return subs.filter(s => allowedSubjectIds.includes(s.id));
    }
    return subs;
  }, [effectiveExamId, selectedStageId, role, allowedSubjectIds]);

  // Selected Stage object
  const currentStageObj = useMemo(() => {
    return availableStages.find(s => s.id === selectedStageId) || null;
  }, [availableStages, selectedStageId]);

  // Filtered stage subjects for Step 2 search
  const filteredStageSubjects = useMemo(() => {
    if (!subjectSearchQuery.trim()) return stageSubjects;
    const q = subjectSearchQuery.toLowerCase();
    return stageSubjects.filter(s => 
      s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
    );
  }, [stageSubjects, subjectSearchQuery]);

  // Readiness evaluation
  const testCandidate = useMemo(() => ({
    ...test,
    examId: effectiveExamId,
    examPattern: selectedStageId ? { stageId: selectedStageId } : null,
    curriculumScope,
    structure
  }), [test, effectiveExamId, selectedStageId, curriculumScope, structure]);

  const structureReady = useMemo(() => isStructureReady(testCandidate), [testCandidate]);

  // ---------------------------------------------------------------------------
  // STEP 1 HANDLERS: STAGE SELECTION
  // ---------------------------------------------------------------------------
  const handleSelectStage = (stageId) => {
    if (!isEditable) return;
    setSelectedStageId(stageId);
    setIsDirty(true);

    // If existing curriculum scope has subjects outside this new stage, filter them
    const newStageSubjects = getStageSubjects(effectiveExamId, stageId);
    const validSubjectIds = new Set(newStageSubjects.map(s => s.id));
    const currentSelected = curriculumScope?.subjects || [];
    const validSelected = currentSelected.filter(s => validSubjectIds.has(s.subjectId));

    if (validSelected.length !== currentSelected.length) {
      setCurriculumScope({
        subjects: validSelected
      });
    }
  };

  const handleSaveStep1 = async () => {
    if (!selectedStageId) {
      setSaveMessage({ type: 'error', text: 'Please select an Exam Stage.' });
      return;
    }
    setSaving(true);
    setSaveMessage({ type: '', text: '' });
    try {
      const stage = availableStages.find(s => s.id === selectedStageId);
      const patternPayload = {
        patternId: stage?.patternId || null,
        stageId: selectedStageId,
        stageName: stage?.name || selectedStageId
      };
      if (onSaveExamPattern) {
        await onSaveExamPattern(patternPayload);
      }
      setSaveMessage({ type: 'success', text: 'Exam Stage pattern saved successfully.' });
      setIsDirty(false);
      setActiveStep(2);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save stage pattern.' });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 2 HANDLERS: CURRICULUM SCOPE
  // ---------------------------------------------------------------------------
  const isSubjectSelected = (subjectId) => {
    return (curriculumScope?.subjects || []).some(s => s.subjectId === subjectId);
  };

  const getSubjectScopeItem = (subjectId) => {
    return (curriculumScope?.subjects || []).find(s => s.subjectId === subjectId) || null;
  };

  const handleToggleSubject = (subject) => {
    if (!isEditable) return;
    const currentSubs = curriculumScope?.subjects || [];
    const existingIndex = currentSubs.findIndex(s => s.subjectId === subject.id);

    let nextSubs = [];
    if (existingIndex >= 0) {
      // Remove subject
      nextSubs = currentSubs.filter(s => s.subjectId !== subject.id);
    } else {
      // Add subject with all chapters by default
      const chapterIds = Array.isArray(subject.chapters) ? subject.chapters.map(c => c.id) : [];
      nextSubs = [...currentSubs, { subjectId: subject.id, chapterIds }];
    }

    setCurriculumScope({ subjects: nextSubs });
    setIsDirty(true);
  };

  const handleSelectAllSubjects = () => {
    if (!isEditable) return;
    const allSubs = stageSubjects.map(sub => ({
      subjectId: sub.id,
      chapterIds: Array.isArray(sub.chapters) ? sub.chapters.map(c => c.id) : []
    }));
    setCurriculumScope({ subjects: allSubs });
    setIsDirty(true);
  };

  const handleClearAllSubjects = () => {
    if (!isEditable) return;
    setCurriculumScope({ subjects: [] });
    setIsDirty(true);
  };

  const handleToggleChapter = (subjectId, chapterId) => {
    if (!isEditable) return;
    const currentSubs = curriculumScope?.subjects || [];
    const subItem = currentSubs.find(s => s.subjectId === subjectId);
    if (!subItem) return;

    const currentChapterIds = Array.isArray(subItem.chapterIds) ? subItem.chapterIds : [];
    const exists = currentChapterIds.includes(chapterId);

    const nextChapterIds = exists 
      ? currentChapterIds.filter(id => id !== chapterId)
      : [...currentChapterIds, chapterId];

    const nextSubs = currentSubs.map(s => {
      if (s.subjectId === subjectId) {
        return { ...s, chapterIds: nextChapterIds };
      }
      return s;
    });

    setCurriculumScope({ subjects: nextSubs });
    setIsDirty(true);
  };

  const handleSelectAllChapters = (subject) => {
    if (!isEditable) return;
    const allChapIds = Array.isArray(subject.chapters) ? subject.chapters.map(c => c.id) : [];
    const currentSubs = curriculumScope?.subjects || [];
    const nextSubs = currentSubs.map(s => {
      if (s.subjectId === subject.id) {
        return { ...s, chapterIds: allChapIds };
      }
      return s;
    });
    setCurriculumScope({ subjects: nextSubs });
    setIsDirty(true);
  };

  const toggleSubjectExpanded = (subId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
  };

  const handleSaveStep2 = async () => {
    if (!curriculumScope?.subjects || curriculumScope.subjects.length === 0) {
      setSaveMessage({ type: 'error', text: 'Please select at least one subject in the Curriculum Scope.' });
      return;
    }
    setSaving(true);
    setSaveMessage({ type: '', text: '' });
    try {
      if (onSaveCurriculumScope) {
        await onSaveCurriculumScope(curriculumScope);
      }
      setSaveMessage({ type: 'success', text: 'Curriculum scope saved successfully.' });
      setIsDirty(false);
      setActiveStep(3);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save curriculum scope.' });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 3 HANDLERS: TEST STRUCTURE (PHASES, SECTIONS, BLOCKS)
  // ---------------------------------------------------------------------------
  const openAddSection = (phaseId = null) => {
    if (!isEditable) return;
    setModalState({
      isOpen: true,
      item: null,
      itemType: STRUCTURE_ITEM_TYPES.SECTION,
      parentId: phaseId
    });
  };

  const openAddBlock = (sectionId) => {
    if (!isEditable) return;
    setModalState({
      isOpen: true,
      item: null,
      itemType: STRUCTURE_ITEM_TYPES.BLOCK,
      parentId: sectionId
    });
  };

  const openAddPhase = () => {
    if (!isEditable) return;
    setModalState({
      isOpen: true,
      item: null,
      itemType: STRUCTURE_ITEM_TYPES.PHASE,
      parentId: null
    });
  };

  const openEditItem = (item) => {
    if (!isEditable) return;
    setModalState({
      isOpen: true,
      item,
      itemType: item.type || STRUCTURE_ITEM_TYPES.SECTION,
      parentId: item.parentId || null
    });
  };

  const handleSaveModalItem = (itemData) => {
    const isEditing = Boolean(modalState.item && modalState.item.id);
    let updatedSections = [...(structure.sections || [])];
    let updatedPhases = [...(structure.phases || [])];

    if (itemData.type === STRUCTURE_ITEM_TYPES.PHASE) {
      if (isEditing) {
        updatedPhases = updatedPhases.map(p => p.id === itemData.id ? itemData : p);
      } else {
        const newPhase = {
          ...itemData,
          id: itemData.id || `phase-${Date.now()}`,
          order: updatedPhases.length
        };
        updatedPhases.push(newPhase);
      }
    } else if (itemData.type === STRUCTURE_ITEM_TYPES.BLOCK) {
      const secId = modalState.parentId || itemData.parentId;
      updatedSections = updatedSections.map(sec => {
        if (sec.id === secId) {
          const blocks = [...(sec.blocks || [])];
          if (isEditing) {
            const bIdx = blocks.findIndex(b => b.id === itemData.id);
            if (bIdx >= 0) blocks[bIdx] = itemData;
          } else {
            blocks.push({
              ...itemData,
              id: itemData.id || `blk-${Date.now()}`,
              parentId: secId,
              order: blocks.length
            });
          }
          return { ...sec, blocks };
        }
        return sec;
      });
    } else {
      // Section
      if (isEditing) {
        updatedSections = updatedSections.map(s => s.id === itemData.id ? { ...s, ...itemData } : s);
      } else {
        const newSec = {
          ...itemData,
          id: itemData.id || `sec-${Date.now()}`,
          type: STRUCTURE_ITEM_TYPES.SECTION,
          order: updatedSections.length,
          blocks: []
        };
        updatedSections.push(newSec);
      }
    }

    const nextStructure = normalizeTestStructure({
      ...structure,
      phases: updatedPhases,
      sections: updatedSections
    });

    setStructure(nextStructure);
    setIsDirty(true);
    setModalState({ isOpen: false, item: null, itemType: null, parentId: null });
  };

  const handleDeleteSection = (sectionId) => {
    if (!isEditable) return;
    if ((structure.sections || []).length <= 1) {
      alert('A Test must contain at least one Section container.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this section?')) return;

    const nextSections = structure.sections
      .filter(s => s.id !== sectionId)
      .map((s, idx) => ({ ...s, order: idx }));

    const nextStructure = normalizeTestStructure({
      ...structure,
      sections: nextSections
    });
    setStructure(nextStructure);
    setIsDirty(true);
  };

  const handleDeleteBlock = (sectionId, blockId) => {
    if (!isEditable) return;
    if (!window.confirm('Are you sure you want to remove this block?')) return;

    const nextSections = structure.sections.map(sec => {
      if (sec.id === sectionId) {
        const remainingBlocks = (sec.blocks || [])
          .filter(b => b.id !== blockId)
          .map((b, idx) => ({ ...b, order: idx }));
        return { ...sec, blocks: remainingBlocks };
      }
      return sec;
    });

    const nextStructure = normalizeTestStructure({
      ...structure,
      sections: nextSections
    });
    setStructure(nextStructure);
    setIsDirty(true);
  };

  const handleDeletePhase = (phaseId) => {
    if (!isEditable) return;
    if (!window.confirm('Are you sure you want to remove this Phase? Sections inside it will be retained.')) return;

    const nextPhases = (structure.phases || [])
      .filter(p => p.id !== phaseId)
      .map((p, idx) => ({ ...p, order: idx }));

    const nextSections = (structure.sections || []).map(sec => {
      if (sec.phaseId === phaseId) {
        return { ...sec, phaseId: null };
      }
      return sec;
    });

    const nextStructure = normalizeTestStructure({
      ...structure,
      phases: nextPhases,
      sections: nextSections
    });
    setStructure(nextStructure);
    setIsDirty(true);
  };

  const handleMoveSection = (index, direction) => {
    if (!isEditable) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= structure.sections.length) return;

    const list = [...structure.sections];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    // Update order while keeping IDs stable
    const reordered = list.map((item, idx) => ({ ...item, order: idx }));
    const nextStructure = normalizeTestStructure({
      ...structure,
      sections: reordered
    });
    setStructure(nextStructure);
    setIsDirty(true);
  };

  const handleMoveBlock = (sectionId, blockIndex, direction) => {
    if (!isEditable) return;
    const nextSections = structure.sections.map(sec => {
      if (sec.id === sectionId) {
        const blocks = [...(sec.blocks || [])];
        const targetIndex = blockIndex + direction;
        if (targetIndex < 0 || targetIndex >= blocks.length) return sec;

        const [moved] = blocks.splice(blockIndex, 1);
        blocks.splice(targetIndex, 0, moved);
        const reordered = blocks.map((b, idx) => ({ ...b, order: idx }));
        return { ...sec, blocks: reordered };
      }
      return sec;
    });

    const nextStructure = normalizeTestStructure({
      ...structure,
      sections: nextSections
    });
    setStructure(nextStructure);
    setIsDirty(true);
  };

  const handleSaveStep3 = async () => {
    const validation = validateTestStructureHierarchy(
      structure,
      effectiveExamId,
      selectedStageId,
      curriculumScope,
      role === 'faculty' ? allowedSubjectIds : null,
      testAllowedQuestionTypes
    );

    if (!validation.valid) {
      setSaveMessage({ type: 'error', text: validation.errors[0]?.message || 'Structure validation failed.' });
      return;
    }

    setSaving(true);
    setSaveMessage({ type: '', text: '' });
    try {
      if (onSaveStructure) {
        await onSaveStructure(structure);
      }
      setSaveMessage({ type: 'success', text: 'Test Structure saved successfully.' });
      setIsDirty(false);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save test structure.' });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* 3-Step Linear Workflow Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-indigo-50 text-indigo-700 uppercase">
                Phase 2: Structure
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Exam Pattern + Curriculum + Test Structure
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Hierarchical Assessment Architecture
            </h2>
          </div>

          {/* Readiness Badge */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              structureReady 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {structureReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phase 2 Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Configuration Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStep === 1
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">Step 1</span>
              {selectedStageId ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600">Required</span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900">Exam Stage Selection</div>
            <div className="text-xs text-slate-500 truncate mt-0.5">
              {currentStageObj ? currentStageObj.name : 'Select exam pattern stage'}
            </div>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStep === 2
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">Step 2</span>
              {(curriculumScope?.subjects || []).length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" /> {curriculumScope.subjects.length} Subjects
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600">Required</span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900">Curriculum Scope</div>
            <div className="text-xs text-slate-500 truncate mt-0.5">
              {(curriculumScope?.subjects || []).length > 0 
                ? `${curriculumScope.subjects.length} of ${stageSubjects.length} subjects scoped`
                : 'Choose subjects & chapters'}
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStep === 3
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">Step 3</span>
              {(structure.sections || []).length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" /> {structure.sections.length} Sections
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600">Required</span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900">Test Structure</div>
            <div className="text-xs text-slate-500 truncate mt-0.5">
              Phases, Sections & Blocks hierarchy
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      {saveMessage.text && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
          saveMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {saveMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{saveMessage.text}</span>
          <button
            type="button"
            onClick={() => setSaveMessage({ type: '', text: '' })}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =======================================================================
          STEP 1: EXAM STAGE SELECTION
          ======================================================================= */}
      {activeStep === 1 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Read-only Exam Context */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Exam Track (Phase 1)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono font-bold">READ-ONLY</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{exam.name || effectiveExamId}</h3>
              <p className="text-xs text-slate-500 mt-1">
                The test derives its curriculum and pattern boundaries strictly from this exam track. To change the exam track, update Phase 1: Foundation.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Select Exam Pattern Stage</h3>
            <p className="text-xs text-slate-500 mb-4">
              Choose the official curriculum stage or examination phase this test belongs to.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableStages.map(stage => {
                const isSelected = stage.id === selectedStageId;
                const stageSubCount = getStageSubjects(effectiveExamId, stage.id).length;
                return (
                  <div
                    key={stage.id}
                    onClick={() => handleSelectStage(stage.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {stage.code || stage.id}
                      </span>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{stage.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {stage.description || 'Standard examination stage curriculum scope.'}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <span>Available Subjects</span>
                      <span className="font-bold text-slate-800">{stageSubCount} subjects</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Context Card */}
          {currentStageObj && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">Active Stage Selection</div>
                  <div className="text-xs text-indigo-700">
                    {currentStageObj.name} ({currentStageObj.code}) • {stageSubjects.length} subjects eligible for scoping in Step 2.
                  </div>
                </div>
              </div>

              {isEditable && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveStep1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Save & Continue to Step 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          STEP 2: CURRICULUM SCOPE SELECTION
          ======================================================================= */}
      {activeStep === 2 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Curriculum Scope Selection</h3>
              <p className="text-xs text-slate-500">
                Define the subjects and chapters eligible for question selection and blueprinting in this test.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllSubjects}
                disabled={!isEditable}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Select All</span>
              </button>
              <button
                type="button"
                onClick={handleClearAllSubjects}
                disabled={!isEditable}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Active Stage & Scope Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Selected Stage</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{currentStageObj?.name || 'All Stages'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Subjects In Scope</div>
              <div className="text-sm font-bold text-indigo-600 mt-0.5">
                {(curriculumScope?.subjects || []).length} of {stageSubjects.length} Selected
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Faculty Restrictions</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {role === 'faculty' ? 'Authorized Scope Only' : 'Full Catalog Access'}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={subjectSearchQuery}
              onChange={(e) => setSubjectSearchQuery(e.target.value)}
              placeholder="Search subjects by name or code..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Subjects List */}
          <div className="space-y-3">
            {filteredStageSubjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No subjects matching "{subjectSearchQuery}".
              </div>
            ) : (
              filteredStageSubjects.map(subject => {
                const selected = isSubjectSelected(subject.id);
                const scopeItem = getSubjectScopeItem(subject.id);
                const isExpanded = Boolean(expandedSubjects[subject.id]);
                const chapters = Array.isArray(subject.chapters) ? subject.chapters : [];
                const selectedChapCount = scopeItem ? (scopeItem.chapterIds?.length ?? chapters.length) : 0;

                return (
                  <div
                    key={subject.id}
                    className={`rounded-2xl border transition-all ${
                      selected ? 'bg-white border-indigo-200 shadow-xs' : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    {/* Subject Header Row */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToggleSubject(subject)}
                          disabled={!isEditable}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{subject.name}</h4>
                            {subject.code && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {subject.code}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {selected 
                              ? `${selectedChapCount} of ${chapters.length || 0} chapters included` 
                              : `${chapters.length || 0} chapters available`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {chapters.length > 0 && selected && (
                          <button
                            type="button"
                            onClick={() => toggleSubjectExpanded(subject.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                          >
                            <span>Chapters</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chapters Accordion */}
                    {selected && isExpanded && chapters.length > 0 && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Chapters / Modules</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllChapters(subject)}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Select All Chapters
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {chapters.map(chap => {
                            const isChapSelected = scopeItem?.chapterIds 
                              ? scopeItem.chapterIds.includes(chap.id) 
                              : true;
                            return (
                              <label
                                key={chap.id}
                                className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                                  isChapSelected
                                    ? 'bg-white border-indigo-200 text-indigo-950 font-medium'
                                    : 'bg-slate-100/60 border-transparent text-slate-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChapSelected}
                                  onChange={() => handleToggleChapter(subject.id, chap.id)}
                                  disabled={!isEditable}
                                  className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="truncate">{chap.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Step 2 Bottom Save Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back to Step 1
            </button>

            {isEditable && (
              <button
                type="button"
                disabled={saving || (curriculumScope?.subjects || []).length === 0}
                onClick={handleSaveStep2}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Save & Continue to Step 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =======================================================================
          STEP 3: TEST STRUCTURE BUILDER (PHASES, SECTIONS, BLOCKS)
          ======================================================================= */}
      {activeStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Test Structure Hierarchy</h3>
              <p className="text-xs text-slate-500">
                Organize the test into Sections (primary containers), optional Blocks (subdivisions), and optional Phases (macro segments).
              </p>
            </div>

            {/* Action Buttons */}
            {isEditable && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAddPhase}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Phase (Optional)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddSection()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>
            )}
          </div>

          {/* Optional Phases Summary if any exist */}
          {structure.phases && structure.phases.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Configured Phases ({structure.phases.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {structure.phases.map(phase => (
                  <div key={phase.id} className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-900">{phase.name}</div>
                      {phase.code && <div className="text-[10px] font-mono text-purple-600">{phase.code}</div>}
                    </div>
                    {isEditable && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditItem(phase)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhase(phase.id)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections Tree */}
          <div className="space-y-4">
            {(structure.sections || []).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No sections configured yet.</p>
                <p className="text-xs text-slate-500 mt-0.5">Click "Add Section" above to create the primary test container.</p>
              </div>
            ) : (
              (structure.sections || []).map((sec, secIdx) => {
                const blocks = Array.isArray(sec.blocks) ? sec.blocks : [];
                return (
                  <div
                    key={sec.id}
                    className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {secIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{sec.name}</span>
                            {sec.code && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                                {sec.code}
                              </span>
                            )}
                            {sec.quota && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                {sec.quota} Qs
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sec.description || 'Primary assessment section container.'}
                          </p>
                        </div>
                      </div>

                      {/* Section Action buttons */}
                      {isEditable && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAddBlock(sec.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-amber-600" />
                            <span>Add Block</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditItem(sec)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Section"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={secIdx === 0}
                            onClick={() => handleMoveSection(secIdx, -1)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg transition-colors"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={secIdx === structure.sections.length - 1}
                            onClick={() => handleMoveSection(secIdx, 1)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg transition-colors"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section Curriculum Scope Pills if mapped */}
                    {sec.curriculumScope?.subjectIds && sec.curriculumScope.subjectIds.length > 0 && (
                      <div className="px-4 py-2 bg-indigo-50/30 border-b border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-[11px] font-semibold text-slate-400">Mapped Subjects:</span>
                        {sec.curriculumScope.subjectIds.map(subId => {
                          const subObj = stageSubjects.find(s => s.id === subId);
                          return (
                            <span key={subId} className="px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 text-[11px] font-medium">
                              {subObj?.name || subId}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Nested Blocks List */}
                    <div className="p-4 bg-white">
                      {blocks.length === 0 ? (
                        <div className="py-3 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                          <span>No subdivisions (blocks) in this section. Section functions as a single delivery block.</span>
                          {isEditable && (
                            <button
                              type="button"
                              onClick={() => openAddBlock(sec.id)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              + Add Optional Block
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                            Blocks Inside Section ({blocks.length})
                          </div>
                          {blocks.map((blk, blkIdx) => (
                            <div
                              key={blk.id}
                              className="p-3 bg-amber-50/30 border border-amber-200/60 rounded-xl flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                                  {blkIdx + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">{blk.name}</span>
                                    {blk.code && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100/80 text-amber-800 rounded">
                                        {blk.code}
                                      </span>
                                    )}
                                    {blk.quota && (
                                      <span className="text-[10px] px-1.5 py-0.2 bg-white text-slate-600 rounded border border-slate-200">
                                        {blk.quota} Qs
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {isEditable && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditItem(blk)}
                                    className="p-1 text-slate-500 hover:text-slate-800 rounded"
                                    title="Edit Block"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={blkIdx === 0}
                                    onClick={() => handleMoveBlock(sec.id, blkIdx, -1)}
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                                    title="Move Up"
                                  >
                                    <MoveUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={blkIdx === blocks.length - 1}
                                    onClick={() => handleMoveBlock(sec.id, blkIdx, 1)}
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                                    title="Move Down"
                                  >
                                    <MoveDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBlock(sec.id, blk.id)}
                                    className="p-1 text-red-500 hover:text-red-700 rounded"
                                    title="Delete Block"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Step 3 Save Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back to Step 2
            </button>

            {isEditable && (
              <button
                type="button"
                disabled={saving || (structure.sections || []).length === 0}
                onClick={handleSaveStep3}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Test Structure</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Item Modal (Phase, Section, Block) */}
      <StructureItemModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, item: null, itemType: null, parentId: null })}
        item={modalState.item}
        itemType={modalState.itemType}
        parentId={modalState.parentId}
        curriculumScope={curriculumScope}
        examSubjects={stageSubjects}
        onSave={handleSaveModalItem}
      />
    </div>
  );
}
