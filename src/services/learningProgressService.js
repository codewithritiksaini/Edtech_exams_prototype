// =============================================================================
// LEARNING PROGRESS SERVICE — STRICT SEQUENTIAL RESOURCE ENGINE
// Manages the resource state machine (LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED),
// enforces strict sequential gating within a Day, persists partial progress,
// and enforces Day-to-Day sequential unlocks across the Student LMS.
// =============================================================================

const STORAGE_KEY_PROGRESS = 'medprep_learning_progress_v1';
const EVENT_PROGRESS_UPDATED = 'medprep_learning_progress_updated';

// Preferred sequence of mandatory clinical resources
export const MANDATORY_RESOURCE_ORDER = ['video', 'notes', 'images', 'flashcards', 'test'];

export const RESOURCE_TITLES = {
  video: 'Video Lecture',
  notes: 'Clinical PDF Notes',
  images: 'ECG & Clinical Diagrams',
  flashcards: 'Spaced-Repetition Flashcards',
  test: 'Clinical CBT Test'
};

export const RESOURCE_STATUS = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

// Initial Seed Data: Days 1 & 2 completed, Day 3 active with all resources available (unlocked)
const INITIAL_SEED_DATA = {
  completedDays: [1, 2],
  days: {
    '1': {
      completed: true,
      resources: {
        video: { status: 'COMPLETED', progress: 100 },
        notes: { status: 'COMPLETED', progress: 100, currentPage: 22 },
        images: { status: 'COMPLETED', progress: 100, viewedIds: [1, 2] },
        flashcards: { status: 'COMPLETED', progress: 100, reviewedCount: 3 }
      }
    },
    '2': {
      completed: true,
      resources: {
        video: { status: 'COMPLETED', progress: 100 },
        notes: { status: 'COMPLETED', progress: 100, currentPage: 26 }
      }
    },
    '3': {
      completed: false,
      resources: {
        video: { status: 'AVAILABLE', progress: 0, currentTime: '00:00' },
        notes: { status: 'LOCKED', progress: 0, currentPage: 1 },
        images: { status: 'LOCKED', progress: 0, viewedIds: [] },
        flashcards: { status: 'LOCKED', progress: 0, reviewedCount: 0 },
        test: { status: 'LOCKED', progress: 0 }
      }
    }
  }
};

class LearningProgressService {
  constructor() {
    this.store = this.loadStore();
  }

  loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.completedDays && parsed.days) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load learning progress from localStorage', e);
    }
    this.saveStore(INITIAL_SEED_DATA);
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }

  saveStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(EVENT_PROGRESS_UPDATED, { detail: data }));
      }
    } catch (e) {
      console.warn('Failed to save learning progress to localStorage', e);
    }
  }

  /**
   * Subscribe to progress updates
   */
  subscribe(callback) {
    const handler = () => callback(this.store);
    window.addEventListener(EVENT_PROGRESS_UPDATED, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_PROGRESS_UPDATED, handler);
      window.removeEventListener('storage', handler);
    };
  }

  /**
   * Get filtered sequence of mandatory resources configured for a Day
   */
  getMandatorySequence(dayData) {
    if (!dayData) return ['video', 'notes'];
    
    // 1. If activeTabs is explicitly scheduled by admin/faculty
    if (Array.isArray(dayData.activeTabs) && dayData.activeTabs.length > 0) {
      return MANDATORY_RESOURCE_ORDER.filter(key => {
        if (!dayData.activeTabs.includes(key)) return false;
        // Verify scheduled content actually exists
        if (key === 'video') return Boolean(dayData.video || dayData.videoData);
        if (key === 'notes') return Boolean(dayData.pdf || (Array.isArray(dayData.pdfList) && dayData.pdfList.length > 0));
        if (key === 'images') return Array.isArray(dayData.images) && dayData.images.length > 0;
        if (key === 'flashcards') return Array.isArray(dayData.flashcards) && dayData.flashcards.length > 0;
        if (key === 'test') return Boolean(dayData.hasTest);
        return false;
      });
    }

    // 2. Otherwise check what content is scheduled/configured for this day
    return MANDATORY_RESOURCE_ORDER.filter(key => {
      if (key === 'video') return Boolean(dayData.video || dayData.videoData);
      if (key === 'notes') return Boolean(dayData.pdf || (Array.isArray(dayData.pdfList) && dayData.pdfList.length > 0));
      if (key === 'images') return Array.isArray(dayData.images) && dayData.images.length > 0;
      if (key === 'flashcards') return Array.isArray(dayData.flashcards) && dayData.flashcards.length > 0;
      if (key === 'test') return Boolean(dayData.hasTest);
      return false;
    });
  }

  /**
   * Check whether Day N is unlocked (Day 1 is always unlocked; Day N requires Day N-1 completed)
   */
  isDayUnlocked(dayNumber) {
    const dayNum = parseInt(dayNumber, 10);
    if (dayNum <= 1) return true;
    const completedList = this.store.completedDays || [];
    // Day N is unlocked if Day N-1 is in completedDays
    return completedList.includes(dayNum - 1);
  }

  /**
   * Return highest unlocked day number
   */
  getHighestUnlockedDay() {
    const completedList = this.store.completedDays || [];
    if (completedList.length === 0) return 1;
    const maxCompleted = Math.max(...completedList);
    return maxCompleted + 1;
  }

  /**
   * Get all completed day numbers
   */
  getCompletedDays() {
    return this.store.completedDays || [];
  }

  /**
   * Check if a Day is marked completed
   */
  isDayCompleted(dayId, dayData) {
    const dayStr = String(dayId);
    const completedList = this.store.completedDays || [];
    if (completedList.includes(parseInt(dayId, 10))) return true;

    // Check if day record is marked completed
    if (this.store.days[dayStr]?.completed) return true;

    // Otherwise check if every mandatory resource is completed
    if (!dayData) return false;
    const sequence = this.getMandatorySequence(dayData);
    if (sequence.length === 0) return false;

    return sequence.every(key => this.isResourceCompleted(dayId, key, dayData));
  }

  /**
   * Ensure day record exists in store
   */
  ensureDayRecord(dayId, dayData) {
    const dayStr = String(dayId);
    if (!this.store.days[dayStr]) {
      this.store.days[dayStr] = {
        completed: false,
        resources: {}
      };
    }
    const sequence = this.getMandatorySequence(dayData);
    sequence.forEach((key, idx) => {
      if (!this.store.days[dayStr].resources[key]) {
        this.store.days[dayStr].resources[key] = {
          status: idx === 0 ? RESOURCE_STATUS.AVAILABLE : RESOURCE_STATUS.LOCKED,
          progress: 0
        };
      }
    });
  }

  /**
   * Get status & progress of a specific resource within a Day
   */
  getResourceState(dayId, resourceKey, dayData) {
    const dayStr = String(dayId);
    this.ensureDayRecord(dayId, dayData);

    const sequence = this.getMandatorySequence(dayData);
    const keyIndex = sequence.indexOf(resourceKey);

    // If resource is not in mandatory sequence (e.g. 'live' or 'doubt'), it's always accessible
    if (keyIndex === -1) {
      return {
        status: RESOURCE_STATUS.AVAILABLE,
        progress: 100,
        isMandatory: false
      };
    }

    const saved = this.store.days[dayStr]?.resources?.[resourceKey] || {};

    // If day is already completed, all resources are completed
    if (this.store.completedDays?.includes(parseInt(dayId, 10)) || this.store.days[dayStr]?.completed) {
      return {
        status: RESOURCE_STATUS.COMPLETED,
        progress: 100,
        isMandatory: true,
        ...saved
      };
    }

    // Check if explicitly marked COMPLETED
    if (saved.status === RESOURCE_STATUS.COMPLETED || saved.progress >= 95) {
      return {
        status: RESOURCE_STATUS.COMPLETED,
        progress: saved.progress || 100,
        isMandatory: true,
        ...saved
      };
    }    // Sequential Gating Check:
    // If this resource is at index > 0, check if all previous resources in sequence are COMPLETED
    if (keyIndex > 0) {
      const priorAllCompleted = sequence.slice(0, keyIndex).every(priorKey => {
        const priorSaved = this.store.days[dayStr]?.resources?.[priorKey];
        return priorSaved?.status === RESOURCE_STATUS.COMPLETED || (priorSaved?.progress >= 95);
      });

      if (!priorAllCompleted) {
        return {
          status: RESOURCE_STATUS.LOCKED,
          progress: saved.progress || 0,
          isMandatory: true,
          ...saved
        };
      }
    }

    const currentStatus = (saved.progress > 0 && saved.progress < 95)
      ? RESOURCE_STATUS.IN_PROGRESS 
      : (saved.status === RESOURCE_STATUS.COMPLETED ? RESOURCE_STATUS.COMPLETED : RESOURCE_STATUS.AVAILABLE);

    return {
      status: currentStatus,
      progress: saved.progress || 0,
      isMandatory: true,
      ...saved
    };
  }

  /**
   * Check if a resource can be opened (must be COMPLETED, IN_PROGRESS, or AVAILABLE)
   */
  isResourceUnlocked(dayId, resourceKey, dayData) {
    const state = this.getResourceState(dayId, resourceKey, dayData);
    return state.status !== RESOURCE_STATUS.LOCKED;
  }

  /**
   * Check if a resource is COMPLETED
   */
  isResourceCompleted(dayId, resourceKey, dayData) {
    const state = this.getResourceState(dayId, resourceKey, dayData);
    return state.status === RESOURCE_STATUS.COMPLETED;
  }

  /**
   * Get the current active resource that the student should be studying
   */
  getCurrentActiveResource(dayId, dayData) {
    const sequence = this.getMandatorySequence(dayData);
    if (sequence.length === 0) return 'notes';

    // Find the first resource that is NOT completed
    for (const key of sequence) {
      const state = this.getResourceState(dayId, key, dayData);
      if (state.status !== RESOURCE_STATUS.COMPLETED) {
        return key;
      }
    }
    // If all completed, default to the last or first resource
    return sequence[0];
  }

  /**
   * Save partial or complete progress for a resource
   */
  saveResourceProgress(dayId, resourceKey, progressData = {}, dayData = null) {
    const dayStr = String(dayId);
    this.ensureDayRecord(dayId, dayData);

    const existing = this.store.days[dayStr].resources[resourceKey] || {};
    const newProgress = Math.max(existing.progress || 0, progressData.progress || 0);
    const isNowCompleted = progressData.status === RESOURCE_STATUS.COMPLETED || newProgress >= 95;

    this.store.days[dayStr].resources[resourceKey] = {
      ...existing,
      ...progressData,
      progress: isNowCompleted ? 100 : newProgress,
      status: isNowCompleted ? RESOURCE_STATUS.COMPLETED : (newProgress > 0 ? RESOURCE_STATUS.IN_PROGRESS : RESOURCE_STATUS.AVAILABLE),
      lastUpdated: Date.now()
    };

    // If completed, automatically unlock the next resource in sequence
    if (isNowCompleted && dayData) {
      const sequence = this.getMandatorySequence(dayData);
      const idx = sequence.indexOf(resourceKey);
      if (idx !== -1 && idx < sequence.length - 1) {
        const nextKey = sequence[idx + 1];
        if (!this.store.days[dayStr].resources[nextKey] || this.store.days[dayStr].resources[nextKey].status === RESOURCE_STATUS.LOCKED) {
          this.store.days[dayStr].resources[nextKey] = {
            status: RESOURCE_STATUS.AVAILABLE,
            progress: 0
          };
        }
      }

      // Automatically complete Day if all mandatory resources in sequence are completed
      const allDone = sequence.every(k => {
        const r = this.store.days[dayStr].resources[k];
        return r?.status === RESOURCE_STATUS.COMPLETED || (r?.progress >= 95);
      });

      if (allDone) {
        this.store.days[dayStr].completed = true;
        const dayNum = parseInt(dayId, 10);
        if (!this.store.completedDays.includes(dayNum)) {
          this.store.completedDays.push(dayNum);
          this.store.completedDays.sort((a, b) => a - b);
        }
        const nextDayNum = dayNum + 1;
        const nextDayStr = String(nextDayNum);
        if (!this.store.days[nextDayStr]) {
          this.store.days[nextDayStr] = { completed: false, resources: {} };
        }
      }
    }

    this.saveStore(this.store);
    return this.store.days[dayStr].resources[resourceKey];
  }

  /**
   * Complete a resource immediately (100%)
   */
  completeResource(dayId, resourceKey, dayData) {
    return this.saveResourceProgress(
      dayId,
      resourceKey,
      { status: RESOURCE_STATUS.COMPLETED, progress: 100 },
      dayData
    );
  }

  /**
   * Complete the Day: Verifies all mandatory resources are finished, then unlocks Day N+1
   */
  completeDay(dayId, dayData) {
    const dayNum = parseInt(dayId, 10);
    const dayStr = String(dayId);
    this.ensureDayRecord(dayId, dayData);

    // Verify all mandatory resources
    const sequence = this.getMandatorySequence(dayData);
    const allDone = sequence.every(key => this.isResourceCompleted(dayId, key, dayData));

    if (!allDone) {
      return {
        success: false,
        message: 'Please complete all required clinical learning resources before marking this Day complete.'
      };
    }

    // Mark day complete in store
    this.store.days[dayStr].completed = true;
    if (!this.store.completedDays.includes(dayNum)) {
      this.store.completedDays.push(dayNum);
      this.store.completedDays.sort((a, b) => a - b);
    }

    // Unlock next day
    const nextDayNum = dayNum + 1;
    const nextDayStr = String(nextDayNum);
    if (!this.store.days[nextDayStr]) {
      this.store.days[nextDayStr] = {
        completed: false,
        resources: {}
      };
    }

    this.saveStore(this.store);

    return {
      success: true,
      nextDayNumber: nextDayNum,
      message: `🎉 Outstanding work! Day ${dayNum} curriculum milestone completed. Day ${nextDayNum} is now unlocked.`
    };
  }

  /**
   * Unlock all resources for a specific day immediately (marks them AVAILABLE)
   */
  unlockAllResourcesForDay(dayId, dayData) {
    const dayStr = String(dayId);
    this.ensureDayRecord(dayId, dayData);
    const sequence = this.getMandatorySequence(dayData);

    sequence.forEach(key => {
      const current = this.store.days[dayStr].resources[key] || {};
      this.store.days[dayStr].resources[key] = {
        ...current,
        status: current.status === RESOURCE_STATUS.COMPLETED ? RESOURCE_STATUS.COMPLETED : RESOURCE_STATUS.AVAILABLE,
        progress: current.progress || 0
      };
    });

    this.saveStore(this.store);
    return this.store.days[dayStr];
  }

  /**
   * Mark all resources for a day as complete (100%) and unlock the next day
   */
  completeAllResourcesForDay(dayId, dayData) {
    const dayNum = parseInt(dayId, 10);
    const dayStr = String(dayId);
    this.ensureDayRecord(dayId, dayData);
    const sequence = this.getMandatorySequence(dayData);

    sequence.forEach(key => {
      this.store.days[dayStr].resources[key] = {
        status: RESOURCE_STATUS.COMPLETED,
        progress: 100,
        lastUpdated: Date.now()
      };
    });

    this.store.days[dayStr].completed = true;
    if (!this.store.completedDays.includes(dayNum)) {
      this.store.completedDays.push(dayNum);
      this.store.completedDays.sort((a, b) => a - b);
    }

    // Unlock next day
    const nextDayNum = dayNum + 1;
    const nextDayStr = String(nextDayNum);
    if (!this.store.days[nextDayStr]) {
      this.store.days[nextDayStr] = {
        completed: false,
        resources: {}
      };
    }

    this.saveStore(this.store);
    return {
      success: true,
      nextDayNumber: nextDayNum,
      message: `🎉 All resources for Day ${dayNum} unlocked and marked complete! Day ${nextDayNum} is now unlocked.`
    };
  }

  /**
   * Unlock a specific Day number (allows student to access any particular day directly)
   */
  unlockDay(dayNumber) {
    const dayNum = parseInt(dayNumber, 10);
    if (dayNum > 1) {
      for (let d = 1; d < dayNum; d++) {
        if (!this.store.completedDays.includes(d)) {
          this.store.completedDays.push(d);
        }
      }
      this.store.completedDays.sort((a, b) => a - b);
    }
    const dayStr = String(dayNum);
    if (!this.store.days[dayStr]) {
      this.store.days[dayStr] = { completed: false, resources: {} };
    }
    this.saveStore(this.store);
    return this.store;
  }

  /**
   * Unlock all days across the whole curriculum
   */
  unlockAllDays(allDayNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    allDayNumbers.forEach(d => {
      if (!this.store.completedDays.includes(d)) {
        this.store.completedDays.push(d);
      }
      const dayStr = String(d);
      if (!this.store.days[dayStr]) {
        this.store.days[dayStr] = { completed: false, resources: {} };
      }
    });
    this.store.completedDays.sort((a, b) => a - b);
    this.saveStore(this.store);
    return this.store;
  }

  /**
   * Get current overall learning position for the Student Dashboard & Resume flow
   */
  getCurrentLearningPosition(dayDataLookup) {
    const highestDay = this.getHighestUnlockedDay();
    const dayData = typeof dayDataLookup === 'function' ? dayDataLookup(highestDay) : null;
    const currentResource = this.getCurrentActiveResource(highestDay, dayData);
    const resourceState = this.getResourceState(highestDay, currentResource, dayData);

    return {
      dayNumber: highestDay,
      resourceKey: currentResource,
      resourceTitle: RESOURCE_TITLES[currentResource] || currentResource,
      progress: resourceState.progress || 0,
      status: resourceState.status
    };
  }

  /**
   * Reset progress back to Day 3 active (useful for testing & demo resets)
   */
  resetToInitialSeed() {
    this.store = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this.saveStore(this.store);
    return this.store;
  }

  // ===========================================================================
  // LECTURE PROGRESS & SEQUENTIAL LOCKING
  // ===========================================================================
  loadLectureStore() {
    const STORAGE_KEY_LECTURES = 'medprep_lecture_progress_v2';
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LECTURES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.completedLectures)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load lecture progress:', e);
    }
    return { completedLectures: [] };
  }

  saveLectureStore(data) {
    const STORAGE_KEY_LECTURES = 'medprep_lecture_progress_v2';
    const EVENT_LECTURES_UPDATED = 'medprep_lecture_progress_updated';
    try {
      localStorage.setItem(STORAGE_KEY_LECTURES, JSON.stringify(data));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(EVENT_LECTURES_UPDATED, { detail: data }));
      }
    } catch (e) {
      console.warn('Failed to save lecture progress:', e);
    }
  }

  subscribeLectures(callback) {
    const EVENT_LECTURES_UPDATED = 'medprep_lecture_progress_updated';
    const handler = () => callback(this.loadLectureStore());
    window.addEventListener(EVENT_LECTURES_UPDATED, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_LECTURES_UPDATED, handler);
      window.removeEventListener('storage', handler);
    };
  }

  isLectureCompleted(lectureId) {
    if (!lectureId) return false;
    const store = this.loadLectureStore();
    return (store.completedLectures || []).includes(lectureId);
  }

  markLectureCompleted(lectureId, isCompleted = true) {
    if (!lectureId) return;
    const store = this.loadLectureStore();
    let list = store.completedLectures || [];
    if (isCompleted) {
      if (!list.includes(lectureId)) {
        list.push(lectureId);
      }
    } else {
      list = list.filter(id => id !== lectureId);
    }
    store.completedLectures = list;
    this.saveLectureStore(store);
    return isCompleted;
  }

  getCompletedLectures() {
    const store = this.loadLectureStore();
    return store.completedLectures || [];
  }

  /**
   * Sequential gating: A lecture is unlocked IF:
   * 1) It is the first lecture in the module (index === 0)
   * 2) OR the immediately preceding lecture in the module is marked completed.
   */
  isLectureUnlocked(moduleId, lectureId, allModuleLectures = []) {
    if (!allModuleLectures || allModuleLectures.length === 0) return true;
    const sorted = [...allModuleLectures].sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0));
    const idx = sorted.findIndex(l => l.id === lectureId);

    // If lecture is not found or is the very first lecture, it's always unlocked
    if (idx <= 0) return true;

    // Check if previous lecture is completed
    const prevLecture = sorted[idx - 1];
    return this.isLectureCompleted(prevLecture.id);
  }

  unlockAllLecturesForModule(allModuleLectures = []) {
    const store = this.loadLectureStore();
    const list = store.completedLectures || [];
    allModuleLectures.forEach(l => {
      if (!list.includes(l.id)) {
        list.push(l.id);
      }
    });
    store.completedLectures = list;
    this.saveLectureStore(store);
    return list;
  }

  resetLecturesForModule(allModuleLectures = []) {
    const store = this.loadLectureStore();
    const modIds = new Set(allModuleLectures.map(l => l.id));
    store.completedLectures = (store.completedLectures || []).filter(id => !modIds.has(id));
    this.saveLectureStore(store);
    return store.completedLectures;
  }

  /**
   * Calculate exact completed and remaining time for a single lecture
   */
  getLectureTimeStats(lecture) {
    if (!lecture) return { totalMins: 45, completedMins: 0, remainingMins: 45, totalStr: '45 mins', completedStr: '0 mins', remainingStr: '45 mins', pct: 0, isDone: false };
    
    const totalMins = parseDurationToMinutes(lecture.duration);
    const isDone = this.isLectureCompleted(lecture.id);
    const store = this.loadLectureStore();
    const lectureSpent = store.lectureTimeSpent && store.lectureTimeSpent[lecture.id] ? store.lectureTimeSpent[lecture.id] : 0;
    
    // If completed, student has covered 100% of duration
    const completedMins = isDone ? totalMins : Math.min(totalMins, lectureSpent);
    const remainingMins = Math.max(0, totalMins - completedMins);
    const pct = totalMins > 0 ? Math.round((completedMins / totalMins) * 100) : 0;

    return {
      totalMins,
      completedMins,
      remainingMins,
      totalStr: formatMinutesToDuration(totalMins),
      completedStr: formatMinutesToDuration(completedMins),
      remainingStr: formatMinutesToDuration(remainingMins),
      pct,
      isDone
    };
  }

  /**
   * Log/record incremental study time spent on a lecture
   */
  addLectureStudyTime(lectureId, minutesToAdd = 5) {
    if (!lectureId) return;
    const store = this.loadLectureStore();
    if (!store.lectureTimeSpent) store.lectureTimeSpent = {};
    store.lectureTimeSpent[lectureId] = (store.lectureTimeSpent[lectureId] || 0) + minutesToAdd;
    this.saveLectureStore(store);
  }

  /**
   * Calculate exact completed and remaining time for a module
   */
  getModuleTimeStats(moduleLectures = []) {
    const totalMinutes = moduleLectures.reduce((acc, l) => acc + parseDurationToMinutes(l.duration), 0);
    const completedMinutes = moduleLectures
      .reduce((acc, l) => {
        const stats = this.getLectureTimeStats(l);
        return acc + stats.completedMins;
      }, 0);
    const remainingMinutes = Math.max(0, totalMinutes - completedMinutes);
    const pct = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

    return {
      totalMinutes,
      completedMinutes,
      remainingMinutes,
      totalFormatted: formatMinutesToDuration(totalMinutes),
      completedFormatted: formatMinutesToDuration(completedMinutes),
      remainingFormatted: formatMinutesToDuration(remainingMinutes),
      pct
    };
  }
}

