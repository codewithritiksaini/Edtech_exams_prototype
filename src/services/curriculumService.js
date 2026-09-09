// =============================================================================
// CURRICULUM SERVICE — PHASE 1 HIERARCHICAL CURRICULUM ARCHITECTURE
// Hierarchy: Exam -> Subject -> Chapter -> Topic -> Topic Content (PDF/Images/Video/Cards) -> Study Schedule
// Persists in localStorage with cross-component reactive event dispatching
// =============================================================================

import { dayContentStore } from '../data/mockData';

const STORAGE_KEY_SUBJECTS = 'medprep_curriculum_subjects_v1';
const STORAGE_KEY_CHAPTERS = 'medprep_curriculum_chapters_v1';
const STORAGE_KEY_TOPICS = 'medprep_curriculum_topics_v1';
const STORAGE_KEY_SCHEDULE = 'medprep_curriculum_schedule_v1';

// =============================================================================
// INITIAL SEED DATA
// =============================================================================

export const INITIAL_SUBJECTS = [
  // NEET PG Subjects
  {
    id: 'sub-neet-cardio',
    examId: 'neet-pg',
    name: 'Cardiology & Hemodynamics',
    code: 'CARD-101',
    icon: 'Heart',
    color: 'rose',
    description: 'Coronary artery diseases, valvular pathologies, arrhythmias, ECG interpretation, and heart failure pharmacotherapy.',
    order: 1,
    status: 'Active',
    defaultTimeSlot: '09:00 AM - 10:30 AM IST',
    assignedFacultyName: 'Dr. Siddharth V. (AIIMS)',
    facultyEmail: 'faculty@demo.com'
  },
  {
    id: 'sub-neet-pulmo',
    examId: 'neet-pg',
    name: 'Respiratory Medicine & Pulmonology',
    code: 'PULM-102',
    icon: 'Wind',
    color: 'sky',
    description: 'Obstructive & restrictive lung diseases, mechanical ventilation, ARDS, pulmonary embolism, and thoracic oncology.',
    order: 2,
    status: 'Active',
    defaultTimeSlot: '11:00 AM - 12:30 PM IST',
    assignedFacultyName: 'Dr. Marcus Vance (MRCP)',
    facultyEmail: 'marcus.vance@demo.com'
  },
  {
    id: 'sub-neet-nephro',
    examId: 'neet-pg',
    name: 'Renal & Acid-Base Physiology',
    code: 'NEPH-103',
    icon: 'Droplet',
    color: 'amber',
    description: 'Glomerulonephritis, acute kidney injury (KDIGO), Davenport acid-base diagrams, and renal replacement therapy.',
    order: 3,
    status: 'Active',
    defaultTimeSlot: '02:00 PM - 03:30 PM IST',
    assignedFacultyName: 'Dr. Elena Rossi (Charité)',
    facultyEmail: 'elena.rossi@demo.com'
  },
  {
    id: 'sub-neet-gastro',
    examId: 'neet-pg',
    name: 'Gastroenterology & Hepatology',
    code: 'GAST-104',
    icon: 'Activity',
    color: 'emerald',
    description: 'Cirrhosis, portal hypertension, inflammatory bowel diseases, acute pancreatitis, and viral hepatitis serology.',
    order: 4,
    status: 'Active',
    defaultTimeSlot: '05:00 PM - 06:30 PM IST',
    assignedFacultyName: 'Dr. Priya Sharma (KEM)',
    facultyEmail: 'priya.surgery@demo.com'
  },
  {
    id: 'sub-neet-neuro',
    examId: 'neet-pg',
    name: 'Neurology & Neuroanatomy',
    code: 'NEUR-105',
    icon: 'Brain',
    color: 'indigo',
    description: 'Cerebrovascular accidents, epilepsy syndromes, demyelinating diseases, cranial nerves, and peripheral neuropathies.',
    order: 5,
    status: 'Active',
    defaultTimeSlot: '06:30 PM - 08:00 PM IST',
    assignedFacultyName: 'Dr. Ananya Sen (PGI)',
    facultyEmail: 'ananya.pharma@demo.com'
  },
  {
    id: 'sub-neet-pharma',
    examId: 'neet-pg',
    name: 'Clinical Pharmacology & Toxicology',
    code: 'PHAR-106',
    icon: 'Pill',
    color: 'purple',
    description: 'Receptor dynamics, pharmacokinetics, antimicrobial stewardship, emergency antidotes, and chemotherapy protocols.',
    order: 6,
    status: 'Active',
    defaultTimeSlot: '04:00 PM - 05:30 PM IST',
    assignedFacultyName: 'Dr. Siddharth V. (AIIMS)',
    facultyEmail: 'faculty@demo.com'
  },
  {
    id: 'sub-neet-patho',
    examId: 'neet-pg',
    name: 'General & Systemic Pathology',
    code: 'PATH-107',
    icon: 'Microscope',
    color: 'cyan',
    description: 'Cell injury, inflammation, neoplasia, immunohistochemistry markers, and clinical hematopathology.',
    order: 7,
    status: 'Active',
    defaultTimeSlot: '07:30 PM - 09:00 PM IST',
    assignedFacultyName: 'Dr. Priya Sharma (KEM)',
    facultyEmail: 'priya.surgery@demo.com'
  },

  // USMLE Subjects
  {
    id: 'sub-usmle-cvs',
    examId: 'usmle',
    name: 'Cardiovascular Physiology & Pathology',
    code: 'US-CVS-01',
    icon: 'Heart',
    color: 'rose',
    description: 'Pressure-volume loops, cardiac hemodynamics, congenital malformations, and pharmacology.',
    order: 1,
    status: 'Active',
    defaultTimeSlot: '10:00 AM - 11:30 AM EST',
    assignedFacultyName: 'Dr. Siddharth V. (AIIMS)',
    facultyEmail: 'faculty@demo.com'
  },
  {
    id: 'sub-usmle-neuro',
    examId: 'usmle',
    name: 'Autonomic & Neuro-Pharmacology',
    code: 'US-NEUR-02',
    icon: 'Brain',
    color: 'indigo',
    description: 'Adrenergic & cholinergic receptors, neurotoxins, and CNS drug mechanisms.',
    order: 2,
    status: 'Active',
    defaultTimeSlot: '03:00 PM - 04:30 PM EST',
    assignedFacultyName: 'Dr. Ananya Sen (PGI)',
    facultyEmail: 'ananya.pharma@demo.com'
  },

  // PLAB Subjects
  {
    id: 'sub-plab-acute',
    examId: 'plab',
    name: 'NHS Acute Clinical Presentations & Guidelines',
    code: 'PLAB-ACU-01',
    icon: 'Shield',
    color: 'emerald',
    description: 'Chest pain triage, Sepsis 6 protocol, NICE guidelines, and emergency hospital management.',
    order: 1,
    status: 'Active',
    defaultTimeSlot: '02:00 PM - 03:30 PM GMT',
    assignedFacultyName: 'Dr. Marcus Vance (NHS Lead)',
    facultyEmail: 'marcus.vance@demo.com'
  },

  // Europe Licensing
  {
    id: 'sub-eur-fsp',
    examId: 'europe',
    name: 'Fachsprachprüfung (FSP) Medical Terminology',
    code: 'EUR-FSP-01',
    icon: 'BookOpen',
    color: 'blue',
    description: 'Anamnesegespräch, clinical doctor-to-doctor handover, and German medical terminology.',
    order: 1,
    status: 'Active',
    defaultTimeSlot: '05:00 PM - 06:30 PM CET',
    assignedFacultyName: 'Dr. Elena Rossi (Charité)',
    facultyEmail: 'elena.rossi@demo.com'
  }
];

