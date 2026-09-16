// =============================================================================
// PROTOTYPE EXAM DEMO DATA — CANONICAL SEED FIXTURES
// Realistic educational fixtures for NEET PG, IELTS Listening, and Clinical Cases.
// =============================================================================

import { QUESTION_TYPES, STIMULUS_TYPES, ITEM_TYPES } from '../../utils/questionTypes.js';

// -----------------------------------------------------------------------------
// 1. CANONICAL QUESTIONS (12 Realistic Questions Total)
// -----------------------------------------------------------------------------

export const DEMO_QUESTIONS = [
  // --- NEET PG Objective Single Choice Questions (5 Qs) ---
  {
    id: 'q-neet-01',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      vignette: 'A 62-year-old male with hypertension and smoking history presents with severe crushing substernal chest pain for 90 minutes. ECG demonstrates 3 mm ST elevation in V2-V5 with reciprocal ST depression in II, III, and aVF.',
      prompt: 'Which coronary artery is most likely occluded, and what is the definitive first-line reperfusion therapy?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Left Anterior Descending (LAD) artery; Primary Percutaneous Coronary Intervention (PCI)' },
        { id: 'B', text: 'Right Coronary Artery (RCA); Intravenous Beta-blocker infusion' },
        { id: 'C', text: 'Left Circumflex (LCx) artery; Emergent Coronary Artery Bypass Grafting (CABG)' },
        { id: 'D', text: 'Left Main Coronary Artery; Sublingual Nitroglycerin monotherapy' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Medicine',
      topic: 'Cardiology',
      difficulty: 'medium',
      tags: ['STEMI', 'ECG', 'Reperfusion']
    },
    explanation: 'ST elevation in leads V2-V5 indicates an acute anterior STEMI, typically caused by occlusion of the Left Anterior Descending (LAD) artery. Guideline-directed first-line strategy is emergent Primary PCI performed within 90 minutes of medical contact.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-neet-02',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      vignette: 'A 55-year-old female with poorly controlled type 2 diabetes presents with gradual onset of burning pain, numbness, and tingling in both feet in a symmetric stocking distribution. Vibration and light touch sensation are diminished.',
      prompt: 'What is the first-line pharmacotherapeutic agent approved for the symptomatic management of this patient\'s condition?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Duloxetine or Pregabalin' },
        { id: 'B', text: 'Oral Prednisone pulse therapy' },
        { id: 'C', text: 'High-dose Indomethacin' },
        { id: 'D', text: 'Metformin titration monotherapy' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Medicine',
      topic: 'Neurology',
      difficulty: 'easy',
      tags: ['Diabetes', 'Neuropathy', 'Pharmacology']
    },
    explanation: 'First-line FDA and ADA approved agents for painful diabetic peripheral neuropathy include SNRIs (such as Duloxetine) and Gabapentinoids (such as Pregabalin or Gabapentin). NSAIDs and steroids are ineffective.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-neet-03',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      vignette: 'A 4-year-old boy presents with high fever, barking cough, inspiratory stridor, and hoarseness that worsen at night. Soft-tissue neck radiograph reveals classic subglottic narrowing (steeple sign).',
      prompt: 'What is the most common etiology of this condition, and what is the primary initial medical therapy for moderate-to-severe stridor?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Parainfluenza virus type 1; Single-dose oral Dexamethasone plus Nebulized Epinephrine' },
        { id: 'B', text: 'Haemophilus influenzae type b; Intravenous Ceftriaxone' },
        { id: 'C', text: 'Respiratory Syncytial Virus (RSV); Inhaled Albuterol' },
        { id: 'D', text: 'Bordetella pertussis; Oral Azithromycin' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Pediatrics',
      topic: 'Pulmonology',
      difficulty: 'medium',
      tags: ['Croup', 'Infectious Disease', 'Emergency']
    },
    explanation: 'Croup (laryngotracheobronchitis) is most frequently caused by Parainfluenza virus type 1. Standard treatment for moderate to severe croup with resting stridor is a single dose of oral or IM Dexamethasone along with nebulized racemic epinephrine.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-neet-04',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      vignette: 'A 34-year-old woman presents with persistent fatigue, orthostatic hypotension, unexplained weight loss, and hyperpigmentation of palmar creases and buccal mucosa. Serum sodium is 128 mEq/L and potassium is 5.8 mEq/L.',
      prompt: 'Which diagnostic test is the gold standard investigation to definitively establish this diagnosis?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Cosyntropin (ACTH) Stimulation Test' },
        { id: 'B', text: 'High-dose Dexamethasone Suppression Test' },
        { id: 'C', text: '24-hour urinary free cortisol excretion' },
        { id: 'D', text: 'Water deprivation test with desmopressin' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Medicine',
      topic: 'Endocrinology',
      difficulty: 'medium',
      tags: ['Addison Disease', 'Adrenal', 'Diagnostics']
    },
    explanation: 'Hyperpigmentation with hyponatremia and hyperkalemia points to Primary Adrenal Insufficiency (Addison disease). The Cosyntropin stimulation test evaluates adrenal reserve; an inadequate rise in serum cortisol (< 18 mcg/dL) confirms diagnosis.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-neet-05',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      vignette: 'A 70-year-old male with heart failure on Digoxin and Furosemide presents with nausea, yellow-tinted blurred vision (xanthopsia), and severe bradycardia. Serum potassium is 6.2 mEq/L and ECG reveals frequent bidirectional ventricular tachycardia.',
      prompt: 'What is the definitive antidote of choice for acute life-threatening toxicity in this patient?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Digoxin-specific antibody antigen-binding fragments (DigiFab)' },
        { id: 'B', text: 'Intravenous Calcium gluconate 10% bolus' },
        { id: 'C', text: 'Immediate hemodialysis' },
        { id: 'D', text: 'Intravenous Atropine 3 mg continuous infusion' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Pharmacology',
      topic: 'Toxicology',
      difficulty: 'hard',
      tags: ['Digoxin', 'Arrhythmia', 'Antidote']
    },
    explanation: 'Digoxin-specific Fab fragments (DigiFab) are the definitive antidote for life-threatening digoxin toxicity (characterized by severe ventricular arrhythmias and hyperkalemia). Calcium gluconate is historically avoided due to stone heart risk.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },

  // --- IELTS Academic Listening Questions (4 Qs: Single Choice, Matching, Fill Blank) ---
  {
    id: 'q-ielts-01',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      prompt: 'According to the recorded conversation, what is the primary reason the student visits the Student Services Hub?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'To collect her official international student identity card' },
        { id: 'B', text: 'To request an extension for campus accommodation deposit payment' },
        { id: 'C', text: 'To switch her academic major from Biomedical Sciences to Pharmacology' },
        { id: 'D', text: 'To book an appointment with the university career counseling advisor' }
      ]
    },
    answer: {
      correct: ['B']
    },
    scoring: {
      marks: 1,
      negativeMarks: 0
    },
    metadata: {
      subject: 'English',
      topic: 'IELTS Listening',
      difficulty: 'easy',
      tags: ['Section 1', 'Dialogue']
    },
    explanation: 'The student states early in the conversation that she needs two additional weeks to transfer international funds for her campus residence hall deposit.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-ielts-02',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      prompt: 'On which date does the mandatory international student orientation program begin?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Monday, September 21st' },
        { id: 'B', text: 'Wednesday, September 23rd' },
        { id: 'C', text: 'Friday, September 25th' },
        { id: 'D', text: 'Monday, September 28th' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 1,
      negativeMarks: 0
    },
    metadata: {
      subject: 'English',
      topic: 'IELTS Listening',
      difficulty: 'easy',
      tags: ['Dates', 'Details']
    },
    explanation: 'The administrator confirms that orientation commences on the third Monday of September (September 21st).',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-ielts-03',
    type: QUESTION_TYPES.MATCHING,
    content: {
      prompt: 'Match each campus facility with its corresponding operating schedule as mentioned in the audio recording.'
    },
    responseSchema: {
      premises: [
        { id: 'P1', text: 'Central Library Main Reading Room' },
        { id: 'P2', text: 'Student Health & Wellness Center' },
        { id: 'P3', text: 'Campus Recreation & Olympic Pool' }
      ],
      targets: [
        { id: 'T1', text: '24 Hours Daily with Electronic Keycard Access' },
        { id: 'T2', text: '08:00 to 18:00 Monday through Friday' },
        { id: 'T3', text: '06:00 to 22:00 Seven Days a Week' }
      ]
    },
    answer: {
      correct: {
        P1: 'T1',
        P2: 'T2',
        P3: 'T3'
      }
    },
    scoring: {
      marks: 3,
      negativeMarks: 0
    },
    metadata: {
      subject: 'English',
      topic: 'IELTS Listening',
      difficulty: 'medium',
      tags: ['Matching', 'Campus Facilities']
    },
    explanation: 'The audio confirms the library is 24/7 with keycard access, health center operates 8am-6pm weekdays, and recreation pool is open 6am-10pm daily.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-ielts-04',
    type: QUESTION_TYPES.FILL_BLANK,
    content: {
      prompt: 'Complete the note below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER: The international registration form must be submitted to Room ___ before 17:00 on Friday.'
    },
    responseSchema: {
      placeholder: 'Enter room number or name'
    },
    answer: {
      correct: ['304B', '304-B', 'Room 304B']
    },
    scoring: {
      marks: 1,
      negativeMarks: 0
    },
    metadata: {
      subject: 'English',
      topic: 'IELTS Listening',
      difficulty: 'medium',
      tags: ['Form Completion', 'Fill Blank']
    },
    explanation: 'The registrar specifies delivering the paperwork to Room 304B on the third floor before the Friday afternoon deadline.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },

  // --- Clinical Case Grouped Questions (3 Qs under shared stimulus) ---
  {
    id: 'q-case-01',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      prompt: 'Based on the clinical presentation and physical examination findings, what is the most likely and immediately life-threatening diagnosis?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Acute Aortic Dissection (Stanford Type A)' },
        { id: 'B', text: 'Acute Anterolateral Myocardial Infarction with papillary muscle rupture' },
        { id: 'C', text: 'Spontaneous Tension Pneumothorax' },
        { id: 'D', text: 'Massive Pulmonary Embolism with acute cor pulmonale' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Medicine',
      topic: 'Cardiology',
      difficulty: 'hard',
      tags: ['Aortic Dissection', 'Emergency', 'Vascular']
    },
    explanation: 'Severe tearing chest pain radiating to the interscapular back, asymmetric upper extremity blood pressure (>20 mmHg difference), and a new diastolic murmur of aortic regurgitation are pathognomonic for an Ascending Aortic Dissection (Stanford Type A).',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-case-02',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      prompt: 'What is the diagnostic imaging investigation of choice to definitively confirm the diagnosis in this hemodynamically stable patient?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'CT Angiography (CTA) of the chest, abdomen, and pelvis' },
        { id: 'B', text: 'Transthoracic Echocardiogram (TTE) alone' },
        { id: 'C', text: 'Invasive Catheter Coronary Angiography' },
        { id: 'D', text: 'Standard Posterior-Anterior Chest Radiograph' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Radiology',
      topic: 'Vascular Imaging',
      difficulty: 'medium',
      tags: ['CTA', 'Diagnostics']
    },
    explanation: 'Contrast-enhanced CT Angiography (CTA) of the chest and abdomen is the gold standard imaging modality for hemodynamically stable patients suspected of aortic dissection, with sensitivity and specificity near 100%. Transesophageal echocardiography (TEE) is preferred if unstable.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'q-case-03',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      prompt: 'Prior to emergent surgical intervention, what is the initial medical pharmacotherapy indicated to reduce aortic wall shear stress?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Intravenous Beta-blocker (e.g. Esmolol or Labetalol) targeting heart rate < 60 bpm and SBP < 120 mmHg' },
        { id: 'B', text: 'Intravenous Sodium Nitroprusside monotherapy' },
        { id: 'C', text: 'Sublingual Nitroglycerin spray and IV Hydralazine' },
        { id: 'D', text: 'Immediate systemic anticoagulation with unfractionated heparin' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Critical Care',
      topic: 'Hemodynamic Management',
      difficulty: 'hard',
      tags: ['Pharmacotherapy', 'ICU', 'Aorta']
    },
    explanation: 'Initial medical therapy must lower both heart rate and blood pressure to minimize dP/dt (shear stress on the aortic wall). IV beta-blockers (Esmolol or Labetalol) are first-line. Vasodilators like nitroprusside should never be given without beta-blockade due to reflex tachycardia.',
    status: 'published',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },

  // --- Multi-Select Multiple Choice Questions (2 Qs) ---
  {
    id: 'q-med-mc-01',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    content: {
      vignette: 'A 68-year-old hospitalized patient develops acute rigors and tachycardia 48 hours following elective colonic resection.',
      prompt: 'Which of the following clinical and laboratory parameters satisfy the Consensus Criteria for Systemic Inflammatory Response Syndrome (SIRS) in an adult? (Select all that apply)'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Core body temperature > 38.0°C (100.4°F) or < 36.0°C (96.8°F)' },
        { id: 'B', text: 'Heart rate > 90 beats per minute' },
        { id: 'C', text: 'Mean Arterial Pressure (MAP) < 65 mmHg' },
        { id: 'D', text: 'Respiratory rate > 20 breaths/min or PaCO2 < 32 mmHg' },
        { id: 'E', text: 'White blood cell count > 12,000/mcL, < 4,000/mcL, or > 10% immature band forms' }
      ]
    },
    answer: {
      correct: ['A', 'B', 'D', 'E']
    },
    scoring: {
      marks: 4,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Critical Care',
      topic: 'Sepsis & Resuscitation',
      difficulty: 'medium',
      tags: ['SIRS', 'Sepsis', 'ICU Criteria']
    },
    explanation: 'SIRS criteria require ≥ 2 of: (1) Temp > 38°C or < 36°C; (2) HR > 90 bpm; (3) RR > 20 or PaCO2 < 32; (4) WBC > 12k, < 4k, or > 10% bands. MAP < 65 mmHg is a resuscitation hemodynamic target and sign of septic shock, but not a defined SIRS criterion.',
    status: 'published',
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-15T09:00:00.000Z'
  },
  {
    id: 'q-med-mc-02',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    content: {
      vignette: 'A 74-year-old male with refractory ventricular arrhythmias has been maintained on oral Amiodarone 200 mg daily for the past 3 years.',
      prompt: 'Which of the following organ-specific toxicities are well-documented adverse reactions associated with long-term Amiodarone therapy? (Select all that apply)'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Pulmonary interstitial fibrosis and pneumonitis' },
        { id: 'B', text: 'Aplastic anemia' },
        { id: 'C', text: 'Thyroid dysfunction (both hypothyroidism and thyrotoxicosis)' },
        { id: 'D', text: 'Corneal microdeposits (vortex keratopathy)' },
        { id: 'E', text: 'Hepatotoxicity with elevated serum aminotransferases' }
      ]
    },
    answer: {
      correct: ['A', 'C', 'D', 'E']
    },
    scoring: {
      marks: 4,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Pharmacology',
      topic: 'Antiarrhythmic Agents',
      difficulty: 'medium',
      tags: ['Amiodarone', 'Toxicology', 'Pharmacovigilance']
    },
    explanation: 'Amiodarone is iodine-rich and lipophilic. Recognized toxicities include pulmonary fibrosis, thyroid disease (37% iodine by weight), corneal deposits (in >90% of chronic users), hepatotoxicity, and blue-gray skin discoloration. Aplastic anemia is not characteristic.',
    status: 'review',
    createdAt: '2026-09-15T09:15:00.000Z',
    updatedAt: '2026-09-15T09:15:00.000Z'
  },

  // --- True / False Questions (2 Qs) ---
  {
    id: 'q-med-tf-01',
    type: QUESTION_TYPES.TRUE_FALSE,
    content: {
      vignette: 'A 24-year-old unrestrained driver involved in a motor vehicle crash presents with acute dyspnea, hypotension, and absent breath sounds over the right hemithorax.',
      prompt: 'In tension pneumothorax, mediastinal shift causes tracheal deviation characteristically TOWARD the ipsilateral side of the pneumothorax.'
    },
    responseSchema: {
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ]
    },
    answer: {
      correct: ['false']
    },
    scoring: {
      marks: 2,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Surgery',
      topic: 'Trauma & Emergency',
      difficulty: 'easy',
      tags: ['Pneumothorax', 'Trauma', 'Chest Tube']
    },
    explanation: 'False. In a tension pneumothorax, accumulated intrapleural positive pressure shifts the mediastinum and trachea AWAY from the affected side (contralateral deviation), impeding venous return through the vena cava.',
    status: 'published',
    createdAt: '2026-09-15T09:30:00.000Z',
    updatedAt: '2026-09-15T09:30:00.000Z'
  },
  {
    id: 'q-med-tf-02',
    type: QUESTION_TYPES.TRUE_FALSE,
    content: {
      prompt: 'Initiation or upward titration of beta-blocker therapy is strictly contraindicated during an acute decompensated heart failure exacerbation with signs of hypoperfusion and volume overload.'
    },
    responseSchema: {
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ]
    },
    answer: {
      correct: ['true']
    },
    scoring: {
      marks: 2,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Cardiology',
      topic: 'Heart Failure Management',
      difficulty: 'easy',
      tags: ['Beta-blocker', 'Decompensation', 'Guidelines']
    },
    explanation: 'True. While beta-blockers reduce mortality in chronic stable heart failure with reduced ejection fraction, they have negative inotropic effects and must not be started or uptitrated during acute unstable decompensation until euvolemia is restored.',
    status: 'approved',
    createdAt: '2026-09-15T09:45:00.000Z',
    updatedAt: '2026-09-15T09:45:00.000Z'
  },

  // --- Short Answer Questions (2 Qs) ---
  {
    id: 'q-med-sa-01',
    type: QUESTION_TYPES.SHORT_ANSWER,
    content: {
      vignette: 'A 78-year-old male is brought by his family for progressive unsteadiness while walking, frequent falls, progressive memory decline, and new-onset urinary urgency and incontinence over the past 8 months. Brain MRI reveals ventriculomegaly disproportionate to cerebral sulcal atrophy.',
      prompt: 'What classic mnemonic or clinical triad describes the three primary cardinal presenting features of Normal Pressure Hydrocephalus (NPH)?'
    },
    responseSchema: {
      placeholder: 'Enter triad or cardinal symptoms...',
      caseSensitive: false
    },
    answer: {
      correct: [
        'wet, wacky, and wobbly',
        'wet, wacky, wobbly',
        'gait disturbance, dementia, urinary incontinence',
        'gait disturbance, memory loss, urinary incontinence',
        'gait ataxia, cognitive impairment, urinary incontinence',
        'Hakim triad',
        'Hakim-Adams triad'
      ]
    },
    scoring: {
      marks: 3,
      negativeMarks: 0
    },
    metadata: {
      subject: 'Neurology',
      topic: 'Hydrocephalus & Cognitive Impairment',
      difficulty: 'medium',
      tags: ['NPH', 'Hakim Triad', 'Geriatrics']
    },
    explanation: 'The classic Hakim-Adams triad of Normal Pressure Hydrocephalus is gait disturbance (wobbly / magnetic gait), dementia/cognitive impairment (wacky), and urinary incontinence (wet).',
    status: 'published',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'q-med-sa-02',
    type: QUESTION_TYPES.SHORT_ANSWER,
    content: {
      vignette: 'A 42-year-old obese female presents with sudden sharp right upper quadrant pain that began 2 hours after a fatty meal.',
      prompt: 'What is the eponymous term for the physical examination maneuver where deep palpation beneath the right subcostal margin causes sudden cessation of inspiration due to severe sharp peritoneal pain?'
    },
    responseSchema: {
      placeholder: "e.g. Murphy's sign",
      caseSensitive: false
    },
    answer: {
      correct: [
        "Murphy sign",
        "Murphy's sign",
        "Murphys sign",
        "Murphy's",
        "Murphy"
      ]
    },
    scoring: {
      marks: 3,
      negativeMarks: 0
    },
    metadata: {
      subject: 'Surgery',
      topic: 'Biliary Disease',
      difficulty: 'easy',
      tags: ['Cholecystitis', 'Physical Exam', 'Eponym']
    },
    explanation: "Murphy's sign is characteristic of acute calculous cholecystitis. It occurs when the inflamed gallbladder descends and contacts the examiner's palpating fingers during inspiration.",
    status: 'draft',
    createdAt: '2026-09-15T10:15:00.000Z',
    updatedAt: '2026-09-15T10:15:00.000Z'
  },

  // --- Fill in the Blank Questions (1 Q) ---
  {
    id: 'q-med-fb-01',
    type: QUESTION_TYPES.FILL_BLANK,
    content: {
      vignette: 'A 56-year-old female underwent mechanical bileaflet mitral valve replacement 6 weeks ago.',
      prompt: 'According to ACC/AHA guidelines, the standard target therapeutic International Normalized Ratio (INR) range for an uncomplicated patient with a mechanical MITRAL valve prosthesis on Warfarin is ___ to ___.'
    },
    responseSchema: {
      placeholder: 'e.g. 2.5 to 3.5'
    },
    answer: {
      correct: [
        '2.5 to 3.5',
        '2.5-3.5',
        '2.5 - 3.5',
        '2.5 to 3.5'
      ]
    },
    scoring: {
      marks: 2,
      negativeMarks: 0
    },
    metadata: {
      subject: 'Hematology',
      topic: 'Anticoagulation & Prosthetic Valves',
      difficulty: 'medium',
      tags: ['Warfarin', 'INR', 'Prosthetic Valve']
    },
    explanation: 'Mechanical mitral valves carry higher thromboembolic risk than mechanical aortic valves due to lower blood flow velocity in the left atrium; thus the recommended target INR is 2.5 to 3.5 (target 3.0). Mechanical aortic valves target 2.0 to 3.0.',
    status: 'published',
    createdAt: '2026-09-15T10:30:00.000Z',
    updatedAt: '2026-09-15T10:30:00.000Z'
  },

  // --- Archived Demo Question (1 Q) ---
  {
    id: 'q-med-arc-01',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    content: {
      vignette: 'A 52-year-old male with long-standing alcohol use presents with chronic epigastric pain and steatorrhea.',
      prompt: 'Which of the following is the most sensitive diagnostic imaging modality for detecting early morphological pancreatic ductal changes in chronic pancreatitis?'
    },
    responseSchema: {
      options: [
        { id: 'A', text: 'Endoscopic Retrograde Cholangiopancreatography (ERCP) / MRCP with Secretin' },
        { id: 'B', text: 'Plain abdominal radiograph' },
        { id: 'C', text: 'Fecal elastase-1 assay monotherapy' },
        { id: 'D', text: 'Serum amylase and lipase measurement' }
      ]
    },
    answer: {
      correct: ['A']
    },
    scoring: {
      marks: 5,
      negativeMarks: -1
    },
    metadata: {
      subject: 'Gastroenterology',
      topic: 'Pancreatic Disorders',
      difficulty: 'hard',
      tags: ['Pancreatitis', 'Imaging', 'Archived Version']
    },
    explanation: 'Secretin-enhanced MRCP and Endoscopic Ultrasound (EUS) are the most sensitive non-invasive imaging methods for early stage ductal and parenchymal changes in chronic pancreatitis. (Archived curriculum item).',
    status: 'archived',
    createdAt: '2026-09-15T07:00:00.000Z',
    updatedAt: '2026-09-15T10:45:00.000Z'
  }
];

