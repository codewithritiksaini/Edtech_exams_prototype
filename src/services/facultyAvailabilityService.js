// =============================================================================
// FACULTY AVAILABILITY SERVICE
// Manages declared teaching windows, date exceptions & availability validation
// Storage Key: medprep_faculty_availability_v1
// Event: medprep-faculty-availability-updated
// =============================================================================

import { 
  STANDARD_TIME_SLOTS, 
  doTimeWindowsOverlap, 
  parseTimeRangeToHours, 
  normalizeTimeSlot 
} from '../utils/scheduleSlotUtils.js';
import { curriculumService } from './curriculumService.js';
import { peopleService } from './peopleService.js';

const STORAGE_KEY = 'medprep_faculty_availability_v1';
const EVENT_NAME = 'medprep-faculty-availability-updated';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_DECLARED_AVAILABILITY = {
  'faculty@demo.com': {
    email: 'faculty@demo.com',
    facultyId: 'fac-1',
    declaredWeeklySlots: {
      Monday: ['slot-morning', 'slot-midday', 'slot-evening'],
      Tuesday: ['slot-morning', 'slot-afternoon', 'slot-evening'],
      Wednesday: ['slot-morning', 'slot-midday', 'slot-late-evening'],
      Thursday: ['slot-morning', 'slot-afternoon', 'slot-evening'],
      Friday: ['slot-morning', 'slot-midday'],
      Saturday: ['slot-morning'],
      Sunday: []
    },
    dateExceptions: [
      {
        id: 'exc-demo-1',
        date: '2026-09-25',
        type: 'UNAVAILABLE',
        reason: 'National Cardiology Symposium Keynote',
        slots: []
      }
    ],
    preferredNoticeDays: 2,
    maxDailySlots: 3,
    lastUpdated: new Date().toISOString()
  },
  'siddharth@demo.com': {
    email: 'siddharth@demo.com',
    facultyId: 'fac-1',
    declaredWeeklySlots: {
      Monday: ['slot-morning', 'slot-evening'],
      Tuesday: ['slot-midday', 'slot-evening'],
      Wednesday: ['slot-morning', 'slot-evening'],
      Thursday: ['slot-morning', 'slot-midday'],
      Friday: ['slot-morning', 'slot-evening'],
      Saturday: ['slot-morning'],
      Sunday: []
    },
    dateExceptions: [],
    preferredNoticeDays: 3,
    maxDailySlots: 2,
    lastUpdated: new Date().toISOString()
  },
  'sarah.jenkins@demo.com': {
    email: 'sarah.jenkins@demo.com',
    facultyId: 'fac-3',
    declaredWeeklySlots: {
      Monday: ['slot-morning', 'slot-midday', 'slot-afternoon'],
      Tuesday: ['slot-morning', 'slot-evening'],
      Wednesday: ['slot-afternoon', 'slot-evening', 'slot-late-evening'],
      Thursday: ['slot-morning', 'slot-midday'],
      Friday: ['slot-morning', 'slot-afternoon'],
      Saturday: [],
      Sunday: []
    },
    dateExceptions: [],
    preferredNoticeDays: 1,
    maxDailySlots: 3,
    lastUpdated: new Date().toISOString()
  }
};

class FacultyAvailabilityService {
  constructor() {
    this.availability = this.load();
  }

