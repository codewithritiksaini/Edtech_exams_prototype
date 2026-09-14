// =============================================================================
// SAMPLE PAPER SERVICE
// Manages module-level sample papers and PDFs with role & course-based access control.
// Hierarchy: Exam -> Subject -> Module -> Sample Papers (1 or multiple PDFs)
// =============================================================================

import { curriculumService } from './curriculumService';
import { peopleService } from './peopleService';
import { catalogService } from './catalogService';
import { authService, USER_ROLES } from './authService';

const STORAGE_KEY_SAMPLE_PAPERS = 'medprep_sample_papers_v1';
const EVENT_SAMPLE_PAPERS_UPDATED = 'medprep-sample-papers-updated';

export const INITIAL_SAMPLE_PAPERS = [
  {
    id: 'sp-cardio-valvular-1',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-valvular',
    title: 'Sample Paper 1: Valvular Pathology & Murmurs Sprint',
    description: 'High-yield clinical vignettes covering Aortic Stenosis gradient criteria, Mitral Regurgitation v-wave dynamics, and dynamic auscultation maneuvers.',
    pdfUrl: '/samples/sample_paper_cardio_valvular_01.pdf',
    fileName: 'NEET_PG_Cardio_Ch01_Valvular_Paper1.pdf',
    fileSize: '3.2 MB',
    pageCount: 14,
    totalMarks: 100,
    questionsCount: 25,
    durationMinutes: 45,
    difficulty: 'Medium',
    hasAnswerKey: true,
    answerKeyPdfUrl: '/samples/solutions_cardio_valvular_01.pdf',
    answerKeyFileName: 'NEET_PG_Cardio_Ch01_Solutions_Key.pdf',
    answerKeyFileSize: '1.8 MB',
    uploadedByRole: 'faculty',
    uploadedByName: 'Dr. Siddharth V.',
    uploadedByEmail: 'faculty@demo.com',
    facultyId: 'fac-1',
    uploadedById: 'fac-1',
    createdAt: '2026-09-08T10:15:00Z',
    status: 'Published',
    downloadsCount: 238
  },
  {
    id: 'sp-cardio-valvular-2',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-valvular',
    title: 'Sample Paper 2: Echo Tracings & Pressure Volume Loops',
    description: 'Advanced diagnostic assessment with 30 Doppler echocardiogram images, Gorlin formula calculations, and prosthetic valve complications.',
    pdfUrl: '/samples/sample_paper_cardio_valvular_02.pdf',
    fileName: 'NEET_PG_Cardio_Ch01_EchoTracings_Paper2.pdf',
    fileSize: '4.8 MB',
    pageCount: 18,
    totalMarks: 120,
    questionsCount: 30,
    durationMinutes: 60,
    difficulty: 'Hard',
    hasAnswerKey: true,
    answerKeyPdfUrl: '/samples/solutions_cardio_valvular_02.pdf',
    answerKeyFileName: 'NEET_PG_Cardio_Ch01_Paper2_AnswerKey.pdf',
    answerKeyFileSize: '2.1 MB',
    uploadedByRole: 'faculty',
    uploadedByName: 'Dr. Siddharth V.',
    uploadedByEmail: 'faculty@demo.com',
    facultyId: 'fac-1',
    uploadedById: 'fac-1',
    createdAt: '2026-09-08T14:30:00Z',
    status: 'Published',
    downloadsCount: 175
  },
  {
    id: 'sp-cardio-hf-1',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-hf',
    title: 'Sample Paper: Heart Failure Guidelines & Pharmacotherapy Trial Mastery',
    description: 'Questions centered on the 4 Pillars of HFrEF: Sacubitril/Valsartan, SGLT2i, Beta-Blockers, and MRAs with acute decompensated hemodynamics.',
    pdfUrl: '/samples/sample_paper_cardio_hf_01.pdf',
    fileName: 'NEET_PG_Cardio_Ch02_HeartFailure_Guide.pdf',
    fileSize: '2.9 MB',
    pageCount: 12,
    totalMarks: 100,
    questionsCount: 25,
    durationMinutes: 45,
    difficulty: 'Medium',
    hasAnswerKey: true,
    answerKeyPdfUrl: '/samples/solutions_cardio_hf_01.pdf',
    answerKeyFileName: 'NEET_PG_Cardio_Ch02_HF_Solutions.pdf',
    answerKeyFileSize: '1.5 MB',
    uploadedByRole: 'admin',
    uploadedByName: 'Academic Editorial Board',
    uploadedByEmail: 'admin@demo.com',
    facultyId: null,
    uploadedById: 'admin-1',
    createdAt: '2026-09-07T11:00:00Z',
    status: 'Published',
    downloadsCount: 312
  },
  {
    id: 'sp-cardio-arrhythmias-1',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-arrhythmias',
    title: 'Sample Paper: 12-Lead ECG Interpretation & Arrhythmia Grand Mock',
    description: 'Wide complex tachycardias, Brugada vs Vereckei algorithmic differentiation, and ACLS emergency cardioversion guidelines.',
    pdfUrl: '/samples/sample_paper_cardio_arrhythmias_01.pdf',
    fileName: 'NEET_PG_Cardio_Ch03_ECG_MockPaper.pdf',
    fileSize: '5.1 MB',
    pageCount: 20,
    totalMarks: 150,
    questionsCount: 35,
    durationMinutes: 75,
    difficulty: 'Clinical Case',
    hasAnswerKey: true,
    answerKeyPdfUrl: '/samples/solutions_cardio_arrhythmias_01.pdf',
    answerKeyFileName: 'NEET_PG_Cardio_Ch03_ECG_Solutions.pdf',
    answerKeyFileSize: '2.6 MB',
    uploadedByRole: 'faculty',
    uploadedByName: 'Dr. Siddharth V.',
    uploadedByEmail: 'faculty@demo.com',
    facultyId: 'fac-1',
    uploadedById: 'fac-1',
    createdAt: '2026-09-06T16:20:00Z',
    status: 'Published',
    downloadsCount: 405
  },
  {
    id: 'sp-pulmo-pft-1',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    moduleId: 'mod-neet-pft',
    title: 'Sample Paper: Spirometry, DLCO & Flow-Volume Loops Practice',
    description: 'Differentiating obstructive vs restrictive defects, fixed vs variable intrathoracic upper airway lesions, and DLCO adjustments.',
    pdfUrl: '/samples/sample_paper_pulmo_pft_01.pdf',
    fileName: 'NEET_PG_Pulmo_Ch01_PFT_SamplePaper.pdf',
    fileSize: '3.4 MB',
    pageCount: 15,
    totalMarks: 100,
    questionsCount: 25,
    durationMinutes: 45,
    difficulty: 'Medium',
    hasAnswerKey: true,
    answerKeyPdfUrl: '/samples/solutions_pulmo_pft_01.pdf',
    answerKeyFileName: 'NEET_PG_Pulmo_Ch01_PFT_AnswerKey.pdf',
    answerKeyFileSize: '1.7 MB',
    uploadedByRole: 'faculty',
    uploadedByName: 'Dr. Marcus Vance (MRCP)',
    uploadedByEmail: 'marcus.vance@demo.com',
    facultyId: 'fac-3',
    uploadedById: 'fac-3',
    createdAt: '2026-09-05T09:00:00Z',
    status: 'Published',
    downloadsCount: 189
  },
  {
    id: 'sp-usmle-cvs-1',
    examId: 'usmle',
    subjectId: 'sub-usmle-cvs',
    moduleId: 'mod-usmle-emb',
    title: 'Sample Paper: Cardiac Embryology & Congenital Defects USMLE Style',
    description: 'Step 1 high-yield vignettes: Truncus arteriosus, Tetralogy of Fallot, transposition of great vessels, and endocardial cushion defects.',
    pdfUrl: '/samples/sample_paper_usmle_cvs_01.pdf',
    fileName: 'USMLE_Step1_Cardio_Ch01_SamplePaper.pdf',
    fileSize: '3.8 MB',
    pageCount: 16,
    totalMarks: 100,
    questionsCount: 25,
    durationMinutes: 50,
    difficulty: 'Clinical Case',
    hasAnswerKey: true,
    answerKeyPdfUrl: '/samples/solutions_usmle_cvs_01.pdf',
    answerKeyFileName: 'USMLE_Step1_Cardio_Ch01_Solutions.pdf',
    answerKeyFileSize: '2.0 MB',
    uploadedByRole: 'faculty',
    uploadedByName: 'Dr. Siddharth V.',
    uploadedByEmail: 'faculty@demo.com',
    facultyId: 'fac-1',
    uploadedById: 'fac-1',
    createdAt: '2026-09-04T12:00:00Z',
    status: 'Published',
    downloadsCount: 276
  }
];