export const INITIAL_CHAPTERS = [
  // Under NEET Cardiology
  {
    id: 'chap-neet-valvular',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Valvular Heart Diseases & Auscultation Dynamics',
    chapterNumber: 1,
    description: 'Aortic stenosis, regurgitation, mitral valve prolapse, and diagnostic auscultatory maneuvers.',
    status: 'Active'
  },
  {
    id: 'chap-neet-hf',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Heart Failure & Guideline Pharmacotherapy',
    chapterNumber: 2,
    description: 'HFrEF vs HFpEF, neurohormonal activation, ARNI therapy, and SGLT2 inhibitor trials.',
    status: 'Active'
  },
  {
    id: 'chap-neet-arrhythmias',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Cardiac Arrhythmias & Clinical ECG Mastery',
    chapterNumber: 3,
    description: 'Wide complex tachycardias, Brugada vs Vereckei criteria, AV blocks, and ACLS algorithms.',
    status: 'Active'
  },
  {
    id: 'chap-neet-cad',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Acute Coronary Syndromes & STEMI Pathways',
    chapterNumber: 4,
    description: 'Plaque rupture, biomarker kinetics, primary PCI vs thrombolysis, and TIMI risk scoring.',
    status: 'Active'
  },

  // Under NEET Pulmonology
  {
    id: 'chap-neet-pft',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    title: 'Pulmonary Function Testing & Flow-Volume Loops',
    chapterNumber: 1,
    description: 'Spirometry interpretation, diffusion capacity (DLCO), and airway resistance.',
    status: 'Active'
  },
  {
    id: 'chap-neet-copd',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    title: 'COPD, Bronchial Asthma & Bronchiectasis',
    chapterNumber: 2,
    description: 'GOLD staging guidelines, acute exacerbations, biological therapies, and cystic fibrosis.',
    status: 'Active'
  },
  {
    id: 'chap-neet-ards',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    title: 'ARDS, Sepsis & Mechanical Ventilation Protocols',
    chapterNumber: 3,
    description: 'Berlin definition, lung-protective ventilation, prone positioning, and ECMO indications.',
    status: 'Active'
  },

  // Under NEET Nephrology
  {
    id: 'chap-neet-gn',
    examId: 'neet-pg',
    subjectId: 'sub-neet-nephro',
    title: 'Glomerular Disorders & Biopsy Histology',
    chapterNumber: 1,
    description: 'Nephritic vs nephrotic presentation, electron microscopy pearls, and immunofluorescence.',
    status: 'Active'
  },
  {
    id: 'chap-neet-acidbase',
    examId: 'neet-pg',
    subjectId: 'sub-neet-nephro',
    title: 'Clinical Acid-Base Disorders & Electrolytes',
    chapterNumber: 2,
    description: 'Anion gap calculations, Winter formula, delta ratio, and renal tubular acidosis.',
    status: 'Active'
  },

  // Under NEET Clinical Pharmacology
  {
    id: 'chap-neet-pharm-receptors',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pharma',
    title: 'Autonomic Receptors & Sympathomimetic Agents',
    chapterNumber: 1,
    description: 'Alpha/Beta adrenergic agonists, pressor selection in septic shock, and chronotropic effects.',
    status: 'Active'
  },
  {
    id: 'chap-neet-pharm-antiarrhythmics',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pharma',
    title: 'Antiarrhythmics & Vaughan-Williams Pharmacology',
    chapterNumber: 2,
    description: 'Sodium channel kinetics, beta-blocker trials, amiodarone toxicity pearls, and adenosine dosing.',
    status: 'Active'
  },

  // USMLE Step 1 Chapters
  {
    id: 'chap-usmle-pvloops',
    examId: 'usmle',
    subjectId: 'sub-usmle-cvs',
    title: 'Ventricular Pressure-Volume Loops & Murmurs',
    chapterNumber: 1,
    description: 'Wiggers diagram, stroke volume, inotropy, and pressure-volume loop shifts in valvular stenosis and regurgitation.',
    status: 'Active'
  },
  {
    id: 'chap-usmle-autonomic',
    examId: 'usmle',
    subjectId: 'sub-usmle-neuro',
    title: 'Autonomic Pharmacology & Receptor Signaling',
    chapterNumber: 1,
    description: 'Alpha, beta, and muscarinic receptor kinetics, autonomic reflex loops, and pressor mechanisms.',
    status: 'Active'
  },

  // PLAB 1 & 2 Chapters
  {
    id: 'chap-plab-chestpain',
    examId: 'plab',
    subjectId: 'sub-plab-acute',
    title: 'NICE Clinical Guidelines: Acute Chest Pain & ACS',
    chapterNumber: 1,
    description: 'Emergency department triage, troponin pathway, GRACE risk assessment, and Sepsis 6 resuscitation.',
    status: 'Active'
  },

  // Europe Licensing Chapters
  {
    id: 'chap-eur-anamnese',
    examId: 'europe',
    subjectId: 'sub-eur-fsp',
    title: 'Medical History Taking (Anamnese) & Doctor Handover',
    chapterNumber: 1,
    description: 'German medical terminology, SOCRATES pain history in German, and structured doctor-to-doctor presentation.',
    status: 'Active'
  }
];