/**
 * Parse any time duration string (e.g. '40 mins', '1.5 hours', '50 mins') into total minutes
 */
export function parseDurationToMinutes(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 45;
  const lower = durationStr.toLowerCase().trim();

  // Match hours, e.g. "1.5 hours", "2 hrs", "1 hour"
  if (lower.includes('hour') || lower.includes('hr')) {
    const match = lower.match(/([\d.]+)\s*(?:hour|hr)/);
    if (match) {
      const hrs = parseFloat(match[1]);
      const minMatch = lower.match(/(\d+)\s*(?:min|m)/);
      const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
      return Math.round(hrs * 60) + mins;
    }
  }

  // Match minutes, e.g. "45 mins", "40m"
  const minMatch = lower.match(/(\d+)\s*(?:min|m)/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  return 45;
}

/**
 * Format total minutes into human-friendly duration (e.g. "1 hr 25 mins", "40 mins")
 */
export function formatMinutesToDuration(totalMinutes) {
  const mins = Math.max(0, Math.round(totalMinutes || 0));
  if (mins === 0) return '0 mins';
  if (mins < 60) return `${mins} mins`;

  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;

  if (remaining === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours > 1 ? 's' : ''} ${remaining} mins`;
}

export const learningProgressService = new LearningProgressService();
