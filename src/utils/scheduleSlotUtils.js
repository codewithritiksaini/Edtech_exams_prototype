import { facultyAvailabilityService } from '../services/facultyAvailabilityService';

// =============================================================================
// SCHEDULE SLOT UTILITIES
// Provides standard slot taxonomy, normalization, and faculty slot matrix helpers
// Used by ManageScheduleTab, FacultySlotMatrixView, FacultySlotDetailModal
// =============================================================================

/**
 * Standard daily clinical lecture slots (6 windows per day)
 */
export const STANDARD_TIME_SLOTS = [
  {
    id: 'slot-morning',
    label: 'Morning',
    shortLabel: 'Morn',
    timeRange: '09:00 AM - 10:30 AM IST',
    startHour: 9,
    endHour: 10.5,
    color: 'amber',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    icon: '🌅',
  },
  {
    id: 'slot-midday',
    label: 'Midday',
    shortLabel: 'Mid',
    timeRange: '11:30 AM - 01:00 PM IST',
    startHour: 11.5,
    endHour: 13,
    color: 'sky',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
    badgeBg: 'bg-sky-100 text-sky-800',
    icon: '☀️',
  },
  {
    id: 'slot-afternoon',
    label: 'Afternoon',
    shortLabel: 'Aftn',
    timeRange: '02:00 PM - 03:30 PM IST',
    startHour: 14,
    endHour: 15.5,
    color: 'emerald',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    icon: '🌤️',
  },
  {
    id: 'slot-evening',
    label: 'Evening',
    shortLabel: 'Eve',
    timeRange: '04:00 PM - 05:30 PM IST',
    startHour: 16,
    endHour: 17.5,
    color: 'rose',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    icon: '🌆',
  },
  {
    id: 'slot-late-evening',
    label: 'Late Evening',
    shortLabel: 'LateEve',
    timeRange: '06:00 PM - 07:30 PM IST',
    startHour: 18,
    endHour: 19.5,
    color: 'indigo',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    icon: '🌇',
  },
  {
    id: 'slot-night',
    label: 'Night',
    shortLabel: 'Night',
    timeRange: '07:30 PM - 09:00 PM IST',
    startHour: 19.5,
    endHour: 21,
    color: 'purple',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    icon: '🌙',
  },
];

/**
 * Parse a time string like "09:00 AM" or "04:00 PM" into decimal hours
 */
function parseTimeToHours(timeStr) {
  if (!timeStr) return null;
  const clean = timeStr.trim().replace(/\s*(IST|EST|GMT|CET)\s*/i, '').trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h + m / 60;
}

/**
 * Normalize a raw time string (e.g. "09:00 AM - 11:00 AM IST") to the matching
 * standard slot. Returns the best matching STANDARD_TIME_SLOTS entry, or null.
 */
export function normalizeTimeSlot(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split('-');
  if (parts.length < 2) return null;
  const startHour = parseTimeToHours(parts[0].trim());
  if (startHour === null) return null;

  // Match to whichever standard slot's window this start time falls into
  // Allow ±1.5 hour tolerance for flexibility
  let best = null;
  let bestDiff = Infinity;
  STANDARD_TIME_SLOTS.forEach(slot => {
    const diff = Math.abs(startHour - slot.startHour);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = slot;
    }
  });

  // Only match if within 1.5 hours of a standard slot start
  return bestDiff <= 1.5 ? best : null;
}

/**
 * Get the full slot matrix for a faculty member over a given week.
 * Returns an array of 7 day objects, each with an array of 6 slot objects.
 *
 * @param {string} facultyEmail
 * @param {string} examId
 * @param {number} weekNumber
 * @param {Array}  allScheduleSlots  - full schedule array from curriculumService
 * @param {Array}  allSubjects       - full subjects array from curriculumService
 * @returns {Array<{dayNumber, weekday, date, slots: Array<{slotInfo, status, session}>}>}
 */
