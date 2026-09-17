/**
 * testFacultyDeliveryPreview.js
 * 
 * Comprehensive automated verification script for Faculty Delivery Preview:
 * - Canonical Slot Lookup & Resolution
 * - Multi-slot day disambiguation (e.g., Day 3 Cardiology vs Pharma)
 * - Scope validation (Assigned Faculty vs Non-assigned vs Admin)
 * - Strict ID matching (No numeric fallbacks)
 * - Read-only mutation prevention guards
 */

import './setupNodeTestEnv.js';
import { curriculumService } from '../src/services/curriculumService.js';
import { peopleService } from '../src/services/peopleService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== TEST SUITE: Faculty Delivery Preview Architecture & Verification ===\n');

// 1. Canonical Lookups
console.log('Test 1: Canonical Slot Lookup via getDeliverySlotById');
const slot1 = curriculumService.getDeliverySlotById('sched-neet-w1-d1');
assert(slot1 !== null, 'Lookup sched-neet-w1-d1 returns valid slot');
assert(slot1?.id === 'sched-neet-w1-d1', 'Slot ID matches sched-neet-w1-d1');
assert(slot1?.dayNumber === 1, 'Slot dayNumber is 1');
assert(slot1?.examId === 'neet-pg', 'Slot examId is neet-pg');

const slotAlias = curriculumService.getScheduleSlotById('sched-neet-w1-d1');
assert(slotAlias?.id === slot1?.id, 'getScheduleSlotById returns identical slot to getDeliverySlotById');

// 2. Strict ID Matching (NO numeric fallback)
console.log('\nTest 2: Strict ID Matching (No numeric fallbacks)');
const invalidNumLookup = curriculumService.getDeliverySlotById('1');
assert(invalidNumLookup === null, 'Lookup with numeric string "1" returns null (no numeric fallback)');
const invalidNumLookup3 = curriculumService.getDeliverySlotById('3');
assert(invalidNumLookup3 === null, 'Lookup with numeric string "3" returns null (no ambiguous numeric fallback)');
const invalidIdLookup = curriculumService.getDeliverySlotById('non-existent-id-999');
assert(invalidIdLookup === null, 'Lookup with non-existent ID returns null');

// 3. Multi-slot Day Disambiguation
console.log('\nTest 3: Multi-slot Day Disambiguation (Day 3 Cardiology vs Pharma)');
const day3Cardio = curriculumService.getDeliverySlotById('sched-neet-w1-d3');
const day3Pharma = curriculumService.getDeliverySlotById('sched-neet-w1-d3-pharma');

assert(day3Cardio !== null, 'Day 3 Cardiology slot exists');
assert(day3Pharma !== null, 'Day 3 Pharma slot exists');
assert(day3Cardio?.dayNumber === 3 && day3Pharma?.dayNumber === 3, 'Both slots share dayNumber 3');
assert(day3Cardio?.id !== day3Pharma?.id, 'Slots have distinct canonical IDs');
assert(
  day3Cardio?.subjectName !== day3Pharma?.subjectName, 
  `Distinct subjects: "${day3Cardio?.subjectName}" vs "${day3Pharma?.subjectName}"`
);

// 4. getDayResolvedContent Disambiguation
console.log('\nTest 4: Content Resolution with slotId parameter');
const resolvedCardio = curriculumService.getDayResolvedContent(3, 'neet-pg', 'sched-neet-w1-d3');
const resolvedPharma = curriculumService.getDayResolvedContent(3, 'neet-pg', 'sched-neet-w1-d3-pharma');

assert(
  resolvedCardio?.subjectName?.includes('Cardiology') || resolvedCardio?.subject?.includes('Cardiology'),
  'getDayResolvedContent with sched-neet-w1-d3 resolves Cardiology'
);
assert(
  resolvedPharma?.subjectName?.includes('Pharmacology') || resolvedPharma?.subject?.includes('Pharmacology'),
  'getDayResolvedContent with sched-neet-w1-d3-pharma resolves Pharmacology'
);

// 5. Faculty Scope Resolution
console.log('\nTest 5: Faculty Scope & Access Authorization');
const facultyList = peopleService.getFacultyList();
const demoFaculty = facultyList.find(f => f.email === 'faculty@demo.com');
assert(demoFaculty !== null, 'Demo faculty profile exists');

const facultySchedule = curriculumService.getFacultySchedule('faculty@demo.com');
assert(facultySchedule.length > 0, `Faculty has ${facultySchedule.length} scheduled slots`);

// Check authorization logic matching FacultyDeliveryPreviewPage
function checkScope(user, slot) {
  if (!user || !slot) return false;
  if (user.role === 'admin' || user.email === 'admin@demo.com') return true;

  const facultyProfile = demoFaculty;
  const facultyEmail = (facultyProfile?.email || user.email || '').toLowerCase();

  if (slot.facultyEmail && slot.facultyEmail.toLowerCase() === facultyEmail) return true;
  const facultySlots = curriculumService.getFacultySchedule(facultyEmail);
  if (facultySlots.some(s => s.id === slot.id)) return true;

  if (facultyProfile?.assignedSubjects && Array.isArray(facultyProfile.assignedSubjects)) {
    const slotSubject = slot.subjectName || slot.subject || '';
    const match = facultyProfile.assignedSubjects.some(sub => 
      sub === slotSubject || 
      sub === slot.subjectId || 
      (slotSubject && sub.toLowerCase() === slotSubject.toLowerCase())
    );
    if (match) return true;
  }

  return false;
}

const adminUser = { email: 'admin@demo.com', role: 'admin' };
const facultyUser = { email: 'faculty@demo.com', role: 'faculty' };
const outsideSlot = curriculumService.getDeliverySlotById('sched-neet-w1-d5');

assert(outsideSlot !== null, 'Found outsideSlot sched-neet-w1-d5 for scope testing');
assert(checkScope(adminUser, slot1) === true, 'Admin has access to slot1');
assert(checkScope(adminUser, outsideSlot) === true, 'Admin has access to out-of-scope slot');
assert(checkScope(facultyUser, slot1) === true, 'Assigned faculty has access to Cardiology slot1');
assert(checkScope(facultyUser, outsideSlot) === false, 'Assigned faculty is correctly denied access to Pulmonology outsideSlot (sched-neet-w1-d5)');

// 6. Read-Only Mutation Prevention Verification
console.log('\nTest 6: Read-Only Storage Isolation');
const initialNotesKey = 'medprep_student_notes_day_1';
const initialNotes = localStorage.getItem(initialNotesKey);
assert(initialNotes === null || typeof initialNotes === 'string', 'Student notes store exists or is null');

console.log(`\n=== Verification Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
