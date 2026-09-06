// =============================================================================
// CATALOG SERVICE — PHASE 5.2 UNIFIED CATALOG MANAGEMENT
// Manages Exams (Master Tracks) and Packages (Pricing Tiers & Feature Toggles)
// Persists in localStorage with cross-component reactivity
// =============================================================================

const STORAGE_KEY_EXAMS = 'medprep_catalog_exams_v1';
const STORAGE_KEY_PACKAGES = 'medprep_catalog_packages_v1';

export const INITIAL_EXAMS = [
  {
    id: 'neet-pg',
    name: 'NEET PG & NExT',
    country: 'India',
    flag: '🇮🇳',
    regionCode: 'IN',
    currency: '₹',
    tag: 'National Board of Examinations',
    description: 'Targeted clinical revision and grand test series structured for Indian postgraduate residency.',
    weeks: 28,
    packagesCount: 3,
    enrolledStudents: 680,
    status: 'Active',
    startingPrice: '₹14,999',
    popular: true
  },
  {
    id: 'usmle',
    name: 'USMLE Step 1 & Step 2 CK',
    country: 'United States',
    flag: '🇺🇸',
    regionCode: 'US',
    currency: '$',
    tag: 'ECFMG / FSMB Aligned',
    description: 'Organ-system integrated modules and clinical reasoning aligned with USMLE exam standards.',
    weeks: 24,
    packagesCount: 3,
    enrolledStudents: 420,
    status: 'Active',
    startingPrice: '$299',
    popular: false
  },
  {
    id: 'plab',
    name: 'PLAB 1 & 2 / UKMLA',
    country: 'United Kingdom',
    flag: '🇬🇧',
    regionCode: 'UK',
    currency: '£',
    tag: 'General Medical Council (GMC)',
    description: 'Targeted NHS clinical guidelines, communication skills, and high-yield OSCE station drills.',
    weeks: 16,
    packagesCount: 3,
    enrolledStudents: 320,
    status: 'Active',
    startingPrice: '£189',
    popular: false
  },
  {
    id: 'europe',
    name: 'Europe Medical Licensing',
    country: 'Europe',
    flag: '🇪🇺',
    regionCode: 'EU',
    currency: '€',
    tag: 'Germany (FSP/KP), Italy & EU',
    description: 'Navigate language medical terminology, Approbation exam prep, and clinical hospital pathways.',
    weeks: 12,
    packagesCount: 3,
    enrolledStudents: 195,
    status: 'Active',
    startingPrice: '€249',
    popular: false
  }
];

export const INITIAL_PACKAGES = [
  // NEET PG
  {
    id: 'neet-pg-basic',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT',
    name: 'Basic Tier',
    price: 14999,
    formattedPrice: '₹14,999',
    duration: '3 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: false,
      liveSessions: false,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 180,
    status: 'Active'
  },
  {
    id: 'neet-pg-standard',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT',
    name: 'Standard Tier',
    price: 22999,
    formattedPrice: '₹22,999',
    duration: '6 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: false,
      testSeries: true
    },
    popular: true,
    activeSubscribers: 340,
    status: 'Active'
  },
  {
    id: 'neet-pg-premium',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT',
    name: 'Premium Tier',
    price: 34999,
    formattedPrice: '₹34,999',
    duration: '12 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: true,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 160,
    status: 'Active'
  },

  // USMLE
  {
    id: 'usmle-basic',
    examId: 'usmle',
    examName: 'USMLE Step 1 & Step 2 CK',
    name: 'Basic Tier',
    price: 299,
    formattedPrice: '$299',
    duration: '3 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: false,
      liveSessions: false,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 95,
    status: 'Active'
  },
  {
    id: 'usmle-standard',
    examId: 'usmle',
    examName: 'USMLE Step 1 & Step 2 CK',
    name: 'Standard Tier',
    price: 469,
    formattedPrice: '$469',
    duration: '6 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: false,
      testSeries: true
    },
    popular: true,
    activeSubscribers: 215,
    status: 'Active'
  },
  {
    id: 'usmle-premium',
    examId: 'usmle',
    examName: 'USMLE Step 1 & Step 2 CK',
    name: 'Premium Tier',
    price: 689,
    formattedPrice: '$689',
    duration: '12 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: true,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 110,
    status: 'Active'
  },

  // PLAB
  {
    id: 'plab-basic',
    examId: 'plab',
    examName: 'PLAB 1 & 2 / UKMLA',
    name: 'Basic Tier',
    price: 189,
    formattedPrice: '£189',
    duration: '3 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: false,
      liveSessions: false,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 75,
    status: 'Active'
  },
  {
    id: 'plab-standard',
    examId: 'plab',
    examName: 'PLAB 1 & 2 / UKMLA',
    name: 'Standard Tier',
    price: 299,
    formattedPrice: '£299',
    duration: '6 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: false,
      testSeries: true
    },
    popular: true,
    activeSubscribers: 165,
    status: 'Active'
  },
  {
    id: 'plab-premium',
    examId: 'plab',
    examName: 'PLAB 1 & 2 / UKMLA',
    name: 'Premium Tier',
    price: 440,
    formattedPrice: '£440',
    duration: '12 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: true,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 80,
    status: 'Active'
  },

  // EUROPE
  {
    id: 'europe-basic',
    examId: 'europe',
    examName: 'Europe Medical Licensing',
    name: 'Basic Tier',
    price: 249,
    formattedPrice: '€249',
    duration: '3 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: false,
      liveSessions: false,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 45,
    status: 'Active'
  },
  {
    id: 'europe-standard',
    examId: 'europe',
    examName: 'Europe Medical Licensing',
    name: 'Standard Tier',
    price: 389,
    formattedPrice: '€389',
    duration: '6 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: false,
      testSeries: true
    },
    popular: true,
    activeSubscribers: 95,
    status: 'Active'
  },
  {
    id: 'europe-premium',
    examId: 'europe',
    examName: 'Europe Medical Licensing',
    name: 'Premium Tier',
    price: 549,
    formattedPrice: '€549',
    duration: '12 Months',
    features: {
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: true,
      testSeries: true
    },
    popular: false,
    activeSubscribers: 55,
    status: 'Active'
  }
];

