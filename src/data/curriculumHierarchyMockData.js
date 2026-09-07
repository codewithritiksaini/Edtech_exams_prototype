// =============================================================================
// CURRICULUM HIERARCHY MOCK DATA — PHASE 1 SEED DATASET
// Hierarchy: Exam -> Curriculum -> Chapter -> Topic -> Content
// Schedule: Exactly 1 Schedule per Chapter
// Supported Content Types: 'video' | 'photo' | 'pdf' | 'ppt' | 'live_session'
// =============================================================================

export const SEED_EXAMS = [
  {
    id: 'exam-neet-pg',
    title: 'NEET PG & NExT 2026',
    slug: 'neet-pg',
    country: 'India',
    region_code: 'IN',
    currency: '₹',
    description: 'National Board of Examinations postgraduate residency clinical track.',
    status: 'active',
    enrolled_count: 680
  },
  {
    id: 'exam-usmle',
    title: 'USMLE Step 1 & Step 2 CK',
    slug: 'usmle',
    country: 'United States',
    region_code: 'US',
    currency: '$',
    description: 'ECFMG & USMLE aligned organ-system integrated medical licensing program.',
    status: 'active',
    enrolled_count: 420
  }
];

export const SEED_CURRICULUMS = [
  // NEET PG Curriculums (Multiple curriculums per exam)
  {
    id: 'curr-neet-core-2026',
    exam_id: 'exam-neet-pg',
    title: 'Core Comprehensive Clinical Curriculum 2026',
    version: 'v2.4',
    description: 'Complete 28-week in-depth residency preparation covering all 19 medical subjects.',
    is_default: true,
    status: 'published',
    order_index: 1
  },
  {
    id: 'curr-neet-rapid-revision',
    exam_id: 'exam-neet-pg',
    title: 'High-Yield 60-Day Rapid Revision Track',
    version: 'v1.1',
    description: 'Condensed high-frequency clinical pearls, image-based drills, and rapid fire MCQ series.',
    is_default: false,
    status: 'published',
    order_index: 2
  },

  // USMLE Curriculums
  {
    id: 'curr-usmle-step1-core',
    exam_id: 'exam-usmle',
    title: 'USMLE Step 1 Systems-Based Master Track',
    version: 'v3.0',
    description: 'Integrated organ systems pathophysiology, pharmacology, and microbiology.',
    is_default: true,
    status: 'published',
    order_index: 1
  },
  {
    id: 'curr-usmle-step2-ck',
    exam_id: 'exam-usmle',
    title: 'USMLE Step 2 CK Clinical Reasoning Track',
    version: 'v2.0',
    description: 'Diagnostic workup algorithms, patient management, and preventive medicine.',
    is_default: false,
    status: 'published',
    order_index: 2
  }
];

export const SEED_CHAPTERS = [
  // Chapters under NEET Core
  {
    id: 'chap-neet-cardio',
    curriculum_id: 'curr-neet-core-2026',
    title: 'Cardiovascular System & Clinical Hemodynamics',
    chapter_number: 1,
    description: 'Comprehensive study of cardiac physiology, murmurs, valvular anomalies, and hemodynamic monitoring.',
    estimated_duration_hours: 16.0,
    order_index: 1,
    status: 'active'
  },
  {
    id: 'chap-neet-arrhythmia',
    curriculum_id: 'curr-neet-core-2026',
    title: 'Cardiac Arrhythmias & 12-Lead ECG Mastery',
    chapter_number: 2,
    description: 'Supraventricular vs ventricular tachycardias, channelopathies, and ACLS algorithms.',
    estimated_duration_hours: 14.5,
    order_index: 2,
    status: 'active'
  },
  {
    id: 'chap-neet-ischemic',
    curriculum_id: 'curr-neet-core-2026',
    title: 'Ischemic Heart Disease & Acute Coronary Care',
    chapter_number: 3,
    description: 'STEMI vs NSTEMI emergency triage, thrombolysis windows, and secondary pharmacotherapy.',
    estimated_duration_hours: 18.0,
    order_index: 3,
    status: 'active'
  },
  {
    id: 'chap-neet-heart-failure',
    curriculum_id: 'curr-neet-core-2026',
    title: 'Heart Failure & Cardiomyopathies',
    chapter_number: 4,
    description: 'HFrEF, HFpEF, GDMT guidelines, and mechanical circulatory support.',
    estimated_duration_hours: 12.0,
    order_index: 4,
    status: 'active'
  },

  // Chapters under USMLE Step 1 Core
  {
    id: 'chap-usmle-cardio-phys',
    curriculum_id: 'curr-usmle-step1-core',
    title: 'Cardiovascular Physiology & Pressure-Volume Loops',
    chapter_number: 1,
    description: 'Cardiac cycle, Wiggers diagram, contractility shifts, and compliance dynamics.',
    estimated_duration_hours: 15.0,
    order_index: 1,
    status: 'active'
  },
  {
    id: 'chap-usmle-cardio-pharm',
    curriculum_id: 'curr-usmle-step1-core',
    title: 'Cardiovascular Autonomic & Ion Channel Pharmacology',
    chapter_number: 2,
    description: 'Vaughan-Williams antiarrhythmic classes, adrenergic agonists/blockers, and RAAS inhibitors.',
    estimated_duration_hours: 14.0,
    order_index: 2,
    status: 'active'
  }
];

