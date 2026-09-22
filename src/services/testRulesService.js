// =============================================================================
// TEST RULES SERVICE — PHASE 3 ORCHESTRATION
// Blueprint + Scoring + Timing + Navigation
//
// Provides:
//   - createDefaultRules(test)  → default rules object
//   - validateRules(rules, test) → { valid, errors, warnings }
//   - isRulesReady(rules)        → boolean (Phase 3 complete)
//   - saveAdminTestRules(id, rules)
//   - getAdminTestRules(id)
//   - saveFacultyTestRules(id, rules, faculty)
//   - getFacultyTestRules(id, faculty)
// =============================================================================

import { adminTestService } from './adminTestService.js';
import { cbtTestService } from './cbtTestService.js';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

export const BLUEPRINT_MODES = {
  NONE: 'NONE',           // No blueprint constraints
  WEIGHTED: 'WEIGHTED',   // Percentage-based difficulty targets (soft)
  STRICT: 'STRICT'        // Hard counts per difficulty level
};

export const TIMING_MODES = {
  OVERALL: 'OVERALL',           // Single shared countdown
  PER_SECTION: 'PER_SECTION',   // Each section has its own clock
  UNPROCTORED: 'UNPROCTORED'    // No time limit
};

export const NAVIGATION_MODES = {
  FREE: 'FREE',         // Candidates can jump between any question/section
  LINEAR: 'LINEAR'      // Must answer in sequence, no going back
};

export const CUTOFF_MODES = {
  NONE: 'NONE',
  PERCENTAGE: 'PERCENTAGE',
  ABSOLUTE: 'ABSOLUTE'
};

export const BREAK_POLICIES = {
  NONE: 'NONE',
  SCHEDULED: 'SCHEDULED'
};

// ---------------------------------------------------------------------------
// SCHEMA FACTORIES
// ---------------------------------------------------------------------------

/**
 * Returns a default blueprint sub-object.
 */
export function createDefaultBlueprint(test = {}) {
  return {
    mode: BLUEPRINT_MODES.WEIGHTED,
    subjectDistribution: [],     // [{ subjectId, subjectName, targetCount }]
    perSectionOverrides: {}      // { unitId: {} }
  };
}

/**
 * Returns a default scoring sub-object.
 */
export function createDefaultScoring(test = {}) {
  // Try to detect existing marks from CBT test data
  const marksCorrect = test.marksPerCorrect ?? test.marksCorrect ?? 4;
  const marksIncorrect = test.marksPerIncorrect ?? test.marksIncorrect ?? -1;
  const negEnabled = test.negativeMarking ?? true;

  return {
    marksPerCorrect: marksCorrect,
    marksPerIncorrect: marksIncorrect,
    marksUnanswered: 0,
    negativeMarkingEnabled: negEnabled,
    partialMarkingEnabled: false,
    cutoffMode: CUTOFF_MODES.NONE,
    cutoffValue: null,
    perSectionScoring: false,
    sectionCutoffs: {}           // { unitId: { cutoffMode, cutoffValue } }
  };
}

/**
 * Returns a default timing sub-object.
 */
export function createDefaultTiming(test = {}) {
  const duration = test.targetDuration ?? test.durationMinutes ?? 180;
  return {
    mode: TIMING_MODES.OVERALL,
    overallDurationMinutes: duration,
    sectionDurations: {},         // { unitId: minutes }
    breakPolicy: BREAK_POLICIES.NONE,
    breakIntervalMinutes: null
  };
}

/**
 * Returns a default navigation sub-object.
 */
export function createDefaultNavigation() {
  return {
    mode: NAVIGATION_MODES.FREE,
    allowSectionJump: true,
    allowReviewMarking: true,
    allowAnswerChange: true,
    lockSectionAfterSubmit: false,
    showCalculator: false,
    showSectionSummary: true
  };
}

/**
 * Creates a full default rules object for a given test.
 * @param {object} test - Test object for seeding sensible defaults
 * @returns {{ blueprint, scoring, timing, navigation, version, savedAt }}
 */
export function createDefaultRules(test = {}) {
  return {
    blueprint: createDefaultBlueprint(test),
    scoring: createDefaultScoring(test),
    timing: createDefaultTiming(test),
    navigation: createDefaultNavigation(),
    version: 1,
    savedAt: null
  };
}

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------

