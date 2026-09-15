// =============================================================================
// CURRICULUM SERVICE — PHASE 1 HIERARCHICAL CURRICULUM ARCHITECTURE
// Hierarchy: Exam -> Subject -> Module -> Lecture -> Lecture Content (PDF/Images/Video/Cards/Topics) -> Study Schedule
// Persists in localStorage with cross-component reactive event dispatching
// =============================================================================

import { dayContentStore } from '../data/mockData.js';
import { studyPlan28DaysCurriculum } from '../data/studyPlanCurriculumData.js';

const STORAGE_KEY_SUBJECTS = 'medprep_curriculum_subjects_v1';
const STORAGE_KEY_MODULES = 'medprep_curriculum_modules_v1';
const STORAGE_KEY_LECTURES = 'medprep_curriculum_lectures_v1';
const STORAGE_KEY_SCHEDULE = 'medprep_curriculum_schedule_v1';

// Legacy keys from the pre-rename Chapter/Topic model (kept only for one-time migration)
const LEGACY_STORAGE_KEY_CHAPTERS = 'medprep_curriculum_chapters_v1';
const LEGACY_STORAGE_KEY_TOPICS = 'medprep_curriculum_topics_v1';

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

export const INITIAL_MODULES = [
  // Under NEET Cardiology
  {
    id: 'mod-neet-valvular',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Valvular Heart Diseases & Auscultation Dynamics',
    moduleNumber: 1,
    description: 'Aortic stenosis, regurgitation, mitral valve prolapse, and diagnostic auscultatory maneuvers.',
    status: 'Active'
  },
  {
    id: 'mod-neet-hf',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Heart Failure & Guideline Pharmacotherapy',
    moduleNumber: 2,
    description: 'HFrEF vs HFpEF, neurohormonal activation, ARNI therapy, and SGLT2 inhibitor trials.',
    status: 'Active'
  },
  {
    id: 'mod-neet-arrhythmias',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Cardiac Arrhythmias & Clinical ECG Mastery',
    moduleNumber: 3,
    description: 'Wide complex tachycardias, Brugada vs Vereckei criteria, AV blocks, and ACLS algorithms.',
    status: 'Active'
  },
  {
    id: 'mod-neet-cad',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    title: 'Acute Coronary Syndromes & STEMI Pathways',
    moduleNumber: 4,
    description: 'Plaque rupture, biomarker kinetics, primary PCI vs thrombolysis, and TIMI risk scoring.',
    status: 'Active'
  },

  // Under NEET Pulmonology
  {
    id: 'mod-neet-pft',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    title: 'Pulmonary Function Testing & Flow-Volume Loops',
    moduleNumber: 1,
    description: 'Spirometry interpretation, diffusion capacity (DLCO), and airway resistance.',
    status: 'Active'
  },
  {
    id: 'mod-neet-copd',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    title: 'COPD, Bronchial Asthma & Bronchiectasis',
    moduleNumber: 2,
    description: 'GOLD staging guidelines, acute exacerbations, biological therapies, and cystic fibrosis.',
    status: 'Active'
  },
  {
    id: 'mod-neet-ards',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    title: 'ARDS, Sepsis & Mechanical Ventilation Protocols',
    moduleNumber: 3,
    description: 'Berlin definition, lung-protective ventilation, prone positioning, and ECMO indications.',
    status: 'Active'
  },

  // Under NEET Nephrology
  {
    id: 'mod-neet-gn',
    examId: 'neet-pg',
    subjectId: 'sub-neet-nephro',
    title: 'Glomerular Disorders & Biopsy Histology',
    moduleNumber: 1,
    description: 'Nephritic vs nephrotic presentation, electron microscopy pearls, and immunofluorescence.',
    status: 'Active'
  },
  {
    id: 'mod-neet-acidbase',
    examId: 'neet-pg',
    subjectId: 'sub-neet-nephro',
    title: 'Clinical Acid-Base Disorders & Electrolytes',
    moduleNumber: 2,
    description: 'Anion gap calculations, Winter formula, delta ratio, and renal tubular acidosis.',
    status: 'Active'
  },

  // Under NEET Clinical Pharmacology
  {
    id: 'mod-neet-pharm-receptors',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pharma',
    title: 'Autonomic Receptors & Sympathomimetic Agents',
    moduleNumber: 1,
    description: 'Alpha/Beta adrenergic agonists, pressor selection in septic shock, and chronotropic effects.',
    status: 'Active'
  },
  {
    id: 'mod-neet-pharm-antiarrhythmics',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pharma',
    title: 'Antiarrhythmics & Vaughan-Williams Pharmacology',
    moduleNumber: 2,
    description: 'Sodium channel kinetics, beta-blocker trials, amiodarone toxicity pearls, and adenosine dosing.',
    status: 'Active'
  },

  // USMLE Step 1 Modules
  {
    id: 'mod-usmle-pvloops',
    examId: 'usmle',
    subjectId: 'sub-usmle-cvs',
    title: 'Ventricular Pressure-Volume Loops & Murmurs',
    moduleNumber: 1,
    description: 'Wiggers diagram, stroke volume, inotropy, and pressure-volume loop shifts in valvular stenosis and regurgitation.',
    status: 'Active'
  },
  {
    id: 'mod-usmle-autonomic',
    examId: 'usmle',
    subjectId: 'sub-usmle-neuro',
    title: 'Autonomic Pharmacology & Receptor Signaling',
    moduleNumber: 1,
    description: 'Alpha, beta, and muscarinic receptor kinetics, autonomic reflex loops, and pressor mechanisms.',
    status: 'Active'
  },

  // PLAB 1 & 2 Modules
  {
    id: 'mod-plab-chestpain',
    examId: 'plab',
    subjectId: 'sub-plab-acute',
    title: 'NICE Clinical Guidelines: Acute Chest Pain & ACS',
    moduleNumber: 1,
    description: 'Emergency department triage, troponin pathway, GRACE risk assessment, and Sepsis 6 resuscitation.',
    status: 'Active'
  },

  // Europe Licensing Modules
  {
    id: 'mod-eur-anamnese',
    examId: 'europe',
    subjectId: 'sub-eur-fsp',
    title: 'Medical History Taking (Anamnese) & Doctor Handover',
    moduleNumber: 1,
    description: 'German medical terminology, SOCRATES pain history in German, and structured doctor-to-doctor presentation.',
    status: 'Active'
  }
];