// Exactly 1 Schedule per Chapter
export const SEED_SCHEDULES = [
  {
    id: 'sched-neet-cardio',
    chapter_id: 'chap-neet-cardio',
    schedule_type: 'fixed_dates',
    start_date: '2026-09-08',
    end_date: '2026-09-15',
    target_duration_days: 7,
    recommended_study_hours: 16,
    milestone_name: 'Week 1 Clinical Core: Cardiovascular Foundations Assessment',
    unlock_at: '2026-09-08T00:00:00Z'
  },
  {
    id: 'sched-neet-arrhythmia',
    chapter_id: 'chap-neet-arrhythmia',
    schedule_type: 'fixed_dates',
    start_date: '2026-09-16',
    end_date: '2026-09-23',
    target_duration_days: 7,
    recommended_study_hours: 14,
    milestone_name: 'Week 2 Clinical Core: 12-Lead ECG Interpretation Benchmark',
    unlock_at: '2026-09-16T00:00:00Z'
  },
  {
    id: 'sched-neet-ischemic',
    chapter_id: 'chap-neet-ischemic',
    schedule_type: 'fixed_dates',
    start_date: '2026-09-24',
    end_date: '2026-10-01',
    target_duration_days: 7,
    recommended_study_hours: 18,
    milestone_name: 'Week 3 Clinical Core: STEMI & Coronary Angiography Triage',
    unlock_at: '2026-09-24T00:00:00Z'
  },
  {
    id: 'sched-neet-heart-failure',
    chapter_id: 'chap-neet-heart-failure',
    schedule_type: 'fixed_dates',
    start_date: '2026-10-02',
    end_date: '2026-10-09',
    target_duration_days: 7,
    recommended_study_hours: 12,
    milestone_name: 'Week 4 Clinical Core: Heart Failure GDMT Therapeutics',
    unlock_at: '2026-10-02T00:00:00Z'
  },
  {
    id: 'sched-usmle-phys',
    chapter_id: 'chap-usmle-cardio-phys',
    schedule_type: 'fixed_dates',
    start_date: '2026-09-10',
    end_date: '2026-09-17',
    target_duration_days: 7,
    recommended_study_hours: 15,
    milestone_name: 'System 1: Hemodynamics & Wiggers Curve Validation',
    unlock_at: '2026-09-10T00:00:00Z'
  },
  {
    id: 'sched-usmle-pharm',
    chapter_id: 'chap-usmle-cardio-pharm',
    schedule_type: 'fixed_dates',
    start_date: '2026-09-18',
    end_date: '2026-09-25',
    target_duration_days: 7,
    recommended_study_hours: 14,
    milestone_name: 'System 2: Autonomic & Antiarrhythmic Drug Target Mastery',
    unlock_at: '2026-09-18T00:00:00Z'
  }
];

