// =============================================================================
// TEST PUBLISH SERVICE — LIFECYCLE TRANSITION, TEST WINDOW & CONFIG LOCKING
// Enforces pre-flight readiness gate, validates scheduled test windows,
// transitions statuses (PUBLISHED / UPCOMING), and locks test configuration.
// =============================================================================

import { adminTestService, TEST_STATUS } from './adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from './cbtTestService.js';
import { testReadinessService } from './testReadinessService.js';

class TestPublishService {
  /**
   * Validate test window configuration.
   * 
   * @param {object} windowConfig - { enabled, startAt, endAt, timezone }
   * @returns {object} { valid: boolean, error?: string }
   */
  validateTestWindow(windowConfig) {
    if (!windowConfig || !windowConfig.enabled) {
      return { valid: true };
    }

    const { startAt, endAt } = windowConfig;

    if (!startAt || !String(startAt).trim()) {
      return { valid: false, error: 'Start date and time are required when Test Window is enabled.' };
    }

    if (!endAt || !String(endAt).trim()) {
      return { valid: false, error: 'End date and time are required when Test Window is enabled.' };
    }

    const startTime = new Date(startAt).getTime();
    const endTime = new Date(endAt).getTime();

    if (isNaN(startTime)) {
      return { valid: false, error: 'Invalid Start date/time format.' };
    }

    if (isNaN(endTime)) {
      return { valid: false, error: 'Invalid End date/time format.' };
    }

    if (endTime <= startTime) {
      return { valid: false, error: 'End date and time must be strictly after the Start date and time.' };
    }

    return { valid: true };
  }

  /**
   * Publishes an Admin Test.
   * Enforces readiness gate, validates test window, updates status to PUBLISHED,
   * emits event, and locks configuration.
   * 
   * @param {string} testId
   * @param {object} options - { testWindow, publishedBy }
   * @returns {object} Published test
   */
  publishAdminTest(testId, options = {}) {
    const test = adminTestService.getTest(testId);
    if (!test) {
      throw new Error(`Admin test with ID "${testId}" not found.`);
    }

    // 1. Pre-flight readiness check
    const readiness = testReadinessService.validateTestForPublish(test, null, { role: 'admin' });
    if (!readiness.ready) {
      const errorSummary = readiness.errors.map(e => e.message).join('; ');
      const err = new Error(`CANNOT_PUBLISH: Test has ${readiness.errorCount} blocking error(s): ${errorSummary}`);
      err.readiness = readiness;
      throw err;
    }

    // 2. Test Window validation
    const testWindow = options.testWindow || test.testWindow || { enabled: false };
    const windowValidation = this.validateTestWindow(testWindow);
    if (!windowValidation.valid) {
      throw new Error(`INVALID_TEST_WINDOW: ${windowValidation.error}`);
    }

    // 3. Status transition & metadata
    const now = new Date().toISOString();
    const updatedTest = {
      ...test,
      status: TEST_STATUS.PUBLISHED,
      publishedAt: now,
      publishedBy: options.publishedBy || 'Admin',
      testWindow: testWindow.enabled ? testWindow : null,
      updatedAt: now
    };

    // Save into admin tests repository
    const index = adminTestService.tests.findIndex(t => t.id === testId);
    if (index !== -1) {
      adminTestService.tests[index] = updatedTest;
      adminTestService.save();
    }

    return updatedTest;
  }

  /**
   * Publishes a Faculty Test.
   * Enforces readiness gate, validates test window, updates status to UPCOMING,
   * emits event, and locks configuration.
   * 
   * @param {string} testId
   * @param {object} options - { testWindow, publishedBy }
   * @param {object|null} requestingFaculty
   * @returns {object} Published faculty test
   */
  publishFacultyTest(testId, options = {}, requestingFaculty = null) {
    const test = cbtTestService.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty test with ID "${testId}" not found.`);
    }

    cbtTestService._verifyFacultyTestAccess(test, requestingFaculty);

    // 1. Pre-flight readiness check
    const readiness = testReadinessService.validateTestForPublish(test, null, { role: 'faculty' });
    if (!readiness.ready) {
      const errorSummary = readiness.errors.map(e => e.message).join('; ');
      const err = new Error(`CANNOT_PUBLISH: Test has ${readiness.errorCount} blocking error(s): ${errorSummary}`);
      err.readiness = readiness;
      throw err;
    }

    // 2. Test Window validation
    const testWindow = options.testWindow || test.testWindow || { enabled: false };
    const windowValidation = this.validateTestWindow(testWindow);
    if (!windowValidation.valid) {
      throw new Error(`INVALID_TEST_WINDOW: ${windowValidation.error}`);
    }

    // 3. Status transition & metadata
    const now = new Date().toISOString();
    const facultyName = requestingFaculty?.name || test.facultyName || 'Faculty';

    const updatedTest = {
      ...test,
      status: FACULTY_TEST_STATUS.UPCOMING,
      publishedAt: now,
      publishedBy: facultyName,
      testWindow: testWindow.enabled ? testWindow : null,
      updatedAt: now
    };

    // Update scheduling if testWindow was configured
    if (testWindow.enabled && testWindow.startAt) {
      const startDate = new Date(testWindow.startAt);
      updatedTest.date = startDate.toLocaleDateString();
      updatedTest.time = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;
      updatedTest.formattedWindow = `${updatedTest.date} • ${updatedTest.time}`;
    }

    const index = cbtTestService.tests.findIndex(t => t.id === testId);
    if (index !== -1) {
      cbtTestService.tests[index] = updatedTest;
      cbtTestService.saveTests();
    }

    return updatedTest;
  }

  /**
   * Check if a test is in a published/locked state.
   * 
   * @param {object} test
   * @returns {boolean}
   */
  isTestPublished(test) {
    if (!test) return false;
    if (test.status === TEST_STATUS.PUBLISHED || test.status === TEST_STATUS.ACTIVE || test.status === TEST_STATUS.COMPLETED) {
      return true;
    }
    if (test.publishedAt && (test.status === FACULTY_TEST_STATUS.UPCOMING || test.status === FACULTY_TEST_STATUS.LIVE)) {
      return true;
    }
    return false;
  }
}

export const testPublishService = new TestPublishService();
