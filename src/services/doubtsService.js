// =============================================================================
// CLINICAL DOUBTS SERVICE
// Manages candidate questions, doubts from lecture rooms, and faculty clinical pearls
// Storage Key: medprep_clinical_doubts_v1
// Event: medprep-doubts-updated
// =============================================================================

const STORAGE_KEY = 'medprep_clinical_doubts_v1';
const EVENT_NAME = 'medprep-doubts-updated';

const INITIAL_DOUBTS = [
  {
    id: 'doubt-1',
    studentId: 'st-101',
    studentName: 'Dr. Ananya Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1594824813571-638f02634417?w=100&auto=format&fit=crop&q=80',
    course: 'NEET PG & NExT 2026',
    examId: 'neet-pg',
    subjectName: 'Cardiology & Hemodynamics',
    topic: 'Cardiac Arrhythmias & ECG Interpretation',
    dayNumber: 3,
    title: 'ECG Rhythm Confusion: VT vs Aberrant SVT (Brugada vs Vereckei Criteria)',
    question: 'In lead V1, how do we reliably differentiate a rabbit-ear right bundle branch block pattern from ventricular tachycardia when both show positive concordance? Does the taller left rabbit ear reliably confirm VT?',
    submittedAt: '2026-09-15T09:30:00Z',
    status: 'unresolved', // 'unresolved' | 'resolved'
    urgency: 'high',
    facultyReply: null,
    repliedAt: null,
    repliedBy: null
  },
  {
    id: 'doubt-2',
    studentId: 'st-102',
    studentName: 'Dr. Rajesh Kumar',
    studentAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
    course: 'NEET PG & NExT 2026',
    examId: 'neet-pg',
    subjectName: 'Cardiology & Hemodynamics',
    topic: 'Heart Failure & Guideline Pharmacotherapy',
    dayNumber: 2,
    title: 'HFrEF 4-Pillars GDMT Initiation Sequencing in Borderline Hypotension',
    question: 'If an acute decompensated heart failure patient has a baseline BP of 95/60 mmHg and eGFR of 38 mL/min, which of the 4 GDMT pillars should be prioritized first? Should we start low-dose SGLT2i before ARNI?',
    submittedAt: '2026-09-14T16:45:00Z',
    status: 'resolved',
    urgency: 'normal',
    facultyReply: 'Clinical Pearl: SGLT2 inhibitors (Empagliflozin 10mg / Dapagliflozin 10mg) have minimal effect on systolic blood pressure (< 2-3 mmHg drop) and provide immediate decongestion and cardiorenal protection without requiring titration. You can initiate SGLT2i alongside a low-dose beta-blocker once euvolemic, and introduce ARNI (Sacubitril/Valsartan 24/26mg BID) once hemodynamics stabilize.',
    repliedAt: '2026-09-14T18:20:00Z',
    repliedBy: 'Dr. Siddharth V. (Cardiology Lead)'
  },
  {
    id: 'doubt-3',
    studentId: 'st-103',
    studentName: 'Dr. Maya Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
    course: 'NEET PG & NExT 2026',
    examId: 'neet-pg',
    subjectName: 'Cardiology & Hemodynamics',
    topic: 'Valvular Heart Diseases & Murmurs',
    dayNumber: 1,
    title: 'Severe Aortic Stenosis: Paradoxical Low-Flow Low-Gradient Criteria',
    question: 'When an AS patient has an AVA < 1.0 cm2 but mean gradient is < 40 mmHg and LVEF is preserved (>50%), what is the diagnostic gold-standard confirmation needed before transcatheter valve replacement (TAVR)?',
    submittedAt: '2026-09-15T11:15:00Z',
    status: 'unresolved',
    urgency: 'normal',
    facultyReply: null,
    repliedAt: null,
    repliedBy: null
  },
  {
    id: 'doubt-4',
    studentId: 'st-104',
    studentName: 'Dr. Kevin Chen',
    studentAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80',
    course: 'USMLE Step 1 Comprehensive',
    examId: 'usmle-step-1',
    subjectName: 'Pathology & Pharmacology',
    topic: 'Renal Tubular Acidosis Syndromes',
    dayNumber: 8,
    title: 'Urine Anion Gap in Type 1 vs Type 4 RTA',
    question: 'Why is the urine anion gap positive in Type 4 RTA despite hyperkalemia, whereas in proximal RTA it can be variable? How is this tested in Step 1 clinical vignettes?',
    submittedAt: '2026-09-13T14:10:00Z',
    status: 'resolved',
    urgency: 'normal',
    facultyReply: 'Clinical Pearl: Urine Anion Gap = (Na + K) - Cl. It serves as a surrogate for urinary NH4+ excretion. In Type 4 RTA (hypoaldosteronism), impaired ammoniagenesis directly reduces NH4Cl excretion, leaving urine Cl lower than (Na+K), yielding a positive UAG. Remember: "Positive UAG = Renal cause of normal AG acidosis".',
    repliedAt: '2026-09-13T16:00:00Z',
    repliedBy: 'Dr. Sarah Jenkins'
  }
];

class DoubtsService {
  constructor() {
    this.doubts = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOUBTS;
      }
    } catch (e) {
      console.warn('Failed to load clinical doubts from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DOUBTS));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.doubts));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { doubts: this.doubts } }));
    } catch (e) {
      console.warn('Failed to save clinical doubts:', e);
    }
  }

  getAllDoubts(examId = 'all') {
    if (!examId || examId === 'all') return this.doubts;
    return this.doubts.filter(d => d.examId === examId);
  }

  getDoubtById(id) {
    return this.doubts.find(d => d.id === id) || null;
  }

  submitDoubt(doubtPayload) {
    const newDoubt = {
      id: `doubt-${Date.now()}`,
      studentId: doubtPayload.studentId || 'st-curr',
      studentName: doubtPayload.studentName || 'Doctor Candidate',
      studentAvatar: doubtPayload.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      course: doubtPayload.course || 'NEET PG & NExT 2026',
      examId: doubtPayload.examId || 'neet-pg',
      subjectName: doubtPayload.subjectName || 'General Medicine',
      topic: doubtPayload.topic || 'Clinical Lecture Topic',
      dayNumber: doubtPayload.dayNumber || 1,
      title: doubtPayload.title || 'Clinical Question',
      question: doubtPayload.question || '',
      submittedAt: new Date().toISOString(),
      status: 'unresolved',
      urgency: doubtPayload.urgency || 'normal',
      facultyReply: null,
      repliedAt: null,
      repliedBy: null
    };

    this.doubts = [newDoubt, ...this.doubts];
    this.save();
    return newDoubt;
  }

  replyToDoubt(doubtId, pearlText, facultyName = 'Faculty Lead') {
    const index = this.doubts.findIndex(d => d.id === doubtId);
    if (index === -1) return null;

    this.doubts[index] = {
      ...this.doubts[index],
      status: 'resolved',
      facultyReply: pearlText,
      repliedAt: new Date().toISOString(),
      repliedBy: facultyName
    };

    this.save();
    return this.doubts[index];
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail?.doubts || this.doubts);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }
}

export const doubtsService = new DoubtsService();
