// =============================================================================
// FACULTY AVAILABILITY SERVICE
// Manages declared teaching windows & availability preferences for faculty
// Storage Key: medprep_faculty_availability_v1
// Event: medprep-faculty-availability-updated
// =============================================================================

import { STANDARD_TIME_SLOTS } from '../utils/scheduleSlotUtils';

const STORAGE_KEY = 'medprep_faculty_availability_v1';
const EVENT_NAME = 'medprep-faculty-availability-updated';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_DECLARED_AVAILABILITY = {
  'faculty@demo.com': {
    email: 'faculty@demo.com',
    declaredWeeklySlots: {
      Monday: ['slot-morning', 'slot-midday', 'slot-evening'],
      Tuesday: ['slot-morning', 'slot-afternoon', 'slot-evening'],
      Wednesday: ['slot-morning', 'slot-midday', 'slot-late-evening'],
      Thursday: ['slot-morning', 'slot-afternoon', 'slot-evening'],
      Friday: ['slot-morning', 'slot-midday'],
      Saturday: ['slot-morning'],
      Sunday: []
    },
    preferredNoticeDays: 2,
    maxDailySlots: 3,
    lastUpdated: new Date().toISOString()
  },
  'siddharth@demo.com': {
    email: 'siddharth@demo.com',
    declaredWeeklySlots: {
      Monday: ['slot-morning', 'slot-evening'],
      Tuesday: ['slot-midday', 'slot-evening'],
      Wednesday: ['slot-morning', 'slot-evening'],
      Thursday: ['slot-morning', 'slot-midday'],
      Friday: ['slot-morning', 'slot-evening'],
      Saturday: ['slot-morning'],
      Sunday: []
    },
    preferredNoticeDays: 3,
    maxDailySlots: 2,
    lastUpdated: new Date().toISOString()
  },
  'sarah.jenkins@demo.com': {
    email: 'sarah.jenkins@demo.com',
    declaredWeeklySlots: {
      Monday: ['slot-morning', 'slot-midday', 'slot-afternoon'],
      Tuesday: ['slot-morning', 'slot-evening'],
      Wednesday: ['slot-afternoon', 'slot-evening', 'slot-late-evening'],
      Thursday: ['slot-morning', 'slot-midday'],
      Friday: ['slot-morning', 'slot-afternoon'],
      Saturday: [],
      Sunday: []
    },
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.availability));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { availability: this.availability }
      }));
    } catch (e) {
      console.warn('Failed to save faculty availability:', e);
    }
  }

  getAllAvailability() {
    return this.availability;
  }

  getAvailabilityForFaculty(facultyEmail) {
    if (!facultyEmail) return null;
    const cleanEmail = facultyEmail.toLowerCase().trim();
    
    // Exact or fallback matching
    const entry = Object.values(this.availability).find(
      a => a.email?.toLowerCase() === cleanEmail
    );

    if (entry) return entry;

    // Return sensible default template for unconfigured faculty
    return {
      email: cleanEmail,
      declaredWeeklySlots: {
        Monday: ['slot-morning', 'slot-evening'],
        Tuesday: ['slot-morning', 'slot-evening'],
        Wednesday: ['slot-morning', 'slot-evening'],
        Thursday: ['slot-morning', 'slot-evening'],
        Friday: ['slot-morning', 'slot-evening'],
        Saturday: ['slot-morning'],
        Sunday: []
      },
      preferredNoticeDays: 2,
      maxDailySlots: 3,
      lastUpdated: null
    };
  }

  isSlotDeclaredAvailable(facultyEmail, weekday, slotId) {
    const profile = this.getAvailabilityForFaculty(facultyEmail);
    if (!profile || !profile.declaredWeeklySlots) return false;
    const daySlots = profile.declaredWeeklySlots[weekday] || [];
    return daySlots.includes(slotId);
  }

  setAvailabilityForFaculty(facultyEmail, declaredWeeklySlots, options = {}) {
    if (!facultyEmail) return;
    const cleanEmail = facultyEmail.toLowerCase().trim();
    
    this.availability[cleanEmail] = {
      email: cleanEmail,
      declaredWeeklySlots,
      preferredNoticeDays: options.preferredNoticeDays || 2,
      maxDailySlots: options.maxDailySlots || 3,
      lastUpdated: new Date().toISOString()
    };

    this.save();
    return this.availability[cleanEmail];
  }

  toggleSlot(facultyEmail, weekday, slotId) {
    const profile = this.getAvailabilityForFaculty(facultyEmail);
    const weeklySlots = { ...profile.declaredWeeklySlots };
    const daySlots = weeklySlots[weekday] ? [...weeklySlots[weekday]] : [];

    if (daySlots.includes(slotId)) {
      weeklySlots[weekday] = daySlots.filter(s => s !== slotId);
    } else {
      weeklySlots[weekday] = [...daySlots, slotId];
    }

    return this.setAvailabilityForFaculty(facultyEmail, weeklySlots, {
      preferredNoticeDays: profile.preferredNoticeDays,
      maxDailySlots: profile.maxDailySlots
    });
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail?.availability || this.availability);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }
}

export const facultyAvailabilityService = new FacultyAvailabilityService();