export const INITIAL_LECTURES = [
  // Under Module: Valvular Heart Diseases
  {
    id: 'lec-valvular-murmurs',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-valvular',
    title: 'Aortic Stenosis & Regurgitation Auscultation Pearls',
    lectureNumber: 1,
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
      topics: [
        { id: 'lt-valvular-1', title: 'Aortic Stenosis Grading & Gorlin Formula', order: 1, summary: 'Valve area cutoffs, mean gradient thresholds, and low-flow low-gradient AS.' },
        { id: 'lt-valvular-2', title: 'Mitral Regurgitation & Austin Flint Murmur', order: 2, summary: 'Acute vs chronic MR hemodynamics and the Austin Flint murmur mechanism.' }
      ],
      clinicalNotes: 'Severe aortic stenosis with valve area < 1.0 cm2 or mean gradient > 40 mmHg requires prompt valve replacement.'
    }
  },

  {
    id: 'lec-valvular-mitral',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-valvular',
    title: 'Mitral Stenosis & Mitral Regurgitation: Murmurs, PV Loops & Hemodynamics',
    lectureNumber: 2,
    duration: '45 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-valvular-2',
          fileName: 'Mitral_Valve_Pathology_and_Auscultation_Mastery.pdf',
          title: 'Mitral Stenosis (Opening Snap) vs MR (Holosystolic Murmur) Clinical Protocol',
          pages: 24,
          size: '5.1 MB',
          updated: 'Recently updated',
          author: 'Dr. Siddharth V. (MD, DM Cardiology)'
        }
      ],
      images: [
        {
          id: 'img-valvular-3',
          title: 'Mitral Valve Opening Snap and Diastolic Rumble Timing',
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 3: A2-to-opening snap (A2-OS) interval narrows with increasing severity of mitral stenosis.'
        },
        {
          id: 'img-valvular-4',
          title: 'Color Doppler Echocardiography of Severe Mitral Regurgitation Jet',
          url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 4: Eccentric regurgitant jet reaching posterior wall of left atrium with vena contracta > 0.7 cm.'
        }
      ],
      video: {
        title: 'Mitral Stenosis vs Regurgitation: Pressure Tracings & Auscultation Pearls',
        duration: '42:15',
        instructor: 'Dr. Siddharth V.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
        chapters: [
          { time: '00:00', label: 'Rheumatic Fever Pathogenesis & MacCallum Plaques' },
          { time: '14:20', label: 'Hemodynamic Consequences: Left Atrial Dilation & Pulmonary HTN' },
          { time: '28:40', label: 'Auscultation Pearls: Dynamic Maneuvers (Handgrip vs Valsalva)' }
        ]
      },
      flashcards: [
        {
          id: 'fc-mitral-1',
          question: 'What auscultatory finding determines the severity of Mitral Stenosis?',
          answer: 'The A2-to-Opening Snap (A2-OS) interval: A shorter interval indicates higher left atrial pressure and more severe stenosis.'
        },
        {
          id: 'fc-mitral-2',
          question: 'How does handgrip (isometric exercise) affect the murmur of Mitral Regurgitation?',
          answer: 'Handgrip increases systemic vascular resistance (afterload), which increases regurgitant flow across the mitral valve, accentuating the holosystolic murmur.'
        },
        {
          id: 'fc-mitral-3',
          question: 'What is Ortner syndrome in severe long-standing Mitral Stenosis?',
          answer: 'Hoarseness of voice caused by compression of the left recurrent laryngeal nerve between an enlarged left atrium / pulmonary trunk and the aortic arch.'
        }
      ],
      liveClasses: [],
      topics: [
        { id: 'lt-mitral-1', title: 'A2-OS Interval Analysis & Wilkins Score', order: 1, summary: 'Wilkins score echocardiographic assessment for PMBV candidacy.' },
        { id: 'lt-mitral-2', title: 'Holosystolic Murmurs: MR vs TR vs VSD', order: 2, summary: 'Differentiating apical vs parasternal holosystolic murmurs with Carvallo and Handgrip.' }
      ],
      clinicalNotes: 'Severe mitral stenosis has valve area < 1.0 cm2 and mean pressure gradient > 10 mmHg. Anticoagulation is indicated if atrial fibrillation or prior thromboembolism is present.'
    }
  },

  {
    id: 'lec-valvular-mvp-tricuspid',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-valvular',
    title: 'Mitral Valve Prolapse & Tricuspid Regurgitation (Carvallo Sign)',
    lectureNumber: 3,
    duration: '35 mins',
    difficulty: 'Core Clinical',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-valvular-3',
          fileName: 'MVP_Tricuspid_and_Pulmonary_Valvular_Disorders.pdf',
          title: 'Myxomatous Degeneration, Mid-Systolic Clicks & Right-Sided Valve Lesions',
          pages: 18,
          size: '3.9 MB',
          updated: 'Recently updated',
          author: 'Dr. Anita Sharma, MD'
        }
      ],
      images: [
        {
          id: 'img-valvular-5',
          title: 'Dynamic Auscultation Changes in Mitral Valve Prolapse',
          url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 5: Standing/Valsalva decreases preload, causing the click and murmur to occur earlier in systole.'
        }
      ],
      video: {
        title: 'MVP Auscultation Dynamics & Right-Sided Heart Murmurs Masterclass',
        duration: '34:50',
        instructor: 'Dr. Anita Sharma, MD',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&auto=format&fit=crop&q=80',
        chapters: [
          { time: '00:00', label: 'Connective Tissue Disorders (Marfan & Ehlers-Danlos)' },
          { time: '11:15', label: 'Mid-Systolic Click & Late-Systolic Murmur Physics' },
          { time: '23:00', label: "Carvallo's Sign in Tricuspid Regurgitation vs MR" }
        ]
      },
      flashcards: [
        {
          id: 'fc-mvp-1',
          question: 'What maneuver moves the mid-systolic click and murmur of MVP closer to S1?',
          answer: 'Any maneuver that decreases left ventricular volume (e.g., sudden standing or the strain phase of the Valsalva maneuver).'
        },
        {
          id: 'fc-mvp-2',
          question: 'What is Carvallo sign and what condition does it differentiate?',
          answer: 'Carvallo sign is an increase in murmur intensity during inspiration; it is positive in Tricuspid Regurgitation and differentiates it from Mitral Regurgitation.'
        }
      ],
      liveClasses: [],
      topics: [
        { id: 'lt-mvp-1', title: 'Barlow Syndrome & Myxomatous Degeneration', order: 1, summary: 'Redundant leaflets prolapsing into left atrium during systole.' },
        { id: 'lt-mvp-2', title: 'Carvallo Sign and Dynamic Respiration Pearls', order: 2, summary: 'Inspiratory augmentation of right-sided murmurs due to increased venous return.' }
      ],
      clinicalNotes: 'Tricuspid regurgitation is most commonly secondary (functional) due to right ventricular dilation from pulmonary hypertension.'
    }
  },

  {
    id: 'lec-valvular-prosthetic-endo',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-valvular',
    title: 'Infective Endocarditis & Prosthetic Heart Valve Complications',
    lectureNumber: 4,
    duration: '50 mins',
    difficulty: 'High-Yield',
    status: 'Published',
    content: {
      pdfList: [
        {
          id: 'pdf-valvular-4',
          fileName: 'Infective_Endocarditis_Duke_Criteria_and_Prosthetic_Valves.pdf',
          title: 'Modified Duke Criteria, Valve Thrombosis & Anticoagulation Protocols',
          pages: 28,
          size: '6.2 MB',
          updated: 'Recently updated',
          author: 'Dr. Siddharth V. & Dr. Rajiv Mehta'
        }
      ],
      images: [
        {
          id: 'img-valvular-6',
          title: 'Transesophageal Echocardiogram (TEE) of Large Aortic Valve Vegetation',
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=80',
          caption: 'Fig 6: TEE demonstrating oscillating intracardiac mass on aortic valve with leaflet perforation.'
        }
      ],
      video: {
        title: 'Duke Diagnostic Criteria, Blood Culture Regimens & Surgical Indications',
        duration: '48:30',
        instructor: 'Dr. Siddharth V.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80',
        chapters: [
          { time: '00:00', label: 'Microbiology: Staph aureus, Viridans Streptococci & Enterococci' },
          { time: '16:45', label: 'Major vs Minor Duke Criteria Deep Dive' },
          { time: '32:10', label: 'Mechanical vs Bioprosthetic Valve Management & INR Targets' }
        ]
      },
      flashcards: [
        {
          id: 'fc-endo-1',
          question: 'What is the recommended target INR for a mechanical mitral valve prosthesis?',
          answer: 'Target INR is 3.0 (range 2.5 - 3.5), higher than a mechanical aortic valve (target 2.5) due to lower velocity flow.'
        },
        {
          id: 'fc-endo-2',
          question: 'What are the classic Duke Major Criteria for Infective Endocarditis?',
          answer: '1) Persistently positive blood cultures with typical organisms; 2) Evidence of endocardial involvement on echocardiogram (vegetation, abscess, new partial dehiscence of prosthetic valve) or new valvular regurgitation.'
        }
      ],
      liveClasses: [],
      topics: [
        { id: 'lt-endo-1', title: 'Duke Diagnostic Algorithm & Culture-Negative IE', order: 1, summary: 'Bartonella, Coxiella burnetii, and HACEK organisms in culture-negative endocarditis.' },
        { id: 'lt-endo-2', title: 'Prosthetic Valve Thrombosis vs Pannus Formation', order: 2, summary: 'Differentiating acute valve thrombosis from chronic fibrous pannus ingrowth.' }
      ],
      clinicalNotes: 'Urgent valve replacement surgery is indicated in IE complicated by acute severe aortic or mitral regurgitation with pulmonary edema or cardiogenic shock.'
    }
  },

  // Under Module: Heart Failure
  {
    id: 'lec-hf-gdmt',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-hf',
    title: 'HFrEF vs HFpEF: Quadruple Medical Therapy (ARNI, SGLT2i, MRA, Beta-Blockers)',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
      clinicalNotes: 'All HFrEF patients should be on all 4 foundational drug classes titrated to target doses as tolerated.'
    }
  },

  // Under Module: Cardiac Arrhythmias
  {
    id: 'lec-ecg-arrhythmias',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-arrhythmias',
    title: 'Wide Complex Tachycardias: Brugada vs Vereckei & ACLS Protocols',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
      clinicalNotes: 'Treat any wide complex tachycardia as VT until proven otherwise in an emergency setting.'
    }
  },

  // Under Module: Pulmonology PFT
  {
    id: 'lec-pulmo-pft',
    examId: 'neet-pg',
    subjectId: 'sub-neet-pulmo',
    moduleId: 'mod-neet-pft',
    title: 'Flow-Volume Loops & Obstructive vs Restrictive Patterns',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
      clinicalNotes: 'Always check FEV1/FVC ratio first: < 0.70 confirms obstruction.'
    }
  },

  // Under Module: Acute Coronary Syndromes & STEMI Pathways
  {
    id: 'lec-cad-stemi',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    moduleId: 'mod-neet-cad',
    title: 'STEMI Localization & Culprit Artery ECG Criteria',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
      clinicalNotes: 'Time is myocardium: primary PCI within 90 minutes or thrombolysis within 30 minutes if transfer time > 120 mins.'
    }
  },

  // USMLE Lecture
  {
    id: 'lec-usmle-pvloops',
    examId: 'usmle',
    subjectId: 'sub-usmle-cvs',
    moduleId: 'mod-usmle-pvloops',
    title: 'Wiggers Diagram & Valvular Shifts on PV Loops',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
      clinicalNotes: 'Width of PV loop = Stroke Volume (EDV - ESV).'
    }
  },

  // PLAB Lecture
  {
    id: 'lec-plab-triage',
    examId: 'plab',
    subjectId: 'sub-plab-acute',
    moduleId: 'mod-plab-chestpain',
    title: 'Emergency Triage & Troponin Protocols (NICE NG185)',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
      clinicalNotes: 'Always perform ECG within 10 minutes of patient arrival.'
    }
  },

  // Europe Lecture
  {
    id: 'lec-eur-dialogue',
    examId: 'europe',
    subjectId: 'sub-eur-fsp',
    moduleId: 'mod-eur-anamnese',
    title: 'Strukturierte Schmerzanamnese & Arzt-zu-Arzt Übergabe',
    lectureNumber: 1,
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
      liveClasses: [],
      topics: [],
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
    moduleId: 'mod-neet-valvular',
    moduleTitle: 'Valvular Heart Diseases & Auscultation Dynamics',
    lectureIds: ['lec-valvular-murmurs'],
    scheduledDate: '2026-09-08',
    status: 'Active',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '09:00 AM - 10:30 AM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-hf',
    moduleTitle: 'Heart Failure & Guideline Pharmacotherapy',
    lectureIds: ['lec-hf-gdmt'],
    scheduledDate: '2026-09-09',
    status: 'Active',
    estimatedTime: '2.0 hours',
    lectureTimeSlot: '09:00 AM - 11:00 AM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-arrhythmias',
    moduleTitle: 'Cardiac Arrhythmias & Clinical ECG Mastery',
    lectureIds: ['lec-ecg-arrhythmias'],
    scheduledDate: '2026-09-10',
    status: 'Active',
    estimatedTime: '2.0 hours',
    lectureTimeSlot: '09:00 AM - 11:00 AM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-pharm-antiarrhythmics',
    moduleTitle: 'Antiarrhythmics & Vaughan-Williams Pharmacology',
    lectureIds: [],
    scheduledDate: '2026-09-10',
    status: 'Active',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '04:00 PM - 05:30 PM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-cad',
    moduleTitle: 'Acute Coronary Syndromes & STEMI Pathways',
    lectureIds: ['lec-cad-stemi'],
    scheduledDate: '2026-09-11',
    status: 'Scheduled',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '09:00 AM - 10:30 AM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-pft',
    moduleTitle: 'Pulmonary Function Testing & Flow-Volume Loops',
    lectureIds: ['lec-pulmo-pft'],
    scheduledDate: '2026-09-12',
    status: 'Scheduled',
    estimatedTime: '1.5 hours',
    lectureTimeSlot: '11:00 AM - 12:30 PM IST',
    facultyName: 'Dr. Marcus Vance',
    facultyEmail: 'marcus.vance@demo.com',
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
    moduleId: 'mod-neet-arrhythmias',
    moduleTitle: 'Cardiac Arrhythmias & Clinical ECG Mastery',
    lectureIds: ['lec-ecg-arrhythmias'],
    scheduledDate: '2026-09-13',
    status: 'Scheduled',
    estimatedTime: '1.0 hour',
    lectureTimeSlot: '09:00 AM - 10:00 AM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-valvular',
    moduleTitle: 'Valvular Heart Diseases & Auscultation Dynamics',
    lectureIds: ['lec-valvular-murmurs'],
    scheduledDate: '2026-09-14',
    status: 'Scheduled',
    estimatedTime: '1.0 hour',
    lectureTimeSlot: '10:00 AM - 11:30 AM IST',
    facultyName: 'Dr. Siddharth V.',
    facultyEmail: 'faculty@demo.com',
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
    moduleId: 'mod-neet-pft',
    moduleTitle: 'Pulmonary Function Testing & Flow-Volume Loops',
    lectureIds: ['lec-pulmo-pft'],
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
    moduleId: 'mod-usmle-pvloops',
    moduleTitle: 'Ventricular Pressure-Volume Loops & Murmurs',
    lectureIds: ['lec-usmle-pvloops'],
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
    moduleId: 'mod-usmle-autonomic',
    moduleTitle: 'Autonomic Pharmacology & Receptor Signaling',
    lectureIds: ['lec-usmle-pvloops'],
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
    moduleId: 'mod-plab-chestpain',
    moduleTitle: 'NICE Clinical Guidelines: Acute Chest Pain & ACS',
    lectureIds: ['lec-plab-triage'],
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
    moduleId: 'mod-eur-anamnese',
    moduleTitle: 'Medical History Taking (Anamnese) & Doctor Handover',
    lectureIds: ['lec-eur-dialogue'],
    scheduledDate: '2026-09-08',
    status: 'Active',
    estimatedTime: '1.5 hours',
    hasLive: true,
    hasTest: false
  }
];