// -----------------------------------------------------------------------------
// 2. STIMULI (Shared Stimuli for Question Groups)
// -----------------------------------------------------------------------------

export const DEMO_STIMULI = [
  {
    id: 'stimulus-cardio-case-001',
    type: STIMULUS_TYPES.TEXT,
    title: 'Clinical Case Presentation: Acute Severe Tearing Interscapular Pain',
    content: {
      text: 'A 58-year-old male with a history of poorly controlled essential hypertension and a 30-pack-year smoking history is brought to the emergency department by paramedics. He reports sudden, catastrophic "tearing and ripping" pain that began 45 minutes ago while lifting heavy furniture at home. The pain originated retrosternally and rapidly radiated through to the mid-scapular back.\n\nOn physical examination: Patient appears pale, diaphoretic, and in agonizing distress. Vital signs: Heart rate 104 bpm regular, respiratory rate 24/min, room air SpO2 96%. Blood pressure in the right arm is 188/104 mmHg, whereas blood pressure in the left arm is 144/78 mmHg (differential > 40 mmHg). Radial pulses are noticeably unequal. Cardiac auscultation reveals a high-pitched, blowing early-diastolic decrescendo murmur heard best at the right second intercostal space. Pulmonary examination is clear to auscultation bilaterally. Neurological examination is intact.'
    },
    media: [],
    metadata: {
      subject: 'Medicine',
      topic: 'Cardiology / Vascular Surgery',
      clinicalSetting: 'Emergency Resuscitation'
    }
  },
  {
    id: 'stimulus-ielts-audio-01',
    type: STIMULUS_TYPES.AUDIO,
    title: 'IELTS Section 1: Campus Housing & Orientation Consultation',
    content: {
      transcript: 'Administrator: Good morning, International Student Services Hub. How may I assist you today?\nStudent: Hello, my name is Elena Rostova. I recently arrived from abroad and need to inquire about my residence hall registration and the upcoming orientation week schedule...\nAdministrator: Welcome to the university, Elena. Regarding housing, deposits are ordinarily due on registration day, but international students may request an official two-week extension for overseas wire transfers...'
    },
    media: [
      {
        id: 'media-audio-ielts-01',
        type: 'audio',
        url: '/demo/audio/ielts-listening-section1.mp3',
        title: 'Listening Track: Dialogue Between Student & Registrar',
        durationSeconds: 240
      }
    ],
    metadata: {
      subject: 'English',
      topic: 'IELTS Academic',
      accent: 'British / Australian Mixed'
    }
  }
];

