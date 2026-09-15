// =============================================================================
// STIMULUS & QUESTION GROUP SERVICE — PROTOTYPE CANONICAL DATA LAYER
// Manages shared stimuli (case scenarios, listening audio, passages) and groups.
// =============================================================================

import { PROTOTYPE_STORAGE_KEYS, getStoredData, setStoredData } from '../utils/examStorage.js';
import { validateStimulus, validateQuestionGroup, detectDuplicateIds } from '../utils/examValidation.js';
import { DEMO_STIMULI, DEMO_QUESTION_GROUPS } from '../data/exam/examDemoData.js';

class StimulusService {
  constructor() {
    this.stimuliKey = PROTOTYPE_STORAGE_KEYS.STIMULI;
    this.groupsKey = PROTOTYPE_STORAGE_KEYS.GROUPS;
    this.init();
  }

  init() {
    const existingStimuli = getStoredData(this.stimuliKey, null);
    if (!existingStimuli || !Array.isArray(existingStimuli) || existingStimuli.length === 0) {
      setStoredData(this.stimuliKey, [...DEMO_STIMULI]);
    }

    const existingGroups = getStoredData(this.groupsKey, null);
    if (!existingGroups || !Array.isArray(existingGroups) || existingGroups.length === 0) {
      setStoredData(this.groupsKey, [...DEMO_QUESTION_GROUPS]);
    }
  }

  resetToDefaults() {
    setStoredData(this.stimuliKey, [...DEMO_STIMULI]);
    setStoredData(this.groupsKey, [...DEMO_QUESTION_GROUPS]);
    return {
      stimuli: [...DEMO_STIMULI],
      groups: [...DEMO_QUESTION_GROUPS]
    };
  }

  // ---------------------------------------------------------------------------
  // Stimulus Operations
  // ---------------------------------------------------------------------------

  getStimuli() {
    const stimuli = getStoredData(this.stimuliKey, DEMO_STIMULI);
    detectDuplicateIds(stimuli, 'stimulusService.getStimuli');
    return Array.isArray(stimuli) ? stimuli : [];
  }

  getStimulusById(id) {
    if (!id) return null;
    const list = this.getStimuli();
    return list.find(s => String(s.id) === String(id)) || null;
  }

  createStimulus(stimulusData) {
    const newStimulus = {
      ...stimulusData,
      id: stimulusData.id || `stimulus-proto-${Date.now()}`,
      media: stimulusData.media || [],
      metadata: stimulusData.metadata || {}
    };

    const validation = validateStimulus(newStimulus);
    if (!validation.isValid) {
      console.warn('[stimulusService.createStimulus] Validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    const list = this.getStimuli();
    const updated = [newStimulus, ...list.filter(s => String(s.id) !== String(newStimulus.id))];
    setStoredData(this.stimuliKey, updated);
    return { success: true, stimulus: newStimulus };
  }

  deleteStimulus(id) {
    if (!id) return false;
    const list = this.getStimuli();
    const filtered = list.filter(s => String(s.id) !== String(id));
    if (filtered.length === list.length) return false;
    setStoredData(this.stimuliKey, filtered);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Question Group Operations
  // ---------------------------------------------------------------------------

  getQuestionGroups() {
    const groups = getStoredData(this.groupsKey, DEMO_QUESTION_GROUPS);
    detectDuplicateIds(groups, 'stimulusService.getQuestionGroups');
    return Array.isArray(groups) ? groups : [];
  }

  getQuestionGroupById(id) {
    if (!id) return null;
    const groups = this.getQuestionGroups();
    return groups.find(g => String(g.id) === String(id)) || null;
  }

  createQuestionGroup(groupData) {
    const newGroup = {
      ...groupData,
      id: groupData.id || `group-proto-${Date.now()}`,
      questionIds: groupData.questionIds || [],
      metadata: groupData.metadata || {}
    };

    const validation = validateQuestionGroup(newGroup);
    if (!validation.isValid) {
      console.warn('[stimulusService.createQuestionGroup] Validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    const groups = this.getQuestionGroups();
    const updated = [newGroup, ...groups.filter(g => String(g.id) !== String(newGroup.id))];
    setStoredData(this.groupsKey, updated);
    return { success: true, group: newGroup };
  }

  updateQuestionGroup(id, updates = {}) {
    if (!id) return null;
    const groups = this.getQuestionGroups();
    const index = groups.findIndex(g => String(g.id) === String(id));
    if (index === -1) {
      console.warn(`[stimulusService.updateQuestionGroup] Group "${id}" not found.`);
      return null;
    }

    const updated = {
      ...groups[index],
      ...updates,
      id: groups[index].id
    };

    groups[index] = updated;
    setStoredData(this.groupsKey, groups);
    return updated;
  }

  deleteQuestionGroup(id) {
    if (!id) return false;
    const groups = this.getQuestionGroups();
    const filtered = groups.filter(g => String(g.id) !== String(id));
    if (filtered.length === groups.length) return false;
    setStoredData(this.groupsKey, filtered);
    return true;
  }
}

export const stimulusService = new StimulusService();