export const catalogService = {
  // =========================================================================
  // EXAMS MANAGEMENT
  // =========================================================================
  getExams: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXAMS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Catalog storage read error (exams):', e);
    }
    return INITIAL_EXAMS;
  },

  getActiveExams: () => {
    return catalogService.getExams().filter(e => e.status === 'Active');
  },

  getExamById: (id) => {
    const exams = catalogService.getExams();
    return exams.find(e => e.id === id) || exams[0];
  },

  getCurrencyForExam: (examId) => {
    const exam = catalogService.getExamById(examId);
    if (!exam) return '₹';
    if (exam.currency) return exam.currency;
    if (exam.regionCode === 'US' || exam.country.includes('United States')) return '$';
    if (exam.regionCode === 'UK' || exam.country.includes('United Kingdom')) return '£';
    if (exam.regionCode === 'EU' || exam.country.includes('Europe')) return '€';
    return '₹';
  },

  saveExam: (examData) => {
    const exams = catalogService.getExams();
    let updated;
    const existingIndex = exams.findIndex(e => e.id === examData.id);

    if (existingIndex !== -1) {
      updated = [...exams];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...examData
      };
    } else {
      const newId = examData.id || examData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newExam = {
        id: newId,
        name: examData.name,
        country: examData.country || 'Global',
        flag: examData.flag || '🌐',
        regionCode: examData.regionCode || 'GL',
        currency: examData.currency || '₹',
        tag: examData.tag || 'Medical Council Aligned',
        description: examData.description || 'Comprehensive clinical modules and licensing assessment preparation.',
        weeks: examData.weeks || 24,
        packagesCount: 0,
        enrolledStudents: 0,
        status: examData.status || 'Active',
        startingPrice: examData.startingPrice || '₹14,999',
        popular: Boolean(examData.popular)
      };
      updated = [newExam, ...exams];
    }

    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-catalog-updated', { detail: { type: 'exams', data: updated } }));
    } catch (e) {
      console.warn('Catalog storage write error (exams):', e);
    }
    return updated;
  },

  toggleExamStatus: (id) => {
    const exams = catalogService.getExams();
    const updated = exams.map(exam => {
      if (exam.id === id) {
        const nextStatus = exam.status === 'Active' ? 'Inactive' : 'Active';
        return { ...exam, status: nextStatus };
      }
      return exam;
    });

    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-catalog-updated', { detail: { type: 'exams', data: updated } }));
    } catch (e) {
      console.warn('Catalog storage toggle error (exams):', e);
    }
    return updated;
  },

  deleteExam: (id) => {
    const exams = catalogService.getExams();
    const exam = exams.find(e => e.id === id);
    if (!exam) return { success: false, reason: 'Exam track not found.' };

    const packages = catalogService.getPackages(id);
    const hasActivePackages = packages.length > 0;
    const hasEnrolledStudents = (exam.enrolledStudents || 0) > 0;

    // Rule: Attempting to delete an Exam that already has Packages/Students tied to it
    // should show a warning: "This exam has active packages and enrolled students. Deactivate instead of deleting."
    if (hasActivePackages || hasEnrolledStudents) {
      return {
        success: false,
        reason: 'This exam has active packages and enrolled students. Deactivate instead of deleting.',
        hasDependents: true
      };
    }

    const updated = exams.filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-catalog-updated', { detail: { type: 'exams', data: updated } }));
    } catch (e) {
      console.warn('Catalog storage delete error (exams):', e);
    }
    return { success: true, updated };
  },

  // =========================================================================
  // PACKAGES MANAGEMENT
  // =========================================================================
  getAllPackages: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PACKAGES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Catalog storage read error (packages):', e);
    }
    return INITIAL_PACKAGES;
  },

  getPackages: (examId) => {
    const all = catalogService.getAllPackages();
    if (!examId || examId === 'all') return all;
    return all.filter(p => p.examId === examId);
  },

  getActivePackages: (examId) => {
    const packages = catalogService.getPackages(examId);
    return packages.filter(p => p.status === 'Active');
  },

  savePackage: (pkgData) => {
    const packages = catalogService.getAllPackages();
    let updated;
    const existingIndex = packages.findIndex(p => p.id === pkgData.id);

    const parentExam = catalogService.getExamById(pkgData.examId);
    const currency = catalogService.getCurrencyForExam(pkgData.examId);
    const formattedPrice = `${currency}${Number(pkgData.price).toLocaleString()}`;

    if (existingIndex !== -1) {
      updated = [...packages];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...pkgData,
        examName: parentExam?.name || updated[existingIndex].examName,
        formattedPrice
      };
    } else {
      const newPkg = {
        id: `pkg-${pkgData.examId}-${Date.now()}`,
        examId: pkgData.examId,
        examName: parentExam?.name || 'Medical Prep Exam',
        name: pkgData.name,
        price: Number(pkgData.price) || 14999,
        formattedPrice,
        duration: pkgData.duration || '6 Months',
        features: {
          pdfNotes: Boolean(pkgData.features?.pdfNotes),
          videoLectures: Boolean(pkgData.features?.videoLectures),
          flashcards: Boolean(pkgData.features?.flashcards),
          liveSessions: Boolean(pkgData.features?.liveSessions),
          testSeries: Boolean(pkgData.features?.testSeries)
        },
        popular: Boolean(pkgData.popular),
        activeSubscribers: Number(pkgData.activeSubscribers) || 0,
        status: pkgData.status || 'Active'
      };
      updated = [newPkg, ...packages];
    }

    // Also update packagesCount on parent exam
    catalogService.refreshExamPackageCounts(updated);

    try {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-catalog-updated', { detail: { type: 'packages', data: updated } }));
    } catch (e) {
      console.warn('Catalog storage write error (packages):', e);
    }
    return updated;
  },

  togglePackageStatus: (id) => {
    const packages = catalogService.getAllPackages();
    const updated = packages.map(pkg => {
      if (pkg.id === id) {
        const nextStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
        return { ...pkg, status: nextStatus };
      }
      return pkg;
    });

    try {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-catalog-updated', { detail: { type: 'packages', data: updated } }));
    } catch (e) {
      console.warn('Catalog storage toggle error (packages):', e);
    }
    return updated;
  },

  deletePackage: (id) => {
    const packages = catalogService.getAllPackages();
    const updated = packages.filter(p => p.id !== id);

    catalogService.refreshExamPackageCounts(updated);

    try {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-catalog-updated', { detail: { type: 'packages', data: updated } }));
    } catch (e) {
      console.warn('Catalog storage delete error (packages):', e);
    }
    return updated;
  },

  refreshExamPackageCounts: (allPackages) => {
    const exams = catalogService.getExams();
    const updatedExams = exams.map(exam => {
      const count = allPackages.filter(p => p.examId === exam.id).length;
      return { ...exam, packagesCount: count };
    });
    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updatedExams));
    } catch (e) {
      console.warn('Refresh counts error:', e);
    }
  },

  // =========================================================================
  // REACTIVE LISTENER
  // =========================================================================
  subscribe: (callback) => {
    const handler = (e) => {
      callback({
        exams: catalogService.getExams(),
        packages: catalogService.getAllPackages(),
        detail: e.detail
      });
    };
    window.addEventListener('medprep-catalog-updated', handler);
    return () => window.removeEventListener('medprep-catalog-updated', handler);
  }
};
