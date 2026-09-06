// =============================================================================
// LIVE SESSIONS SERVICE — PHASE 5.5 LIVE GRAND ROUNDS PIPELINE
// Manages Live Grand Rounds, Faculty Assignments, and Recording Archives
// Persists in localStorage and syncs with Day Content View (Phase 4) and Dashboard
// =============================================================================

import { contentService } from './contentService';

const STORAGE_KEY_LIVE = 'medprep_live_sessions_v1';

export const INITIAL_LIVE_SESSIONS = [
  {
    id: 'live-101',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    weekId: '1',
    dayId: '3',
    topic: 'STEMI Pathways, Arrhythmias & Door-to-Balloon Decision Drills',
    date: '2026-09-06',
    time: '20:00 IST',
    duration: '1.5 hours',
    faculty: 'Dr. Siddharth V. (MD, DM Interventional Cardiology)',
    facultyId: 'fac-1',
    meetingLink: 'https://meet.google.com/medprep-stemi-grand-round',
    packageTier: 'Standard & Premium Only',
    status: 'Live Soon',
    badge: 'Tonight',
    attendeesCount: 342,
    recordingUrl: null,
    isCompleted: false
  },
  {
    id: 'live-102',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    weekId: '1',
    dayId: '2',
    topic: 'ECG Masterclass: Distinguishing VT from SVT with Aberrancy',
    date: '2026-09-05',
    time: '19:30 IST',
    duration: '1 hour',
    faculty: 'Dr. Ananya Sen (MD General Medicine, AIIMS)',
    facultyId: 'fac-2',
    meetingLink: 'https://meet.google.com/medprep-ecg-mastery',
    packageTier: 'All Students of this Exam',
    status: 'Completed',
    badge: 'Recorded',
    attendeesCount: 418,
    recordingUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&auto=format&fit=crop&q=80',
    isCompleted: true
  },
  {
    id: 'live-103',
    examId: 'usmle',
    examName: 'USMLE Step 1 & 2 CK',
    weekId: '1',
    dayId: '1',
    topic: 'Cardiac Hemodynamics, Wiggers Curves & Pressure-Volume Shifts',
    date: '2026-09-07',
    time: '21:00 IST',
    duration: '1.5 hours',
    faculty: 'Dr. Marcus Vance (MD, FACC)',
    facultyId: 'fac-3',
    meetingLink: 'https://meet.google.com/usmle-hemodynamics-live',
    packageTier: 'All Premium Students',
    status: 'Upcoming',
    badge: 'Tomorrow',
    attendeesCount: 290,
    recordingUrl: null,
    isCompleted: false
  },
  {
    id: 'live-104',
    examId: 'plab',
    examName: 'PLAB 1 & 2 / UKMLA',
    weekId: '1',
    dayId: '1',
    topic: 'NHS Chest Pain Triage, NICE Guidelines & Sepsis 6 Simulation',
    date: '2026-09-08',
    time: '18:30 IST',
    duration: '2 hours',
    faculty: 'Dr. Priya Sharma (MRCP, UK NHS Consultant)',
    facultyId: 'fac-5',
    meetingLink: 'https://meet.google.com/plab-nhs-triage',
    packageTier: 'All Students of this Exam',
    status: 'Upcoming',
    badge: 'Scheduled',
    attendeesCount: 215,
    recordingUrl: null,
    isCompleted: false
  },
  {
    id: 'live-105',
    examId: 'europe',
    examName: 'Europe Medical Licensing',
    weekId: '1',
    dayId: '1',
    topic: 'FSP Ärztliche Kommunikation: Anamnese & Symptome Simulation',
    date: '2026-09-09',
    time: '19:00 IST',
    duration: '1 hour',
    faculty: 'Dr. Elena Rossi (MD, Approbation Specialist)',
    facultyId: 'fac-4',
    meetingLink: 'https://meet.google.com/europe-fsp-anamnese',
    packageTier: 'Standard & Premium Only',
    status: 'Upcoming',
    badge: 'Scheduled',
    attendeesCount: 164,
    recordingUrl: null,
    isCompleted: false
  }
];