export const INITIAL_TOPICS = [
  // Under Chapter: Valvular Heart Diseases
  {
    id: 'top-valvular-murmurs',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    chapterId: 'chap-neet-valvular',
    title: 'Aortic Stenosis & Regurgitation Auscultation Pearls',
    topicNumber: 1,
    duration: '40 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-valvular-1',
          fileName: 'Valvular_Heart_Diseases_Clinical_Mastery_2026.pdf',
          title: 'Aortic & Mitral Lesions: Hemodynamics and Auscultation Guide',
          pages: 22,
          size: '4.8 MB',
          updated: 'Recently updated',
          author: 'Dr. Rajiv Mehta (MD, DM Cardiology)'
        }
      ],
      images: [
        {
          id: 'img-valvular-1',
          title: 'Cardiac Cycle & Auscultation Points (Wiggers Diagram)',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 1: Relationship of ventricular pressure, aortic flow, and cardiac heart sounds (S1, S2, S3, S4).'
        },
        {
          id: 'img-valvular-2',
          title: 'Mitral Valve Prolapse Histopathology (Myxomatous Degeneration)',
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 2: Histological stain showing dermatan sulfate accumulation in the spongiosa layer of the mitral leaflet.'
        }
      ],
      video: {
        title: 'Clinical Auscultation & Systolic vs Diastolic Murmurs',
        duration: '32:15',
        instructor: 'Dr. Rajiv Mehta',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
        chapters: [
          { time: '00:00', label: 'Anatomy of Heart Valves' },
          { time: '08:12', label: 'Aortic Stenosis vs Sclerosis' },
          { time: '18:40', label: 'Mitral Regurgitation & Austin Flint Murmur' },
          { time: '26:30', label: 'Dynamic Auscultation Maneuvers' }
        ]
      },
      flashcards: [
        {
          id: 'fc-valvular-1',
          question: 'Which physical exam maneuver uniquely INCREASES the intensity of Hypertrophic Cardiomyopathy (HCM) and Mitral Valve Prolapse (MVP) murmurs?',
          answer: 'Valsalva maneuver (strain phase) and sudden standing from squatting (both decrease left ventricular end-diastolic volume).'
        },
        {
          id: 'fc-valvular-2',
          question: 'What is the classic clinical symptom triad of severe aortic stenosis and what is the associated prognosis?',
          answer: 'SAD: Syncope (3-yr survival), Angina (5-yr survival), Dyspnea/Heart Failure (2-yr survival without valve replacement).'
        },
        {
          id: 'fc-valvular-3',
          question: 'What is the Austin Flint murmur and in which valvular disorder is it heard?',
          answer: 'A low-pitched rumbling mid-to-late diastolic murmur at the apex caused by severe Aortic Regurgitation jet impinging on anterior mitral leaflet.'
        }
      ],
      liveClasses: [
        {
          id: 'live-auscultation-1',
          title: 'Live Masterclass: Heart Murmurs & Bedside Auscultation Maneuvers',
          instructor: 'Dr. Rajiv Mehta (MD, DM Cardiology)',
          date: 'Tomorrow',
          time: '07:00 PM - 08:15 PM IST',
          duration: '75 mins',
          platform: 'Zoom Live Interactive',
          joinUrl: 'https://zoom.us/j/9876543210',
          meetingId: '987 654 3210',
          passcode: 'CARDIO2026',
          status: 'Live Now',
          recordingUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        {
          id: 'live-auscultation-2',
          title: 'Clinical Grand Round: Severe AS vs MR Hemodynamic Diagnostic Traps',
          instructor: 'Dr. Siddharth V. (Clinical Specialist)',
          date: 'Friday',
          time: '08:00 PM - 09:00 PM IST',
          duration: '60 mins',
          platform: 'Google Meet',
          joinUrl: 'https://meet.google.com/med-card-live',
          meetingId: 'med-card-live',
          passcode: 'NEETPG99',
          status: 'Scheduled',
          recordingUrl: ''
        }
      ],
      clinicalNotes: 'Severe aortic stenosis with valve area < 1.0 cm2 or mean gradient > 40 mmHg requires prompt valve replacement.'
    }
  },

  // Under Chapter: Heart Failure
  {
    id: 'top-hf-gdmt',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    chapterId: 'chap-neet-hf',
    title: 'HFrEF vs HFpEF: Quadruple Medical Therapy (ARNI, SGLT2i, MRA, Beta-Blockers)',
    topicNumber: 1,
    duration: '45 mins',
    difficulty: 'Core Clinical',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-hf-1',
          fileName: 'Heart_Failure_HFrEF_HFpEF_Pharmacology_Guide.pdf',
          title: 'HFrEF vs HFpEF: Guideline-Directed Medical Therapy (GDMT)',
          pages: 26,
          size: '5.2 MB',
          updated: 'Recently updated',
          author: 'Dr. Siddharth V.'
        }
      ],
      images: [],
      video: {
        title: 'Quadruple Therapy in HFrEF: ARNI, Beta-Blockers, MRA & SGLT2i',
        duration: '44:10',
        instructor: 'Dr. Siddharth V.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
        chapters: [
          { time: '00:00', label: 'Neurohormonal Activation in Heart Failure' },
          { time: '12:00', label: 'DAPA-HF and EMPEROR-Reduced Trial Pearls' },
          { time: '28:15', label: 'Sacubitril/Valsartan Mechanism & Neprilysin Inhibition' }
        ]
      },
      flashcards: [
        {
          id: 'fc-hf-1',
          question: 'Why must ACE inhibitors be stopped at least 36 hours before initiating Sacubitril/Valsartan (ARNI)?',
          answer: 'To prevent severe, life-threatening Angioedema caused by simultaneous inhibition of both ACE and Neprilysin, which exponentially increases bradykinin levels.'
        },
        {
          id: 'fc-hf-2',
          question: 'Which SGLT2 inhibitors have established mortality benefits in heart failure with reduced ejection fraction regardless of diabetes status?',
          answer: 'Dapagliflozin and Empagliflozin.'
        }
      ],
      clinicalNotes: 'All HFrEF patients should be on all 4 foundational drug classes titrated to target doses as tolerated.'
    }
  },

  // Under Chapter: Cardiac Arrhythmias
  {
    id: 'top-ecg-arrhythmias',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    chapterId: 'chap-neet-arrhythmias',
    title: 'Wide Complex Tachycardias: Brugada vs Vereckei & ACLS Protocols',
    topicNumber: 1,
    duration: '50 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-arrh-1',
          fileName: 'Clinical_ECG_Mastery_Arrhythmias_and_AV_Blocks.pdf',
          title: 'ECG Mastery: Tachyarrhythmias, Bradycardias & Pre-excitation',
          pages: 30,
          size: '6.4 MB',
          updated: 'Recently updated',
          author: 'Dr. Siddharth V. & Dr. Rajiv Mehta'
        }
      ],
      images: [
        {
          id: 'img-arrh-1',
          title: '12-Lead ECG: Monomorphic Ventricular Tachycardia (VT)',
          url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 1: Wide complex tachycardia with AV dissociation, extreme QRS axis deviation, and positive concordance in V1-V6.'
        },
        {
          id: 'img-arrh-2',
          title: 'ECG: Atrial Fibrillation with Rapid Ventricular Response (RVR)',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 2: Irregularly irregular R-R intervals with undulating fibrillatory baseline waves and absence of P waves.'
        },
        {
          id: 'img-arrh-3',
          title: 'Wolff-Parkinson-White (WPW) Pre-Excitation Pattern',
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 3: Short PR interval (< 120 ms) with slurred initial upstroke of the QRS complex (Delta wave).'
        }
      ],
      video: {
        title: 'Wide Complex Tachycardias: Brugada vs Vereckei Algorithmic Mastery',
        duration: '28:40',
        instructor: 'Dr. Siddharth V. (AIIMS Interventional Cardiologist)',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
        chapters: [
          { time: '00:00', label: 'Conduction System Physiology' },
          { time: '06:15', label: 'Differentiating VT from SVT with Aberrancy' },
          { time: '14:30', label: 'Step-by-Step Brugada 4-Step Algorithm' },
          { time: '22:10', label: 'Antiarrhythmic Drug Classification' }
        ]
      },
      flashcards: [
        {
          id: 'fc-arrh-1',
          question: 'What is the definitive ECG hallmark of atrioventricular (AV) dissociation in ventricular tachycardia?',
          answer: 'The presence of independent sinus P waves marching across wide QRS complexes, along with intermittent capture beats (Dressler beats) and fusion beats.'
        },
        {
          id: 'fc-arrh-2',
          question: 'What is the first-line pharmacologic drug for stable monomorphic VT with preserved left ventricular function?',
          answer: 'Intravenous Procainamide or IV Amiodarone. Calcium channel blockers (Verapamil) are strictly contraindicated as they cause hemodynamic collapse.'
        },
        {
          id: 'fc-arrh-3',
          question: 'Which drugs are absolutely contraindicated in Atrial Fibrillation with WPW pre-excitation?',
          answer: 'AV nodal blocking agents: Adenosine, Beta-blockers, CCBs, Digoxin (ABCD). They divert conduction solely down the accessory pathway into VF.'
        }
      ],
      clinicalNotes: 'Treat any wide complex tachycardia as VT until proven otherwise in an emergency setting.'
    }
  },

  // Under Chapter: Pulmonology PFT
  {
    id: 'top-pulmo-pft',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    chapterId: 'chap-neet-pft',
    title: 'Flow-Volume Loops & Obstructive vs Restrictive Patterns',
    topicNumber: 1,
    duration: '45 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-pulm-1',
          fileName: 'PFT_Flow_Volume_Loops_Clinical_Guide.pdf',
          title: 'Pulmonary Function Tests: Spirometry & DLCO Interpretation',
          pages: 18,
          size: '3.9 MB',
          updated: 'Recently updated',
          author: 'Dr. Arvind Sen (MD Pulmonology)'
        }
      ],
      images: [
        {
          id: 'img-pulm-1',
          title: 'Diagnostic Flow-Volume Loops (Normal vs COPD vs Fibrosis)',
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 1: Scooped out expiratory limb in obstructive disease vs witch hat narrow loop in restrictive disease.'
        }
      ],
      video: {
        title: 'Mastering Spirometry: FEV1/FVC Ratios & Reversibility Criteria',
        duration: '35:20',
        instructor: 'Dr. Arvind Sen',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
      },
      flashcards: [
        {
          id: 'fc-pulm-1',
          question: 'What defines significant post-bronchodilator reversibility in asthma on spirometry?',
          answer: 'An increase in FEV1 or FVC by > 12% AND > 200 mL compared to baseline.'
        },
        {
          id: 'fc-pulm-2',
          question: 'What happens to DLCO in emphysema vs chronic bronchitis vs asthma?',
          answer: 'Emphysema: DECREASED (alveolar capillary destruction). Chronic Bronchitis: NORMAL. Asthma: NORMAL or slightly ELEVATED.'
        }
      ],
      clinicalNotes: 'Always check FEV1/FVC ratio first: < 0.70 confirms obstruction.'
    }
  },

  // Under Chapter: Acute Coronary Syndromes & STEMI Pathways
  {
    id: 'top-cad-stemi',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    chapterId: 'chap-neet-cad',
    title: 'STEMI Localization & Culprit Artery ECG Criteria',
    topicNumber: 1,
    duration: '45 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-stemi-1',
          fileName: 'STEMI_Culprit_Artery_ECG_Algorithms.pdf',
          title: 'Acute Coronary Syndromes: STEMI vs NSTEMI Triage & Reperfusion',
          pages: 24,
          size: '5.1 MB',
          updated: 'Recently updated',
          author: 'Dr. Siddharth V. & Dr. Rajiv Mehta'
        }
      ],
      images: [
        {
          id: 'img-stemi-1',
          title: 'Hyperacute Anteroseptal STEMI (LAD Occlusion)',
          url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&auto=format&fit=crop&q=80',
          caption: 'ST elevation in V1-V4 with reciprocal depression in II, III, aVF indicating proximal LAD occlusion.'
        }
      ],
      video: {
        title: 'Door-to-Balloon Strategy & Primary PCI Guidelines',
        duration: '32:15',
        instructor: 'Dr. Siddharth V.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
      },
      flashcards: [
        {
          id: 'fc-stemi-1',
          question: 'What is the cutoff for ST elevation in V2-V3 for men < 40 years to diagnose STEMI?',
          answer: '>= 2.5 mm (0.25 mV). In men >= 40 it is >= 2.0 mm; in women of any age it is >= 1.5 mm.'
        }
      ],
      clinicalNotes: 'Time is myocardium: primary PCI within 90 minutes or thrombolysis within 30 minutes if transfer time > 120 mins.'
    }
  },

  // USMLE Topic
  {
    id: 'top-usmle-pvloops',
    examId: 'usmle',
    subjectId: 'sub-usmle-cvs',
    chapterId: 'chap-usmle-pvloops',
    title: 'Wiggers Diagram & Valvular Shifts on PV Loops',
    topicNumber: 1,
    duration: '45 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-usmle-1',
          fileName: 'USMLE_Cardiovascular_Pressure_Volume_Loops.pdf',
          title: 'High-Yield USMLE PV Loops: Contractility, Afterload & Preload',
          pages: 20,
          size: '4.2 MB',
          updated: 'Recently updated',
          author: 'USMLE Faculty Panel'
        }
      ],
      images: [
        {
          id: 'img-usmle-1',
          title: 'Ventricular Pressure-Volume Loop Pathology Shifts',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: 'Pressure-Volume loop changes under altered preload, afterload, inotropy, and aortic stenosis.'
        }
      ],
      video: {
        title: 'Mastering USMLE Cardiovascular Hemodynamics',
        duration: '38:00',
        instructor: 'Dr. Michael Hayes, MD',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
      },
      flashcards: [
        {
          id: 'fc-usmle-1',
          question: 'How does aortic stenosis affect the peak ventricular pressure on the PV loop?',
          answer: 'Markedly increases peak left ventricular systolic pressure due to high afterload and transvalvular gradient.'
        }
      ],
      clinicalNotes: 'Width of PV loop = Stroke Volume (EDV - ESV).'
    }
  },

  // PLAB Topic
  {
    id: 'top-plab-triage',
    examId: 'plab',
    subjectId: 'sub-plab-acute',
    chapterId: 'chap-plab-chestpain',
    title: 'Emergency Triage & Troponin Protocols (NICE NG185)',
    topicNumber: 1,
    duration: '40 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-plab-1',
          fileName: 'NICE_Clinical_Guideline_Acute_Chest_Pain_NHS.pdf',
          title: 'NICE NG185: Acute Chest Pain of Recent Onset',
          pages: 18,
          size: '3.8 MB',
          updated: 'Recently updated',
          author: 'NHS Foundation Trust Faculty'
        }
      ],
      images: [
        {
          id: 'img-plab-1',
          title: 'NHS Acute Medical Unit Troponin Algorithm',
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
          caption: 'High-sensitivity cardiac troponin (hs-cTn) 0h/1h rule-out/rule-in protocol.'
        }
      ],
      video: {
        title: 'PLAB 1 Clinical Vignettes: ED Chest Pain Pathway',
        duration: '30:00',
        instructor: 'Dr. Sarah Jenkins, MRCP (UK)',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
      },
      flashcards: [
        {
          id: 'fc-plab-1',
          question: 'What is the immediate pharmacological management of suspected ACS in NHS ED before transfer?',
          answer: 'Aspirin 300 mg chewable, GTN sublingual, IV access, and ECG within 10 minutes.'
        }
      ],
      clinicalNotes: 'Always perform ECG within 10 minutes of patient arrival.'
    }
  },

  // Europe Topic
  {
    id: 'top-eur-dialogue',
    examId: 'europe',
    subjectId: 'sub-eur-fsp',
    chapterId: 'chap-eur-anamnese',
    title: 'Strukturierte Schmerzanamnese & Arzt-zu-Arzt Übergabe',
    topicNumber: 1,
    duration: '35 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-eur-1',
          fileName: 'FSP_Fachsprachprufung_Schmerzanamnese_Leitfaden.pdf',
          title: 'FSP Leitfaden: Anamnesegespräch & Arzt-Brief Dokumentation',
          pages: 22,
          size: '4.5 MB',
          updated: 'Recently updated',
          author: 'Dr. med. Lukas Weber'
        }
      ],
      images: [
        {
          id: 'img-eur-1',
          title: 'SOCRATES Schema auf Deutsch (Schmerzanalyse)',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: 'Schmerzcharakter, Lokalisation, Ausstrahlung, Stärke und Begleitsymptome.'
        }
      ],
      video: {
        title: 'Simulation: Arzt-Patienten-Gespräch bei akutem Koronarsyndrom',
        duration: '25:00',
        instructor: 'Dr. med. Lukas Weber',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
      },
      flashcards: [
        {
          id: 'fc-eur-1',
          question: 'Wie übersetzen Sie "retrosternales Engegefühl mit Ausstrahlung in den linken Arm"?',
          answer: 'Retrosternal tightness radiating to the left arm (typisch für Angina Pectoris / Myokardinfarkt).'
        }
      ],
      clinicalNotes: 'Wichtig für FSP: Empathische Kommunikation und Vermeidung von Fachjargon im Patientengespräch.'
    }
  }
];