  load() {
    try {
      if (typeof localStorage === 'undefined') return DEFAULT_DECLARED_AVAILABILITY;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_DECLARED_AVAILABILITY, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load faculty availability:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DECLARED_AVAILABILITY));
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.availability));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(EVENT_NAME, {
          detail: { availability: this.availability }
        }));
      }
    } catch (e) {
      console.warn('Failed to save faculty availability:', e);
    }
  }

  getAllAvailability() {
    return this.availability;
  }

  /**
   * Helper to resolve faculty identifier (ID or Email) to canonical lowercase email
   */
  resolveFacultyEmail(facultyIdentifier) {
    if (!facultyIdentifier) return '';
    const clean = String(facultyIdentifier).trim().toLowerCase();
    if (clean.includes('@')) return clean;

    try {
      const list = peopleService.getFacultyList();
      const match = list.find(f => f.id?.toLowerCase() === clean);
      if (match?.email) return match.email.toLowerCase().trim();
    } catch (e) {
      // ignore
    }
    return clean;
  }

  getAvailabilityForFaculty(facultyIdentifier) {
    if (!facultyIdentifier) return null;
    const cleanEmail = this.resolveFacultyEmail(facultyIdentifier);
    
    // Exact or fallback matching
    const entry = Object.values(this.availability).find(
      a => a.email?.toLowerCase() === cleanEmail
    );

    if (entry) {
      if (!Array.isArray(entry.dateExceptions)) {
        entry.dateExceptions = [];
      }
      return entry;
    }

    // Return sensible default template for unconfigured faculty
    return {
      email: cleanEmail,
      facultyId: null,
      declaredWeeklySlots: {
        Monday: ['slot-morning', 'slot-evening'],
        Tuesday: ['slot-morning', 'slot-evening'],
        Wednesday: ['slot-morning', 'slot-evening'],
        Thursday: ['slot-morning', 'slot-evening'],
        Friday: ['slot-morning', 'slot-evening'],
        Saturday: ['slot-morning'],
        Sunday: []
      },
      dateExceptions: [],
      preferredNoticeDays: 2,
      maxDailySlots: 3,
      lastUpdated: null
    };
  }

  isSlotDeclaredAvailable(facultyIdentifier, weekday, slotId) {
    const profile = this.getAvailabilityForFaculty(facultyIdentifier);
    if (!profile || !profile.declaredWeeklySlots) return false;
    const daySlots = profile.declaredWeeklySlots[weekday] || [];
    return daySlots.includes(slotId);
  }

  setAvailabilityForFaculty(facultyIdentifier, declaredWeeklySlots, options = {}) {
    if (!facultyIdentifier) return null;
    const cleanEmail = this.resolveFacultyEmail(facultyIdentifier);
    const existing = this.getAvailabilityForFaculty(cleanEmail);
    
    this.availability[cleanEmail] = {
      email: cleanEmail,
      facultyId: options.facultyId || existing?.facultyId || null,
      declaredWeeklySlots,
      dateExceptions: options.dateExceptions || existing?.dateExceptions || [],
      preferredNoticeDays: options.preferredNoticeDays ?? existing?.preferredNoticeDays ?? 2,
      maxDailySlots: options.maxDailySlots ?? existing?.maxDailySlots ?? 3,
      lastUpdated: new Date().toISOString()
    };

    this.save();
    return this.availability[cleanEmail];
  }

  toggleSlot(facultyIdentifier, weekday, slotId) {
    const profile = this.getAvailabilityForFaculty(facultyIdentifier);
    const weeklySlots = { ...profile.declaredWeeklySlots };
    const daySlots = weeklySlots[weekday] ? [...weeklySlots[weekday]] : [];

    if (daySlots.includes(slotId)) {
      weeklySlots[weekday] = daySlots.filter(s => s !== slotId);
    } else {
      weeklySlots[weekday] = [...daySlots, slotId];
    }

    return this.setAvailabilityForFaculty(profile.email, weeklySlots, {
      preferredNoticeDays: profile.preferredNoticeDays,
      maxDailySlots: profile.maxDailySlots,
      dateExceptions: profile.dateExceptions
    });
  }

  setDayAvailability(facultyIdentifier, weekday, isAvailable) {
    const profile = this.getAvailabilityForFaculty(facultyIdentifier);
    const weeklySlots = { ...profile.declaredWeeklySlots };

    if (isAvailable) {
      // Mark all standard clinical slots available for this day
      weeklySlots[weekday] = STANDARD_TIME_SLOTS.map(s => s.id);
    } else {
      // Mark day completely unavailable
      weeklySlots[weekday] = [];
    }

    return this.setAvailabilityForFaculty(profile.email, weeklySlots, {
      preferredNoticeDays: profile.preferredNoticeDays,
      maxDailySlots: profile.maxDailySlots,
      dateExceptions: profile.dateExceptions
    });
  }

  // ---------------------------------------------------------------------------
  // DATE-SPECIFIC EXCEPTIONS (Blackouts & Overrides)
  // ---------------------------------------------------------------------------
  getDateExceptions(facultyIdentifier) {
    const profile = this.getAvailabilityForFaculty(facultyIdentifier);
    return profile?.dateExceptions || [];
  }

  addDateException(facultyIdentifier, exception) {
    const cleanEmail = this.resolveFacultyEmail(facultyIdentifier);
    const profile = this.getAvailabilityForFaculty(cleanEmail);
    const exceptions = Array.isArray(profile?.dateExceptions) ? [...profile.dateExceptions] : [];

    const newException = {
      id: exception.id || `exc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: String(exception.date).trim(), // YYYY-MM-DD
      type: exception.type || 'UNAVAILABLE', // 'UNAVAILABLE' | 'OVERRIDE'
      reason: exception.reason || '',
      slots: exception.slots || [] // allowed slot IDs if type is OVERRIDE
    };

    // Replace if exception on same date already exists
    const existingIdx = exceptions.findIndex(e => e.date === newException.date);
    if (existingIdx !== -1) {
      exceptions[existingIdx] = newException;
    } else {
      exceptions.push(newException);
    }

    return this.setAvailabilityForFaculty(cleanEmail, profile.declaredWeeklySlots, {
      preferredNoticeDays: profile.preferredNoticeDays,
      maxDailySlots: profile.maxDailySlots,
      dateExceptions: exceptions
    });
  }

  removeDateException(facultyIdentifier, exceptionId) {
    const cleanEmail = this.resolveFacultyEmail(facultyIdentifier);
    const profile = this.getAvailabilityForFaculty(cleanEmail);
    const exceptions = (profile?.dateExceptions || []).filter(
      e => e.id !== exceptionId && e.date !== exceptionId
    );

    return this.setAvailabilityForFaculty(cleanEmail, profile.declaredWeeklySlots, {
      preferredNoticeDays: profile.preferredNoticeDays,
      maxDailySlots: profile.maxDailySlots,
      dateExceptions: exceptions
    });
  }

  // ---------------------------------------------------------------------------
  // CENTRAL AVAILABILITY & OVERLAP VALIDATION ENGINE
  // Single source of truth for: "Is this faculty available during this window?"
  // ---------------------------------------------------------------------------
  /**
   * Check if a faculty member is available on a specific date and time slot.
   *
   * @param {string} facultyIdentifier - Email or ID of faculty member
   * @param {string} dateStr           - Date string (YYYY-MM-DD)
   * @param {string} timeSlotOrRange   - Slot ID ("slot-morning") or range ("09:00 AM - 10:30 AM IST")
   * @param {object} options           - { excludeSlotId?: string, ignoreWeeklyDeclaration?: boolean }
   * @returns {{ available: boolean, code: string, reason: string, conflictingSlot?: object, exception?: object }}
   */
  isFacultyAvailable(facultyIdentifier, dateStr, timeSlotOrRange, options = {}) {
    if (!facultyIdentifier) {
      return { available: false, code: 'NO_FACULTY', reason: 'No faculty member specified.' };
    }
    if (!dateStr || !timeSlotOrRange) {
      return { available: false, code: 'INVALID_PARAMETERS', reason: 'Date and time slot are required.' };
    }

    const cleanEmail = this.resolveFacultyEmail(facultyIdentifier);
    const profile = this.getAvailabilityForFaculty(cleanEmail);

    if (!profile) {
      return { available: false, code: 'FACULTY_NOT_FOUND', reason: 'Faculty profile not found.' };
    }

    // Resolve date and weekday
    let formattedDate = String(dateStr).trim();
    let weekday = null;
    try {
      const parts = formattedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
        }
      } else {
        const d = new Date(formattedDate);
        if (!isNaN(d.getTime())) {
          weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
          formattedDate = d.toISOString().split('T')[0];
        }
      }
    } catch (e) {
      console.warn('Date parsing error in availability check:', e);
    }

    // Standard slot matching
    const stdSlot = STANDARD_TIME_SLOTS.find(
      s => s.id === timeSlotOrRange || s.timeRange.toLowerCase() === timeSlotOrRange.toLowerCase()
    );
    const effectiveSlotId = stdSlot?.id || null;
    const effectiveTimeRange = stdSlot?.timeRange || timeSlotOrRange;

    // 1. Check Date Exceptions FIRST
    const exception = (profile.dateExceptions || []).find(e => e.date === formattedDate);
    if (exception) {
      if (exception.type === 'UNAVAILABLE') {
        return {
          available: false,
          code: 'DATE_EXCEPTION_UNAVAILABLE',
          reason: `Faculty is unavailable on ${formattedDate}${exception.reason ? ` (${exception.reason})` : ''}.`,
          exception
        };
      }
      if (exception.type === 'OVERRIDE') {
        const allowedSlots = exception.slots || [];
        if (effectiveSlotId && !allowedSlots.includes(effectiveSlotId)) {
          return {
            available: false,
            code: 'DATE_OVERRIDE_SLOT_NOT_ALLOWED',
            reason: `Time slot ${effectiveTimeRange} is not in the approved override slots for ${formattedDate}.`,
            exception
          };
        }
      }
    }

    // 2. Check Weekly Declared Availability (if no exception override)
    if (!exception && weekday && !options.ignoreWeeklyDeclaration) {
      const declaredDaySlots = profile.declaredWeeklySlots?.[weekday] || [];
      let isDeclared = false;

      if (effectiveSlotId) {
        isDeclared = declaredDaySlots.includes(effectiveSlotId);
      } else {
        // Custom window: check if it overlaps any declared standard slot
        isDeclared = declaredDaySlots.some(declaredId => {
          const s = STANDARD_TIME_SLOTS.find(item => item.id === declaredId);
          return s && doTimeWindowsOverlap(s.timeRange, effectiveTimeRange);
        });
      }

      if (!isDeclared) {
        return {
          available: false,
          code: 'NOT_DECLARED_AVAILABLE',
          reason: `Faculty has not declared availability on ${weekday} for ${effectiveTimeRange}.`
        };
      }
    }

    // 3. Check Existing Bookings / Time Overlap Conflicts across ALL exams
    try {
      const allFacultySlots = curriculumService.getFacultySchedule(cleanEmail);
      const conflictingSlot = allFacultySlots.find(slot => {
        // Exclude slot being edited
        if (options.excludeSlotId && slot.id === options.excludeSlotId) return false;
        // Ignore cancelled sessions
        if (String(slot.status).toLowerCase() === 'cancelled') return false;
        // Check date
        if (slot.scheduledDate !== formattedDate) return false;
        // Check time overlap
        return doTimeWindowsOverlap(slot.lectureTimeSlot, effectiveTimeRange);
      });

      if (conflictingSlot) {
        return {
          available: false,
          code: 'TIME_CONFLICT',
          reason: `Faculty already has a conflicting session: "${conflictingSlot.subjectName || 'Session'}" (${conflictingSlot.lectureTimeSlot}) on Day ${conflictingSlot.dayNumber}.`,
          conflictingSlot
        };
      }
    } catch (e) {
      console.warn('Error verifying schedule conflicts in curriculumService:', e);
    }

    return {
      available: true,
      code: 'AVAILABLE',
      reason: 'Faculty is available for teaching session.'
    };
  }

  /**
   * Validate a proposed booking before saving.
   * Returns { valid: boolean, error?: string, details?: object }
   */
  validateBooking({ facultyEmail, dateStr, timeSlot, excludeSlotId = null }) {
    const result = this.isFacultyAvailable(facultyEmail, dateStr, timeSlot, { excludeSlotId });
    if (!result.available) {
      return {
        valid: false,
        error: result.reason,
        code: result.code,
        details: result
      };
    }
    return {
      valid: true,
      error: null,
      details: result
    };
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail?.availability || this.availability);
    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_NAME, handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EVENT_NAME, handler);
      }
    };
  }
}

export const facultyAvailabilityService = new FacultyAvailabilityService();