class LiveSessionsService {
  constructor() {
    this.sessions = this.loadSessions();
  }

  loadSessions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIVE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Live sessions read error:', e);
    }
    return [...INITIAL_LIVE_SESSIONS];
  }

  saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY_LIVE, JSON.stringify(this.sessions));
      window.dispatchEvent(new CustomEvent('medprep-live-sessions-updated', { detail: this.sessions }));
    } catch (e) {
      console.warn('Live sessions save error:', e);
    }
  }

  getAllSessions() {
    return [...this.sessions];
  }

  getSessions(examFilter = 'all', statusFilter = 'all', allowedExams = null) {
    return this.sessions.filter((session) => {
      // Role-based scoping: If allowedExams is provided (for faculty), restrict to those
      if (allowedExams && !allowedExams.includes(session.examId)) {
        return false;
      }
      if (examFilter !== 'all' && session.examId !== examFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'Upcoming' && session.status !== 'Upcoming' && session.status !== 'Live Soon') {
          return false;
        }
        if (statusFilter === 'Completed' && session.status !== 'Completed') {
          return false;
        }
        if (statusFilter === 'Live Soon' && session.status !== 'Live Soon') {
          return false;
        }
      }
      return true;
    });
  }

  addSession(data) {
    const newSession = {
      id: `live-${Date.now()}`,
      examId: data.examId || 'neet-pg',
      examName: data.examName || 'NEET PG & NExT 2026',
      weekId: String(data.weekId || '1'),
      dayId: String(data.dayId || '1'),
      topic: data.topic,
      date: data.date,
      time: data.time.includes('IST') ? data.time : `${data.time} IST`,
      duration: data.duration || '1 hour',
      faculty: data.faculty || 'Dr. Siddharth V.',
      facultyId: data.facultyId || 'fac-1',
      meetingLink: data.meetingLink || 'https://meet.google.com/medprep-live-room',
      packageTier: data.packageTier || 'All Enrolled Students',
      status: 'Upcoming',
      badge: 'Scheduled',
      attendeesCount: 0,
      recordingUrl: null,
      isCompleted: false
    };

    this.sessions = [newSession, ...this.sessions];
    this.saveSessions();

    // Sync directly with Day Content Store (Phase 4 bridge)
    try {
      const day = contentService.getDayContent(newSession.dayId);
      if (day) {
        day.live = {
          hasSession: true,
          isScheduled: true,
          title: newSession.topic,
          time: `${newSession.date} @ ${newSession.time}`,
          faculty: newSession.faculty,
          duration: newSession.duration,
          attendeesCount: 120,
          recordingAvailable: false,
          badge: 'Upcoming Grand Rounds'
        };
        contentService.saveStore();
      }
    } catch (e) {
      console.warn('Sync with DayContent error:', e);
    }

    return newSession;
  }

  uploadRecording(sessionId, recordingUrl) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.recordingUrl = recordingUrl || 'https://medprep.storage/recordings/grand-round-archive.mp4';
    session.status = 'Completed';
    session.isCompleted = true;
    session.badge = 'Recorded';
    this.saveSessions();

    // Update Day Content Store (Phase 4 bridge)
    try {
      const day = contentService.getDayContent(session.dayId);
      if (day) {
        day.live = {
          hasSession: true,
          isScheduled: false,
          recordingAvailable: true,
          title: session.topic,
          faculty: session.faculty,
          duration: session.duration,
          recordingUrl: session.recordingUrl,
          badge: 'Recorded Masterclass'
        };
        contentService.saveStore();
      }
    } catch (e) {
      console.warn('Sync recording error:', e);
    }

    return session;
  }

  cancelSession(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    this.saveSessions();

    if (session) {
      try {
        const day = contentService.getDayContent(session.dayId);
        if (day) {
          day.live = { hasSession: false };
          contentService.saveStore();
        }
      } catch (e) {
        console.warn('Sync cancel error:', e);
      }
    }
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.sessions);
    window.addEventListener('medprep-live-sessions-updated', handler);
    return () => window.removeEventListener('medprep-live-sessions-updated', handler);
  }
}

export const liveSessionsService = new LiveSessionsService();