export const INITIAL_SCHEDULE = [
  // NEET PG — Week 1 (Days 1 to 7 Complete Curriculum)
  {
    id: 'sched-neet-w1-d1',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiology & ECG Foundations',
    dayNumber: 1,
    dayTitle: 'Day 1 — Valvular Heart Diseases & Murmurs',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    chapterId: 'chap-neet-valvular',
    chapterTitle: 'Valvular Heart Diseases & Auscultation Dynamics',
    topicIds: ['top-valvular-murmurs'],
    scheduledDate: '2026-09-08',
    status: 'Active',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '09:00 AM - 10:30 AM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: true,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d2',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiology & ECG Foundations',
    dayNumber: 2,
    dayTitle: 'Day 2 — Congestive Heart Failure & Pharmacotherapy',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    chapterId: 'chap-neet-hf',
    chapterTitle: 'Heart Failure & Guideline Pharmacotherapy',
    topicIds: ['top-hf-gdmt'],
    scheduledDate: '2026-09-09',
    status: 'Active',
    estimatedTime: '2.0 hours',
    lectureTimeSlot: '09:00 AM - 11:00 AM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: false,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d3',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiology & ECG Foundations',
    dayNumber: 3,
    dayTitle: 'Day 3 (Morn) — Cardiac Arrhythmias & ECG Interpretation',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    chapterId: 'chap-neet-arrhythmias',
    chapterTitle: 'Cardiac Arrhythmias & Clinical ECG Mastery',
    topicIds: ['top-ecg-arrhythmias'],
    scheduledDate: '2026-09-10',
    status: 'Active',
    estimatedTime: '2.0 hours',
    lectureTimeSlot: '09:00 AM - 11:00 AM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: true,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d3-pharma',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Clinical Pharmacology Foundations',
    dayNumber: 3,
    dayTitle: 'Day 3 (Eve) — Antiarrhythmic Drug Protocols & Pharmacotherapy',
    subjectId: 'sub-neet-pharma',
    subjectName: 'Clinical Pharmacology & Toxicology',
    chapterId: 'chap-neet-pharm-antiarrhythmics',
    chapterTitle: 'Antiarrhythmics & Vaughan-Williams Pharmacology',
    topicIds: [],
    scheduledDate: '2026-09-10',
    status: 'Active',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '04:00 PM - 05:30 PM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: false,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d4',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiology & ECG Foundations',
    dayNumber: 4,
    dayTitle: 'Day 4 — Acute Coronary Syndromes & STEMI Pathways',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    chapterId: 'chap-neet-cad',
    chapterTitle: 'Acute Coronary Syndromes & STEMI Pathways',
    topicIds: ['top-cad-stemi'],
    scheduledDate: '2026-09-11',
    status: 'Scheduled',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '09:00 AM - 10:30 AM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: false,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d5',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Respiratory Medicine Foundations',
    dayNumber: 5,
    dayTitle: 'Day 5 — Pulmonary Function Tests & Spirometry Loops',
    subjectId: 'sub-neet-pulmo',
    subjectName: 'Respiratory Medicine & Pulmonology',
    chapterId: 'chap-neet-pft',
    chapterTitle: 'Pulmonary Function Testing & Flow-Volume Loops',
    topicIds: ['top-pulmo-pft'],
    scheduledDate: '2026-09-12',
    status: 'Scheduled',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '11:00 AM - 12:30 PM IST',
    facultyName: 'Dr. Marcus Vance',
    hasLive: false,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d6',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiology & ECG Foundations',
    dayNumber: 6,
    dayTitle: 'Day 6 — High-Yield ECG Mastery & Clinical Flashcards Sprint',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    chapterId: 'chap-neet-arrhythmias',
    chapterTitle: 'Cardiac Arrhythmias & Clinical ECG Mastery',
    topicIds: ['top-ecg-arrhythmias'],
    scheduledDate: '2026-09-13',
    status: 'Scheduled',
    estimatedTime: '1.0 hour',
    lectureTimeSlot: '09:00 AM - 10:00 AM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: true,
    hasTest: false
  },
  {
    id: 'sched-neet-w1-d7',
    examId: 'neet-pg',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiology & ECG Foundations',
    dayNumber: 7,
    dayTitle: 'Day 7 — Subject Grand Test #01: Full Cardiology CBT',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    chapterId: 'chap-neet-valvular',
    chapterTitle: 'Valvular Heart Diseases & Auscultation Dynamics',
    topicIds: ['top-valvular-murmurs'],
    scheduledDate: '2026-09-14',
    status: 'Scheduled',
    estimatedTime: '1.0 hour',
    lectureTimeSlot: '10:00 AM - 11:30 AM IST',
    facultyName: 'Dr. Siddharth V.',
    hasLive: false,
    hasTest: true
  },

  // Week 2 — Pulmonology Track (NEET PG)
  {
    id: 'sched-neet-w2-d8',
    examId: 'neet-pg',
    weekNumber: 2,
    weekTitle: 'Week 2 — Respiratory Medicine & Pulmonary Pathology',
    dayNumber: 8,
    dayTitle: 'Day 8 — Pulmonary Function Tests & Flow-Volume Loops',
    subjectId: 'sub-neet-pulmo',
    subjectName: 'Respiratory Medicine & Pulmonology',
    chapterId: 'chap-neet-pft',
    chapterTitle: 'Pulmonary Function Testing & Flow-Volume Loops',
    topicIds: ['top-pulmo-pft'],
    scheduledDate: '2026-09-15',
    status: 'Scheduled',
    estimatedTime: '1.5 hours',
    hasLive: false,
    hasTest: false
  },

  // USMLE Step 1 — Week 1 Track
  {
    id: 'sched-usmle-w1-d1',
    examId: 'usmle',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiovascular Physiology & Pathology',
    dayNumber: 1,
    dayTitle: 'Day 1 — Pressure-Volume Loops & Valvular Shifts',
    subjectId: 'sub-usmle-cvs',
    subjectName: 'Cardiovascular Physiology & Pathology',
    chapterId: 'chap-usmle-pvloops',
    chapterTitle: 'Ventricular Pressure-Volume Loops & Murmurs',
    topicIds: ['top-usmle-pvloops'],
    scheduledDate: '2026-09-08',
    status: 'Active',
    estimatedTime: '2.0 hours',
    hasLive: true,
    hasTest: false
  },
  {
    id: 'sched-usmle-w1-d2',
    examId: 'usmle',
    weekNumber: 1,
    weekTitle: 'Week 1 — Cardiovascular Physiology & Pathology',
    dayNumber: 2,
    dayTitle: 'Day 2 — Autonomic Receptor Kinetics & Pressors',
    subjectId: 'sub-usmle-neuro',
    subjectName: 'Autonomic & Neuro-Pharmacology',
    chapterId: 'chap-usmle-autonomic',
    chapterTitle: 'Autonomic Pharmacology & Receptor Signaling',
    topicIds: ['top-usmle-pvloops'],
    scheduledDate: '2026-09-09',
    status: 'Scheduled',
    estimatedTime: '1.5 hours',
    hasLive: false,
    hasTest: false
  },

  // PLAB 1 — Week 1 Track
  {
    id: 'sched-plab-w1-d1',
    examId: 'plab',
    weekNumber: 1,
    weekTitle: 'Week 1 — Acute Clinical Presentations & NHS Protocols',
    dayNumber: 1,
    dayTitle: 'Day 1 — Acute Chest Pain Triage & NICE Troponin Pathways',
    subjectId: 'sub-plab-acute',
    subjectName: 'NHS Acute Clinical Presentations & Guidelines',
    chapterId: 'chap-plab-chestpain',
    chapterTitle: 'NICE Clinical Guidelines: Acute Chest Pain & ACS',
    topicIds: ['top-plab-triage'],
    scheduledDate: '2026-09-08',
    status: 'Active',
    estimatedTime: '1.5 hours',
    hasLive: true,
    hasTest: false
  },

  // Europe Licensing (FSP) — Week 1 Track
  {
    id: 'sched-eur-w1-d1',
    examId: 'europe',
    weekNumber: 1,
    weekTitle: 'Week 1 — FSP Medical Terminology & Clinical Handover',
    dayNumber: 1,
    dayTitle: 'Day 1 — Strukturierte Schmerzanamnese (SOCRATES auf Deutsch)',
    subjectId: 'sub-eur-fsp',
    subjectName: 'Fachsprachprüfung (FSP) Medical Terminology',
    chapterId: 'chap-eur-anamnese',
    chapterTitle: 'Medical History Taking (Anamnese) & Doctor Handover',
    topicIds: ['top-eur-dialogue'],
    scheduledDate: '2026-09-08',
    status: 'Active',
    estimatedTime: '1.5 hours',
    hasLive: true,
    hasTest: false
  }
];

