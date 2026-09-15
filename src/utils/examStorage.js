// =============================================================================
// EXAM STORAGE UTILITY — PROTOTYPE ISOLATED PERSISTENCE
// Safe localStorage wrappers with isomorphic in-memory fallback for Node tests.
// =============================================================================

export const PROTOTYPE_STORAGE_KEYS = {
  ASSESSMENTS: 'medprep_prototype_assessments_v1',
  QUESTIONS: 'medprep_prototype_questions_v1',
  STIMULI: 'medprep_prototype_stimuli_v1',
  GROUPS: 'medprep_prototype_groups_v1'
};

// In-memory fallback map for non-browser (Node.js test) environments
const memoryStore = new Map();

/**
 * Safely reads and parses JSON data from localStorage with graceful fallback.
 * @param {string} key - The localStorage key
 * @param {any} fallback - Value to return if missing or malformed
 * @returns {any} Parsed value or fallback
 */
export function getStoredData(key, fallback = null) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return fallback;
      }
      return JSON.parse(raw);
    }

    if (memoryStore.has(key)) {
      return memoryStore.get(key);
    }
    return fallback;
  } catch (error) {
    console.warn(`[examStorage] Failed to parse key "${key}", returning fallback. Error:`, error);
    return fallback;
  }
}

/**
 * Safely writes data as JSON to localStorage and dispatches change events.
 * @param {string} key - The localStorage key
 * @param {any} data - Data to serialize
 * @returns {boolean} Success status
 */
export function setStoredData(key, data) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('medprep-exam-data-updated', {
          detail: { key, timestamp: Date.now() }
        }));
      }
      return true;
    }

    // In Node.js environment: store a cloned copy in memoryStore
    memoryStore.set(key, JSON.parse(JSON.stringify(data)));
    return true;
  } catch (error) {
    console.error(`[examStorage] Failed to write key "${key}". Error:`, error);
    return false;
  }
}

/**
 * Safely removes a key from localStorage.
 * @param {string} key - The localStorage key
 */
export function removeStoredData(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    memoryStore.delete(key);
  } catch (error) {
    console.warn(`[examStorage] Failed to remove key "${key}". Error:`, error);
  }
}