class SamplePaperService {
  constructor() {
    this.papers = this.loadPapers();
  }

  loadPapers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAMPLE_PAPERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => {
            let paper = p;

            // Migrate legacy chapterId -> moduleId (pre Module/Lecture rename)
            if (paper.chapterId !== undefined && paper.moduleId === undefined) {
              const { chapterId, ...rest } = paper;
              const migratedModuleId = typeof chapterId === 'string' && chapterId.startsWith('chap-')
                ? `mod-${chapterId.slice('chap-'.length)}`
                : chapterId;
              paper = { ...rest, moduleId: migratedModuleId };
            }

            // Backfill facultyId and uploadedById if missing
            if (!paper.facultyId && paper.uploadedByRole === 'faculty') {
              const email = (paper.uploadedByEmail || '').toLowerCase();
              const name = paper.uploadedByName || '';
              if (email.includes('faculty') || name.includes('Siddharth')) {
                return { ...paper, facultyId: 'fac-1', uploadedById: 'fac-1' };
              } else if (email.includes('marcus') || name.includes('Marcus')) {
                return { ...paper, facultyId: 'fac-3', uploadedById: 'fac-3' };
              } else if (email.includes('ananya') || name.includes('Ananya')) {
                return { ...paper, facultyId: 'fac-2', uploadedById: 'fac-2' };
              }
            }
            return paper;
          });
        }
      }
    } catch (e) {
      console.warn('Could not read sample papers from localStorage:', e);
    }
    this.savePapersToStorage(INITIAL_SAMPLE_PAPERS);
    return JSON.parse(JSON.stringify(INITIAL_SAMPLE_PAPERS));
  }

  savePapersToStorage(papers) {
    try {
      localStorage.setItem(STORAGE_KEY_SAMPLE_PAPERS, JSON.stringify(papers));
      window.dispatchEvent(new CustomEvent(EVENT_SAMPLE_PAPERS_UPDATED, { detail: { papers } }));
    } catch (e) {
      console.error('Error saving sample papers to storage:', e);
    }
  }

  subscribe(listener) {
    const handler = (e) => listener(e.detail?.papers || this.papers);
    window.addEventListener(EVENT_SAMPLE_PAPERS_UPDATED, handler);
    return () => window.removeEventListener(EVENT_SAMPLE_PAPERS_UPDATED, handler);
  }

  /**
   * Get all sample papers with optional query filters.
   * If role is 'faculty' (or facultyEmail/facultyId provided), strictly returns only papers authored/uploaded by that faculty!
   */
  getSamplePapers({ examId = null, subjectId = null, moduleId = null, search = '', role = null, facultyEmail = null, facultyId = null } = {}) {
    let list = [...this.papers];

    // If role is faculty, enforce strict ownership:
    // Faculty can ONLY see their own sample papers! Not anyone else's or admin's.
    if (role === 'faculty' || facultyEmail || facultyId) {
      const faculty = peopleService.getCurrentFacultyProfile();
      const currentUser = authService.getCurrentUser();
      const isUserFaculty = currentUser?.role === USER_ROLES.FACULTY;

      const activeEmail = (facultyEmail || (isUserFaculty ? currentUser?.email : null) || faculty?.email || 'faculty@demo.com').toLowerCase().trim();
      const activeId = facultyId || (isUserFaculty ? currentUser?.id : null) || faculty?.id || 'fac-1';
      const activeName = ((isUserFaculty ? currentUser?.name : null) || faculty?.name || '').toLowerCase().trim();

      const allowedExams = faculty?.assignedExams || [];
      const allowedSubjects = faculty?.assignedSubjects || [];

      list = list.filter(p => {
        // Exclude papers uploaded by admin
        if (p.uploadedByRole === 'admin') return false;

        const pEmail = (p.uploadedByEmail || '').toLowerCase().trim();
        const pName = (p.uploadedByName || '').toLowerCase().trim();
        const pFacId = p.facultyId || p.uploadedById;

        // Strict ownership check: Must be uploaded by this faculty
        const emailMatch = activeEmail && pEmail === activeEmail;
        const idMatch = activeId && pFacId === activeId;
        const nameMatch = activeName && pName && (pName === activeName || pName.includes(activeName) || activeName.includes(pName));

        const isOwner = Boolean(emailMatch || idMatch || nameMatch);
        if (!isOwner) return false;

        // Course/Subject scope check
        const examMatch = allowedExams.length === 0 || allowedExams.includes(p.examId);
        const subjectMatch = allowedSubjects.length === 0 || allowedSubjects.includes(p.subjectId);
        return examMatch && subjectMatch;
      });
    }

    if (examId && examId !== 'all') {
      list = list.filter(p => p.examId === examId);
    }

    if (subjectId && subjectId !== 'all') {
      list = list.filter(p => p.subjectId === subjectId);
    }

    if (moduleId && moduleId !== 'all') {
      list = list.filter(p => p.moduleId === moduleId);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.fileName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getSamplePaperById(id) {
    return this.papers.find(p => p.id === id) || null;
  }

  getSamplePapersByModule(moduleId, options = {}) {
    if (!moduleId) return [];
    if (options.role === 'faculty' || options.facultyEmail || options.facultyId) {
      return this.getSamplePapers({ moduleId, role: 'faculty', ...options });
    }
    return this.papers.filter(p => p.moduleId === moduleId && p.status === 'Published');
  }

  getSamplePapersCountByModule(moduleId, options = {}) {
    if (!moduleId) return 0;
    if (options.role === 'faculty' || options.facultyEmail || options.facultyId) {
      return this.getSamplePapers({ moduleId, role: 'faculty', ...options }).length;
    }
    return this.papers.filter(p => p.moduleId === moduleId).length;
  }

  /**
   * Save (create or update) a sample paper
   */
  saveSamplePaper(data) {
    const existingIndex = this.papers.findIndex(p => p.id === data.id);
    let updated;

    if (existingIndex !== -1) {
      this.papers[existingIndex] = {
        ...this.papers[existingIndex],
        ...data,
        facultyId: data.facultyId || data.uploadedById || this.papers[existingIndex].facultyId || null,
        uploadedById: data.uploadedById || data.facultyId || this.papers[existingIndex].uploadedById || null,
        updatedAt: new Date().toISOString()
      };
      updated = this.papers[existingIndex];
    } else {
      const newPaper = {
        id: data.id || `sp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        examId: data.examId,
        subjectId: data.subjectId,
        moduleId: data.moduleId,
        title: data.title || 'Untitled Module Sample Paper',
        description: data.description || '',
        pdfUrl: data.pdfUrl || '/samples/sample_paper_template.pdf',
        fileName: data.fileName || `${data.title || 'Sample_Paper'}.pdf`.replace(/\s+/g, '_'),
        fileSize: data.fileSize || '2.5 MB',
        pageCount: Number(data.pageCount) || 12,
        totalMarks: Number(data.totalMarks) || 100,
        questionsCount: Number(data.questionsCount) || 25,
        durationMinutes: Number(data.durationMinutes) || 45,
        difficulty: data.difficulty || 'Medium',
        hasAnswerKey: Boolean(data.hasAnswerKey || data.answerKeyPdfUrl),
        answerKeyPdfUrl: data.answerKeyPdfUrl || '',
        answerKeyFileName: data.answerKeyFileName || '',
        answerKeyFileSize: data.answerKeyFileSize || '',
        uploadedByRole: data.uploadedByRole || 'admin',
        uploadedByName: data.uploadedByName || 'Platform Administrator',
        uploadedByEmail: data.uploadedByEmail || 'admin@demo.com',
        uploadedById: data.uploadedById || data.facultyId || null,
        facultyId: data.facultyId || data.uploadedById || null,
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'Published',
        downloadsCount: data.downloadsCount || 0
      };
      this.papers.unshift(newPaper);
      updated = newPaper;
    }

    this.savePapersToStorage(this.papers);
    return updated;
  }

  /**
   * Delete a sample paper
   */
  deleteSamplePaper(id) {
    const prevLen = this.papers.length;
    this.papers = this.papers.filter(p => p.id !== id);
    if (this.papers.length !== prevLen) {
      this.savePapersToStorage(this.papers);
      return { success: true };
    }
    return { success: false, message: 'Sample paper not found' };
  }

  /**
   * Increment download count
   */
  incrementDownloadCount(id) {
    const paper = this.papers.find(p => p.id === id);
    if (paper) {
      paper.downloadsCount = (paper.downloadsCount || 0) + 1;
      this.savePapersToStorage(this.papers);
    }
  }

  /**
   * Overall platform stats
   */
  getStats(scopePapers = null) {
    const dataset = scopePapers || this.papers;
    const modulesSet = new Set(dataset.map(p => p.moduleId));
    const totalQuestions = dataset.reduce((acc, p) => acc + (Number(p.questionsCount) || 0), 0);
    const totalDownloads = dataset.reduce((acc, p) => acc + (Number(p.downloadsCount) || 0), 0);

    return {
      totalPapers: dataset.length,
      modulesCovered: modulesSet.size,
      totalQuestions,
      totalDownloads
    };
  }
}

export const samplePaperService = new SamplePaperService();
