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
    fullName: 'National Eligibility cum Entrance Test for Postgraduate (NEET PG & NExT)',
    country: 'India',
    authority: 'National Board of Examinations (NBE) / NMC',
    forAudience: ['Medical Students', 'Interns', 'MBBS Graduates'],
    purpose: 'Admission to MD/MS/DNB postgraduate residency programs in India',
    stages: 1,
    examStructure: 'Single comprehensive Computer-Based Test (200 clinical MCQs across 3 sections)',
    step1: 'Clinical Pre & Para-Clinical Specialties (Anatomy, Physio, Biochem, Path, Pharma, Micro, FMT)',
    step2: 'Clinical Specialties (Medicine, Surgery, OBGY, Peds, ENT, Ophtha, Ortho, Psych, Derma, Radio, Anes)',
    finalStep: 'All-India Merit Ranking & MCC Postgraduate Seat Allocation',
    englishRequirement: 'Exam administered in English; separate language score not required',
    feeAmount: 4250,
    feeCurrency: 'INR',
    careerPath: 'MBBS → NEET PG Rank → MD/MS Residency (3 Years) → Senior Residency / Specialist',
    difficulty: 'Very High',
    bestFor: 'Indian MBBS doctors & licensed practitioners targeting top-tier residency programs',
    packagesCount: 3,
    enrolledStudents: 680,
    status: 'Active',
    startingPrice: '₹14,999',
    popular: true
  },
  {
    id: 'usmle',
    name: 'USMLE (United States Medical Licensing Examination)',
    fullName: 'United States Medical Licensing Examination (USMLE)',
    country: 'United States',
    authority: 'USMLE / FSMB / ECFMG',
    forAudience: ['Medical Students', 'IMGs (International Medical Graduates)'],
    purpose: 'U.S. Medical Licensing & Residency Match (NRMP)',
    stages: 3,
    examStructure: 'Step 1 → Step 2 CK → Step 3',
    step1: 'Basic Medical Sciences (Anatomy, Physio, Path, Micro, Pharma - Pass/Fail CBT)',
    step2: 'Clinical Knowledge (Integrated 9-hour scored examination on diagnostic reasoning & patient management)',
    finalStep: 'Step 3: Two-day assessment of independent clinical practice competency & Computer-based Case Simulations (CCS)',
    englishRequirement: 'OET (Occupational English Test) Medicine Grade B in all sub-tests for ECFMG Certification',
    feeAmount: 695,
    feeCurrency: 'USD',
    careerPath: 'ECFMG Certification → US Clinical Experience (USCE) → ERAS Application → Residency Match → Independent Practice',
    difficulty: 'Very High',
    bestFor: 'Doctors targeting USA residency match and long-term US medical practice',
    packagesCount: 3,
    enrolledStudents: 420,
    status: 'Active',
    startingPrice: '$299',
    popular: false
  },
  {
    id: 'plab',
    name: 'PLAB 1 & 2 / UKMLA',
    fullName: 'Professional and Linguistic Assessments Board / UK Medical Licensing Assessment',
    country: 'United Kingdom',
    authority: 'General Medical Council (GMC)',
    forAudience: ['IMGs (International Medical Graduates)', 'Overseas Doctors'],
    purpose: 'GMC Registration with a licence to practise medicine in the United Kingdom',
    stages: 2,
    examStructure: 'PLAB 1 (Applied Knowledge Test) → PLAB 2 (Clinical & Professional Skills Assessment)',
    step1: 'PLAB 1: 3-hour exam with 180 single best answer (SBA) clinical scenario questions',
    step2: 'PLAB 2: 16-station objective structured clinical exam (OSCE) in Manchester, UK',
    finalStep: 'GMC Identity Check & Granting of Full GMC Registration with License to Practise',
    englishRequirement: 'IELTS Academic (min 7.5 overall, 7.0 in each skill) or OET Medicine (min Grade B in each subtest)',
    feeAmount: 268,
    feeCurrency: 'GBP',
    careerPath: 'PLAB 1 & 2 → GMC Registration → NHS Junior Doctor (FY2/ST1/CT1) → Specialty Training → CCT Specialist',
    difficulty: 'Moderate–High',
    bestFor: 'International medical graduates seeking rapid clinical entry into the UK NHS system',
    packagesCount: 3,
    enrolledStudents: 320,
    status: 'Active',
    startingPrice: '£189',
    popular: false
  },
  {
    id: 'europe',
    name: 'Europe Medical Licensing & Approbation',
    fullName: 'German Approbation & European Medical Licensure',
    country: 'Germany',
    authority: 'State Medical Licensing Boards (Landesprüfungsamt) / EU Health Chambers',
    forAudience: ['IMGs', 'EU/Non-EU Medical Graduates'],
    purpose: 'National Medical Licence (Approbation) & Residency Specialization in Germany & Europe',
    stages: 2,
    examStructure: 'Fachsprachprüfung (FSP) → Kenntnisprüfung (KP)',
    step1: 'Fachsprachprüfung (FSP): C1 Medical Terminology, Physician-Patient Simulation & Medical Documentation',
    step2: 'Kenntnisprüfung (KP): Oral-practical examination covering Internal Medicine, Surgery, Pharmacology & Emergency',
    finalStep: 'Full German Approbation (Unrestricted lifetime licence to practise medicine in Germany & EU)',
    englishRequirement: 'B2 General German + C1 Medical German (English not accepted for state licensing)',
    feeAmount: 450,
    feeCurrency: 'EUR',
    careerPath: 'German Language (B2/C1) → FSP Exam → Berufserlaubnis → KP Exam → Approbation → Assistenzarzt Residency',
    difficulty: 'High',
    bestFor: 'Doctors targeting tuition-free paid medical residency and permanent career in Germany & Europe',
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
        const parsed = JSON.parse(stored);
        return parsed.map(exam => {
          const fallback = INITIAL_EXAMS.find(ie => ie.id === exam.id);
          return fallback ? { ...fallback, ...exam } : exam;
        });
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
    if (exam.feeCurrency) return exam.feeCurrency;
    if (exam.currency) return exam.currency;
    if (exam.country && exam.country.includes('United States')) return '$';
    if (exam.country && exam.country.includes('United Kingdom')) return '£';
    if (exam.country && exam.country.includes('Germany')) return '€';
    return '₹';
  },

  createExam: (examData) => {
    return catalogService.saveExam(examData);
  },

  updateExam: (id, examData) => {
    return catalogService.saveExam({ id, ...examData });
  },

  saveExam: (examData) => {
    const exams = catalogService.getExams();
    let updated;
    const existingIndex = exams.findIndex(e => e.id === examData.id);

    if (existingIndex !== -1) {
      updated = [...exams];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...examData,
        name: examData.fullName || examData.name || updated[existingIndex].name,
        fullName: examData.fullName || examData.name || updated[existingIndex].fullName
      };
    } else {
      const newId = examData.id || (examData.fullName || examData.name || 'exam').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newExam = {
        id: newId,
        name: examData.fullName || examData.name,
        fullName: examData.fullName || examData.name,
        country: examData.country || 'India',
        authority: examData.authority || '',
        forAudience: examData.forAudience || [],
        purpose: examData.purpose || '',
        stages: Number(examData.stages) || 1,
        examStructure: examData.examStructure || '',
        step1: examData.step1 || '',
        step2: examData.step2 || '',
        finalStep: examData.finalStep || '',
        englishRequirement: examData.englishRequirement || '',
        feeAmount: Number(examData.feeAmount) || 0,
        feeCurrency: examData.feeCurrency || 'USD',
        careerPath: examData.careerPath || '',
        difficulty: examData.difficulty || 'Moderate',
        bestFor: examData.bestFor || '',
        packagesCount: 0,
        enrolledStudents: 0,
        status: examData.status || 'Active',
        startingPrice: examData.feeCurrency && examData.feeAmount ? `${examData.feeCurrency} ${examData.feeAmount}` : 'Free',
        popular: false
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

  deleteExam: (id, force = false) => {
    const exams = catalogService.getExams();
    const exam = exams.find(e => e.id === id);
    if (!exam) return { success: false, reason: 'Exam track not found.' };

    const packages = catalogService.getPackages(id);
    const hasActivePackages = packages.length > 0;
    const hasEnrolledStudents = (exam.enrolledStudents || 0) > 0;

    // Rule: Attempting to delete an Exam that already has Packages/Students tied to it
    // should show a warning unless force is explicitly set
    if (!force && (hasActivePackages || hasEnrolledStudents)) {
      return {
        success: false,
        reason: 'This exam has active packages or enrolled students. You can deactivate it, or confirm force delete.',
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