// -----------------------------------------------------------------------------
// 3. QUESTION GROUPS (Linking Stimulus to Questions)
// -----------------------------------------------------------------------------

export const DEMO_QUESTION_GROUPS = [
  {
    id: 'group-cardio-case-001',
    type: 'clinical_case',
    title: 'Cardiology Case Scenario: 58-Year-Old Male with Acute Tearing Pain',
    description: 'Comprehensive clinical evaluation, diagnostic imaging, and critical hemodynamic stabilization series.',
    stimulusId: 'stimulus-cardio-case-001',
    questionIds: [
      'q-case-01',
      'q-case-02',
      'q-case-03'
    ],
    metadata: {
      subject: 'Medicine',
      topic: 'Aortic Emergencies'
    }
  },
  {
    id: 'group-ielts-housing-001',
    type: 'listening_section',
    title: 'Section 1: University Housing & Registration',
    description: 'Questions 1–4 based on the dialogue between student and registrar.',
    stimulusId: 'stimulus-ielts-audio-01',
    questionIds: [
      'q-ielts-01',
      'q-ielts-02',
      'q-ielts-03',
      'q-ielts-04'
    ],
    metadata: {
      subject: 'English',
      topic: 'Listening Comprehension'
    }
  }
];

// -----------------------------------------------------------------------------
// 4. CANONICAL ASSESSMENTS & VERSIONS
// -----------------------------------------------------------------------------

