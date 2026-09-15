// =============================================================================
// PEOPLE SERVICE — PHASE 5.3 FACULTY & STUDENT DIRECTORY MANAGEMENT
// Handles Faculty provisioning, granular scoping, and Student progress records
// Persists in localStorage and synchronizes with authService
// =============================================================================

import { authService, USER_ROLES } from './authService.js';
import { curriculumService } from './curriculumService.js';

const STORAGE_KEY_FACULTY = 'medprep_phase5_faculty_v1';
const STORAGE_KEY_STUDENTS = 'medprep_phase5_students_v1';

export const INITIAL_FACULTY = [
  {
    id: 'fac-1',
    name: 'Dr. Siddharth V.',
    email: 'faculty@demo.com',
    specialty: 'MD Cardiology (AIIMS New Delhi)',
    assignedExams: ['neet-pg', 'usmle'],
    assignedExamsLabels: ['NEET PG & NExT', 'USMLE Step 1 & 2'],
    assignedSubjects: ['sub-neet-cardio', 'sub-usmle-cvs'],
    assignedWeeks: 'Weeks 1–4 (Cardiology & ECG)',
    contentUploadedCount: 14,
    liveSessionsCount: 6,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-2',
    name: 'Dr. Ananya Sen',
    email: 'ananya.pharma@demo.com',
    specialty: 'MD Pharmacology (PGI Chandigarh)',
    assignedExams: ['usmle', 'neet-pg'],
    assignedExamsLabels: ['USMLE Step 1 & 2', 'NEET PG & NExT'],
    assignedSubjects: ['sub-neet-pharma', 'sub-usmle-neuro'],
    assignedWeeks: 'Weeks 5–8 (Autonomic & Neuro-Pharm)',
    contentUploadedCount: 22,
    liveSessionsCount: 8,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1594824813689-13e64883395b?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-3',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@demo.com',
    specialty: 'MRCP UK (Lead NHS Clinician)',
    assignedExams: ['plab'],
    assignedExamsLabels: ['PLAB 1 & 2 / UKMLA'],
    assignedSubjects: ['sub-plab-acute'],
    assignedWeeks: 'All Weeks (NHS Guidelines & OSCE)',
    contentUploadedCount: 31,
    liveSessionsCount: 12,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-4',
    name: 'Dr. Elena Rossi',
    email: 'elena.rossi@demo.com',
    specialty: 'MD Internal Medicine (Charité Berlin)',
    assignedExams: ['europe', 'neet-pg'],
    assignedExamsLabels: ['Europe Medical Licensing', 'NEET PG & NExT'],
    assignedSubjects: ['sub-neet-nephro'],
    assignedWeeks: 'All Weeks (FSP & KP Terminology)',
    contentUploadedCount: 8,
    liveSessionsCount: 4,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-5',
    name: 'Dr. Priya Sharma',
    email: 'priya.surgery@demo.com',
    specialty: 'MS General Surgery (KEM Mumbai)',
    assignedExams: ['neet-pg'],
    assignedExamsLabels: ['NEET PG & NExT'],
    assignedSubjects: ['sub-neet-gastro', 'sub-neet-patho'],
    assignedWeeks: 'Weeks 9–12 (Trauma & Operative)',
    contentUploadedCount: 18,
    liveSessionsCount: 5,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'std-1',
    name: 'Dr. Ritik Saini',
    email: 'student@demo.com',
    roll: 'MEDPREP-2026-NEET-0428',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    packageTier: 'Standard Tier',
    duration: '6 Months',
    progress: 42,
    enrollmentDate: '12 Aug 2026',
    expiryDate: '12 Feb 2027',
    status: 'Active',
    mockScore: '76 / 100',
    percentile: '94.2%ile',
    liveAttendance: '4 of 6 sessions (66.7%)',
    weekProgress: [
      { week: 'Week 1 — Cardiology Basics', completion: 100 },
      { week: 'Week 2 — Valvular Diseases', completion: 70 },
      { week: 'Week 3 — Arrhythmias & ECG', completion: 40 },
      { week: 'Week 4 — Heart Failure', completion: 0 }
    ],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-2',
    name: 'Dr. Kabir Anand',
    email: 'kabir.anand@demo.com',
    roll: 'MEDPREP-2026-USMLE-0112',
    examId: 'usmle',
    examName: 'USMLE Step 1 & 2 CK',
    packageTier: 'Premium Tier',
    duration: '12 Months',
    progress: 58,
    enrollmentDate: '01 Jul 2026',
    expiryDate: '01 Jul 2027',
    status: 'Active',
    mockScore: '88 / 100',
    percentile: '98.5%ile',
    liveAttendance: '6 of 6 sessions (100%)',
    weekProgress: [
      { week: 'Week 1 — Biochemistry & Genetics', completion: 100 },
      { week: 'Week 2 — Immunology & Pathology', completion: 100 },
      { week: 'Week 3 — Cardiovascular Systems', completion: 60 },
      { week: 'Week 4 — Renal & Respiratory', completion: 15 }
    ],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-3',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@demo.com',
    roll: 'MEDPREP-2026-PLAB-0891',
    examId: 'plab',
    examName: 'PLAB 1 & 2 / UKMLA',
    packageTier: 'Standard Tier',
    duration: '6 Months',
    progress: 65,
    enrollmentDate: '15 Jun 2026',
    expiryDate: '15 Dec 2026',
    status: 'Active',
    mockScore: '82 / 100',
    percentile: '96.1%ile',
    liveAttendance: '5 of 6 sessions (83.3%)',
    weekProgress: [
      { week: 'Week 1 — NHS Clinical Guidelines', completion: 100 },
      { week: 'Week 2 — BNF Pharmacology', completion: 100 },
      { week: 'Week 3 — Acute Medicine Scenarios', completion: 80 },
      { week: 'Week 4 — OSCE Communication Station', completion: 35 }
    ],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-4',
    name: 'Dr. Lukas Weber',
    email: 'lukas.weber@demo.com',
    roll: 'MEDPREP-2026-EUR-0344',
    examId: 'europe',
    examName: 'Europe Medical Licensing',
    packageTier: 'Basic Tier',
    duration: '3 Months',
    progress: 19,
    enrollmentDate: '28 Aug 2026',
    expiryDate: '28 Nov 2026',
    status: 'Active',
    mockScore: '64 / 100',
    percentile: '82.0%ile',
    liveAttendance: '2 of 6 sessions (33.3%)',
    weekProgress: [
      { week: 'Week 1 — FSP Medical Terminology', completion: 65 },
      { week: 'Week 2 — Anamnesis & Case History', completion: 20 },
      { week: 'Week 3 — Clinical Examination (KP)', completion: 0 },
      { week: 'Week 4 — Pharmacotherapy & Law', completion: 0 }
    ],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-5',
    name: 'Dr. Pooja Verma',
    email: 'pooja.verma@demo.com',
    roll: 'MEDPREP-2026-NEET-0914',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    packageTier: 'Premium Tier',
    duration: '12 Months',
    progress: 74,
    enrollmentDate: '10 May 2026',
    expiryDate: '10 May 2027',
    status: 'Active',
    mockScore: '92 / 100',
    percentile: '99.4%ile',
    liveAttendance: '6 of 6 sessions (100%)',
    weekProgress: [
      { week: 'Week 1 — Cardiology & ECG', completion: 100 },
      { week: 'Week 2 — Neurology & CNS', completion: 100 },
      { week: 'Week 3 — Endocrinology & Metabolic', completion: 90 },
      { week: 'Week 4 — Nephrology & Electrolytes', completion: 60 }
    ],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-6',
    name: 'Dr. David Miller',
    email: 'david.miller@demo.com',
    roll: 'MEDPREP-2026-USMLE-0782',
    examId: 'usmle',
    examName: 'USMLE Step 1 & 2 CK',
    packageTier: 'Standard Tier',
    duration: '6 Months',
    progress: 52,
    enrollmentDate: '05 Aug 2026',
    expiryDate: '05 Feb 2027',
    status: 'Active',
    mockScore: '84 / 100',
    percentile: '95.0%ile',
    liveAttendance: '4 of 6 sessions (66.7%)',
    weekProgress: [
      { week: 'Week 1 — Organ Physiology', completion: 100 },
      { week: 'Week 2 — Clinical Pharmacology', completion: 80 },
      { week: 'Week 3 — Diagnostic Reasoning', completion: 50 },
      { week: 'Week 4 — Behavioral Sciences', completion: 10 }
    ],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'std-7',
    name: 'Dr. Matteo Conti',
    email: 'matteo.conti@demo.com',
    roll: 'MEDPREP-2026-EUR-0105',
    examId: 'europe',
    examName: 'Europe Medical Licensing',
    packageTier: 'Standard Tier',
    duration: '6 Months',
    progress: 28,
    enrollmentDate: '10 Feb 2026',
    expiryDate: '10 Aug 2026',
    status: 'Expired',
    mockScore: '68 / 100',
    percentile: '85.2%ile',
    liveAttendance: '3 of 6 sessions (50.0%)',
    weekProgress: [
      { week: 'Week 1 — Medical German Foundations', completion: 80 },
      { week: 'Week 2 — Case Documentation', completion: 30 },
      { week: 'Week 3 — Emergency Protocols', completion: 0 },
      { week: 'Week 4 — Clinical Interview Simulation', completion: 0 }
    ],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
];

export const peopleService = {
  // =========================================================================
  // FACULTY MANAGEMENT
  // =========================================================================
  getFacultyList: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FACULTY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Faculty storage read error:', e);
    }
    return INITIAL_FACULTY;
  },

  getFaculty: () => {
    return peopleService.getFacultyList();
  },

  saveFaculty: (facultyData) => {
    const list = peopleService.getFacultyList();
    let updated;
    const existingIndex = list.findIndex(f => f.id === facultyData.id);
    const existingRecord = existingIndex !== -1 ? list[existingIndex] : null;
    // Partial updates (e.g. only assignedExams) must not wipe fields that weren't passed
    const assignedSubjects = facultyData.assignedSubjects !== undefined
      ? facultyData.assignedSubjects
      : (existingRecord?.assignedSubjects || []);
    const effectiveEmail = facultyData.email ?? existingRecord?.email;
    const effectiveName = facultyData.name ?? existingRecord?.name;

    if (existingIndex !== -1) {
      updated = [...list];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...facultyData,
        assignedSubjects
      };
    } else {
      const newFaculty = {
        id: `fac-${Date.now()}`,
        name: facultyData.name,
        email: facultyData.email.trim().toLowerCase(),
        specialty: facultyData.specialty || 'MD Clinical Specialist',
        assignedExams: facultyData.assignedExams || ['neet-pg'],
        assignedExamsLabels: facultyData.assignedExamsLabels || ['NEET PG & NExT'],
        assignedSubjects,
        assignedWeeks: facultyData.assignedWeeks || 'All Weeks',
        contentUploadedCount: 0,
        liveSessionsCount: 0,
        status: facultyData.status || 'Active',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'
      };
      updated = [newFaculty, ...list];
    }

    try {
      localStorage.setItem(STORAGE_KEY_FACULTY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-people-updated', { detail: { type: 'faculty', data: updated } }));
    } catch (e) {
      console.warn('Faculty write error:', e);
    }

    // Connect with curriculumService: synchronize subject assignment so subjects know who is teaching them!
    if (effectiveEmail) {
      try {
        curriculumService.assignFacultyToSubjects(effectiveEmail, effectiveName, assignedSubjects);
      } catch (e) {
        console.warn('Curriculum faculty sync error:', e);
      }

      // Connect with authService: register account so this email can immediately log in!
      authService.registerFacultyAccount?.({
        email: effectiveEmail,
        name: effectiveName,
        assignedExams: facultyData.assignedExamsLabels || facultyData.assignedExams || existingRecord?.assignedExamsLabels || existingRecord?.assignedExams,
        assignedSubjects,
        assignedWeeks: facultyData.assignedWeeks || existingRecord?.assignedWeeks
      });
    }

    return updated;
  },

  getCurrentFacultyProfile: () => {
    try {
      const user = authService.getCurrentUser();
      const list = peopleService.getFacultyList();
      if (!user) return list[0];
      const found = list.find(f => f.email?.toLowerCase() === user.email?.toLowerCase());
      return found || list[0];
    } catch (e) {
      return INITIAL_FACULTY[0];
    }
  },

  getFacultyAssignedSubjects: (facultyEmail) => {
    const list = peopleService.getFacultyList();
    const fac = list.find(f => f.email?.toLowerCase() === facultyEmail?.toLowerCase());
    return fac?.assignedSubjects || [];
  },

  toggleFacultyStatus: (id) => {
    const list = peopleService.getFacultyList();
    const updated = list.map(fac => {
      if (fac.id === id) {
        return { ...fac, status: fac.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return fac;
    });

    try {
      localStorage.setItem(STORAGE_KEY_FACULTY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-people-updated', { detail: { type: 'faculty', data: updated } }));
    } catch (e) {
      console.warn('Faculty toggle error:', e);
    }
    return updated;
  },

  removeFaculty: (id) => {
    const list = peopleService.getFacultyList();
    const target = list.find(f => f.id === id);
    if (!target) return { success: false, reason: 'Faculty member not found.' };

    // Protective rule: If faculty has already uploaded content, trigger warning
    if ((target.contentUploadedCount || 0) > 0) {
      return {
        success: false,
        reason: `This faculty member has uploaded ${target.contentUploadedCount} learning units for ${target.assignedExamsLabels?.join(' & ') || 'their assigned track'}. Their content will remain, but reassign new uploads to another faculty member before removing.`,
        hasUploadedContent: true,
        faculty: target
      };
    }

    const updated = list.filter(f => f.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_FACULTY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-people-updated', { detail: { type: 'faculty', data: updated } }));
    } catch (e) {
      console.warn('Faculty remove error:', e);
    }
    return { success: true, updated };
  },

  // =========================================================================
  // STUDENT MANAGEMENT
  // =========================================================================
  getStudents: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Student storage read error:', e);
    }
    return INITIAL_STUDENTS;
  },

  // Auto-scoping for Faculty (e.g. Dr. Siddharth V. assigned to neet-pg & usmle)
  getStudentsForScope: (assignedExams) => {
    const all = peopleService.getStudents();
    if (!assignedExams || assignedExams.length === 0) return all;
    return all.filter(s => assignedExams.includes(s.examId));
  },

  extendStudentPackage: (studentId, additionalMonths = 3) => {
    const list = peopleService.getStudents();
    const updated = list.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          duration: `${parseInt(s.duration) + additionalMonths} Months`,
          expiryDate: '15 Aug 2027 (Extended)',
          status: 'Active'
        };
      }
      return s;
    });

    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-people-updated', { detail: { type: 'students', data: updated } }));
    } catch (e) {
      console.warn('Student extend error:', e);
    }
    return updated;
  },

  updateStudentPackageTier: (studentId, newTier) => {
    const list = peopleService.getStudents();
    const updated = list.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          packageTier: newTier
        };
      }
      return s;
    });

    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-people-updated', { detail: { type: 'students', data: updated } }));
    } catch (e) {
      console.warn('Student tier update error:', e);
    }
    return updated;
  },

  toggleStudentStatus: (studentId) => {
    const list = peopleService.getStudents();
    const updated = list.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: s.status === 'Active' ? 'Expired' : 'Active'
        };
      }
      return s;
    });

    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-people-updated', { detail: { type: 'students', data: updated } }));
    } catch (e) {
      console.warn('Student toggle error:', e);
    }
    return updated;
  },

  // =========================================================================
  // REACTIVE EVENT LISTENER
  // =========================================================================
  subscribe: (callback) => {
    const handler = (e) => {
      callback({
        faculty: peopleService.getFacultyList(),
        students: peopleService.getStudents(),
        detail: e.detail
      });
    };
    window.addEventListener('medprep-people-updated', handler);
    return () => window.removeEventListener('medprep-people-updated', handler);
  }
};
