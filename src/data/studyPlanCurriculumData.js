// =============================================================================
// 28-DAY CLINICAL STUDY PLAN CURRICULUM ROADMAP (NEET PG & NExT 2026)
// Provides full academic hierarchy: Day -> Modules -> Lectures -> Topics -> Resources
// =============================================================================

export const studyPlan28DaysCurriculum = [
  // ===========================================================================
  // WEEK 1: CARDIOLOGY & CLINICAL HEMODYNAMICS
  // ===========================================================================
  {
    weekNumber: 1,
    title: 'Cardiology & Clinical Hemodynamics',
    description: 'Valvular pathologies, heart failure physiology, electrocardiography, and acute coronary syndromes.',
    badge: 'High-Yield Core Track (28 Qs in Exam)',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    days: [
      {
        dayNumber: 1,
        title: 'Valvular Heart Diseases & Murmurs',
        duration: '1.5 hours',
        summaryPills: ['Aortic Stenosis', 'Mitral Regurgitation', 'Auscultation Maneuvers', 'Infective Endocarditis'],
        score: '18/20 (90%)',
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-1-1',
            moduleNumber: 1,
            title: 'Valvular Heart Diseases & Auscultation Dynamics',
            lectures: [
              {
                id: 'lec-1-1',
                lectureNumber: 1,
                title: 'Aortic Stenosis & Regurgitation Auscultation Pearls',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Aortic stenosis grading (valve area < 1.0 cm², mean gradient > 40 mmHg)',
                  'SAD clinical triad: Syncope, Angina, Dyspnea and prognosis curves',
                  'Austin Flint murmur mechanism in severe aortic regurgitation',
                  'Dynamic maneuvers: Handgrip vs Valsalva differential responses'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (32 mins)' },
                  { type: 'images', label: '2 High-Res Wiggers Diagrams' },
                  { type: 'flashcards', label: '3 Active Recall Flashcards' },
                  { type: 'live', label: 'Live Grand Rounds Session' }
                ]
              },
              {
                id: 'lec-1-2',
                lectureNumber: 2,
                title: 'Mitral Stenosis & Mitral Regurgitation: Murmurs & PV Loops',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'A2-to-Opening Snap interval relationship to left atrial pressure',
                  'Wilkins echocardiographic score for PMBV balloon valvuloplasty eligibility',
                  'Holosystolic murmurs: Differentiating MR from TR with Carvallo sign',
                  'Left ventricular pressure-volume loop shifts in chronic MR'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (42 mins)' },
                  { type: 'images', label: '2 Color Doppler Echocardiograms' },
                  { type: 'flashcards', label: '3 Spaced Repetition Cards' }
                ]
              },
              {
                id: 'lec-1-3',
                lectureNumber: 3,
                title: 'Mitral Valve Prolapse & Tricuspid Regurgitation',
                duration: '35 mins',
                difficulty: 'Core Clinical',
                topics: [
                  'Myxomatous degeneration of leaflets in Marfan & Ehlers-Danlos syndromes',
                  'Mid-systolic click and late systolic murmur behavior on standing/squatting',
                  'Carvallo sign: Inspiratory augmentation of right-sided murmurs'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (18 Pages)' },
                  { type: 'video', label: 'Video Masterclass (34 mins)' },
                  { type: 'images', label: '1 Dynamic Auscultation Chart' },
                  { type: 'flashcards', label: '2 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-1-4',
                lectureNumber: 4,
                title: 'Infective Endocarditis & Prosthetic Heart Valves',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Modified Duke Criteria: Major vs Minor clinical criteria breakdown',
                  'Staph aureus vs Viridans streptococci vs Enterococcus presentations',
                  'Mechanical vs Bioprosthetic valve thrombosis and anticoagulation targets'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '2 Histopathology & Vegetations Slides' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 2,
        title: 'Congestive Heart Failure & Pharmacotherapy',
        duration: '2.0 hours',
        summaryPills: ['HFrEF vs HFpEF', 'Quadruple GDMT', 'ARNI Trials', 'Cardiogenic Shock'],
        score: '17/20 (85%)',
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-2-1',
            moduleNumber: 1,
            title: 'Heart Failure Pathophysiology & Guideline Pharmacotherapy',
            lectures: [
              {
                id: 'lec-2-1',
                lectureNumber: 1,
                title: 'HFrEF vs HFpEF Diagnostic Criteria & Biomarkers',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Neurohormonal activation: RAAS overdrive, sympathetic tone & natriuretic peptides',
                  'Echocardiographic diastolic dysfunction staging (E/A ratio, E/e\' ratio)',
                  'NT-proBNP cutoff algorithms in obesity, renal impairment, and elderly patients'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 Diagnostic Algorithms & Loops' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-2-2',
                lectureNumber: 2,
                title: 'Guideline-Directed Medical Therapy (GDMT): The 4 Pillars',
                duration: '50 mins',
                difficulty: 'High-Yield',
                topics: [
                  'ARNI (Sacubitril/Valsartan) PARADIGM-HF trial data and 36-hr ACEi washout rule',
                  'Evidence-based Beta-blockers: Carvedilol, Bisoprolol, Metoprolol succinate only',
                  'MRA (Spironolactone, Eplerenone) hyperkalemia thresholds and eGFR limits',
                  'SGLT2 inhibitors (Dapagliflozin, Empagliflozin) cardio-renal protection mechanisms'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (30 Pages)' },
                  { type: 'video', label: 'Video Masterclass (44 mins)' },
                  { type: 'images', label: '2 Landmark Trial Summary Charts' },
                  { type: 'flashcards', label: '4 High-Yield GDMT Cards' }
                ]
              }
            ]
          },
          {
            id: 'mod-2-2',
            moduleNumber: 2,
            title: 'Cardiogenic Shock & Hemodynamic Inotropes',
            lectures: [
              {
                id: 'lec-2-3',
                lectureNumber: 3,
                title: 'Acute Decompensated Heart Failure & Inotropic Support',
                duration: '35 mins',
                difficulty: 'Clinical Care',
                topics: [
                  'Forrester hemodynamic profile: Warm/Dry, Warm/Wet, Cold/Dry, Cold/Wet',
                  'Dobutamine (Beta-1 agonist) vs Milrinone (PDE-3 inhibitor) hemodynamics',
                  'Norepinephrine as first-line pressor in cardiogenic shock with hypotension',
                  'Indications for urgent mechanical circulatory support (IABP, Impella, ECMO)'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (20 Pages)' },
                  { type: 'video', label: 'Video Masterclass (30 mins)' },
                  { type: 'images', label: '1 Forrester 2x2 Hemodynamic Grid' },
                  { type: 'flashcards', label: '2 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 3,
        title: 'Cardiac Arrhythmias & ECG Interpretation',
        duration: '2.0 hours',
        summaryPills: ['VT vs SVT with Aberrancy', 'Brugada Criteria', 'AV Nodal Blocks', 'Antiarrhythmics'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-3-1',
            moduleNumber: 1,
            title: 'Cardiac Arrhythmias & Clinical ECG Mastery',
            lectures: [
              {
                id: 'lec-3-1',
                lectureNumber: 1,
                title: 'Wide vs Narrow Complex Tachycardia: VT vs SVT with Aberrancy',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'AV dissociation hallmarks: Independent P waves, fusion beats, and capture beats',
                  'Brugada 4-step algorithm: Concordance, RS interval > 100 ms, QR/QS morphology',
                  'Vereckei single lead aVR algorithm for rapid emergency differentiation',
                  'Adenosine diagnostic and therapeutic utility in regular narrow-complex tachycardia'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '3 12-Lead Emergency ECG Traces' },
                  { type: 'flashcards', label: '3 Diagnostic Pearls Cards' },
                  { type: 'live', label: 'Live Auscultation & ECG Rounds' }
                ]
              },
              {
                id: 'lec-3-2',
                lectureNumber: 2,
                title: 'AV Nodal Blocks & Bradyarrhythmias',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Mobitz Type I (Wenckebach) vs Mobitz Type II anatomical location and risk of progression',
                  'Third-degree (Complete) heart block: Cannon "a" waves and ventricular escape rates',
                  'Permanent pacemaker indications according to ACC/AHA clinical guidelines',
                  'Emergency atropine vs transcutaneous pacing protocols'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (35 mins)' },
                  { type: 'images', label: '2 Rhythm Strip Case Studies' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          },
          {
            id: 'mod-3-2',
            moduleNumber: 2,
            title: 'Clinical Antiarrhythmic Pharmacotherapy',
            lectures: [
              {
                id: 'lec-3-3',
                lectureNumber: 3,
                title: 'Vaughan-Williams Antiarrhythmic Drug Protocols',
                duration: '35 mins',
                difficulty: 'Pharmacology',
                topics: [
                  'Class IA (Procainamide), IB (Lidocaine), IC (Flecainide) use-dependence kinetics',
                  'CAST trial warning against Class IC agents in structural coronary disease',
                  'Amiodarone monitoring: Pulmonary fibrosis, thyroid disorders, and corneal deposits',
                  'Torsades de Pointes pathophysiology, acquired long-QT causes, and IV Magnesium therapy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (25 Pages)' },
                  { type: 'video', label: 'Video Masterclass (32 mins)' },
                  { type: 'images', label: '1 Drug Classification Diagram' },
                  { type: 'flashcards', label: '3 High-Yield Pharma Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 4,
        title: 'Acute Coronary Syndromes & Cardiac Biomarkers',
        duration: '1.5 hours',
        summaryPills: ['STEMI vs NSTEMI', 'Plaque Rupture', 'hs-cTn Kinetics', 'Primary PCI Guidelines'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-4-1',
            moduleNumber: 1,
            title: 'Acute Coronary Syndromes & STEMI Pathways',
            lectures: [
              {
                id: 'lec-4-1',
                lectureNumber: 1,
                title: 'STEMI vs NSTEMI: Plaque Rupture & ECG Evolution',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Transmural vs subendocardial infarction pathophysiology and plaque erosion',
                  'Hyperacute T waves, ST elevation criteria in contiguous leads, and pathological Q waves',
                  'STEMI equivalents: Wellens syndrome Type A/B and de Winter T-wave pattern',
                  'Posterior wall MI: Tall R waves and horizontal ST depression in leads V1-V3'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '3 ECG Case Studies (Wellens & Posterior)' },
                  { type: 'flashcards', label: '3 Clinical Recall Cards' }
                ]
              },
              {
                id: 'lec-4-2',
                lectureNumber: 2,
                title: 'High-Sensitivity Troponins & Revascularization Guidelines',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'ESC 0/1-hour and 0/2-hour hs-cTn rapid rule-out and rule-in algorithms',
                  'Primary PCI door-to-balloon time < 90 mins vs Fibrinolysis door-to-needle time < 30 mins',
                  'Contraindications to thrombolytic therapy: Absolute vs relative criteria',
                  'Dual Antiplatelet Therapy (DAPT): Aspirin + Ticagrelor/Prasugrel durations'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '2 Revascularization Decision Flowcharts' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 5,
        title: 'Congenital Heart Defects & Pediatric Shunts',
        duration: '1.5 hours',
        summaryPills: ['ASD & VSD', 'Tetralogy of Fallot', 'PDA Murmurs', 'Eisenmenger Syndrome'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-5-1',
            moduleNumber: 1,
            title: 'Congenital Cardiac Disorders',
            lectures: [
              {
                id: 'lec-5-1',
                lectureNumber: 1,
                title: 'Acyanotic Shunts: ASD, VSD & Patent Ductus Arteriosus',
                duration: '40 mins',
                difficulty: 'Pediatrics',
                topics: [
                  'Atrial Septal Defect (Secundum vs Primum): Fixed split S2 and pulmonary flow murmur',
                  'Ventricular Septal Defect: Harsh holosystolic murmur at left lower sternal border',
                  'Patent Ductus Arteriosus: Continuous machine-like murmur at left infraclavicular area',
                  'Indomethacin/Ibuprofen for PDA closure vs Prostaglandin E1 for maintaining ductal patency'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (25 Pages)' },
                  { type: 'video', label: 'Video Masterclass (35 mins)' },
                  { type: 'images', label: '2 Echocardiography Shunt Diagrams' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-5-2',
                lectureNumber: 2,
                title: 'Cyanotic Lesions: Tetralogy of Fallot & Transposition',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'The 4 cardinal lesions of TOF: VSD, Overriding aorta, RV outflow stenosis, RVH',
                  'Hypercyanotic "Tet spells": Pathophysiology and squatting/knee-chest mechanism',
                  'Chest radiograph pearls: Boot-shaped heart (coeur en sabot) in TOF vs Egg-on-a-string in TGA',
                  'Total anomalous pulmonary venous connection (TAPVC) and snowman silhouette'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (42 mins)' },
                  { type: 'images', label: '3 Pediatric Chest Radiographs' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          },
          {
            id: 'mod-5-2',
            moduleNumber: 2,
            title: 'Complex Outflow & Vascular Syndromes',
            lectures: [
              {
                id: 'lec-5-3',
                lectureNumber: 3,
                title: 'Eisenmenger Syndrome & Coarctation of the Aorta',
                duration: '35 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Irreversible pulmonary vascular remodeling converting left-to-right shunt to right-to-left',
                  'Differential cyanosis: Lower extremity cyanosis with normal upper extremities in PDA + Eisenmenger',
                  'Coarctation of aorta: Radio-femoral pulse delay, rib notching (Roesler sign), and bicuspid aortic valve association'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (20 Pages)' },
                  { type: 'video', label: 'Video Masterclass (30 mins)' },
                  { type: 'images', label: '2 Radiograph & Angiogram Slides' },
                  { type: 'flashcards', label: '2 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 6,
        title: 'Cardiology Active Recall & Flashcard Sprint',
        duration: '1.0 hour',
        summaryPills: ['150 High-Yield Flashcards', 'Auscultation Pearls', 'Diagnostic Triads', 'Emergency Protocols'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-6-1',
            moduleNumber: 1,
            title: 'High-Yield Cardiology Active Recall Drills',
            lectures: [
              {
                id: 'lec-6-1',
                lectureNumber: 1,
                title: '150 High-Yield Cardiology Diagnostic Pearls & Triads',
                duration: '60 mins',
                difficulty: 'Active Recall',
                topics: [
                  'Comprehensive auscultatory dynamic maneuvers quick-reference drill',
                  'ECG localized infarct lead localization (LAD, RCA, LCx branches)',
                  'Drug-induced cardiovascular emergencies and reversal agents',
                  'Cardiomyopathy differentiation: Dilated vs Hypertrophic vs Restrictive'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Revision Booklet (35 Pages)' },
                  { type: 'flashcards', label: '150 Spaced Repetition Cards' },
                  { type: 'images', label: '4 High-Yield Summary Cheat Sheets' },
                  { type: 'live', label: 'Faculty Rapid-Fire Quiz Session' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 7,
        title: 'Subject Grand Test #01: Full Cardiology CBT',
        duration: '1.5 hours',
        summaryPills: ['50 Clinical Vignettes', 'Timed Exam UI', 'National Benchmarking', 'Detailed Explanations'],
        hasLive: false,
        hasTest: true,
        modules: [
          {
            id: 'mod-7-1',
            moduleNumber: 1,
            title: 'Examination Simulation & Benchmark',
            lectures: [
              {
                id: 'lec-7-1',
                lectureNumber: 1,
                title: 'Cardiology 50-Vignette CBT Mock Examination',
                duration: '60 mins',
                difficulty: 'Exam Simulation',
                topics: [
                  '50 Single-Best-Answer and Multi-Step Clinical Vignettes',
                  'Timed interface mimicking the exact NExT / NEET PG CBT software',
                  'AI-driven weak area analysis, percentile rank, and peer comparison',
                  'Comprehensive explanation breakdown with faculty commentary'
                ],
                resources: [
                  { type: 'test', label: '50-Question Timed CBT Engine' },
                  { type: 'pdf', label: 'Complete Answer Key & Rationales PDF' },
                  { type: 'images', label: 'Percentile & Subject Analytics Dashboard' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ===========================================================================
  // WEEK 2: RESPIRATORY MEDICINE & PULMONARY PATHOLOGY
  // ===========================================================================
  {
    weekNumber: 2,
    title: 'Respiratory Medicine & Pulmonary Pathology',
    description: 'Obstructive vs restrictive pulmonary function tests, ARDS management, and thoracic radiology.',
    badge: '19 Qs in Exam',
    subjectId: 'sub-neet-pulmo',
    subjectName: 'Respiratory Medicine & Pulmonology',
    days: [
      {
        dayNumber: 8,
        title: 'Pulmonary Function Tests & Flow-Volume Loops',
        duration: '1.5 hours',
        summaryPills: ['Spirometry Curves', 'FEV1/FVC Ratio', 'DLCO Interpretation', 'Lung Volumes'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-8-1',
            moduleNumber: 1,
            title: 'Pulmonary Function Testing & Flow-Volume Loops',
            lectures: [
              {
                id: 'lec-8-1',
                lectureNumber: 1,
                title: 'Obstructive vs Restrictive Flow-Volume Loops',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'FEV1/FVC < 0.70 definition of airflow limitation and scooping of expiratory limb',
                  'Restrictive pattern: Preserved/increased FEV1/FVC ratio with reduced TLC',
                  'Extrathoracic vs Intrathoracic variable obstruction flow patterns',
                  'Fixed upper airway obstruction (tracheal stenosis) plateau appearance'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '3 Classic Flow-Volume Loop Overlays' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-8-2',
                lectureNumber: 2,
                title: 'Diffusing Capacity (DLCO) & Static Lung Volumes',
                duration: '40 mins',
                difficulty: 'Core Clinical',
                topics: [
                  'Single-breath carbon monoxide technique (DLCO) principles and corrections',
                  'Causes of reduced DLCO with normal spirometry: Pulmonary hypertension, early ILD',
                  'Causes of elevated DLCO: Alveolar hemorrhage (Goodpasture), polycythemia, asthma',
                  'Plethysmography vs Helium dilution in measuring Residual Volume (RV) in severe emphysema'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (20 Pages)' },
                  { type: 'video', label: 'Video Masterclass (32 mins)' },
                  { type: 'images', label: '2 Diagnostic Interpretation Charts' },
                  { type: 'flashcards', label: '3 Spaced Repetition Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 9,
        title: 'COPD, Asthma & Bronchiectasis',
        duration: '2.0 hours',
        summaryPills: ['GINA 2026 Asthma Steps', 'GOLD 2026 ABE Groups', 'Biologics', 'Bronchiectasis HRCT'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-9-1',
            moduleNumber: 1,
            title: 'Chronic Obstructive & Reactive Airway Pathologies',
            lectures: [
              {
                id: 'lec-9-1',
                lectureNumber: 1,
                title: 'Bronchial Asthma: GINA Guidelines & Stepwise Management',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'GINA Track 1 preference: Formoterol + Low-dose ICS as reliever and controller (SMART)',
                  'Bronchodilator reversibility testing criteria (> 12% and > 200 mL increase in FEV1)',
                  'Severe eosinophilic asthma biologics: Anti-IgE (Omalizumab), Anti-IL5 (Mepolizumab)',
                  'Aspirin-Exacerbated Respiratory Disease (AERD / Samter Triad) and leukotriene antagonists'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '2 GINA Management Step Grids' },
                  { type: 'flashcards', label: '3 Active Recall Cards' },
                  { type: 'live', label: 'Live Clinical Case Presentation' }
                ]
              },
              {
                id: 'lec-9-2',
                lectureNumber: 2,
                title: 'COPD: GOLD Guidelines & Exacerbation Care',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'GOLD Group A, B, E reclassification and blood eosinophil threshold (> 300 cells/µL for ICS)',
                  'Long-Term Oxygen Therapy (LTOT) indications (PaO2 ≤ 55 mmHg or SaO2 ≤ 88%)',
                  'Acute hypercapnic respiratory failure: Non-invasive ventilation (BiPAP) vs intubation',
                  'Alpha-1 antitrypsin deficiency: Panacinar emphysema at lung bases in young non-smokers'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 Arterial Blood Gas Nomograms' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-9-3',
                lectureNumber: 3,
                title: 'Bronchiectasis & Cystic Fibrosis Management',
                duration: '35 mins',
                difficulty: 'Clinical Core',
                topics: [
                  'High-resolution CT signs: Signet-ring sign (broncho-arterial ratio > 1) and tram-tracks',
                  'Allergic Bronchopulmonary Aspergillosis (ABPA): Central bronchiectasis and elevated IgE',
                  'CFTR modulators: Elexacaftor/Tezacaftor/Ivacaftor mechanism in Delta F508 mutations',
                  'Chronic Pseudomonas aeruginosa infection eradication protocols'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (30 mins)' },
                  { type: 'images', label: '2 HRCT Thorax Slices' },
                  { type: 'flashcards', label: '2 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 10,
        title: 'Interstitial Lung Diseases & Pneumoconioses',
        duration: '1.5 hours',
        summaryPills: ['UIP / IPF Pattern', 'Silicosis & Asbestosis', 'Sarcoidosis Stages', 'Antifibrotics'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-10-1',
            moduleNumber: 1,
            title: 'Diffuse Parenchymal Lung Diseases',
            lectures: [
              {
                id: 'lec-10-1',
                lectureNumber: 1,
                title: 'Idiopathic Pulmonary Fibrosis: UIP Pattern & Antifibrotics',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Usual Interstitial Pneumonia (UIP) HRCT hallmarks: Subpleural basilar honeycombing',
                  'Distinction between UIP and Non-Specific Interstitial Pneumonia (NSIP with subpleural sparing)',
                  'Antifibrotic pharmacotherapy: Pirfenidone and Nintedanib mechanisms and slowing FVC decline',
                  'Hypersensitivity pneumonitis: Centrilobular ground-glass nodules and three-density sign'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '3 HRCT Diagnostic Patterns' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-10-2',
                lectureNumber: 2,
                title: 'Occupational Pneumoconioses & Sarcoidosis',
                duration: '40 mins',
                difficulty: 'Occupational Med',
                topics: [
                  'Silicosis: Upper-lobe nodular opacities, eggshell calcification of hilar lymph nodes, TB risk',
                  'Asbestosis: Lower lobe fibrosis, pleural plaques, ferruginous bodies, and mesothelioma latency',
                  'Sarcoidosis Scadding stages 0 to IV: Non-caseating granulomas, elevated ACE and 1,25-(OH)2D',
                  'Löfgren syndrome classic benign triad: Erythema nodosum, bilateral hilar lymphadenopathy, arthritis'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (25 Pages)' },
                  { type: 'video', label: 'Video Masterclass (34 mins)' },
                  { type: 'images', label: '2 Histopathology & Radiography Slides' },
                  { type: 'flashcards', label: '3 High-Yield Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 11,
        title: 'Pulmonary Embolism & Deep Vein Thrombosis',
        duration: '1.5 hours',
        summaryPills: ['Wells Score', 'CTPA & McConnell Sign', 'Submassive vs Massive PE', 'Catheter Thrombolysis'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-11-1',
            moduleNumber: 1,
            title: 'Venous Thromboembolism & Vascular Emergencies',
            lectures: [
              {
                id: 'lec-11-1',
                lectureNumber: 1,
                title: 'Acute Pulmonary Embolism: Wells Score & Diagnostics',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Two-tier Wells score and YEARS algorithm for CT Pulmonary Angiography triage',
                  'Age-adjusted D-dimer formula (Age x 10 µg/L in patients over 50 years)',
                  'Echocardiography pearls: McConnell sign (apical sparing of RV) and 60/60 sign',
                  'ECG changes: S1Q3T3 pattern, right bundle branch block, and T-wave inversions in V1-V4'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 CTPA Saddle Embolus & Echo Clips' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-11-2',
                lectureNumber: 2,
                title: 'Risk Stratification & Revascularization Strategies',
                duration: '40 mins',
                difficulty: 'Critical Care',
                topics: [
                  'ESC classification: High (Massive), Intermediate-High, Intermediate-Low, Low risk',
                  'Hemodynamic instability criteria defining massive PE requiring systemic thrombolysis',
                  'Catheter-directed ultrasound-assisted thrombolysis and mechanical thrombectomy',
                  'DOAC selection (Apixaban, Rivaroxaban) and IVC filter strict indications'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (32 mins)' },
                  { type: 'images', label: '1 Treatment Algorithm Diagram' },
                  { type: 'flashcards', label: '3 Clinical Decision Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 12,
        title: 'Pneumonia & Mycobacterial Infections (TB)',
        duration: '1.5 hours',
        summaryPills: ['CURB-65 Score', 'GeneXpert MTB/RIF', 'DOTS Regimens', 'MDR-TB BPaLM'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-12-1',
            moduleNumber: 1,
            title: 'Infectious Pulmonary Diseases',
            lectures: [
              {
                id: 'lec-12-1',
                lectureNumber: 1,
                title: 'Community-Acquired Pneumonia: Stratification & Antimicrobials',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'CURB-65 criteria (Confusion, Urea > 7, RR ≥ 30, BP < 90/60, Age ≥ 65) triage',
                  'Atypical pneumonia culprits: Legionella (hyponatremia, diarrhea), Mycoplasma (cold agglutinins)',
                  'Hospital-Acquired and Ventilator-Associated Pneumonia (MRSA & Pseudomonas coverage)',
                  'Procalcitonin kinetics in de-escalating antibacterial therapy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (25 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '2 CXR Lobar vs Interstitial Slices' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-12-2',
                lectureNumber: 2,
                title: 'Tuberculosis: Rapid Diagnostics & Drug Regimens',
                duration: '45 mins',
                difficulty: 'National Health',
                topics: [
                  'GeneXpert (CBNAAT) MTB/RIF assay and line-probe assays for first/second line resistance',
                  'NTEP 2026 Daily FDC regimen (2EHRZ / 4EHR) and drug-induced hepatotoxicity protocols',
                  'MDR-TB short oral regimen: BPaLM (Bedaquiline, Pretomanid, Linezolid, Moxifloxacin)',
                  'Latent TB infection screening (IGRA vs Tuberculin Skin Test) and preventive therapy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (30 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '2 Sputum Microscopy & CT Cavitation Slides' },
                  { type: 'flashcards', label: '4 High-Yield TB Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 13,
        title: 'Thoracic Oncology: Small vs Non-Small Cell Lung Carcinoma',
        duration: '1.5 hours',
        summaryPills: ['NSCLC vs SCLC', 'EGFR/ALK Targeted Therapy', 'Paraneoplastic Syndromes', 'Staging TNM'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-13-1',
            moduleNumber: 1,
            title: 'Thoracic Oncology & Targeted Therapeutics',
            lectures: [
              {
                id: 'lec-13-1',
                lectureNumber: 1,
                title: 'NSCLC vs SCLC: Pathology, Genetics & Targeted Therapies',
                duration: '50 mins',
                difficulty: 'Oncology',
                topics: [
                  'Adenocarcinoma (TTF-1, Napsin A positive, peripheral) vs Squamous cell (p40 positive, central, cavitation)',
                  'Actionable oncogenic drivers: EGFR mutations (Osimertinib), ALK re-arrangements (Alectinib), ROS1, KRAS G12C',
                  'Small Cell Lung Cancer neuroendocrine markers (Synaptophysin, Chromogranin) and platinum-etoposide chemotherapy',
                  'Paraneoplastic syndromes: SIADH, Lambert-Eaton myasthenic syndrome, Cushing syndrome, Hypercalcemia (PTHrP)'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (30 Pages)' },
                  { type: 'video', label: 'Video Masterclass (42 mins)' },
                  { type: 'images', label: '3 Histology Stains & PET-CT Staging Slides' },
                  { type: 'flashcards', label: '4 Active Recall Cards' },
                  { type: 'live', label: 'Live Oncology Case Discussion' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 14,
        title: 'Subject Grand Test #02: Pulmonology CBT',
        duration: '1.5 hours',
        summaryPills: ['50 Clinical Vignettes', 'PFT & ABG Questions', 'National Percentile', 'Detailed Solutions'],
        hasLive: false,
        hasTest: true,
        modules: [
          {
            id: 'mod-14-1',
            moduleNumber: 1,
            title: 'Pulmonology Computer-Based Examination',
            lectures: [
              {
                id: 'lec-14-1',
                lectureNumber: 1,
                title: 'Pulmonology 50-Vignette CBT Mock Simulation',
                duration: '60 mins',
                difficulty: 'Exam Simulation',
                topics: [
                  '50 Timed clinical vignettes covering PFT analysis, Thoracic radiology, and ICU ventilation',
                  'Complex mixed acid-base ABG interpretation and mechanical ventilator wave loops',
                  'Percentile benchmarking against national candidate pool',
                  'Video solution explanations by MD Pulmonology faculty'
                ],
                resources: [
                  { type: 'test', label: '50-Question Timed CBT Engine' },
                  { type: 'pdf', label: 'Detailed Explanation & Key PDF' },
                  { type: 'images', label: 'Candidate Performance Analytics Report' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ===========================================================================
  // WEEK 3: RENAL & ACID-BASE CLINICAL PHYSIOLOGY
  // ===========================================================================
  {
    weekNumber: 3,
    title: 'Renal & Acid-Base Clinical Physiology',
    description: 'Glomerulonephritis histology, Acute Kidney Injury (KDIGO criteria), and Davenport acid-base diagrams.',
    badge: '18 Qs in Exam',
    subjectId: 'sub-neet-nephro',
    subjectName: 'Renal & Acid-Base Physiology',
    days: [
      {
        dayNumber: 15,
        title: 'Nephritic vs Nephrotic Syndromes (Biopsy Pearls)',
        duration: '1.5 hours',
        summaryPills: ['Minimal Change & FSGS', 'Membranous PLA2R', 'IgA Nephropathy', 'Crescentic RPGN'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-15-1',
            moduleNumber: 1,
            title: 'Glomerular Pathology & Biopsy Staining',
            lectures: [
              {
                id: 'lec-15-1',
                lectureNumber: 1,
                title: 'Nephrotic Spectrum: Electron Microscopy & Histology Pearls',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Minimal Change Disease: Selective proteinuria, normal light microscopy, podocyte foot process effacement',
                  'Focal Segmental Glomerulosclerosis (FSGS): Apical vs perihilar variants, APOL1 risk alleles',
                  'Membranous Nephropathy: Phospholipase A2 receptor (PLA2R) autoantibodies, subepithelial spikes on silver stain',
                  'Diabetic Nephropathy: Kimmelstiel-Wilson nodular glomerulosclerosis and hyperfiltration phase'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '3 Electron Microscopy & Silver Stains' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-15-2',
                lectureNumber: 2,
                title: 'Nephritic Spectrum: Rapidly Progressive & Immune Complex GN',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Post-Streptococcal Glomerulonephritis: Subepithelial "lumpy-bumpy" humps on EM, low C3',
                  'IgA Nephropathy (Berger Disease): Mesangial IgA deposits presenting within 1-2 days of upper respiratory infection',
                  'RPGN crescent formation: Fibrin and parietal cell proliferation compressing glomerular tuft',
                  'Pauci-immune crescentic GN (ANCA-associated vasculitis) vs Anti-GBM (Goodpasture linear IgG staining)'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '3 Immunofluorescence Slide Overlays' },
                  { type: 'flashcards', label: '4 High-Yield Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 16,
        title: 'Acute Kidney Injury & Renal Replacement Criteria',
        duration: '1.5 hours',
        summaryPills: ['KDIGO Staging', 'FeNa vs FeUrea', 'ATN vs AIN', 'Emergent AEIOU Dialysis'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-16-1',
            moduleNumber: 1,
            title: 'Acute Kidney Injury & Dialysis Protocols',
            lectures: [
              {
                id: 'lec-16-1',
                lectureNumber: 1,
                title: 'AKI Etiologies: Prerenal, Intrinsic ATN vs AIN, and Postrenal',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'KDIGO classification staging criteria based on serum creatinine rise and urine output',
                  'Fractional excretion of sodium (FeNa < 1% prerenal vs > 2% ATN) and utility of FeUrea with diuretics',
                  'Urinary microscopy pearls: Muddy brown granular casts (ATN) vs WBC casts/eosinophils (AIN)',
                  'Contrast-induced nephropathy risk factors, hydration protocols, and postrenal hydronephrosis on ultrasound'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '2 Urinary Sediment Light Microscopy Slides' },
                  { type: 'flashcards', label: '3 Active Recall Cards' },
                  { type: 'live', label: 'Live Nephrology Rounds' }
                ]
              },
              {
                id: 'lec-16-2',
                lectureNumber: 2,
                title: 'Emergent Dialysis Indications (AEIOU) & Modalities',
                duration: '35 mins',
                difficulty: 'Intensive Care',
                topics: [
                  'The AEIOU mnemonic: Acidosis (pH < 7.15), Electrolytes (K > 6.5 with ECG changes), Ingestions, Overload, Uremia',
                  'Uremic pericarditis (rub, avoidance of heparin during dialysis) vs Uremic encephalopathy',
                  'Continuous Renal Replacement Therapy (CRRT / CVVHDF) in hemodynamically unstable septic shock'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (20 Pages)' },
                  { type: 'video', label: 'Video Masterclass (30 mins)' },
                  { type: 'images', label: '1 Emergency Dialysis Decision Algorithm' },
                  { type: 'flashcards', label: '2 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 17,
        title: 'Acid-Base Disorders: Anion Gap & Winter\'s Formula',
        duration: '2.0 hours',
        summaryPills: ['High Anion Gap Acidosis', 'GOLDMARK Mnemonic', 'Winter\'s Formula', 'Delta-Delta Ratio'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-17-1',
            moduleNumber: 1,
            title: 'Clinical Acid-Base Diagnostics & Calculations',
            lectures: [
              {
                id: 'lec-17-1',
                lectureNumber: 1,
                title: 'High Anion Gap vs Normal Anion Gap Metabolic Acidosis',
                duration: '50 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Serum anion gap calculation (Na - [Cl + HCO3]) with albumin correction (+2.5 per 1 g/dL albumin drop below 4)',
                  'High anion gap causes: GOLDMARK (Glycols, Oxoproline, L-lactate, D-lactate, Methanol, Aspirin, Renal failure, Ketoacidosis)',
                  'Winter\'s formula for expected respiratory compensation: PaCO2 = (1.5 x [HCO3]) + 8 ± 2',
                  'Delta-Delta ratio (Delta AG / Delta HCO3): Identifying hidden metabolic alkalosis or non-gap acidosis'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (30 Pages)' },
                  { type: 'video', label: 'Video Masterclass (44 mins)' },
                  { type: 'images', label: '3 ABG Calculation Worksheets' },
                  { type: 'flashcards', label: '4 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-17-2',
                lectureNumber: 2,
                title: 'Metabolic Alkalosis & Complex Respiratory Disorders',
                duration: '40 mins',
                difficulty: 'Physiology',
                topics: [
                  'Urine chloride assessment: Saline-responsive (< 20 mEq/L, vomiting) vs Saline-resistant (> 20 mEq/L, Conn syndrome)',
                  'Acute vs chronic respiratory acidosis and alkalosis renal compensation rules (1:10 vs 3.5:10 rules)',
                  'Triple acid-base disorder vignette analysis in ICU patients'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (34 mins)' },
                  { type: 'images', label: '2 Acid-Base Davenport Nomograms' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 18,
        title: 'Renal Tubular Acidosis (Types 1, 2, 4)',
        duration: '1.5 hours',
        summaryPills: ['Type 1 Distal RTA', 'Type 2 Proximal RTA', 'Type 4 Hyperkalemic', 'Urine Anion Gap'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-18-1',
            moduleNumber: 1,
            title: 'Tubular Transport & Electrolyte Syndromes',
            lectures: [
              {
                id: 'lec-18-1',
                lectureNumber: 1,
                title: 'Renal Tubular Acidosis: Mechanisms & Clinical Differential',
                duration: '45 mins',
                difficulty: 'Core Clinical',
                topics: [
                  'Type 1 (Distal) RTA: Impaired alpha-intercalated H+ secretion, urine pH > 5.5, nephrocalcinosis, Sjögren association',
                  'Type 2 (Proximal) RTA: Impaired HCO3 reabsorption, Fanconi syndrome (glucosuria, phosphaturia, aminoaciduria)',
                  'Type 4 (Hyperkalemic) RTA: Hypoaldosteronism or aldosterone resistance, diabetic nephropathy, hyperkalemia with urine pH < 5.5',
                  'Urine Anion Gap (Na + K - Cl): Negative in diarrhea (intact NH4+ excretion) vs positive in distal RTA'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '2 Renal Tubular Transporter Overlays' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 19,
        title: 'Diuretics & Electrolyte Derangements',
        duration: '1.5 hours',
        summaryPills: ['Hyponatremia & ODS', 'Hyperkalemia ECG Signs', 'Loop vs Thiazide', 'Calcium & Phosphate'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-19-1',
            moduleNumber: 1,
            title: 'Renal Pharmacology & Severe Electrolyte Derangements',
            lectures: [
              {
                id: 'lec-19-1',
                lectureNumber: 1,
                title: 'Hyponatremia: Diagnostic Algorithms & Safe Correction',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Hypotonic hyponatremia volume status: Hypovolemic vs Euvolemic (SIADH) vs Hypervolemic (Cirrhosis, CHF)',
                  'Correction speed limit: Maximum 8 mEq/L in 24 hours to prevent Osmotic Demyelination Syndrome (Central Pontine Myelinolysis)',
                  'Hypertonic 3% saline bolus (100 mL over 10 mins) indications in severe symptomatic seizures/coma',
                  'SIADH criteria: Inappropriate urine osmolality > 100 mOsm/kg and urine Na > 40 with normal thyroid/adrenal'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 Sodium Correction Flowcharts' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-19-2',
                lectureNumber: 2,
                title: 'Potassium & Diuretic Pharmacology',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Hyperkalemia sequential ECG progression: Peaked T waves -> PR prolongation -> QRS widening -> Sine wave -> VFib',
                  'Emergency hyperkalemia cocktail: IV Calcium Gluconate (membrane stabilization), Regular Insulin + Dextrose, Albuterol',
                  'Loop diuretics (NKCC2 inhibition) vs Thiazides (NCCT inhibition in DCT) electrolyte effects (Hypokalemia, Alkalosis)',
                  'Potassium-sparing diuretics: ENaC blockers (Amiloride, Triamterene) vs Aldosterone antagonists'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (35 mins)' },
                  { type: 'images', label: '2 Emergency ECG & Pharmacology Charts' },
                  { type: 'flashcards', label: '3 High-Yield Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 20,
        title: 'Renal Pathology Recall Marathon',
        duration: '1.0 hour',
        summaryPills: ['150 Flashcards', 'Biopsy Immunofluorescence', 'Casts & Staining', 'Transplant Rejection'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-20-1',
            moduleNumber: 1,
            title: 'High-Yield Renal Pathology Active Recall',
            lectures: [
              {
                id: 'lec-20-1',
                lectureNumber: 1,
                title: '150 Renal Pathology & Biopsy Pearls Flashcard Sprint',
                duration: '60 mins',
                difficulty: 'Active Recall',
                topics: [
                  'Rapid immunofluorescence differentiation: Linear (Goodpasture) vs Granular (SLE, PSGN) vs Pauci-immune (Wegener)',
                  'Renal transplant rejection: Hyperacute (preformed antibodies), Acute cellular (endothelialitis), Chronic (interstitial fibrosis)',
                  'Polycystic Kidney Disease (ADPKD PKD1/PKD2 genes, Berry aneurysms, hepatic cysts) management with Tolvaptan',
                  'Renal cell carcinoma histology (Clear cell VHL gene 3p deletion) and paraneoplastic erythrocytosis'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF High-Yield Summary (30 Pages)' },
                  { type: 'flashcards', label: '150 Spaced Repetition Flashcards' },
                  { type: 'images', label: '4 Histopathology Stains' },
                  { type: 'live', label: 'Live Pathology Review Session' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 21,
        title: 'Subject Grand Test #03: Nephrology CBT',
        duration: '1.5 hours',
        summaryPills: ['50 Clinical Vignettes', 'Acid-Base ABG Cases', 'Percentile Benchmark', 'Video Solutions'],
        hasLive: false,
        hasTest: true,
        modules: [
          {
            id: 'mod-21-1',
            moduleNumber: 1,
            title: 'Nephrology & Acid-Base Examination Simulation',
            lectures: [
              {
                id: 'lec-21-1',
                lectureNumber: 1,
                title: 'Nephrology 50-Vignette CBT Mock Simulation',
                duration: '60 mins',
                difficulty: 'Exam Simulation',
                topics: [
                  '50 Timed clinical vignettes covering Glomerulonephritis, Electrolyte emergencies, and Dialysis',
                  'Interactive multi-step Davenport diagram and acid-base problem-solving items',
                  'National percentile benchmarking and predictive subject score',
                  'Full question-by-question rationales with faculty audio commentary'
                ],
                resources: [
                  { type: 'test', label: '50-Question Timed CBT Engine' },
                  { type: 'pdf', label: 'Detailed Solution Manual PDF' },
                  { type: 'images', label: 'Diagnostic Performance Matrix' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ===========================================================================
  // WEEK 4: GASTROENTEROLOGY & CLINICAL HEPATOLOGY
  // ===========================================================================
  {
    weekNumber: 4,
    title: 'Gastroenterology & Clinical Hepatology',
    description: 'Cirrhosis portal hypertension, inflammatory bowel diseases, and GI endoscopy vignettes.',
    badge: '22 Qs in Exam',
    subjectId: 'sub-neet-gastro',
    subjectName: 'Gastroenterology & Hepatology',
    days: [
      {
        dayNumber: 22,
        title: 'Esophageal Motility & Gastric Ulcer Disease',
        duration: '1.5 hours',
        summaryPills: ['Achalasia Manometry', 'GERD & Barrett Esophagus', 'H. pylori Quadruple Therapy', 'Forrest Classification'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-22-1',
            moduleNumber: 1,
            title: 'Upper Gastrointestinal Pathologies & Motility',
            lectures: [
              {
                id: 'lec-22-1',
                lectureNumber: 1,
                title: 'Achalasia, Diffuse Spasm & GERD / Barrett Esophagus',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Achalasia: High-resolution manometry Chicago classification (integrated relaxation pressure > 15 mmHg), bird\'s beak on barium',
                  'Diffuse Esophageal Spasm (corkscrew esophagus) vs Jackhammer esophagus hypercontractile disorder',
                  'Barrett esophagus: Intestinal metaplasia with goblet cells (CDX2 positive) and adenocarcinoma progression risks',
                  'Endoscopic mucosal resection and radiofrequency ablation guidelines in dysplasia'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 Barium Swallow & Manometry Tracings' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-22-2',
                lectureNumber: 2,
                title: 'Peptic Ulcer Disease & Helicobacter pylori Regimens',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'H. pylori diagnostics: Urea breath test, stool antigen, and biopsy urease sensitivity vs PPI washout period',
                  'First-line Bismuth quadruple therapy (PPI + Bismuth + Metronidazole + Tetracycline for 14 days)',
                  'Zollinger-Ellison syndrome (Gastrinoma triangle) diagnostic workup (Fasting serum gastrin > 1000 pg/mL, secretin stimulation test)',
                  'Forrest endoscopic classification of bleeding ulcers (Ia to III) and endoscopic dual hemostasis'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (32 mins)' },
                  { type: 'images', label: '2 Endoscopy Forrest Classification Slides' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 23,
        title: 'Crohn\'s Disease vs Ulcerative Colitis Differentiation',
        duration: '1.5 hours',
        summaryPills: ['Skip Lesions vs Continuous', 'Granulomas vs Crypt Abscesses', 'Biologics', 'Extraintestinal Signs'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-23-1',
            moduleNumber: 1,
            title: 'Inflammatory Bowel Diseases & Immunotherapy',
            lectures: [
              {
                id: 'lec-23-1',
                lectureNumber: 1,
                title: 'Crohn\'s vs Ulcerative Colitis: Pathology & Diagnostics',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Crohn\'s disease: Transmural inflammation, skip lesions, cobblestoning, non-caseating granulomas, creeping fat, fistulae',
                  'Ulcerative colitis: Mucosal & submucosal continuous inflammation starting from rectum, pseudopolyps, crypt abscesses, lead pipe colon',
                  'Serological markers: ASCA (Anti-Saccharomyces cerevisiae) positive in Crohn\'s vs p-ANCA positive in UC',
                  'Extraintestinal manifestations: Primary Sclerosing Cholangitis (strongly associated with UC), Pyoderma gangrenosum, uveitis'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '3 Colonoscopy & Biopsy Comparative Slides' },
                  { type: 'flashcards', label: '4 Active Recall Cards' },
                  { type: 'live', label: 'Live IBD Case Rounds' }
                ]
              },
              {
                id: 'lec-23-2',
                lectureNumber: 2,
                title: 'IBD Medical Therapeutics & Emergency Surgery',
                duration: '40 mins',
                difficulty: 'Therapeutics',
                topics: [
                  '5-ASA agents (Mesalamine) role in induction and maintenance of remission in mild-to-moderate UC',
                  'Anti-TNF agents (Infliximab, Adalimumab) and anti-integrin (Vedolizumab gut-selective alpha-4-beta-7)',
                  'Anti-IL-12/23 (Ustekinumab) and JAK inhibitors (Tofacitinib, Upadacitinib) indications',
                  'Toxic megacolon emergency diagnosis (colonic diameter > 6 cm with toxicity) and urgent subtotal colectomy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (34 mins)' },
                  { type: 'images', label: '1 Biologic Treatment Algorithm' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 24,
        title: 'Cirrhosis, Portal HTN & Ascites Management',
        duration: '1.5 hours',
        summaryPills: ['SAAG > 1.1 g/dL', 'Variceal Banding EVL', 'SBP Neutrophil Count', 'Hepatorenal Syndrome'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-24-1',
            moduleNumber: 1,
            title: 'Chronic Liver Disease & Portal Hypertension',
            lectures: [
              {
                id: 'lec-24-1',
                lectureNumber: 1,
                title: 'Portal Hypertension & Acute Variceal Bleeding Protocols',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Serum-Ascites Albumin Gradient (SAAG): ≥ 1.1 g/dL (Portal hypertension: Cirrhosis, Budd-Chiari, CHF) vs < 1.1 g/dL (Peritoneal carcinomatosis, TB, Nephrotic)',
                  'Acute variceal hemorrhage protocol: Restrictive transfusion (target Hb 7-8 g/dL), IV Octreotide/Terlipressin, Ceftriaxone prophylaxis',
                  'Endoscopic Variceal Ligation (EVL) within 12 hours and balloon tamponade (Blakemore tube) as bridge to TIPS',
                  'Non-selective beta-blockers (Propranolol, Carvedilol) for primary and secondary prophylaxis'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 Endoscopy Banding & SAAG Flowcharts' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              },
              {
                id: 'lec-24-2',
                lectureNumber: 2,
                title: 'Ascites, Spontaneous Bacterial Peritonitis (SBP) & Hepatorenal Syndrome',
                duration: '45 mins',
                difficulty: 'Critical Care',
                topics: [
                  'Ascites diuretic regimen: Spironolactone + Furosemide (100 mg : 40 mg ratio maintaining normokalemia)',
                  'Diagnostic paracentesis in all hospital admissions: SBP diagnosed by ascitic fluid absolute PMN count ≥ 250 cells/mm³',
                  'SBP empiric treatment: IV Cefotaxime/Ceftriaxone + IV Albumin infusion (1.5 g/kg day 1, 1 g/kg day 3) to prevent HRS',
                  'Hepatorenal Syndrome (HRS-AKI): Diagnostic criteria, Albumin + Terlipressin medical therapy, liver transplantation candidacy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (25 Pages)' },
                  { type: 'video', label: 'Video Masterclass (36 mins)' },
                  { type: 'images', label: '2 Paracentesis Analysis & Algorithm Slides' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 25,
        title: 'Viral Hepatitis Serology & Acute Liver Failure',
        duration: '1.5 hours',
        summaryPills: ['Hepatitis B Serology Windows', 'Direct-Acting Antivirals HCV', 'King\'s College Criteria', 'Hepatic Encephalopathy'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-25-1',
            moduleNumber: 1,
            title: 'Viral Hepatitis & Acute Hepatic Decompensation',
            lectures: [
              {
                id: 'lec-25-1',
                lectureNumber: 1,
                title: 'Hepatitis B & C Serological Profiling & Antivirals',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'HBV serological markers: HBsAg, Anti-HBs, Anti-HBc IgM vs IgG, HBeAg, Anti-HBe and window period (only Anti-HBc IgM positive)',
                  'Chronic Hepatitis B treatment indications: Tenofovir or Entecavir first-line oral nucleoside analogues',
                  'Hepatitis D coinfection vs superinfection (high risk of fulminant hepatic necrosis)',
                  'Hepatitis C pan-genotypic Direct-Acting Antiviral (DAA) regimens (Sofosbuvir/Velpatasvir) achieving > 95% SVR'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (28 Pages)' },
                  { type: 'video', label: 'Video Masterclass (40 mins)' },
                  { type: 'images', label: '3 Hepatitis Serology Grid Diagrams' },
                  { type: 'flashcards', label: '4 High-Yield Serology Cards' }
                ]
              },
              {
                id: 'lec-25-2',
                lectureNumber: 2,
                title: 'Acute Liver Failure & Hepatic Encephalopathy Staging',
                duration: '40 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Acute Liver Failure definition: Encephalopathy + Coagulopathy (INR ≥ 1.5) without pre-existing cirrhosis',
                  'King\'s College Criteria for emergency liver transplantation in Acetaminophen vs Non-Acetaminophen etiologies',
                  'N-Acetylcysteine (NAC) Rumack-Matthew nomogram protocol for acetaminophen toxicity',
                  'Hepatic encephalopathy West Haven grades 1 to 4: Lactulose titration and Rifaximin dual therapy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (22 Pages)' },
                  { type: 'video', label: 'Video Masterclass (34 mins)' },
                  { type: 'images', label: '1 King\'s College Decision Tree' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 26,
        title: 'Pancreatitis & Biliary Tree Pathologies',
        duration: '1.5 hours',
        summaryPills: ['Atlanta Pancreatitis Classification', 'Balthazar CT Index', 'Charcot Triad Cholangitis', 'Tokyo Guidelines'],
        hasLive: true,
        hasTest: false,
        modules: [
          {
            id: 'mod-26-1',
            moduleNumber: 1,
            title: 'Pancreatobiliary Pathology & Interventions',
            lectures: [
              {
                id: 'lec-26-1',
                lectureNumber: 1,
                title: 'Acute Pancreatitis: Severity Scoring & Fluid Resuscitation',
                duration: '45 mins',
                difficulty: 'High-Yield',
                topics: [
                  'Revised Atlanta classification: Mild vs Moderately severe (transient organ failure < 48h) vs Severe (persistent failure > 48h)',
                  'Diagnostic triad (requires 2 of 3): Epigastric pain radiating to back, Lipase/Amylase > 3x ULN, characteristic CT/MRI findings',
                  'Fluid resuscitation: Goal-directed Ringer\'s Lactate infusion and avoidance of routine prophylactic antibiotics',
                  'Necrotizing pancreatitis management: Step-up approach (Conservative -> Percutaneous drainage -> Video-assisted retroperitoneal debridement)'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (26 Pages)' },
                  { type: 'video', label: 'Video Masterclass (38 mins)' },
                  { type: 'images', label: '2 Contrast CT Pancreatitis Slices' },
                  { type: 'flashcards', label: '3 Active Recall Cards' },
                  { type: 'live', label: 'Live Surgical Case Review' }
                ]
              },
              {
                id: 'lec-26-2',
                lectureNumber: 2,
                title: 'Biliary Tract Emergencies: Cholecystitis & Ascending Cholangitis',
                duration: '40 mins',
                difficulty: 'Emergency Med',
                topics: [
                  'Acute Cholecystitis Tokyo guidelines: Murphy sign, ultrasound gallbladder wall thickening > 4 mm, pericholecystic fluid',
                  'Acute Cholangitis Charcot triad (Fever, RUQ pain, Jaundice) and Reynolds pentad (+ Hypotension, Confusion)',
                  'Emergency biliary decompression with urgent ERCP and sphincterotomy',
                  'Primary Sclerosing Cholangitis ("beads on a string" MRCP) vs Primary Biliary Cholangitis (Anti-Mitochondrial Antibodies AMA)'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Guide (24 Pages)' },
                  { type: 'video', label: 'Video Masterclass (35 mins)' },
                  { type: 'images', label: '2 MRCP & Ultrasound Biliary Slides' },
                  { type: 'flashcards', label: '3 Active Recall Cards' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 27,
        title: 'GI Histology & Biopsy Rapid Review',
        duration: '1.0 hour',
        summaryPills: ['150 Flashcards', 'Celiac Marsh Stages', 'Whipple & Wilson Disease', 'Hemochromatosis Pearls'],
        hasLive: false,
        hasTest: false,
        modules: [
          {
            id: 'mod-27-1',
            moduleNumber: 1,
            title: 'High-Yield Gastrointestinal Pathology Active Recall',
            lectures: [
              {
                id: 'lec-27-1',
                lectureNumber: 1,
                title: '150 Gastrointestinal & Liver Biopsy Flashcard Marathon',
                duration: '60 mins',
                difficulty: 'Active Recall',
                topics: [
                  'Celiac disease: Anti-tTG IgA, anti-endomysial antibodies, duodenal biopsy Marsh stages (intraepithelial lymphocytosis, villous atrophy)',
                  'Whipple disease: Tropheryma whipplei, PAS-positive foamy macrophages in lamina propria, cardiac/neurological manifestations',
                  'Wilson disease: ATP7B mutation on chromosome 13, low ceruloplasmin, Kayser-Fleischer rings, Penicillamine/Trientine chelation',
                  'Hereditary Hemochromatosis: HFE gene (C282Y mutation), bronze diabetes, Prussian blue iron staining, therapeutic phlebotomy'
                ],
                resources: [
                  { type: 'pdf', label: '1 PDF Revision Booklet (32 Pages)' },
                  { type: 'flashcards', label: '150 Spaced Repetition Cards' },
                  { type: 'images', label: '4 Histopathology Staining Pearls' }
                ]
              }
            ]
          }
        ]
      },

      {
        dayNumber: 28,
        title: 'Subject Grand Test #04: Gastroenterology CBT',
        duration: '1.5 hours',
        summaryPills: ['50 Clinical Vignettes', 'Endoscopy Video Items', 'National Rank', 'Comprehensive Rationales'],
        hasLive: false,
        hasTest: true,
        modules: [
          {
            id: 'mod-28-1',
            moduleNumber: 1,
            title: 'Gastroenterology Computer-Based Examination',
            lectures: [
              {
                id: 'lec-28-1',
                lectureNumber: 1,
                title: 'Gastroenterology 50-Vignette CBT Mock Simulation',
                duration: '60 mins',
                difficulty: 'Exam Simulation',
                topics: [
                  '50 Timed clinical vignettes covering endoscopy clips, histology images, and hepatology management',
                  'Interactive simulated software recreating official NEET PG / NExT CBT examination environment',
                  'National percentile benchmarking and predictive subject score',
                  'Full question-by-question rationales with video analysis from MD specialist faculty'
                ],
                resources: [
                  { type: 'test', label: '50-Question Timed CBT Engine' },
                  { type: 'pdf', label: 'Detailed Solution Manual & Answer Key' },
                  { type: 'images', label: 'Comprehensive Performance Report' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper to retrieve day data by day number
export function getStudyPlanDay(dayNumber) {
  const num = Number(dayNumber);
  for (const week of studyPlan28DaysCurriculum) {
    const found = week.days.find(d => d.dayNumber === num);
    if (found) {
      return {
        ...found,
        weekNumber: week.weekNumber,
        weekTitle: week.title,
        subjectId: week.subjectId,
        subjectName: week.subjectName
      };
    }
  }
  return null;
}