export const SEED_TOPICS = [
  // Topics under Chapter 1 (Cardiovascular System)
  {
    id: 'top-valvular-disorders',
    chapter_id: 'chap-neet-cardio',
    title: 'Valvular Heart Diseases & Auscultation Murmurs',
    topic_number: 1,
    summary: 'Aortic stenosis, mitral regurgitation, dynamic auscultatory maneuvers, and surgical indications.',
    order_index: 1,
    estimated_minutes: 150
  },
  {
    id: 'top-hemodynamics-echo',
    chapter_id: 'chap-neet-cardio',
    title: 'Cardiac Hemodynamics & Doppler Echocardiography',
    topic_number: 2,
    summary: 'Pressure gradients, Gorlin equation, continuity equation, and diastolic filling parameters.',
    order_index: 2,
    estimated_minutes: 120
  },

  // Topics under Chapter 2 (Arrhythmias)
  {
    id: 'top-ecg-rhythm-axis',
    chapter_id: 'chap-neet-arrhythmia',
    title: '12-Lead ECG Fundamentals: Axis, Intervals & Hypertrophy',
    topic_number: 1,
    summary: 'Vector electrocardiography, Sokolow-Lyon criteria, long QT syndromes, and bundle branch blocks.',
    order_index: 1,
    estimated_minutes: 140
  },
  {
    id: 'top-vt-svt-acls',
    chapter_id: 'chap-neet-arrhythmia',
    title: 'Narrow vs Wide Complex Tachycardias & ACLS Emergency Protocol',
    topic_number: 2,
    summary: 'AVNRT, WPW antidromic pathways, Brugada algorithm for VT, and synchronized cardioversion protocols.',
    order_index: 2,
    estimated_minutes: 180
  },

  // Topics under USMLE Chapter 1
  {
    id: 'top-usmle-pv-loops',
    chapter_id: 'chap-usmle-cardio-phys',
    title: 'Pressure-Volume Loops in Health and Disease',
    topic_number: 1,
    summary: 'Inotropy, afterload, preload changes, and valvular pathology shifts on ventricular PV loops.',
    order_index: 1,
    estimated_minutes: 110
  }
];