export function getFacultySlotMatrix(facultyEmail, examId, weekNumber, allScheduleSlots, allSubjects) {
  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const startDay = (weekNumber - 1) * 7 + 1;

  // Build a set of subjectIds this faculty teaches in this exam
  const facultySubjectIds = new Set(
    allSubjects
      .filter(s => s.examId === examId && s.facultyEmail?.toLowerCase() === facultyEmail?.toLowerCase())
      .map(s => s.id)
  );

  // Filter schedule slots for this faculty, this exam, this week
  const weekSlots = allScheduleSlots.filter(s =>
    s.examId === examId &&
    Number(s.weekNumber) === Number(weekNumber) &&
    (
      s.facultyEmail?.toLowerCase() === facultyEmail?.toLowerCase() ||
      facultySubjectIds.has(s.subjectId)
    )
  );

  return Array.from({ length: 7 }, (_, i) => {
    const dayNumber = startDay + i;
    const weekday = DAY_NAMES[i];
    const daySlots = weekSlots.filter(s => Number(s.dayNumber) === dayNumber);

    const slots = STANDARD_TIME_SLOTS.map(stdSlot => {
      // Find a session booked in this standard time window for this faculty on this day
      const bookedSession = daySlots.find(s => {
        const normalized = normalizeTimeSlot(s.lectureTimeSlot);
        return normalized?.id === stdSlot.id;
      });

      const isDeclared = facultyAvailabilityService.isSlotDeclaredAvailable(facultyEmail, weekday, stdSlot.id);

      let status = 'empty';
      if (bookedSession) {
        status = 'booked';
      } else if (isDeclared) {
        status = 'available';
      } else {
        status = 'unavailable';
      }

      return {
        slotInfo: stdSlot,
        status,
        isDeclaredAvailable: isDeclared,
        session: bookedSession || null,
      };
    });

    return {
      dayNumber,
      weekday,
      shortWeekday: weekday.slice(0, 3),
      slots,
      bookedCount: slots.filter(s => s.status === 'booked').length,
      availableCount: slots.filter(s => s.status === 'available').length,
      emptyCount: slots.filter(s => s.status === 'available' || s.status === 'empty').length,
    };
  });
}

/**
 * Get available (unbooked) standard slots for a faculty on a specific day.
 * Used in the scheduling form to show which slots can still be booked.
 *
 * @param {string} facultyEmail
 * @param {number} dayNumber
 * @param {string} examId
 * @param {Array}  allScheduleSlots
 * @param {Array}  allSubjects
 * @param {string|null} editingSlotId  - exclude this slot from conflict check (when editing)
 * @returns {Array<{slotInfo, status, session}>}  - All 6 slots with booked/empty status
 */
export function getSlotsAvailabilityForFaculty(facultyEmail, dayNumber, examId, allScheduleSlots, allSubjects, editingSlotId = null) {
  const facultySubjectIds = new Set(
    allSubjects
      .filter(s => s.examId === examId && s.facultyEmail?.toLowerCase() === facultyEmail?.toLowerCase())
      .map(s => s.id)
  );

  const daySlots = allScheduleSlots.filter(s =>
    s.examId === examId &&
    Number(s.dayNumber) === Number(dayNumber) &&
    s.id !== editingSlotId &&
    (
      s.facultyEmail?.toLowerCase() === facultyEmail?.toLowerCase() ||
      facultySubjectIds.has(s.subjectId)
    )
  );

  return STANDARD_TIME_SLOTS.map(stdSlot => {
    const bookedSession = daySlots.find(s => {
      const normalized = normalizeTimeSlot(s.lectureTimeSlot);
      return normalized?.id === stdSlot.id;
    });

    return {
      slotInfo: stdSlot,
      status: bookedSession ? 'booked' : 'empty',
      session: bookedSession || null,
    };
  });
}

/**
 * Get a quick summary: how many booked vs empty slots a faculty has on a specific day
 */
export function getFacultyDaySummary(facultyEmail, dayNumber, examId, allScheduleSlots, allSubjects, editingSlotId = null) {
  const availability = getSlotsAvailabilityForFaculty(facultyEmail, dayNumber, examId, allScheduleSlots, allSubjects, editingSlotId);
  return {
    booked: availability.filter(s => s.status === 'booked').length,
    empty: availability.filter(s => s.status === 'empty').length,
    total: availability.length,
    slots: availability,
  };
}

/**
 * Get a color class map for subject colors (mirrors the SUBJECT_COLOR_MAP in ManageScheduleTab)
 */
export const SUBJECT_COLOR_MAP = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', tag: 'bg-rose-600', badge: 'bg-rose-100 text-rose-800' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', tag: 'bg-purple-600', badge: 'bg-purple-100 text-purple-800' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', tag: 'bg-sky-600', badge: 'bg-sky-100 text-sky-800' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', tag: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', tag: 'bg-amber-600', badge: 'bg-amber-100 text-amber-800' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', tag: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-800' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', tag: 'bg-cyan-600', badge: 'bg-cyan-100 text-cyan-800' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', tag: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800' },
};