// =============================================================================
// CURRICULUM SERVICE CLASS
// =============================================================================

class CurriculumService {
  constructor() {
    this.subjects = this.loadSubjects();
    this.chapters = this.loadChapters();
    this.topics = this.loadTopics();
    this.schedule = this.loadSchedule();
  }

  // ---------------------------------------------------------------------------
  // LOCAL STORAGE LOADERS & PERSISTENCE
  // ---------------------------------------------------------------------------
  loadSubjects() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBJECTS);
      if (stored) {
        let parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map(s => s.id));
        const missing = INITIAL_SUBJECTS.filter(s => !existingIds.has(s.id));
        let updated = false;

        // Backfill defaultTimeSlot and faculty assignments if missing
        parsed = parsed.map(s => {
          const init = INITIAL_SUBJECTS.find(i => i.id === s.id);
          if (init && (!s.defaultTimeSlot || !s.assignedFacultyName)) {
            updated = true;
            return { ...init, ...s, defaultTimeSlot: s.defaultTimeSlot || init.defaultTimeSlot, assignedFacultyName: s.assignedFacultyName || init.assignedFacultyName, facultyEmail: s.facultyEmail || init.facultyEmail };
          }
          return s;
        });

        if (missing.length > 0 || updated) {
          const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
          localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load subjects from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
  }

  saveSubjects() {
    try {
      localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(this.subjects));
      window.dispatchEvent(new CustomEvent('medprep-curriculum-updated', { detail: { type: 'subjects', data: this.subjects } }));
    } catch (e) {
      console.warn('Failed to save subjects:', e);
    }
  }

  loadChapters() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHAPTERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = INITIAL_CHAPTERS.filter(c => !existingIds.has(c.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY_CHAPTERS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chapters from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_CHAPTERS));
  }

  saveChapters() {
    try {
      localStorage.setItem(STORAGE_KEY_CHAPTERS, JSON.stringify(this.chapters));
      window.dispatchEvent(new CustomEvent('medprep-curriculum-updated', { detail: { type: 'chapters', data: this.chapters } }));
    } catch (e) {
      console.warn('Failed to save chapters:', e);
    }
  }

  loadTopics() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOPICS);
      if (stored) {
        let parsed = JSON.parse(stored);
        let updated = false;

        parsed = parsed.map(topic => {
          if (!topic.content) {
            topic.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], clinicalNotes: '' };
            updated = true;
          } else if (!topic.content.liveClasses) {
            if (topic.id === 'top-valvular-auscultation') {
              topic.content.liveClasses = [
                {
                  id: 'live-auscultation-1',
                  title: 'Live Masterclass: Heart Murmurs & Bedside Auscultation Maneuvers',
                  instructor: 'Dr. Rajiv Mehta (MD, DM Cardiology)',
                  date: 'Tomorrow',
                  time: '07:00 PM - 08:15 PM IST',
                  duration: '75 mins',
                  platform: 'Zoom Live Interactive',
                  joinUrl: 'https://zoom.us/j/9876543210',
                  meetingId: '987 654 3210',
                  passcode: 'CARDIO2026',
                  status: 'Live Now',
                  recordingUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                },
                {
                  id: 'live-auscultation-2',
                  title: 'Clinical Grand Round: Severe AS vs MR Hemodynamic Diagnostic Traps',
                  instructor: 'Dr. Siddharth V. (Clinical Specialist)',
                  date: 'Friday',
                  time: '08:00 PM - 09:00 PM IST',
                  duration: '60 mins',
                  platform: 'Google Meet',
                  joinUrl: 'https://meet.google.com/med-card-live',
                  meetingId: 'med-card-live',
                  passcode: 'NEETPG99',
                  status: 'Scheduled',
                  recordingUrl: ''
                }
              ];
            } else {
              topic.content.liveClasses = [];
            }
            updated = true;
          }
          return topic;
        });

        const existingIds = new Set(parsed.map(t => t.id));
        const missing = INITIAL_TOPICS.filter(t => !existingIds.has(t.id));
        if (missing.length > 0 || updated) {
          const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
          localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load topics from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TOPICS));
  }

  saveTopics() {
    try {
      localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(this.topics));
      window.dispatchEvent(new CustomEvent('medprep-curriculum-updated', { detail: { type: 'topics', data: this.topics } }));
    } catch (e) {
      console.warn('Failed to save topics:', e);
    }
  }

  loadSchedule() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (stored) {
        let parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map(s => s.id));
        const missing = INITIAL_SCHEDULE.filter(s => !existingIds.has(s.id));
        let updated = false;

        parsed = parsed.map(slot => {
          const init = INITIAL_SCHEDULE.find(i => i.id === slot.id);
          if (init && !slot.lectureTimeSlot) {
            updated = true;
            return { ...init, ...slot, lectureTimeSlot: init.lectureTimeSlot, facultyName: init.facultyName || slot.facultyName };
          }
          return slot;
        });

        if (missing.length > 0 || updated) {
          const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
          localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load schedule from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_SCHEDULE));
  }

  saveSchedule() {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(this.schedule));
      window.dispatchEvent(new CustomEvent('medprep-schedule-updated', { detail: { type: 'schedule', data: this.schedule } }));
    } catch (e) {
      console.warn('Failed to save schedule:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. SUBJECTS CRUD
  // ---------------------------------------------------------------------------
  getSubjects(examId = null) {
    if (!examId || examId === 'all') return this.subjects;
    return this.subjects.filter(s => s.examId === examId);
  }

  getSubjectById(id) {
    return this.subjects.find(s => s.id === id) || null;
  }

  saveSubject(data) {
    const existingIndex = this.subjects.findIndex(s => s.id === data.id);
    if (existingIndex !== -1) {
      this.subjects[existingIndex] = { ...this.subjects[existingIndex], ...data };
    } else {
      const newSubject = {
        id: data.id || `sub-${data.examId}-${Date.now()}`,
        examId: data.examId,
        name: data.name,
        code: data.code || `SUB-${Date.now().toString().slice(-4)}`,
        icon: data.icon || 'BookOpen',
        color: data.color || 'brand',
        description: data.description || '',
        order: this.subjects.filter(s => s.examId === data.examId).length + 1,
        status: data.status || 'Active'
      };
      this.subjects.push(newSubject);
    }
    this.saveSubjects();
    return this.subjects;
  }

  deleteSubject(id) {
    // Also delete or cascade warn for child chapters
    this.subjects = this.subjects.filter(s => s.id !== id);
    this.chapters = this.chapters.filter(c => c.subjectId !== id);
    this.topics = this.topics.filter(t => t.subjectId !== id);
    this.saveSubjects();
    this.saveChapters();
    this.saveTopics();
    return this.subjects;
  }

  toggleSubjectStatus(id) {
    const sub = this.subjects.find(s => s.id === id);
    if (!sub) return null;
    sub.status = sub.status === 'Active' ? 'Draft' : 'Active';
    this.saveSubjects();
    return sub;
  }

  moveSubjectOrder(id, direction) {
    const sub = this.subjects.find(s => s.id === id);
    if (!sub) return this.subjects;
    
    const examSubs = this.subjects
      .filter(s => s.examId === sub.examId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const currentIndex = examSubs.findIndex(s => s.id === id);
    if (currentIndex === -1) return this.subjects;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= examSubs.length) return this.subjects;

    const neighbor = examSubs[targetIndex];
    const prevOrder = sub.order ?? (currentIndex + 1);
    const neighborOrder = neighbor.order ?? (targetIndex + 1);
    
    if (prevOrder === neighborOrder) {
      sub.order = targetIndex + 1;
      neighbor.order = currentIndex + 1;
    } else {
      sub.order = neighborOrder;
      neighbor.order = prevOrder;
    }

    this.saveSubjects();
    return this.subjects;
  }

  // ---------------------------------------------------------------------------
  // 2. CHAPTERS CRUD
  // ---------------------------------------------------------------------------
  getChapters(subjectId = null, examId = null) {
    let list = this.chapters;
    if (examId && examId !== 'all') {
      list = list.filter(c => c.examId === examId);
    }
    if (subjectId && subjectId !== 'all') {
      list = list.filter(c => c.subjectId === subjectId);
    }
    return list;
  }

  getChapterById(id) {
    return this.chapters.find(c => c.id === id) || null;
  }

  saveChapter(data) {
    const existingIndex = this.chapters.findIndex(c => c.id === data.id);
    if (existingIndex !== -1) {
      this.chapters[existingIndex] = { ...this.chapters[existingIndex], ...data };
    } else {
      const subjectChapters = this.chapters.filter(c => c.subjectId === data.subjectId);
      const newChapter = {
        id: data.id || `chap-${Date.now()}`,
        examId: data.examId,
        subjectId: data.subjectId,
        title: data.title,
        chapterNumber: Number(data.chapterNumber) || subjectChapters.length + 1,
        description: data.description || '',
        status: data.status || 'Active'
      };
      this.chapters.push(newChapter);
    }
    this.saveChapters();
    return this.chapters;
  }

  deleteChapter(id) {
    this.chapters = this.chapters.filter(c => c.id !== id);
    this.topics = this.topics.filter(t => t.chapterId !== id);
    this.saveChapters();
    this.saveTopics();
    return this.chapters;
  }

  moveChapterOrder(id, direction) {
    const chap = this.chapters.find(c => c.id === id);
    if (!chap) return this.chapters;

    const subjectChaps = this.chapters
      .filter(c => c.subjectId === chap.subjectId)
      .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

    const currentIndex = subjectChaps.findIndex(c => c.id === id);
    if (currentIndex === -1) return this.chapters;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= subjectChaps.length) return this.chapters;

    const neighbor = subjectChaps[targetIndex];
    const prevNum = chap.chapterNumber ?? (currentIndex + 1);
    const neighborNum = neighbor.chapterNumber ?? (targetIndex + 1);

    if (prevNum === neighborNum) {
      chap.chapterNumber = targetIndex + 1;
      neighbor.chapterNumber = currentIndex + 1;
    } else {
      chap.chapterNumber = neighborNum;
      neighbor.chapterNumber = prevNum;
    }

    this.saveChapters();
    return this.chapters;
  }

  reorderChapters(subjectId, orderedIds) {
    orderedIds.forEach((id, index) => {
      const chap = this.chapters.find(c => c.id === id);
      if (chap) {
        chap.chapterNumber = index + 1;
      }
    });
    this.saveChapters();
    return this.chapters;
  }

  moveTopicOrder(id, direction) {
    const top = this.topics.find(t => t.id === id);
    if (!top) return this.topics;

    const chapTopics = this.topics
      .filter(t => t.chapterId === top.chapterId)
      .sort((a, b) => (a.topicNumber || 0) - (b.topicNumber || 0));

    const currentIndex = chapTopics.findIndex(t => t.id === id);
    if (currentIndex === -1) return this.topics;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= chapTopics.length) return this.topics;

    const neighbor = chapTopics[targetIndex];
    const prevNum = top.topicNumber ?? (currentIndex + 1);
    const neighborNum = neighbor.topicNumber ?? (targetIndex + 1);

    if (prevNum === neighborNum) {
      top.topicNumber = targetIndex + 1;
      neighbor.topicNumber = currentIndex + 1;
    } else {
      top.topicNumber = neighborNum;
      neighbor.topicNumber = prevNum;
    }

    this.saveTopics();
    return this.topics;
  }

  reorderTopics(chapterId, orderedIds) {
    orderedIds.forEach((id, index) => {
      const top = this.topics.find(t => t.id === id);
      if (top) {
        top.topicNumber = index + 1;
      }
    });
    this.saveTopics();
    return this.topics;
  }

  // ---------------------------------------------------------------------------
  // 3. TOPICS CRUD
  // ---------------------------------------------------------------------------
  getTopics(chapterId = null, subjectId = null, examId = null) {
    let list = this.topics;
    if (examId && examId !== 'all') {
      list = list.filter(t => t.examId === examId);
    }
    if (subjectId && subjectId !== 'all') {
      list = list.filter(t => t.subjectId === subjectId);
    }
    if (chapterId && chapterId !== 'all') {
      list = list.filter(t => t.chapterId === chapterId);
    }
    return list;
  }

  getTopicById(id) {
    return this.topics.find(t => t.id === id) || null;
  }

  saveTopic(data) {
    const existingIndex = this.topics.findIndex(t => t.id === data.id);
    if (existingIndex !== -1) {
      this.topics[existingIndex] = {
        ...this.topics[existingIndex],
        ...data,
        content: data.content || this.topics[existingIndex].content || {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          clinicalNotes: ''
        }
      };
    } else {
      const chapterTopics = this.topics.filter(t => t.chapterId === data.chapterId);
      const newTopic = {
        id: data.id || `top-${Date.now()}`,
        examId: data.examId,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        title: data.title,
        topicNumber: Number(data.topicNumber) || chapterTopics.length + 1,
        duration: data.duration || '45 mins',
        difficulty: data.difficulty || 'High-Yield',
        status: data.status || 'Published',
        content: data.content || {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          clinicalNotes: ''
        }
      };
      this.topics.push(newTopic);
    }
    this.saveTopics();
    return this.topics;
  }

  deleteTopic(id) {
    this.topics = this.topics.filter(t => t.id !== id);
    // Remove topic from any schedule slots that reference it
    this.schedule = this.schedule.map(slot => ({
      ...slot,
      topicIds: (slot.topicIds || []).filter(tid => tid !== id)
    }));
    this.saveTopics();
    this.saveSchedule();
    return this.topics;
  }

  // ---------------------------------------------------------------------------
  // 4. TOPIC CONTENT SUB-OPERATIONS (PDF, Images, Video, Flashcards)
  // ---------------------------------------------------------------------------
  getTopicContent(topicId) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    if (!topic.content) {
      topic.content = { pdfList: [], images: [], video: null, flashcards: [], clinicalNotes: '' };
    }
    return topic.content;
  }

  saveTopicContent(topicId, newContent) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    topic.content = { ...topic.content, ...newContent };
    this.saveTopics();
    return topic.content;
  }

  addTopicPdf(topicId, pdfData) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    if (!topic.content) topic.content = { pdfList: [], images: [], video: null, flashcards: [] };
    const newPdf = {
      id: `pdf-${Date.now()}`,
      fileName: pdfData.fileName || 'Clinical_Study_Notes.pdf',
      title: pdfData.title || 'High-Yield Topic Notes',
      pages: Number(pdfData.pages) || 16,
      size: pdfData.size || '3.2 MB',
      updated: 'Just now',
      author: pdfData.author || 'Faculty Specialist'
    };
    topic.content.pdfList = [newPdf, ...(topic.content.pdfList || [])];
    this.saveTopics();
    return topic.content;
  }

  deleteTopicPdf(topicId, pdfId) {
    const topic = this.getTopicById(topicId);
    if (!topic || !topic.content) return null;
    topic.content.pdfList = (topic.content.pdfList || []).filter(p => p.id !== pdfId);
    this.saveTopics();
    return topic.content;
  }

  addTopicImage(topicId, imageData) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    if (!topic.content) topic.content = { pdfList: [], images: [], video: null, flashcards: [] };
    const newImage = {
      id: `img-${Date.now()}`,
      title: imageData.title || 'Diagnostic ECG / Clinical Diagram',
      url: imageData.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
      caption: imageData.caption || 'Clinical diagnostic specimen with annotations.'
    };
    topic.content.images = [newImage, ...(topic.content.images || [])];
    this.saveTopics();
    return topic.content;
  }

  deleteTopicImage(topicId, imageId) {
    const topic = this.getTopicById(topicId);
    if (!topic || !topic.content) return null;
    topic.content.images = (topic.content.images || []).filter(img => img.id !== imageId);
    this.saveTopics();
    return topic.content;
  }

  saveTopicVideo(topicId, videoData) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    if (!topic.content) topic.content = { pdfList: [], images: [], video: null, flashcards: [] };
    if (!videoData) {
      topic.content.video = null;
    } else {
      topic.content.video = {
        title: videoData.title || 'Clinical Video Lecture',
        duration: videoData.duration || '40:00',
        instructor: videoData.instructor || 'Specialist Lead',
        url: videoData.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: videoData.thumbnail || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
        chapters: videoData.chapters || []
      };
    }
    this.saveTopics();
    return topic.content;
  }

  addTopicFlashcard(topicId, cardData) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    if (!topic.content) topic.content = { pdfList: [], images: [], video: null, flashcards: [] };
    const newCard = {
      id: `fc-${Date.now()}`,
      question: cardData.question,
      answer: cardData.answer
    };
    topic.content.flashcards = [...(topic.content.flashcards || []), newCard];
    this.saveTopics();
    return topic.content;
  }

  deleteTopicFlashcard(topicId, cardId) {
    const topic = this.getTopicById(topicId);
    if (!topic || !topic.content) return null;
    topic.content.flashcards = (topic.content.flashcards || []).filter(c => c.id !== cardId);
    this.saveTopics();
    return topic.content;
  }

  // Live Classes Methods
  addTopicLiveClass(topicId, liveData) {
    const topic = this.getTopicById(topicId);
    if (!topic) return null;
    if (!topic.content) topic.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [] };
    const newLive = {
      id: `live-${Date.now()}`,
      title: liveData.title || 'Live Interactive Clinical Session',
      instructor: liveData.instructor || 'Lead Medical Faculty',
      date: liveData.date || new Date().toISOString().split('T')[0],
      time: liveData.time || '07:00 PM IST',
      duration: liveData.duration || '60 mins',
      platform: liveData.platform || 'Zoom Video',
      joinUrl: liveData.joinUrl || 'https://zoom.us/j/9876543210',
      meetingId: liveData.meetingId || '987 654 3210',
      passcode: liveData.passcode || 'MEDPREP',
      status: liveData.status || 'Scheduled', // 'Scheduled' | 'Live Now' | 'Completed'
      recordingUrl: liveData.recordingUrl || ''
    };
    topic.content.liveClasses = [newLive, ...(topic.content.liveClasses || [])];
    this.saveTopics();
    return topic.content;
  }

  updateTopicLiveClass(topicId, liveId, liveData) {
    const topic = this.getTopicById(topicId);
    if (!topic || !topic.content) return null;
    topic.content.liveClasses = (topic.content.liveClasses || []).map(item => 
      item.id === liveId ? { ...item, ...liveData } : item
    );
    this.saveTopics();
    return topic.content;
  }

  deleteTopicLiveClass(topicId, liveId) {
    const topic = this.getTopicById(topicId);
    if (!topic || !topic.content) return null;
    topic.content.liveClasses = (topic.content.liveClasses || []).filter(item => item.id !== liveId);
    this.saveTopics();
    return topic.content;
  }

  // ---------------------------------------------------------------------------
  // 5. SCHEDULE (PLANNER) CRUD
  // ---------------------------------------------------------------------------
  getSchedule(examId = 'neet-pg') {
    return this.schedule.filter(s => s.examId === examId).sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
      return a.dayNumber - b.dayNumber;
    });
  }

  getScheduleSlot(examId, weekNumber, dayNumber) {
    return this.schedule.find(
      s => s.examId === examId && 
           Number(s.weekNumber) === Number(weekNumber) && 
           Number(s.dayNumber) === Number(dayNumber)
    ) || null;
  }

  saveScheduleSlot(slotData) {
    const existingIndex = this.schedule.findIndex(
      s => (slotData.id && s.id === slotData.id) ||
           (s.examId === slotData.examId && Number(s.dayNumber) === Number(slotData.dayNumber) && s.subjectId === slotData.subjectId)
    );

    const subject = this.getSubjectById(slotData.subjectId);
    const chapter = this.getChapterById(slotData.chapterId);

    const payload = {
      id: slotData.id || `sched-${slotData.examId}-d${slotData.dayNumber}-${slotData.subjectId || 'slot'}-${Date.now()}`,
      examId: slotData.examId,
      weekNumber: Number(slotData.weekNumber),
      weekTitle: slotData.weekTitle || `Week ${slotData.weekNumber}`,
      dayNumber: Number(slotData.dayNumber),
      dayTitle: slotData.dayTitle || `Day ${slotData.dayNumber}`,
      subjectId: slotData.subjectId || null,
      subjectName: subject?.name || slotData.subjectName || 'Medical Subject',
      subjectCode: subject?.code || '',
      subjectColor: subject?.color || 'rose',
      chapterId: slotData.chapterId || null,
      chapterTitle: chapter?.title || slotData.chapterTitle || 'Clinical Chapter',
      topicIds: slotData.topicIds || [],
      scheduledDate: slotData.scheduledDate || new Date().toISOString().split('T')[0],
      status: slotData.status || 'Active',
      estimatedTime: slotData.estimatedTime || '1.5 hours',
      lectureTimeSlot: slotData.lectureTimeSlot || subject?.defaultTimeSlot || '09:00 AM - 10:30 AM IST',
      facultyName: slotData.facultyName || subject?.assignedFacultyName || 'Specialist Lead',
      hasLive: Boolean(slotData.hasLive),
      hasTest: Boolean(slotData.hasTest),
      notes: slotData.notes || ''
    };

    if (existingIndex !== -1) {
      this.schedule[existingIndex] = { ...this.schedule[existingIndex], ...payload };
    } else {
      this.schedule.push(payload);
    }

    this.saveSchedule();
    return payload;
  }

  getScheduleBySubject(examId = 'neet-pg', subjectId = 'all') {
    const list = this.getSchedule(examId);
    if (!subjectId || subjectId === 'all') return list;
    return list.filter(s => s.subjectId === subjectId);
  }

  getFacultyAssignedSubjects(userEmail, examId = 'all') {
    const allSubs = this.getSubjects(examId);
    if (!userEmail) return allSubs;
    return allSubs.filter(s => {
      if (s.facultyEmail === userEmail) return true;
      if (userEmail === 'faculty@demo.com' && (s.id === 'sub-neet-cardio' || s.id === 'sub-neet-pharma' || s.id === 'sub-usmle-cvs')) return true;
      return false;
    });
  }

  deleteScheduleSlot(id) {
    this.schedule = this.schedule.filter(s => s.id !== id);
    this.saveSchedule();
    return this.schedule;
  }

  linkTopicToDay(examId, weekNumber, dayNumber, topicId) {
    let slot = this.getScheduleSlot(examId, weekNumber, dayNumber);
    const topic = this.getTopicById(topicId);
    if (!topic) return null;

    if (!slot) {
      slot = this.saveScheduleSlot({
        examId,
        weekNumber,
        dayNumber,
        dayTitle: `Day ${dayNumber} — ${topic.title}`,
        subjectId: topic.subjectId,
        chapterId: topic.chapterId,
        topicIds: [topicId],
        status: 'Active'
      });
    } else {
      const currentIds = slot.topicIds || [];
      if (!currentIds.includes(topicId)) {
        slot.topicIds = [...currentIds, topicId];
      }
      if (!slot.subjectId) slot.subjectId = topic.subjectId;
      if (!slot.chapterId) slot.chapterId = topic.chapterId;
      this.saveSchedule();
    }
    return slot;
  }

  unlinkTopicFromDay(examId, dayNumber, topicId) {
    const slot = this.schedule.find(s => s.examId === examId && Number(s.dayNumber) === Number(dayNumber));
    if (!slot) return null;
    slot.topicIds = (slot.topicIds || []).filter(id => id !== topicId);
    this.saveSchedule();
    return slot;
  }

  // ---------------------------------------------------------------------------
  // 6. DYNAMIC DAY RESOLVER FOR STUDENT LMS (/day/:dayId)
  // Bridging hierarchical content seamlessly into DayContentView
  // ---------------------------------------------------------------------------
  getDayResolvedContent(dayId = '3', examId = null, slotId = null) {
    let slot = null;
    if (slotId) {
      slot = this.schedule.find(s => s.id === slotId);
    }
    if (!slot && examId && examId !== 'all') {
      slot = this.schedule.find(s => s.examId === examId && String(s.dayNumber) === String(dayId));
    }
    if (!slot) {
      slot = this.schedule.find(s => String(s.dayNumber) === String(dayId));
    }

    const fallbackMock = dayContentStore[String(dayId)] || dayContentStore['1'] || {};

    // If slot has linked topics with content, aggregate them
    if (slot && slot.topicIds && slot.topicIds.length > 0) {
      const linkedTopics = slot.topicIds.map(tid => this.getTopicById(tid)).filter(Boolean);
      const primaryTopic = linkedTopics[0];
      
      if (primaryTopic) {
        const subject = this.getSubjectById(slot.subjectId || primaryTopic.subjectId);
        const chapter = this.getChapterById(slot.chapterId || primaryTopic.chapterId);

        // Aggregate assets across all linked topics
        const aggregatedPdfs = [];
        const aggregatedImages = [];
        let primaryVideo = null;
        const aggregatedCards = [];

        linkedTopics.forEach(t => {
          if (t.content) {
            if (t.content.pdfList && t.content.pdfList.length > 0) {
              aggregatedPdfs.push(...t.content.pdfList);
            } else if (t.content.pdf) {
              aggregatedPdfs.push(t.content.pdf);
            }
            if (t.content.images && t.content.images.length > 0) {
              aggregatedImages.push(...t.content.images);
            }
            if (!primaryVideo && t.content.video) {
              primaryVideo = t.content.video;
            }
            if (t.content.flashcards && t.content.flashcards.length > 0) {
              aggregatedCards.push(...t.content.flashcards);
            }
          }
        });

        // Fallbacks if topic has empty asset buckets so preview is never blank
        if (aggregatedPdfs.length === 0 && fallbackMock.pdf) {
          aggregatedPdfs.push(fallbackMock.pdf);
        }
        if (aggregatedImages.length === 0 && fallbackMock.images) {
          aggregatedImages.push(...fallbackMock.images);
        }
        if (!primaryVideo && fallbackMock.video) {
          primaryVideo = fallbackMock.video;
        }
        if (aggregatedCards.length === 0 && fallbackMock.flashcards) {
          aggregatedCards.push(...fallbackMock.flashcards);
        }

        const primaryPdf = aggregatedPdfs[0] || fallbackMock.pdf || null;

        // Compute active tabs based on available assets
        const activeTabs = [];
        if (aggregatedPdfs.length > 0) activeTabs.push('notes');
        if (aggregatedImages.length > 0) activeTabs.push('images');
        if (primaryVideo) activeTabs.push('video');
        if (aggregatedCards.length > 0) activeTabs.push('flashcards');
        if (slot.hasLive || fallbackMock.live?.hasSession) activeTabs.push('live');
        if (slot.hasTest) activeTabs.push('test');

        return {
          dayNumber: Number(dayId),
          weekNumber: slot.weekNumber || 1,
          title: slot.dayTitle || primaryTopic.title,
          estimatedTime: slot.estimatedTime || primaryTopic.duration || '1.5 hours',
          subject: subject?.name || slot.subjectName || 'Clinical Medicine',
          subjectName: subject?.name || slot.subjectName || 'Clinical Medicine',
          unit: chapter?.title || slot.chapterTitle || 'Clinical Chapter',
          chapterTitle: chapter?.title || slot.chapterTitle || 'Clinical Chapter',
          topicTitle: primaryTopic.title,
          topics: linkedTopics,
          activeTabs: activeTabs.length > 0 ? activeTabs : ['notes', 'images', 'video', 'flashcards', 'live'],
          pdf: primaryPdf,
          notesPdf: primaryPdf,
          pdfList: aggregatedPdfs,
          images: aggregatedImages,
          galleryImages: aggregatedImages,
          video: primaryVideo,
          videoData: primaryVideo,
          flashcards: aggregatedCards,
          hasLive: Boolean(slot.hasLive),
          hasTest: Boolean(slot.hasTest),
          live: {
            hasSession: Boolean(slot.hasLive),
            title: `Live Clinical Grand Rounds: ${primaryTopic.title}`,
            faculty: slot.facultyName || subject?.assignedFacultyName || 'Dr. Siddharth V. (MD Cardiology)',
            duration: '60 mins',
            time: slot.lectureTimeSlot ? slot.lectureTimeSlot.split('-')[0].trim() : '09:00 AM IST'
          }
        };
      }
    }

    // If slot exists without topicIds (e.g. Grand Mock Test day 7)
    if (slot) {
      const subject = this.getSubjectById(slot.subjectId);
      const chapter = this.getChapterById(slot.chapterId);
      const primaryPdf = fallbackMock.pdf || null;
      const pdfs = fallbackMock.pdfList || (primaryPdf ? [primaryPdf] : []);
      const imgs = fallbackMock.images || [];
      const vid = fallbackMock.video || null;
      const fcs = fallbackMock.flashcards || [];

      const activeTabs = [];
      if (pdfs.length > 0) activeTabs.push('notes');
      if (imgs.length > 0) activeTabs.push('images');
      if (vid) activeTabs.push('video');
      if (fcs.length > 0) activeTabs.push('flashcards');
      if (slot.hasLive) activeTabs.push('live');
      if (slot.hasTest) activeTabs.push('test');

      return {
        dayNumber: Number(dayId),
        weekNumber: slot.weekNumber || 1,
        title: slot.dayTitle || `Day ${dayId}`,
        estimatedTime: slot.estimatedTime || '1.0 hour',
        subject: subject?.name || slot.subjectName || 'Clinical Medicine',
        subjectName: subject?.name || slot.subjectName || 'Clinical Medicine',
        unit: chapter?.title || slot.chapterTitle || 'Review & Assessment',
        chapterTitle: chapter?.title || slot.chapterTitle || 'Review & Assessment',
        topicTitle: slot.dayTitle,
        topics: [],
        activeTabs: activeTabs.length > 0 ? activeTabs : ['notes', 'images', 'video', 'flashcards'],
        pdf: primaryPdf,
        notesPdf: primaryPdf,
        pdfList: pdfs,
        images: imgs,
        galleryImages: imgs,
        video: vid,
        videoData: vid,
        flashcards: fcs,
        hasLive: Boolean(slot.hasLive),
        hasTest: Boolean(slot.hasTest),
        live: {
          hasSession: Boolean(slot.hasLive),
          title: `Live Clinical Grand Rounds: ${slot.dayTitle}`,
          faculty: slot.facultyName || subject?.assignedFacultyName || 'Dr. Siddharth V. (MD Cardiology)',
          duration: '60 mins',
          time: slot.lectureTimeSlot ? slot.lectureTimeSlot.split('-')[0].trim() : '09:00 AM IST'
        }
      };
    }

    // Graceful fallback to mock data dayContentStore
    if (dayContentStore[String(dayId)]) {
      const d = dayContentStore[String(dayId)];
      return {
        ...d,
        subject: d.subject || d.subjectName || 'Cardiology & Hemodynamics',
        subjectName: d.subjectName || d.subject || 'Cardiology & Hemodynamics',
        unit: d.unit || d.chapterTitle || 'Valvular Heart Diseases',
        chapterTitle: d.chapterTitle || d.unit || 'Valvular Heart Diseases',
        notesPdf: d.pdf,
        galleryImages: d.images,
        videoData: d.video
      };
    }

    // Default empty day structure
    return {
      dayNumber: Number(dayId),
      weekNumber: 1,
      title: `Day ${dayId} — Clinical Practice & Revision`,
      estimatedTime: '1.5 hours',
      subject: 'Cardiology & Hemodynamics',
      subjectName: 'Cardiology & Hemodynamics',
      unit: 'Valvular Heart Diseases',
      chapterTitle: 'Valvular Heart Diseases',
      activeTabs: ['notes', 'images', 'video', 'flashcards', 'live'],
      pdf: fallbackMock.pdf || null,
      notesPdf: fallbackMock.pdf || null,
      pdfList: fallbackMock.pdfList || (fallbackMock.pdf ? [fallbackMock.pdf] : []),
      images: fallbackMock.images || [],
      galleryImages: fallbackMock.images || [],
      video: fallbackMock.video || null,
      videoData: fallbackMock.video || null,
      flashcards: fallbackMock.flashcards || [],
      hasLive: false,
      hasTest: false,
      live: { hasSession: false }
    };
  }

  getAllScheduledDayNumbers(examId = null) {
    const slots = examId ? this.getSchedule(examId) : this.schedule;
    const nums = Array.from(new Set(slots.map(s => Number(s.dayNumber)))).sort((a, b) => a - b);
    return nums.length > 0 ? nums : [1, 2, 3, 4, 5, 6, 7];
  }

  // ---------------------------------------------------------------------------
  // REACTIVE LISTENERS
  // ---------------------------------------------------------------------------
  subscribeCurriculum(callback) {
    const handler = (e) => callback(e.detail || {
      subjects: this.subjects,
      chapters: this.chapters,
      topics: this.topics
    });
    window.addEventListener('medprep-curriculum-updated', handler);
    return () => window.removeEventListener('medprep-curriculum-updated', handler);
  }

  subscribeSchedule(callback) {
    const handler = (e) => callback(e.detail || { schedule: this.schedule });
    window.addEventListener('medprep-schedule-updated', handler);
    return () => window.removeEventListener('medprep-schedule-updated', handler);
  }
}

export const curriculumService = new CurriculumService();