// Rich Mixed Content across all 5 types under Topics
export const SEED_CONTENTS = [
  // ---------------------------------------------------------------------------
  // Topic: Valvular Heart Diseases & Auscultation Murmurs (MIXED 5 TYPES)
  // ---------------------------------------------------------------------------
  {
    id: 'cnt-valvular-vid',
    topic_id: 'top-valvular-disorders',
    content_type: 'video',
    title: 'Master Lecture: Valvular Lesions, Hemodynamics & Auscultation Pearls',
    description: 'High-yield clinical walkthrough explaining phonocardiograms, dynamic bedside maneuvers, and Doppler gradients.',
    order_index: 1,
    is_free_preview: true,
    media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    meta: {
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '44:20',
      duration_seconds: 2660,
      instructor: 'Dr. Siddharth Verma, MD (AIIMS Cardiology)',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
      chapters: [
        { time: '00:00', label: 'Aortic Stenosis: Etiology & Triad of Symptoms' },
        { time: '14:20', label: 'Mitral Regurgitation: Acute vs Chronic Hemodynamics' },
        { time: '28:45', label: 'Dynamic Bedside Maneuvers (Valsalva, Handgrip, Squatting)' },
        { time: '38:10', label: 'High-Yield Transcatheter Aortic Valve Replacement (TAVR) Guidelines' }
      ]
    }
  },
  {
    id: 'cnt-valvular-pdf',
    topic_id: 'top-valvular-disorders',
    content_type: 'pdf',
    title: 'Clinical Companion Notes: Comprehensive Valvular Pathology & Flow Charts',
    description: 'High-yield PDF companion summarizing ACC/AHA clinical guidelines, murmur differentials, and grading tables.',
    order_index: 2,
    is_free_preview: true,
    media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    meta: {
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_name: 'Valvular_Disorders_Clinical_Companion_v2.pdf',
      page_count: 26,
      file_size: '3.8 MB',
      author: 'Dr. Siddharth Verma (Lead Faculty, Cardiology)',
      download_allowed: true
    }
  },
  {
    id: 'cnt-valvular-ppt',
    topic_id: 'top-valvular-disorders',
    content_type: 'ppt',
    title: 'Clinical Grand Rounds Case Presentation: Severe Symptomatic Aortic Stenosis',
    description: 'Official slide presentation used in hospital clinical rounds: Echocardiogram Doppler traces, coronary angiogram correlation, and surgical case discussion.',
    order_index: 3,
    is_free_preview: false,
    media_url: 'https://view.officeapps.live.com/op/view.aspx?src=sample_aortic_stenosis_deck.pptx',
    meta: {
      ppt_url: 'https://view.officeapps.live.com/op/view.aspx?src=sample_aortic_stenosis_deck.pptx',
      embed_url: 'https://onedrive.live.com/embed?cid=sample_ppt',
      file_name: 'Severe_Aortic_Stenosis_Grand_Rounds.pptx',
      slide_count: 36,
      file_size: '14.2 MB',
      presenter: 'Dr. Siddharth Verma & AIIMS Fellows',
      slides: [
        {
          slideNumber: 1,
          title: 'Case Presentation: 72-Year-Old Male with Exertional Syncope & Dyspnea',
          keyNotes: 'Patient presented following collapse while walking up stairs. Harsh crescendo-decrescendo murmur at right upper sternal border with radiation to carotids.'
        },
        {
          slideNumber: 2,
          title: 'Hemodynamic Assessment: Gorlin Equation & Peak Gradient',
          keyNotes: 'Mean gradient > 40 mmHg, peak velocity > 4.0 m/s, calculated aortic valve area 0.65 cm² (consistent with Severe High-Gradient AS).'
        },
        {
          slideNumber: 3,
          title: 'Surgical vs TAVR Decision Matrix (STS Score: 3.4%)',
          keyNotes: 'Patient age 72, low surgical risk, transfemoral access feasible. Heart Team recommended TAVR with balloon-expandable valve prosthesis.'
        },
        {
          slideNumber: 4,
          title: 'Post-Procedural Hemodynamics & High-Yield Exam Pearls',
          keyNotes: 'Immediate resolution of transvalvular gradient. Watch for post-TAVR complete heart block due to deep membranous septum compression.'
        }
      ]
    }
  },
  {
    id: 'cnt-valvular-photo',
    topic_id: 'top-valvular-disorders',
    content_type: 'photo',
    title: 'Diagnostic Specimen: Calcific Bicuspid Aortic Valve & Echocardiogram Continuous-Wave Doppler',
    description: 'Gross pathology specimen demonstrating fusion of the right and left coronary cusps with dense calcification, paired with CW Doppler spectral trace (Vmax 4.6 m/s).',
    order_index: 4,
    is_free_preview: true,
    media_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    meta: {
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      caption: 'Continuous-wave Doppler trace across the aortic valve showing high velocity envelope (Vmax 4.6 m/s, Mean Gradient 48 mmHg), indicative of severe calcific aortic stenosis.',
      specimen_type: 'Gross Pathology & CW Doppler Trace',
      dimensions: '1920x1080',
      aspect_ratio: '16:9'
    }
  },
  {
    id: 'cnt-valvular-live',
    topic_id: 'top-valvular-disorders',
    content_type: 'live_session',
    title: 'Live Interactive Masterclass: Complex Valvular Case Vignettes & Live Q&A',
    description: 'Live interactive patient case solving with audience polling, murmur phonogram listening drills, and exam-oriented problem solving.',
    order_index: 5,
    is_free_preview: false,
    media_url: 'https://zoom.us/j/9876543210',
    meta: {
      session_datetime: '2026-09-12T19:30:00+05:30',
      duration: '75 mins',
      duration_minutes: 75,
      meeting_link: 'https://zoom.us/j/9876543210',
      host_name: 'Dr. Siddharth Verma, MD (AIIMS Cardiology)',
      status: 'scheduled', // 'scheduled' | 'live' | 'completed'
      recording_url: null,
      meeting_password: 'MEDPREP_VALVE'
    }
  },

  // ---------------------------------------------------------------------------
  // Topic: 12-Lead ECG Fundamentals: Axis, Intervals & Hypertrophy
  // ---------------------------------------------------------------------------
  {
    id: 'cnt-ecg-vid',
    topic_id: 'top-ecg-rhythm-axis',
    content_type: 'video',
    title: 'Video Lecture: Systematic 6-Step 12-Lead ECG Interpretation Algorithm',
    description: 'Master rate, rhythm, axis deviation, chamber enlargement, and ST-T wave abnormalities in under 45 minutes.',
    order_index: 1,
    is_free_preview: true,
    media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    meta: {
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '41:15',
      duration_seconds: 2475,
      instructor: 'Dr. Preeti Nair, MD (Cardiology Electrophysiology)',
      thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80',
      chapters: [
        { time: '00:00', label: 'Hexaxial Reference System & Mean QRS Axis' },
        { time: '12:10', label: 'Sokolow-Lyon & Cornell Voltage Criteria for LVH' },
        { time: '24:30', label: 'Long QT Syndromes (LQT1, LQT2, LQT3) & Torsades Prevention' },
        { time: '34:00', label: 'Pathological Q Waves vs Benign Early Repolarization' }
      ]
    }
  },
  {
    id: 'cnt-ecg-photo',
    topic_id: 'top-ecg-rhythm-axis',
    content_type: 'photo',
    title: 'Clinical ECG Strip: Left Ventricular Hypertrophy with Secondary Repolarization Abnormality',
    description: 'Standard 12-lead ECG demonstrating deep S wave in V1 (24 mm) and tall R wave in V5 (28 mm), meeting Sokolow-Lyon criteria (52 mm > 35 mm), with asymmetric T-wave inversions in lateral leads.',
    order_index: 2,
    is_free_preview: true,
    media_url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&auto=format&fit=crop&q=80',
    meta: {
      image_url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&auto=format&fit=crop&q=80',
      caption: '12-Lead ECG showing classical LVH voltage with strain pattern: Deep S in V1/V2, prominent R in V5/V6, and downsloping ST depressions with asymmetric T wave inversions in leads I, aVL, V5, V6.',
      specimen_type: '12-Lead Diagnostic ECG Rhythm Strip',
      dimensions: '2400x1200',
      aspect_ratio: '2:1'
    }
  },
  {
    id: 'cnt-ecg-ppt',
    topic_id: 'top-ecg-rhythm-axis',
    content_type: 'ppt',
    title: 'ECG Slide Deck: 25 High-Yield Rhythm Traces for Examination Hall',
    description: 'Interactive diagnostic slide challenge: Unlabeled 12-lead ECGs followed by animated reveal of axis vectors, intervals, and final clinical diagnoses.',
    order_index: 3,
    is_free_preview: false,
    media_url: 'https://view.officeapps.live.com/op/view.aspx?src=sample_ecg_traces.pptx',
    meta: {
      ppt_url: 'https://view.officeapps.live.com/op/view.aspx?src=sample_ecg_traces.pptx',
      embed_url: 'https://onedrive.live.com/embed?cid=sample_ecg_ppt',
      file_name: '25_High_Yield_ECG_Rhythm_Strips_Challenge.pptx',
      slide_count: 50,
      file_size: '18.9 MB',
      presenter: 'Dr. Preeti Nair & Clinical Cardiology Faculty',
      slides: [
        {
          slideNumber: 1,
          title: 'Case 1: 58-Year-Old with Syncope & Bifascicular Block',
          keyNotes: 'RBBB (rsR prime in V1) + Left Anterior Fascicular Block (Left axis deviation -60°). Risk of progression to complete heart block.'
        },
        {
          slideNumber: 2,
          title: 'Case 2: Wellens Syndrome (Critical LAD Stenosis)',
          keyNotes: 'Deeply inverted or biphasic T waves in leads V2-V3 in pain-free state. High risk of imminent anterior myocardial infarction.'
        },
        {
          slideNumber: 3,
          title: 'Case 3: Hypokalemia vs Hyperkalemia ECG Progression',
          keyNotes: 'Hyperkalemia: Peaked T -> PR prolonged -> Wide QRS -> Sine wave. Hypokalemia: ST depression, flattened T wave, prominent U wave.'
        }
      ]
    }
  },
  {
    id: 'cnt-ecg-pdf',
    topic_id: 'top-ecg-rhythm-axis',
    content_type: 'pdf',
    title: 'Rapid Review Cheat Sheet: 12-Lead ECG Normal Values & Formulas',
    description: 'Pocket formula booklet: Bazett formula for QTc, Lewis index for axis determination, and Cabrera sign for infarction in LBBB.',
    order_index: 4,
    is_free_preview: true,
    media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    meta: {
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_name: 'ECG_Formulas_and_Normal_Values_Card.pdf',
      page_count: 14,
      file_size: '2.1 MB',
      author: 'Dr. Preeti Nair',
      download_allowed: true
    }
  },
  {
    id: 'cnt-ecg-live',
    topic_id: 'top-ecg-rhythm-axis',
    content_type: 'live_session',
    title: 'Live Grand Rounds: ECG Live Clinic — Live Read with Faculty',
    description: 'Faculty and resident candidates analyze real patient ECG strips in real time, with interactive chat Q&A and on-demand replay recording.',
    order_index: 5,
    is_free_preview: false,
    media_url: 'https://zoom.us/j/9876543211',
    meta: {
      session_datetime: '2026-09-05T18:00:00+05:30',
      duration: '90 mins',
      duration_minutes: 90,
      meeting_link: 'https://zoom.us/j/9876543211',
      host_name: 'Dr. Preeti Nair, MD',
      status: 'completed', // Completed session demonstrating recording replay
      recording_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      recording_duration: '1h 32m',
      recording_views: 412
    }
  }
];