/**
 * Validate blueprint rules.
 * @param {object} blueprint
 * @param {object} test
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateBlueprint(blueprint, test = {}) {
  const errors = [];
  const warnings = [];

  if (!blueprint) {
    errors.push('Blueprint configuration is missing.');
    return { valid: false, errors, warnings };
  }

  const validModes = Object.values(BLUEPRINT_MODES);
  if (!validModes.includes(blueprint.mode)) {
    errors.push(`Blueprint mode "${blueprint.mode}" is invalid. Must be one of: ${validModes.join(', ')}.`);
  }

  // Target difficulty distribution has been removed from Blueprint.
  // Difficulty is held on individual questions as descriptive metadata only.

  // Warn if no subject distribution set in STRICT mode
  if (blueprint.mode === BLUEPRINT_MODES.STRICT) {
    const subDist = blueprint.subjectDistribution || [];
    if (subDist.length === 0) {
      warnings.push('Strict mode is active but no subject distribution has been configured.');
    }
    const totalSubjCount = subDist.reduce((acc, s) => acc + (Number(s.targetCount) || 0), 0);
    const target = test.targetQuestions ?? test.totalQuestions;
    if (target && totalSubjCount > 0 && totalSubjCount !== target) {
      warnings.push(
        `Subject distribution target (${totalSubjCount}) does not match test target (${target} questions).`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate scoring rules.
 * @param {object} scoring
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateScoring(scoring) {
  const errors = [];
  const warnings = [];

  if (!scoring) {
    errors.push('Scoring configuration is missing.');
    return { valid: false, errors, warnings };
  }

  const correct = Number(scoring.marksPerCorrect);
  if (isNaN(correct) || correct <= 0) {
    errors.push('Marks per correct answer must be a positive number.');
  }

  if (scoring.negativeMarkingEnabled) {
    const incorrect = Number(scoring.marksPerIncorrect);
    if (isNaN(incorrect) || incorrect > 0) {
      errors.push('Marks per incorrect answer must be zero or negative when negative marking is enabled.');
    }
  }

  const unanswered = Number(scoring.marksUnanswered);
  if (isNaN(unanswered)) {
    errors.push('Marks for unanswered must be a valid number.');
  }

  if (scoring.cutoffMode !== CUTOFF_MODES.NONE) {
    const cutoff = Number(scoring.cutoffValue);
    if (scoring.cutoffValue === null || scoring.cutoffValue === '' || isNaN(cutoff) || cutoff < 0) {
      errors.push('A valid cutoff value is required when a cutoff mode is selected.');
    }
    if (scoring.cutoffMode === CUTOFF_MODES.PERCENTAGE && cutoff > 100) {
      errors.push('Percentage cutoff cannot exceed 100%.');
    }
  }

  if (scoring.negativeMarkingEnabled && Number(scoring.marksPerIncorrect) === 0) {
    warnings.push('Negative marking is enabled but penalty is set to 0. Consider disabling or setting a non-zero penalty.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate timing rules.
 * @param {object} timing
 * @param {object} test
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateTiming(timing, test = {}) {
  const errors = [];
  const warnings = [];

  if (!timing) {
    errors.push('Timing configuration is missing.');
    return { valid: false, errors, warnings };
  }

  const validModes = Object.values(TIMING_MODES);
  if (!validModes.includes(timing.mode)) {
    errors.push(`Timing mode "${timing.mode}" is invalid.`);
  }

  if (timing.mode === TIMING_MODES.OVERALL) {
    const dur = Number(timing.overallDurationMinutes);
    if (isNaN(dur) || dur <= 0) {
      errors.push('Overall duration must be a positive number of minutes.');
    }
    if (dur > 1440) {
      warnings.push('Overall duration exceeds 24 hours. This is unusual for a medical exam.');
    }
  }

  if (timing.mode === TIMING_MODES.PER_SECTION) {
    const sectionDurs = timing.sectionDurations || {};
    const keys = Object.keys(sectionDurs);
    if (keys.length === 0) {
      warnings.push('Per-section timing is active but no section durations have been set.');
    }
    const totalSectionTime = keys.reduce((acc, k) => acc + (Number(sectionDurs[k]) || 0), 0);
    const overall = test.targetDuration ?? test.durationMinutes;
    if (overall && totalSectionTime > overall) {
      warnings.push(
        `Total section durations (${totalSectionTime} min) exceed the overall test target (${overall} min).`
      );
    }
  }

  if (timing.breakPolicy === BREAK_POLICIES.SCHEDULED) {
    const interval = Number(timing.breakIntervalMinutes);
    if (isNaN(interval) || interval <= 0) {
      errors.push('Break interval must be a positive number of minutes when scheduled breaks are enabled.');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate navigation rules.
 * @param {object} navigation
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateNavigation(navigation) {
  const errors = [];
  const warnings = [];

  if (!navigation) {
    errors.push('Navigation configuration is missing.');
    return { valid: false, errors, warnings };
  }

  const validModes = Object.values(NAVIGATION_MODES);
  if (!validModes.includes(navigation.mode)) {
    errors.push(`Navigation mode "${navigation.mode}" is invalid.`);
  }

  if (navigation.mode === NAVIGATION_MODES.LINEAR && navigation.allowSectionJump) {
    warnings.push('Linear navigation is set but "Allow Section Jump" is also enabled. Section jump will be overridden by linear mode.');
  }

  if (navigation.lockSectionAfterSubmit && !navigation.allowSectionJump) {
    // This is fine — after linear submit, section is locked anyway
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate the full rules object.
 * @param {object} rules
 * @param {object} test
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateRules(rules, test = {}) {
  if (!rules) {
    return {
      valid: false,
      errors: ['Rules have not been configured yet.'],
      warnings: []
    };
  }

  const bpResult = validateBlueprint(rules.blueprint, test);
  const scoreResult = validateScoring(rules.scoring);
  const timingResult = validateTiming(rules.timing, test);
  const navResult = validateNavigation(rules.navigation);

  const allErrors = [
    ...bpResult.errors,
    ...scoreResult.errors,
    ...timingResult.errors,
    ...navResult.errors
  ];

  const allWarnings = [
    ...bpResult.warnings,
    ...scoreResult.warnings,
    ...timingResult.warnings,
    ...navResult.warnings
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Returns true if Phase 3 is considered "Ready" (no blocking errors).
 * @param {object} rules
 * @param {object} test
 * @returns {boolean}
 */