export const DEMO_ASSESSMENTS = [
  // Assessment 1: NEET PG Grand Mock
  {
    id: 'assessment-neet-pg-demo',
    title: 'NEET PG High-Yield Grand Mock Assessment',
    description: 'NExT-aligned comprehensive clinical vignette examination evaluating multi-system diagnosis and pharmacology.',
    category: 'Theoretical Exam',
    examType: 'mock',
    status: 'published',
    version: 1,
    activeVersionId: 'assessment-neet-pg-demo-v1',
    metadata: {
      courseId: 'neet-pg',
      subject: 'Clinical Medicine',
      targetAudience: 'Medical Graduates',
      tags: ['NEET PG', 'NExT', 'Clinical Vignettes', 'High-Yield']
    },
    settings: {
      durationMinutes: 45,
      navigation: {
        allowPrevious: true,
        allowNext: true,
        allowQuestionJump: true
      },
      attempt: {
        maxAttempts: 3
      },
      display: {
        showQuestionPalette: true,
        showTimer: true,
        showReviewFlag: true
      }
    },
    versions: [
      {
        id: 'assessment-neet-pg-demo-v1',
        assessmentId: 'assessment-neet-pg-demo',
        version: 1,
        status: 'published',
        evaluationRules: {
          marksPerCorrect: 5,
          marksPerIncorrect: -1,
          unattemptedMarks: 0,
          minimumScore: 0,
          passingPercentage: 50
        },
        sections: [
          {
            id: 'section-neet-clinical-medicine',
            title: 'Section 1: Clinical Vignettes & Diagnostics',
            description: 'Single best answer clinical multiple-choice questions.',
            order: 1,
            settings: {
              durationMinutes: null, // Inherits global 45m timer
              navigation: {
                allowPrevious: true,
                allowNext: true,
                allowQuestionJump: true
              },
              scoring: {
                marksPerCorrect: 5,
                marksPerIncorrect: -1
              }
            },
            instructions: 'Each question consists of a clinical vignette followed by four choices. Select the single best answer.',
            items: [
              { id: 'item-neet-01', type: ITEM_TYPES.QUESTION, refId: 'q-neet-01', order: 1 },
              { id: 'item-neet-02', type: ITEM_TYPES.QUESTION, refId: 'q-neet-02', order: 2 },
              { id: 'item-neet-03', type: ITEM_TYPES.QUESTION, refId: 'q-neet-03', order: 3 },
              { id: 'item-neet-04', type: ITEM_TYPES.QUESTION, refId: 'q-neet-04', order: 4 },
              { id: 'item-neet-05', type: ITEM_TYPES.QUESTION, refId: 'q-neet-05', order: 5 }
            ]
          }
        ],
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T08:00:00.000Z'
      }
    ],
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },

  // Assessment 2: IELTS Listening Practice
  {
    id: 'assessment-ielts-listening-demo',
    title: 'IELTS Academic Listening Simulation',
    description: 'Authentic listening exam containing dialogues, campus consultations, form completion, and matching tasks.',
    category: 'Analytical Exam',
    examType: 'practice',
    status: 'published',
    version: 1,
    activeVersionId: 'assessment-ielts-listening-demo-v1',
    metadata: {
      courseId: 'ielts',
      subject: 'English Language',
      targetAudience: 'Overseas Candidates',
      tags: ['IELTS', 'Listening', 'Band 8 Benchmark']
    },
    settings: {
      durationMinutes: 30,
      navigation: {
        allowPrevious: true,
        allowNext: true,
        allowQuestionJump: true
      },
      attempt: {
        maxAttempts: 5
      },
      display: {
        showQuestionPalette: true,
        showTimer: true,
        showReviewFlag: true
      }
    },
    versions: [
      {
        id: 'assessment-ielts-listening-demo-v1',
        assessmentId: 'assessment-ielts-listening-demo',
        version: 1,
        status: 'published',
        evaluationRules: {
          marksPerCorrect: 1,
          marksPerIncorrect: 0,
          unattemptedMarks: 0,
          minimumScore: 0,
          passingPercentage: 60
        },
        sections: [
          {
            id: 'section-ielts-section-1',
            title: 'Part 1: University Housing & Registration Dialogue',
            description: 'Audio-based questions 1 to 4 with shared listening track.',
            order: 1,
            settings: {
              durationMinutes: null,
              navigation: {
                allowPrevious: true,
                allowNext: true,
                allowQuestionJump: true
              },
              scoring: {
                marksPerCorrect: 1,
                marksPerIncorrect: 0
              }
            },
            instructions: 'Listen carefully to the audio conversation. Answer questions 1 through 4 based solely on the dialogue.',
            items: [
              { id: 'item-ielts-grp-01', type: ITEM_TYPES.QUESTION_GROUP, refId: 'group-ielts-housing-001', order: 1 }
            ]
          }
        ],
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T08:00:00.000Z'
      }
    ],
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },

  // Assessment 3: Clinical Case Assessment
  {
    id: 'assessment-clinical-case-demo',
    title: 'Clinical Cardiology & Emergency Vignette Examination',
    description: 'In-depth clinical scenario evaluating acute cardiovascular pathology, bedside differential, and emergency therapeutics.',
    category: 'Case Scenario',
    examType: 'clinical',
    status: 'published',
    version: 1,
    activeVersionId: 'assessment-clinical-case-demo-v1',
    metadata: {
      courseId: 'usmle',
      subject: 'Emergency Medicine',
      targetAudience: 'Junior Residents',
      tags: ['USMLE Step 2 CK', 'Aorta', 'Critical Care', 'Case Study']
    },
    settings: {
      durationMinutes: 30,
      navigation: {
        allowPrevious: true,
        allowNext: true,
        allowQuestionJump: true
      },
      attempt: {
        maxAttempts: 2
      },
      display: {
        showQuestionPalette: true,
        showTimer: true,
        showReviewFlag: true
      }
    },
    versions: [
      {
        id: 'assessment-clinical-case-demo-v1',
        assessmentId: 'assessment-clinical-case-demo',
        version: 1,
        status: 'published',
        evaluationRules: {
          marksPerCorrect: 5,
          marksPerIncorrect: -1,
          unattemptedMarks: 0,
          minimumScore: 0,
          passingPercentage: 66
        },
        sections: [
          {
            id: 'section-cardio-emergency',
            title: 'Section 1: Acute Aortic Syndromes',
            description: 'Structured clinical case study with progressive questioning.',
            order: 1,
            settings: {
              durationMinutes: null,
              navigation: {
                allowPrevious: true,
                allowNext: true,
                allowQuestionJump: true
              },
              scoring: {
                marksPerCorrect: 5,
                marksPerIncorrect: -1
              }
            },
            instructions: 'Review the emergency case presentation carefully before attempting the subsequent diagnostic and therapeutic questions.',
            items: [
              { id: 'item-cardio-grp-01', type: ITEM_TYPES.QUESTION_GROUP, refId: 'group-cardio-case-001', order: 1 }
            ]
          }
        ],
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T08:00:00.000Z'
      }
    ],
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  }
];
