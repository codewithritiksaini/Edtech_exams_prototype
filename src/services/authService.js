// Unified Authentication Service (Phase 5.1 Revised)
// Single login for everyone: Students, Faculty, and Admin.
// System auto-detects account role based on credentials and routes accordingly.

const AUTH_STORAGE_KEY = 'medprep_auth_user';

export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin'
};

export const MOCK_ACCOUNTS = {
  'student@demo.com': {
    email: 'student@demo.com',
    role: USER_ROLES.STUDENT,
    name: 'Dr. Ritik Saini',
    roleLabel: 'Resident Aspirant',
    targetCourse: 'NEET PG & NExT 2026',
    packageTier: 'Standard (6 Months)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
    redirectTo: '/dashboard'
  },
  'faculty@demo.com': {
    email: 'faculty@demo.com',
    role: USER_ROLES.FACULTY,
    name: 'Dr. Siddharth V.',
    roleLabel: 'Clinical Faculty Lead (Cardiology)',
    institution: 'AIIMS New Delhi',
    assignedScope: 'NEET PG & USMLE — Cardiology & ECG (Weeks 1–4)',
    assignedStudentsCount: 680,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&auto=format&fit=crop&q=80',
    redirectTo: '/admin'
  },
  'admin@demo.com': {
    email: 'admin@demo.com',
    role: USER_ROLES.ADMIN,
    name: 'Chief Platform Admin',
    roleLabel: 'Super Admin (Full Access)',
    institution: 'MedPrep Pro HQ',
    assignedScope: 'All 4 Exam Tracks (Global Operations)',
    assignedStudentsCount: 1420,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    redirectTo: '/admin'
  }
};

class AuthService {
  constructor() {
    this.currentUser = this.loadStoredUser();
    this.listeners = new Set();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && MOCK_ACCOUNTS[parsed.email]) {
          return MOCK_ACCOUNTS[parsed.email];
        }
      }
    } catch (e) {
      console.warn('AuthStorage load error', e);
    }
    // Default fallback to admin for seamless testing, or null
    return MOCK_ACCOUNTS['admin@demo.com'];
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getRole() {
    return this.currentUser?.role || USER_ROLES.ADMIN;
  }

  isAdmin() {
    return this.currentUser?.role === USER_ROLES.ADMIN;
  }

  isFaculty() {
    return this.currentUser?.role === USER_ROLES.FACULTY;
  }

  isStudent() {
    return this.currentUser?.role === USER_ROLES.STUDENT;
  }

  login(email) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    let account = MOCK_ACCOUNTS[cleanEmail];

    // If not matching the 3 hardcoded emails exactly, auto-detect by keywords
    if (!account) {
      if (cleanEmail.includes('admin')) {
        account = MOCK_ACCOUNTS['admin@demo.com'];
      } else if (cleanEmail.includes('faculty') || cleanEmail.includes('dr') || cleanEmail.includes('prof')) {
        account = MOCK_ACCOUNTS['faculty@demo.com'];
      } else {
        // Any other email defaults to student account
        account = {
          ...MOCK_ACCOUNTS['student@demo.com'],
          email: cleanEmail || 'student@demo.com'
        };
      }
    }

    this.currentUser = account;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
    } catch (e) {
      console.warn('AuthStorage save error', e);
    }

    this.notifyListeners();
    return account;
  }

  registerFacultyAccount(faculty) {
    if (!faculty || !faculty.email) return;
    const cleanEmail = faculty.email.trim().toLowerCase();
    const newAccount = {
      email: cleanEmail,
      role: USER_ROLES.FACULTY,
      name: faculty.name,
      roleLabel: `Clinical Faculty Specialist`,
      institution: 'MedPrep Faculty Board',
      assignedScope: `${Array.isArray(faculty.assignedExams) ? faculty.assignedExams.join(', ') : faculty.assignedExams} (${faculty.assignedWeeks || 'All Weeks'})`,
      assignedStudentsCount: 680,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      redirectTo: '/admin'
    };
    MOCK_ACCOUNTS[cleanEmail] = newAccount;
    try {
      localStorage.setItem(`medprep_account_${cleanEmail}`, JSON.stringify(newAccount));
    } catch (e) {
      console.warn('Account save error:', e);
    }
  }

  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('AuthStorage clear error', e);
    }
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Error in auth listener', e);
      }
    });
  }
}

export const authService = new AuthService();