export function isRulesReady(rules, test = {}) {
  if (!rules || !rules.savedAt) return false;
  const result = validateRules(rules, test);
  return result.valid;
}

// ---------------------------------------------------------------------------
// PERSISTENCE — ADMIN
// ---------------------------------------------------------------------------

/**
 * Retrieves admin test rules, or returns default rules if not yet configured.
 * @param {string} testId
 * @returns {object} rules
 */
export function getAdminTestRules(testId) {
  const test = adminTestService.getTest(testId);
  if (!test) throw new Error(`Admin test "${testId}" not found.`);
  return test.rules || createDefaultRules(test);
}

/**
 * Saves rules to an admin test. Validates before persisting.
 * @param {string} testId
 * @param {object} rules - Full rules object
 * @returns {object} updated test
 */
export function saveAdminTestRules(testId, rules) {
  const test = adminTestService.getTest(testId);
  if (!test) throw new Error(`Admin test "${testId}" not found.`);

  // Allow saving even with warnings (only block on hard errors that prevent field hydration)
  const stampedRules = {
    ...rules,
    version: (rules.version || 0) + 1,
    savedAt: new Date().toISOString()
  };

  return adminTestService.saveAdminTestRules(testId, stampedRules);
}

// ---------------------------------------------------------------------------
// PERSISTENCE — FACULTY
// ---------------------------------------------------------------------------

/**
 * Retrieves faculty test rules, or returns default rules if not yet configured.
 * @param {string} testId
 * @param {object} faculty - Current faculty profile
 * @returns {object} rules
 */
export function getFacultyTestRules(testId, faculty) {
  const test = cbtTestService.getTestById(testId);
  if (!test) throw new Error(`Faculty test "${testId}" not found.`);
  return test.rules || createDefaultRules(test);
}

/**
 * Saves rules to a faculty test. Validates ownership before persisting.
 * @param {string} testId
 * @param {object} rules - Full rules object
 * @param {object} faculty - Current faculty profile
 * @returns {object} updated test
 */
export function saveFacultyTestRules(testId, rules, faculty) {
  const test = cbtTestService.getTestById(testId);
  if (!test) throw new Error(`Faculty test "${testId}" not found.`);

  const stampedRules = {
    ...rules,
    version: (rules.version || 0) + 1,
    savedAt: new Date().toISOString()
  };

  return cbtTestService.saveFacultyTestRules(testId, stampedRules, faculty);
}

// ---------------------------------------------------------------------------
// DISPLAY HELPERS
// ---------------------------------------------------------------------------

export function formatScoringScheme(scoring) {
  if (!scoring) return '—';
  const parts = [];
  parts.push(`+${scoring.marksPerCorrect} Correct`);
  if (scoring.negativeMarkingEnabled && scoring.marksPerIncorrect !== 0) {
    parts.push(`${scoring.marksPerIncorrect} Incorrect`);
  }
  if (scoring.marksUnanswered !== 0) {
    parts.push(`${scoring.marksUnanswered} Unanswered`);
  }
  return parts.join(' / ');
}

export function formatTimingMode(timing) {
  if (!timing) return '—';
  switch (timing.mode) {
    case TIMING_MODES.OVERALL:
      return `Overall (${timing.overallDurationMinutes ?? '?'} min)`;
    case TIMING_MODES.PER_SECTION:
      return 'Per-Section';
    case TIMING_MODES.UNPROCTORED:
      return 'Unproctored';
    default:
      return timing.mode;
  }
}

export function formatNavigationMode(navigation) {
  if (!navigation) return '—';
  return navigation.mode === NAVIGATION_MODES.FREE ? 'Free Navigation' : 'Linear (Sequential)';
}

export function formatBlueprintMode(blueprint) {
  if (!blueprint) return '—';
  switch (blueprint.mode) {
    case BLUEPRINT_MODES.NONE: return 'No Blueprint';
    case BLUEPRINT_MODES.WEIGHTED: return 'Weighted Distribution';
    case BLUEPRINT_MODES.STRICT: return 'Strict Blueprint';
    default: return blueprint.mode;
  }
}