// =============================================================================
// LEGACY ID REMAPPING HELPERS (used only during one-time migration)
// =============================================================================

function remapLegacyId(id, fromPrefix, toPrefix) {
  if (typeof id !== 'string' || !id.startsWith(fromPrefix)) return id;
  return toPrefix + id.slice(fromPrefix.length);
}

// =============================================================================
// CURRICULUM SERVICE CLASS
// =============================================================================

class CurriculumService {
  constructor() {
    this.migrateLegacyChapterTopicData();
    this.subjects = this.loadSubjects();
    this.modules = this.loadModules();
    this.lectures = this.loadLectures();
    this.schedule = this.loadSchedule();
  }

  // ---------------------------------------------------------------------------
  // ONE-TIME MIGRATION: pre-rename "Chapter"/"Topic" model -> "Module"/"Lecture"
  // ---------------------------------------------------------------------------
  migrateLegacyChapterTopicData() {
    try {
      const alreadyMigratedModules = localStorage.getItem(STORAGE_KEY_MODULES);
      const alreadyMigratedLectures = localStorage.getItem(STORAGE_KEY_LECTURES);

      if (!alreadyMigratedModules) {
        const legacyChapters = localStorage.getItem(LEGACY_STORAGE_KEY_CHAPTERS);
        if (legacyChapters) {
          const parsed = JSON.parse(legacyChapters);
          const migrated = parsed.map(c => {
            const { chapterNumber, ...rest } = c;
            return {
              ...rest,
              id: remapLegacyId(c.id, 'chap-', 'mod-'),
              moduleNumber: chapterNumber
            };
          });
          localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(migrated));
        }
      }

      if (!alreadyMigratedLectures) {
        const legacyTopics = localStorage.getItem(LEGACY_STORAGE_KEY_TOPICS);
        if (legacyTopics) {
          const parsed = JSON.parse(legacyTopics);
          const migrated = parsed.map(t => {
            const { chapterId, topicNumber, ...rest } = t;
            return {
              ...rest,
              id: remapLegacyId(t.id, 'top-', 'lec-'),
              moduleId: remapLegacyId(chapterId, 'chap-', 'mod-'),
              lectureNumber: topicNumber
            };
          });
          localStorage.setItem(STORAGE_KEY_LECTURES, JSON.stringify(migrated));
        }
      }

      // Schedule keeps the same storage key, but its shape changes in place
      const scheduleRaw = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (scheduleRaw) {
        const parsedSchedule = JSON.parse(scheduleRaw);
        const needsMigration = Array.isArray(parsedSchedule) && parsedSchedule.some(
          s => s.chapterId !== undefined || s.topicIds !== undefined || s.chapterTitle !== undefined
        );
        if (needsMigration) {
          const migrated = parsedSchedule.map(s => {
            const { chapterId, chapterTitle, topicIds, ...rest } = s;
            return {
              ...rest,
              moduleId: chapterId !== undefined ? remapLegacyId(chapterId, 'chap-', 'mod-') : (s.moduleId || null),
              moduleTitle: chapterTitle !== undefined ? chapterTitle : (s.moduleTitle || ''),
              lectureIds: topicIds !== undefined
                ? topicIds.map(id => remapLegacyId(id, 'top-', 'lec-'))
                : (s.lectureIds || [])
            };
          });
          localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(migrated));
        }
      }
    } catch (e) {
      console.warn('Legacy Chapter/Topic -> Module/Lecture migration failed:', e);
    }
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

  loadModules() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MODULES);
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map(m => m.id));
        const missing = INITIAL_MODULES.filter(m => !existingIds.has(m.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load modules from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_MODULES));
  }

  saveModules() {
    try {
      localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(this.modules));
      window.dispatchEvent(new CustomEvent('medprep-curriculum-updated', { detail: { type: 'modules', data: this.modules } }));
    } catch (e) {
      console.warn('Failed to save modules:', e);
    }
  }

  loadLectures() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LECTURES);
      if (stored) {
        let parsed = JSON.parse(stored);
        let updated = false;

        parsed = parsed.map(lecture => {
          if (!lecture.content) {
            lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [], clinicalNotes: '' };
            updated = true;
          } else {
            if (!lecture.content.liveClasses) {
              if (lecture.id === 'lec-valvular-auscultation') {
                lecture.content.liveClasses = [
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
                lecture.content.liveClasses = [];
              }
              updated = true;
            }
            if (!lecture.content.topics) {
              lecture.content.topics = [];
              updated = true;
            }
          }
          return lecture;
        });

        const existingIds = new Set(parsed.map(l => l.id));
        const missing = INITIAL_LECTURES.filter(l => !existingIds.has(l.id));
        if (missing.length > 0 || updated) {
          const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
          localStorage.setItem(STORAGE_KEY_LECTURES, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load lectures from storage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_LECTURES));
  }

  saveLectures() {
    try {
      localStorage.setItem(STORAGE_KEY_LECTURES, JSON.stringify(this.lectures));
      window.dispatchEvent(new CustomEvent('medprep-curriculum-updated', { detail: { type: 'lectures', data: this.lectures } }));
    } catch (e) {
      console.warn('Failed to save lectures:', e);
    }
  }

  loadSchedule() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (stored) {
        let parsed = JSON.parse(stored);
        let updated = false;

        // Clean up rogue/mismatched slot where Day 9 was assigned to dayNumber 4
        const cleaned = parsed.filter(slot => {
          if (Number(slot.dayNumber) === 4 && slot.dayTitle && slot.dayTitle.includes('Day 9')) {
            updated = true;
            return false;
          }
          return true;
        });
        parsed = cleaned;

        const existingIds = new Set(parsed.map(s => s.id));
        const missing = INITIAL_SCHEDULE.filter(s => !existingIds.has(s.id));

        parsed = parsed.map(slot => {
          const init = INITIAL_SCHEDULE.find(i => i.id === slot.id);
          let itemUpdated = false;
          let res = { ...slot };
          if (init && !res.lectureTimeSlot) {
            itemUpdated = true;
            res = { ...init, ...res, lectureTimeSlot: init.lectureTimeSlot, facultyName: init.facultyName || res.facultyName };
          }
          if (!res.deliveryItems && res.lectureIds) {
            itemUpdated = true;
            res.deliveryItems = res.lectureIds.map(lid => ({ type: 'lecture', lectureId: lid }));
          }
          if (itemUpdated) updated = true;
          return res;
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medprep-schedule-updated', { detail: { type: 'schedule', data: this.schedule } }));
        window.dispatchEvent(new CustomEvent('medprep-delivery-plan-updated', { detail: { type: 'delivery', data: this.schedule } }));
      }
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

  getSubjectsByExam(examId) {
    return this.getSubjects(examId);
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
    // Also delete or cascade warn for child modules/lectures
    this.subjects = this.subjects.filter(s => s.id !== id);
    this.modules = this.modules.filter(m => m.subjectId !== id);
    this.lectures = this.lectures.filter(l => l.subjectId !== id);
    this.saveSubjects();
    this.saveModules();
    this.saveLectures();
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

  assignFacultyToSubjects(facultyEmail, facultyName, subjectIds = []) {
    let changed = false;
    const cleanEmail = (facultyEmail || '').trim().toLowerCase();
    this.subjects = this.subjects.map(sub => {
      if (subjectIds.includes(sub.id)) {
        changed = true;
        return {
          ...sub,
          assignedFacultyName: facultyName,
          facultyEmail: cleanEmail
        };
      } else if (sub.facultyEmail && sub.facultyEmail.toLowerCase() === cleanEmail) {
        // Unassigned from this faculty
        changed = true;
        return {
          ...sub,
          assignedFacultyName: 'Unassigned',
          facultyEmail: ''
        };
      }
      return sub;
    });

    if (changed) {
      this.saveSubjects();
    }
    return this.subjects;
  }

  // ---------------------------------------------------------------------------
  // 2. MODULES CRUD (formerly "Chapters")
  // ---------------------------------------------------------------------------
  getModules(subjectId = null, examId = null) {
    let list = this.modules;
    if (examId && examId !== 'all') {
      list = list.filter(m => m.examId === examId);
    }
    if (subjectId && subjectId !== 'all') {
      list = list.filter(m => m.subjectId === subjectId);
    }
    return list;
  }

  getModulesBySubject(subjectId, examId = null) {
    return this.getModules(subjectId, examId);
  }

  getModulesByExam(examId) {
    return this.getModules(null, examId);
  }

  getModuleById(id) {
    return this.modules.find(m => m.id === id) || null;
  }

  saveModule(data) {
    const existingIndex = this.modules.findIndex(m => m.id === data.id);
    if (existingIndex !== -1) {
      this.modules[existingIndex] = { ...this.modules[existingIndex], ...data };
    } else {
      const subjectModules = this.modules.filter(m => m.subjectId === data.subjectId);
      const newModule = {
        id: data.id || `mod-${Date.now()}`,
        examId: data.examId,
        subjectId: data.subjectId,
        title: data.title,
        moduleNumber: Number(data.moduleNumber) || subjectModules.length + 1,
        description: data.description || '',
        status: data.status || 'Active'
      };
      this.modules.push(newModule);
    }
    this.saveModules();
    return this.modules;
  }

  deleteModule(id) {
    this.modules = this.modules.filter(m => m.id !== id);
    this.lectures = this.lectures.filter(l => l.moduleId !== id);
    this.saveModules();
    this.saveLectures();
    return this.modules;
  }

  moveModuleOrder(id, direction) {
    const mod = this.modules.find(m => m.id === id);
    if (!mod) return this.modules;

    const subjectMods = this.modules
      .filter(m => m.subjectId === mod.subjectId)
      .sort((a, b) => (a.moduleNumber || 0) - (b.moduleNumber || 0));

    const currentIndex = subjectMods.findIndex(m => m.id === id);
    if (currentIndex === -1) return this.modules;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= subjectMods.length) return this.modules;

    const neighbor = subjectMods[targetIndex];
    const prevNum = mod.moduleNumber ?? (currentIndex + 1);
    const neighborNum = neighbor.moduleNumber ?? (targetIndex + 1);

    if (prevNum === neighborNum) {
      mod.moduleNumber = targetIndex + 1;
      neighbor.moduleNumber = currentIndex + 1;
    } else {
      mod.moduleNumber = neighborNum;
      neighbor.moduleNumber = prevNum;
    }

    this.saveModules();
    return this.modules;
  }

  reorderModules(subjectId, orderedIds) {
    orderedIds.forEach((id, index) => {
      const mod = this.modules.find(m => m.id === id);
      if (mod) {
        mod.moduleNumber = index + 1;
      }
    });
    this.saveModules();
    return this.modules;
  }

  moveLectureOrder(id, direction) {
    const lec = this.lectures.find(l => l.id === id);
    if (!lec) return this.lectures;

    const moduleLectures = this.lectures
      .filter(l => l.moduleId === lec.moduleId)
      .sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0));

    const currentIndex = moduleLectures.findIndex(l => l.id === id);
    if (currentIndex === -1) return this.lectures;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= moduleLectures.length) return this.lectures;

    const neighbor = moduleLectures[targetIndex];
    const prevNum = lec.lectureNumber ?? (currentIndex + 1);
    const neighborNum = neighbor.lectureNumber ?? (targetIndex + 1);

    if (prevNum === neighborNum) {
      lec.lectureNumber = targetIndex + 1;
      neighbor.lectureNumber = currentIndex + 1;
    } else {
      lec.lectureNumber = neighborNum;
      neighbor.lectureNumber = prevNum;
    }

    this.saveLectures();
    return this.lectures;
  }

  reorderLectures(moduleId, orderedIds) {
    orderedIds.forEach((id, index) => {
      const lec = this.lectures.find(l => l.id === id);
      if (lec) {
        lec.lectureNumber = index + 1;
      }
    });
    this.saveLectures();
    return this.lectures;
  }

  // ---------------------------------------------------------------------------
  // 3. LECTURES CRUD (formerly "Topics")
  // ---------------------------------------------------------------------------
  getLectures(moduleId = null, subjectId = null, examId = null) {
    let list = this.lectures;
    if (examId && examId !== 'all') {
      list = list.filter(l => l.examId === examId);
    }
    if (subjectId && subjectId !== 'all') {
      list = list.filter(l => l.subjectId === subjectId);
    }
    if (moduleId && moduleId !== 'all') {
      list = list.filter(l => l.moduleId === moduleId);
    }
    return list;
  }

  getAllLectures() {
    return this.getLectures();
  }

  getLecturesByModule(moduleId, subjectId = null, examId = null) {
    return this.getLectures(moduleId, subjectId, examId);
  }

  getLecturesBySubject(subjectId, examId = null) {
    return this.getLectures(null, subjectId, examId);
  }

  getLecturesByExam(examId) {
    return this.getLectures(null, null, examId);
  }

  getLectureById(id) {
    return this.lectures.find(l => l.id === id) || null;
  }

  saveLecture(data) {
    const existingIndex = this.lectures.findIndex(l => l.id === data.id);
    if (existingIndex !== -1) {
      this.lectures[existingIndex] = {
        ...this.lectures[existingIndex],
        ...data,
        content: data.content || this.lectures[existingIndex].content || {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          liveClasses: [],
          topics: [],
          clinicalNotes: ''
        }
      };
    } else {
      const moduleLectures = this.lectures.filter(l => l.moduleId === data.moduleId);
      const newLecture = {
        id: data.id || `lec-${Date.now()}`,
        examId: data.examId,
        subjectId: data.subjectId,
        moduleId: data.moduleId,
        title: data.title,
        lectureNumber: Number(data.lectureNumber) || moduleLectures.length + 1,
        duration: data.duration || '45 mins',
        difficulty: data.difficulty || 'High-Yield',
        status: data.status || 'Published',
        content: data.content || {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          liveClasses: [],
          topics: [],
          clinicalNotes: ''
        }
      };
      this.lectures.push(newLecture);
    }
    this.saveLectures();
    return this.lectures;
  }

  deleteLecture(id) {
    this.lectures = this.lectures.filter(l => l.id !== id);
    // Remove lecture from any schedule slots that reference it
    this.schedule = this.schedule.map(slot => ({
      ...slot,
      lectureIds: (slot.lectureIds || []).filter(lid => lid !== id)
    }));
    this.saveLectures();
    this.saveSchedule();
    return this.lectures;
  }

  // ---------------------------------------------------------------------------
  // 4. LECTURE CONTENT SUB-OPERATIONS (PDF, Images, Video, Flashcards, Topics)
  // ---------------------------------------------------------------------------
  getLectureContent(lectureId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) {
      lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [], clinicalNotes: '' };
    }
    return lecture.content;
  }

  saveLectureContent(lectureId, newContent) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    lecture.content = { ...lecture.content, ...newContent };
    this.saveLectures();
    return lecture.content;
  }

  addLecturePdf(lectureId, pdfData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [] };
    const newPdf = {
      id: `pdf-${Date.now()}`,
      fileName: pdfData.fileName || 'Clinical_Study_Notes.pdf',
      title: pdfData.title || 'High-Yield Lecture Notes',
      pages: Number(pdfData.pages) || 16,
      size: pdfData.size || '3.2 MB',
      updated: 'Just now',
      author: pdfData.author || 'Faculty Specialist'
    };
    lecture.content.pdfList = [newPdf, ...(lecture.content.pdfList || [])];
    this.saveLectures();
    return lecture.content;
  }

  deleteLecturePdf(lectureId, pdfId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.pdfList = (lecture.content.pdfList || []).filter(p => p.id !== pdfId);
    this.saveLectures();
    return lecture.content;
  }

  addLectureImage(lectureId, imageData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [] };
    const newImage = {
      id: `img-${Date.now()}`,
      title: imageData.title || 'Diagnostic ECG / Clinical Diagram',
      url: imageData.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
      caption: imageData.caption || 'Clinical diagnostic specimen with annotations.'
    };
    lecture.content.images = [newImage, ...(lecture.content.images || [])];
    this.saveLectures();
    return lecture.content;
  }

  deleteLectureImage(lectureId, imageId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.images = (lecture.content.images || []).filter(img => img.id !== imageId);
    this.saveLectures();
    return lecture.content;
  }

  saveLectureVideo(lectureId, videoData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [] };
    if (!videoData) {
      lecture.content.video = null;
    } else {
      lecture.content.video = {
        title: videoData.title || 'Clinical Video Lecture',
        duration: videoData.duration || '40:00',
        instructor: videoData.instructor || 'Specialist Lead',
        url: videoData.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: videoData.thumbnail || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
        chapters: videoData.chapters || []
      };
    }
    this.saveLectures();
    return lecture.content;
  }

  addLectureFlashcard(lectureId, cardData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [] };
    const newCard = {
      id: `fc-${Date.now()}`,
      question: cardData.question,
      answer: cardData.answer
    };
    lecture.content.flashcards = [...(lecture.content.flashcards || []), newCard];
    this.saveLectures();
    return lecture.content;
  }

  deleteLectureFlashcard(lectureId, cardId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.flashcards = (lecture.content.flashcards || []).filter(c => c.id !== cardId);
    this.saveLectures();
    return lecture.content;
  }

  // Live Classes Methods
  addLectureLiveClass(lectureId, liveData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [] };
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
    lecture.content.liveClasses = [newLive, ...(lecture.content.liveClasses || [])];
    this.saveLectures();
    return lecture.content;
  }

  updateLectureLiveClass(lectureId, liveId, liveData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.liveClasses = (lecture.content.liveClasses || []).map(item =>
      item.id === liveId ? { ...item, ...liveData } : item
    );
    this.saveLectures();
    return lecture.content;
  }

  deleteLectureLiveClass(lectureId, liveId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.liveClasses = (lecture.content.liveClasses || []).filter(item => item.id !== liveId);
    this.saveLectures();
    return lecture.content;
  }

  // Lecture "Topics" — lightweight titled sub-sections within a Lecture (NOT full content units)
  addLectureTopic(lectureId, topicData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) return null;
    if (!lecture.content) lecture.content = { pdfList: [], images: [], video: null, flashcards: [], liveClasses: [], topics: [] };
    if (!lecture.content.topics) lecture.content.topics = [];
    const newTopic = {
      id: `lt-${Date.now()}`,
      title: topicData.title || 'Untitled Topic',
      summary: topicData.summary || '',
      order: Number(topicData.order) || lecture.content.topics.length + 1
    };
    lecture.content.topics = [...lecture.content.topics, newTopic];
    this.saveLectures();
    return lecture.content;
  }

  updateLectureTopic(lectureId, topicId, topicData) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.topics = (lecture.content.topics || []).map(t =>
      t.id === topicId ? { ...t, ...topicData } : t
    );
    this.saveLectures();
    return lecture.content;
  }

  deleteLectureTopic(lectureId, topicId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture || !lecture.content) return null;
    lecture.content.topics = (lecture.content.topics || []).filter(t => t.id !== topicId);
    this.saveLectures();
    return lecture.content;
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
    // Key uniquely by id (edit) or by examId + dayNumber + subjectId + lectureTimeSlot
    // This allows multiple distinct time slots per day per subject
    const existingIndex = this.schedule.findIndex(s => {
      if (slotData.id && s.id === slotData.id) return true;
      if (!slotData.id) {
        const sameExamDaySub =
          s.examId === slotData.examId &&
          Number(s.dayNumber) === Number(slotData.dayNumber) &&
          s.subjectId === slotData.subjectId;
        if (!sameExamDaySub) return false;
        // Allow same subject on same day if time slot is different
        if (slotData.lectureTimeSlot && s.lectureTimeSlot) {
          return s.lectureTimeSlot === slotData.lectureTimeSlot;
        }
        return true;
      }
      return false;
    });

    const subject = this.getSubjectById(slotData.subjectId);
    const module = this.getModuleById(slotData.moduleId);

    const resolvedTimeSlot = slotData.lectureTimeSlot || subject?.defaultTimeSlot || '09:00 AM - 10:30 AM IST';

    const resolvedDeliveryItems = slotData.deliveryItems || (slotData.lectureIds || []).map(lid => ({ type: 'lecture', lectureId: lid }));
    const resolvedLectureIds = Array.from(new Set([
      ...(slotData.lectureIds || []),
      ...resolvedDeliveryItems.filter(i => i.type === 'lecture' && i.lectureId).map(i => i.lectureId)
    ]));

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
      moduleId: slotData.moduleId || null,
      moduleTitle: module?.title || slotData.moduleTitle || 'Clinical Module',
      lectureIds: resolvedLectureIds,
      deliveryItems: resolvedDeliveryItems,
      scheduledDate: slotData.scheduledDate || new Date().toISOString().split('T')[0],
      status: slotData.status || 'Active',
      estimatedTime: slotData.estimatedTime || '1.5 hours',
      lectureTimeSlot: resolvedTimeSlot,
      facultyName: slotData.facultyName || subject?.assignedFacultyName || 'Specialist Lead',
      facultyEmail: slotData.facultyEmail || subject?.facultyEmail || '',
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

  /**
   * Get all schedule slots for a specific faculty member (across exams or for one exam)
   */
  getFacultySchedule(facultyEmail, examId = null) {
    if (!facultyEmail) return [];
    const email = facultyEmail.toLowerCase();
    // Build a set of subjectIds this faculty teaches
    const facultySubjectIds = new Set(
      this.subjects
        .filter(s => s.facultyEmail?.toLowerCase() === email && (!examId || s.examId === examId))
        .map(s => s.id)
    );
    return this.schedule.filter(s => {
      if (examId && s.examId !== examId) return false;
      return (
        s.facultyEmail?.toLowerCase() === email ||
        facultySubjectIds.has(s.subjectId)
      );
    }).sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return 0;
    });
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

  linkLectureToDay(examId, weekNumber, dayNumber, lectureId) {
    const lecture = this.getLectureById(lectureId);
    if (!lecture) {
      console.warn(`Cannot link missing lecture ${lectureId}`);
      return null;
    }

    if (lecture.examId && examId && examId !== 'all' && lecture.examId !== examId) {
      console.warn(`Hierarchy mismatch: lecture ${lectureId} belongs to ${lecture.examId}, not ${examId}`);
      return null;
    }

    const targetWeek = Number(weekNumber) || Math.ceil(Number(dayNumber) / 7) || 1;
    let slot = this.getScheduleSlot(examId, targetWeek, dayNumber);

    if (!slot) {
      slot = this.saveScheduleSlot({
        examId,
        weekNumber: targetWeek,
        dayNumber: Number(dayNumber),
        dayTitle: `Day ${dayNumber} — ${lecture.title}`,
        subjectId: lecture.subjectId,
        moduleId: lecture.moduleId,
        lectureIds: [lectureId],
        deliveryItems: [{ type: 'lecture', lectureId }],
        status: 'Active'
      });
    } else {
      if (!slot.deliveryItems) {
        slot.deliveryItems = (slot.lectureIds || []).map(lid => ({ type: 'lecture', lectureId: lid }));
      }
      if (!slot.deliveryItems.some(item => item.type === 'lecture' && item.lectureId === lectureId)) {
        slot.deliveryItems.push({ type: 'lecture', lectureId });
      }
      const currentIds = slot.lectureIds || [];
      if (!currentIds.includes(lectureId)) {
        slot.lectureIds = [...currentIds, lectureId];
      }
      if (!slot.subjectId) slot.subjectId = lecture.subjectId;
      if (!slot.moduleId) slot.moduleId = lecture.moduleId;
      this.saveSchedule();
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medprep-delivery-plan-updated', {
        detail: { examId, weekNumber: targetWeek, dayNumber: Number(dayNumber), lectureId, action: 'link' }
      }));
    }

    return slot;
  }

  unlinkLectureFromDay(examId, dayNumber, lectureId) {
    const slot = this.schedule.find(s => s.examId === examId && Number(s.dayNumber) === Number(dayNumber));
    if (!slot) return null;

    if (slot.deliveryItems) {
      slot.deliveryItems = slot.deliveryItems.filter(item => !(item.type === 'lecture' && item.lectureId === lectureId));
    }
    slot.lectureIds = (slot.lectureIds || []).filter(id => id !== lectureId);
    this.saveSchedule();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medprep-delivery-plan-updated', {
        detail: { examId, dayNumber: Number(dayNumber), lectureId, action: 'unlink' }
      }));
    }

    return slot;
  }

  // ---------------------------------------------------------------------------
  // 6. CANONICAL DELIVERY PLAN PROVIDER (Weeks 1-4, Days 1-28)
  // Maps delivery schedule to canonical curriculum entities
  // ---------------------------------------------------------------------------
  getDeliveryPlan(examId = 'neet-pg') {
    const examSlots = this.schedule.filter(s => s.examId === examId);

    // Baseline 4 weeks from studyPlan28DaysCurriculum if available (or standard 4 weeks)
    const baseWeeks = Array.isArray(studyPlan28DaysCurriculum) && studyPlan28DaysCurriculum.length > 0
      ? studyPlan28DaysCurriculum
      : [1, 2, 3, 4].map(w => ({ weekNumber: w, title: `Week ${w}`, days: [] }));

    return baseWeeks.map(baseWeek => {
      const weekNum = baseWeek.weekNumber;
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = weekNum * 7;
      const weekSlots = examSlots.filter(s => Number(s.weekNumber) === weekNum);

      const days = [];
      for (let dayNum = startDay; dayNum <= endDay; dayNum++) {
        const slot = weekSlots.find(s => Number(s.dayNumber) === dayNum);
        const fallbackDay = baseWeek.days?.find(d => d.dayNumber === dayNum) || {};

        // 1. Resolve deliveryItems
        let deliveryItems = [];
        if (slot?.deliveryItems && slot.deliveryItems.length > 0) {
          deliveryItems = [...slot.deliveryItems];
        } else if (slot?.lectureIds && slot.lectureIds.length > 0) {
          deliveryItems = slot.lectureIds.map(lid => ({ type: 'lecture', lectureId: lid }));
        } else if (Array.isArray(fallbackDay.modules)) {
          const extractedIds = [];
          fallbackDay.modules.forEach(m => {
            m.lectures?.forEach(l => {
              if (l.id) extractedIds.push(l.id);
            });
          });
          deliveryItems = extractedIds.map(lid => ({ type: 'lecture', lectureId: lid }));
        }

        // 2. Resolve canonical lecture entities from curriculumService
        const resolvedLectures = [];
        deliveryItems.forEach(item => {
          if (item.type === 'lecture' && item.lectureId) {
            const canonicalLec = this.getLectureById(item.lectureId);
            if (canonicalLec) {
              resolvedLectures.push(canonicalLec);
            } else {
              // Gracefully handle if lecture ID was deleted or unmapped
              resolvedLectures.push({
                id: item.lectureId,
                title: 'Assigned Lecture (Catalog Syncing)',
                duration: '45 mins',
                difficulty: 'High-Yield',
                isUnavailable: true
              });
            }
          }
        });

        const primaryLecture = resolvedLectures[0];
        const subject = slot?.subjectId 
          ? this.getSubjectById(slot.subjectId) 
          : (primaryLecture?.subjectId ? this.getSubjectById(primaryLecture.subjectId) : null);
        const module = slot?.moduleId 
          ? this.getModuleById(slot.moduleId) 
          : (primaryLecture?.moduleId ? this.getModuleById(primaryLecture.moduleId) : null);

        days.push({
          id: slot?.id || `day-${dayNum}`,
          slotId: slot?.id || null,
          examId,
          weekNumber: weekNum,
          dayNumber: dayNum,
          title: slot?.dayTitle || fallbackDay.title || (primaryLecture ? primaryLecture.title : `Day ${dayNum} Curriculum`),
          duration: slot?.estimatedTime || fallbackDay.duration || (primaryLecture ? primaryLecture.duration : '1.5 hours'),
          summaryPills: fallbackDay.summaryPills || (primaryLecture ? [primaryLecture.difficulty, primaryLecture.duration] : []),
          score: fallbackDay.score || null,
          hasLive: Boolean(slot?.hasLive ?? fallbackDay.hasLive),
          hasTest: Boolean(slot?.hasTest ?? fallbackDay.hasTest),
          subjectId: subject?.id || slot?.subjectId || baseWeek.subjectId || null,
          subjectName: subject?.name || slot?.subjectName || baseWeek.subjectName || 'Clinical Medicine',
          moduleId: module?.id || slot?.moduleId || null,
          moduleTitle: module?.title || slot?.moduleTitle || 'Clinical Module',
          deliveryItems,
          lectures: resolvedLectures,
          lectureIds: deliveryItems.filter(i => i.type === 'lecture').map(i => i.lectureId),
          status: slot?.status || (dayNum <= 2 ? 'Completed' : 'Active'),
          modules: fallbackDay.modules || []
        });
      }

      return {
        weekNumber: weekNum,
        title: weekSlots[0]?.weekTitle || baseWeek.title || `Week ${weekNum}`,
        description: baseWeek.description || '',
        badge: baseWeek.badge || '',
        subjectId: baseWeek.subjectId || null,
        subjectName: baseWeek.subjectName || 'Clinical Medicine',
        days
      };
    });
  }

  getDayDelivery(examId = 'neet-pg', dayNumber) {
    const num = Number(dayNumber);
    const plan = this.getDeliveryPlan(examId);
    for (const week of plan) {
      const found = week.days.find(d => d.dayNumber === num);
      if (found) return { ...found, weekTitle: week.title };
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // 7. DYNAMIC DAY RESOLVER FOR STUDENT LMS (/day/:dayId)
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

    // If no slot exists in schedule, check the delivery plan
    if (!slot) {
      const planDay = this.getDayDelivery(examId || 'neet-pg', dayId);
      if (planDay && planDay.lectureIds && planDay.lectureIds.length > 0) {
        slot = {
          dayNumber: Number(dayId),
          weekNumber: planDay.weekNumber,
          dayTitle: planDay.title,
          estimatedTime: planDay.duration,
          subjectId: planDay.subjectId,
          subjectName: planDay.subjectName,
          moduleId: planDay.moduleId,
          moduleTitle: planDay.moduleTitle,
          lectureIds: planDay.lectureIds,
          deliveryItems: planDay.deliveryItems,
          hasLive: planDay.hasLive,
          hasTest: planDay.hasTest
        };
      }
    }

    const fallbackMock = dayContentStore[String(dayId)] || {};

    // Determine lecture IDs from deliveryItems or lectureIds
    const lectureIds = (slot?.deliveryItems ? slot.deliveryItems.filter(i => i.type === 'lecture').map(i => i.lectureId) : null) || slot?.lectureIds || [];

    // If slot has linked lectures with content, aggregate them
    if (slot && lectureIds.length > 0) {
      const linkedLectures = lectureIds.map(lid => this.getLectureById(lid)).filter(Boolean);
      const primaryLecture = linkedLectures[0];

      if (primaryLecture) {
        const subject = this.getSubjectById(slot.subjectId || primaryLecture.subjectId);
        const module = this.getModuleById(slot.moduleId || primaryLecture.moduleId);

        // Aggregate assets across all linked lectures
        const aggregatedPdfs = [];
        const aggregatedImages = [];
        let primaryVideo = null;
        const aggregatedCards = [];

        linkedLectures.forEach(l => {
          if (l.content) {
            if (l.content.pdfList && l.content.pdfList.length > 0) {
              aggregatedPdfs.push(...l.content.pdfList);
            } else if (l.content.pdf) {
              aggregatedPdfs.push(l.content.pdf);
            }
            if (Array.isArray(l.content.images) && l.content.images.length > 0) {
              aggregatedImages.push(...l.content.images);
            }
            if (!primaryVideo && l.content.video) {
              primaryVideo = l.content.video;
            }
            if (Array.isArray(l.content.flashcards) && l.content.flashcards.length > 0) {
              aggregatedCards.push(...l.content.flashcards);
            }
          }
        });

        // Fallbacks if lecture has empty asset buckets and fallbackMock has scheduled asset
        if (aggregatedPdfs.length === 0 && fallbackMock.pdf && (!fallbackMock.activeTabs || fallbackMock.activeTabs.includes('notes'))) {
          aggregatedPdfs.push(fallbackMock.pdf);
        }
        if (aggregatedImages.length === 0 && Array.isArray(fallbackMock.images) && fallbackMock.images.length > 0 && (!fallbackMock.activeTabs || fallbackMock.activeTabs.includes('images'))) {
          aggregatedImages.push(...fallbackMock.images);
        }
        if (!primaryVideo && fallbackMock.video && (!fallbackMock.activeTabs || fallbackMock.activeTabs.includes('video'))) {
          primaryVideo = fallbackMock.video;
        }
        if (aggregatedCards.length === 0 && Array.isArray(fallbackMock.flashcards) && fallbackMock.flashcards.length > 0 && (!fallbackMock.activeTabs || fallbackMock.activeTabs.includes('flashcards'))) {
          aggregatedCards.push(...fallbackMock.flashcards);
        }

        const primaryPdf = aggregatedPdfs[0] || (fallbackMock.activeTabs?.includes('notes') ? fallbackMock.pdf : null) || null;

        // Compute active tabs based on available assets scheduled by admin/faculty
        const activeTabs = [];
        if (aggregatedPdfs.length > 0) activeTabs.push('notes');
        if (aggregatedImages.length > 0) activeTabs.push('images');
        if (primaryVideo) activeTabs.push('video');
        if (aggregatedCards.length > 0) activeTabs.push('flashcards');

        const isLiveScheduled = Boolean(
          slot.hasLive || 
          (slot.hasLive !== false && fallbackMock.live?.hasSession === true && (!fallbackMock.activeTabs || fallbackMock.activeTabs.includes('live')))
        );
        if (isLiveScheduled) activeTabs.push('live');
        if (slot.hasTest || fallbackMock.hasTest) activeTabs.push('test');

        const resolvedActiveTabs = fallbackMock.activeTabs || (activeTabs.length > 0 ? activeTabs : ['video', 'notes']);

        // Live canonical title reflection
        const resolvedTitle = (primaryLecture && (!slot.dayTitle || slot.dayTitle.startsWith('Day '))) 
          ? `Day ${dayId} — ${primaryLecture.title}` 
          : (slot.dayTitle || `Day ${dayId} — ${primaryLecture.title}`);

        return {
          dayNumber: Number(dayId),
          weekNumber: slot.weekNumber || 1,
          title: resolvedTitle,
          estimatedTime: slot.estimatedTime || primaryLecture.duration || '1.5 hours',
          subject: subject?.name || slot.subjectName || 'Clinical Medicine',
          subjectName: subject?.name || slot.subjectName || 'Clinical Medicine',
          subjectId: subject?.id || slot.subjectId || null,
          unit: module?.title || slot.moduleTitle || 'Clinical Module',
          moduleTitle: module?.title || slot.moduleTitle || 'Clinical Module',
          moduleId: module?.id || slot.moduleId || null,
          lectureTitle: primaryLecture.title,
          lectures: linkedLectures,
          deliveryItems: slot.deliveryItems || lectureIds.map(lid => ({ type: 'lecture', lectureId: lid })),
          activeTabs: resolvedActiveTabs,
          pdf: primaryPdf,
          notesPdf: primaryPdf,
          pdfList: aggregatedPdfs,
          images: aggregatedImages,
          galleryImages: aggregatedImages,
          video: primaryVideo,
          videoData: primaryVideo,
          flashcards: aggregatedCards,
          hasLive: isLiveScheduled,
          hasTest: Boolean(slot.hasTest || fallbackMock.hasTest),
          live: {
            hasSession: isLiveScheduled,
            title: `Live Clinical Grand Rounds: ${primaryLecture.title}`,
            faculty: slot.facultyName || subject?.assignedFacultyName || 'Dr. Siddharth V. (MD Cardiology)',
            duration: '60 mins',
            time: slot.lectureTimeSlot ? slot.lectureTimeSlot.split('-')[0].trim() : '09:00 AM IST'
          }
        };
      }
    }

    // If slot exists without lectureIds (e.g. Grand Mock Test day 7)
    if (slot) {
      const subject = this.getSubjectById(slot.subjectId);
      const module = this.getModuleById(slot.moduleId);
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
        subjectId: subject?.id || slot.subjectId || null,
        unit: module?.title || slot.moduleTitle || 'Review & Assessment',
        moduleTitle: module?.title || slot.moduleTitle || 'Review & Assessment',
        moduleId: module?.id || slot.moduleId || null,
        lectureTitle: slot.dayTitle,
        lectures: [],
        deliveryItems: slot.deliveryItems || (slot.lectureIds || []).map(lid => ({ type: 'lecture', lectureId: lid })),
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
        unit: d.unit || d.moduleTitle || d.chapterTitle || 'Valvular Heart Diseases',
        moduleTitle: d.moduleTitle || d.chapterTitle || d.unit || 'Valvular Heart Diseases',
        notesPdf: d.pdf,
        galleryImages: d.images,
        videoData: d.video,
        lectures: [],
        deliveryItems: []
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
      moduleTitle: 'Valvular Heart Diseases',
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
      live: { hasSession: false },
      lectures: [],
      deliveryItems: []
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
      modules: this.modules,
      lectures: this.lectures
    });
    window.addEventListener('medprep-curriculum-updated', handler);
    return () => window.removeEventListener('medprep-curriculum-updated', handler);
  }

  subscribeSchedule(callback) {
    const handler = (e) => callback(e.detail || { schedule: this.schedule });
    window.addEventListener('medprep-schedule-updated', handler);
    return () => window.removeEventListener('medprep-schedule-updated', handler);
  }

  subscribeDeliveryPlan(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => callback(e.detail);
    window.addEventListener('medprep-delivery-plan-updated', handler);
    window.addEventListener('medprep-schedule-updated', handler);
    window.addEventListener('medprep-curriculum-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('medprep-delivery-plan-updated', handler);
      window.removeEventListener('medprep-schedule-updated', handler);
      window.removeEventListener('medprep-curriculum-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }
}

export const curriculumService = new CurriculumService();
