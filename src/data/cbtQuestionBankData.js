// =============================================================================
// CBT QUESTION BANK DATA — HIGH-YIELD CLINICAL VIGNETTES
// 20 realistic medical scenarios with full rationale & option distractors
// =============================================================================

export const sampleCbtQuestionBank = [
  {
    id: 1,
    vignette: 'A 62-year-old woman presents to the emergency department with a 3-hour history of acute palpitations and mild lightheadedness. Blood pressure is 118/74 mmHg, pulse is 132/min and irregularly irregular. Electrocardiogram demonstrates an irregularly irregular rhythm with narrow QRS complexes, absent discernible P waves, and fibrillatory baseline waves.',
    question: 'Which of the following is the most appropriate initial pharmacotherapeutic step for rate control in this hemodynamically stable patient?',
    options: [
      { key: 'A', text: 'Intravenous Metoprolol (Beta-blocker)' },
      { key: 'B', text: 'Immediate Synchronized Electrical Cardioversion' },
      { key: 'C', text: 'Intravenous Adenosine rapid bolus' },
      { key: 'D', text: 'Subcutaneous Enoxaparin monotherapy without rate control' }
    ],
    correct: 'A',
    explanation: 'In hemodynamically stable atrial fibrillation with rapid ventricular response (RVR), beta-blockers (IV Metoprolol or Esmolol) or non-dihydropyridine calcium channel blockers (Diltiazem/Verapamil) are first-line for acute ventricular rate control. Electrical cardioversion is reserved for hemodynamic instability (hypotension, acute pulmonary edema, angina).'
  },
  {
    id: 2,
    vignette: 'A 24-year-old elite collegiate athlete undergoes pre-participation cardiovascular screening. He is completely asymptomatic. Cardiac examination reveals a harsh crescendo-decrescendo systolic ejection murmur at the left lower sternal border. The murmur noticeably increases in intensity during the strain phase of the Valsalva maneuver and upon standing.',
    question: 'Which molecular genetic abnormality is most commonly associated with this patient\'s condition?',
    options: [
      { key: 'A', text: 'Mutation in Beta-myosin heavy chain (MYH7) or Myosin-binding protein C' },
      { key: 'B', text: 'Fibrillin-1 (FBN1) gene mutation on chromosome 15' },
      { key: 'C', text: 'Collagen type III alpha-1 (COL3A1) vascular mutation' },
      { key: 'D', text: 'Dystrophin gene deletion on X-chromosome' }
    ],
    correct: 'A',
    explanation: 'Hypertrophic Cardiomyopathy (HCM) is an autosomal dominant condition characterized by asymmetric septal hypertrophy and systolic anterior motion (SAM) of the mitral valve. Dynamic left ventricular outflow tract (LVOT) obstruction increases with maneuvers that decrease preload (Valsalva strain, standing). Most commonly caused by mutations in sarcomeric genes encoding beta-myosin heavy chain (MYH7) or cardiac myosin-binding protein C (MYBPC3).'
  },
  {
    id: 3,
    vignette: 'A 58-year-old man presents with severe retrosternal crushing chest pain radiating to the jaw. ECG reveals 3-mm ST elevations in leads II, III, and aVF with reciprocal ST depressions in I and aVL. Blood pressure is 88/54 mmHg, heart rate is 54/min, and lung fields are completely clear to auscultation bilaterally. Jugular venous distension is present.',
    question: 'Which of the following represents the most appropriate initial management step for this patient\'s hemodynamic compromise?',
    options: [
      { key: 'A', text: 'Intravenous Normal Saline fluid bolus (500-1000 mL)' },
      { key: 'B', text: 'Sublingual Nitroglycerin spray and IV morphine' },
      { key: 'C', text: 'Intravenous Furosemide diuretic bolus' },
      { key: 'D', text: 'Immediate administration of oral Diltiazem' }
    ],
    correct: 'A',
    explanation: 'Inferior wall myocardial infarction with hypotension, elevated JVP, and clear lung fields indicates Right Ventricular (RV) Infarction (involvement of right coronary artery). The failing RV is extremely preload-dependent. The immediate treatment is aggressive IV isotonic fluid resuscitation to maintain RV filling pressure. Nitrates, diuretics, and beta-blockers reduce preload and are strictly contraindicated as they precipitate catastrophic cardiogenic shock.'
  },
  {
    id: 4,
    vignette: 'A 74-year-old man presents with progressive exertional dyspnea and two episodes of near-syncope while walking up stairs over the past month. Cardiac auscultation reveals a loud, harsh, late-peaking systolic ejection murmur heard best at the right second intercostal space radiating to the carotids, with a diminished and delayed carotid arterial pulse.',
    question: 'Which auscultatory and clinical finding is most expected in severe forms of this valvular disorder?',
    options: [
      { key: 'A', text: 'Pulsus parvus et tardus with single or paradoxically split S2' },
      { key: 'B', text: 'Wide fixed splitting of S2 with mid-systolic pulmonary flow murmur' },
      { key: 'C', text: 'High-pitched blowing diastolic decrescendo murmur at left sternal border' },
      { key: 'D', text: 'Prominent opening snap followed by mid-diastolic low rumble' }
    ],
    correct: 'A',
    explanation: 'The classic presentation reflects severe Calcific Aortic Stenosis (triad: Angina, Syncope, Exertional Dyspnea). Key findings: Pulsus parvus et tardus (weak, delayed carotid upstroke), late-peaking systolic murmur radiating to carotids, and paradoxical (reverse) splitting of S2 due to delayed aortic valve closure (A2 occurs after P2).'
  },
  {
    id: 5,
    vignette: 'A 32-year-old unrestrained driver is brought to the trauma center following a high-speed motor vehicle collision. On arrival, blood pressure is 80/50 mmHg, pulse is 128/min, and respirations are 26/min. Physical examination demonstrates distended neck veins, distant and muffled heart sounds, and clear breath sounds bilaterally. Systolic BP drops by 18 mmHg during inspiration.',
    question: 'Which of the following is the definitive emergent therapeutic procedure for this condition?',
    options: [
      { key: 'A', text: 'Emergent subxiphoid pericardiocentesis or pericardial window' },
      { key: 'B', text: 'Immediate tube thoracostomy at the 5th intercostal space' },
      { key: 'C', text: 'Intravenous Norepinephrine infusion without procedural intervention' },
      { key: 'D', text: 'Emergent bronchoscopy with bronchial wash' }
    ],
    correct: 'A',
    explanation: 'The patient presents with Cardiac Tamponade secondary to traumatic hemopericardium, evidenced by Beck\'s triad (Hypotension, Distended jugular veins, Muffled heart sounds) and Pulsus Paradoxus (>10 mmHg drop in systolic BP during inspiration). Emergent pericardiocentesis (or surgical pericardial window) is life-saving to decompress the pericardial space and restore cardiac output.'
  },
  {
    id: 6,
    vignette: 'A 36-year-old male with a history of intravenous heroin use presents with high-grade fevers, chills, and productive cough with pleuritic chest pain. Chest radiography reveals multiple peripheral cavitary nodular infiltrates. Cardiac auscultation reveals a holosystolic murmur at the left lower sternal border that intensifies with inspiration (Carvallo sign).',
    question: 'Which microorganism and cardiac valve are most commonly implicated in this clinical scenario?',
    options: [
      { key: 'A', text: 'Staphylococcus aureus involving the Tricuspid Valve' },
      { key: 'B', text: 'Streptococcus viridans involving the Mitral Valve' },
      { key: 'C', text: 'Enterococcus faecalis involving the Aortic Valve' },
      { key: 'D', text: 'Pseudomonas aeruginosa involving the Pulmonic Valve' }
    ],
    correct: 'A',
    explanation: 'Right-sided Infective Endocarditis is characteristically observed in IV drug users. Staphylococcus aureus is the most frequent causative organism (>60-70%), primarily seeding the tricuspid valve. Tricuspid regurgitation murmur accentuates during inspiration (Carvallo sign) due to increased right ventricular preload. Septic emboli characteristically seed the pulmonary circulation producing multiple nodular or cavitary infiltrates.'
  },
  {
    id: 7,
    vignette: 'A 68-year-old male with a history of prior anterior wall myocardial infarction presents with sudden-onset palpitations and lightheadedness. Pulse is 170/min, BP is 104/68 mmHg. ECG demonstrates a monomorphic wide-complex tachycardia (QRS duration 170 ms). On closer inspection, occasional sinus P waves are seen marching through the rhythm at a slower rate, and occasional narrow fusion/capture beats are identified.',
    question: 'What is the definitive diagnosis and primary clinical significance of these ECG findings?',
    options: [
      { key: 'A', text: 'Ventricular Tachycardia; AV dissociation confirms ventricular origin' },
      { key: 'B', text: 'Supraventricular Tachycardia with aberrant conduction' },
      { key: 'C', text: 'Atrial Flutter with 2:1 fixed conduction' },
      { key: 'D', text: 'Sinus Tachycardia with pre-existing left bundle branch block' }
    ],
    correct: 'A',
    explanation: 'In wide complex tachycardias (WCT), demonstration of Atrioventricular (AV) Dissociation (independent P waves, fusion beats, capture beats) is diagnostic of Ventricular Tachycardia (VT) over SVT with aberrancy. In patients with structural heart disease or prior MI, >90% of wide-complex tachycardias are VT.'
  },
  {
    id: 8,
    vignette: 'A 19-year-old man experiences paroxysmal palpitations during exertion. Baseline 12-lead ECG between episodes demonstrates a shortened PR interval of 98 ms, a slurred upstroke at the beginning of the QRS complex (delta wave), and widening of the QRS complex to 134 ms.',
    question: 'Which of the following pharmacological agents is strictly CONTRAINDICATED in the acute management of pre-excited atrial fibrillation in this patient?',
    options: [
      { key: 'A', text: 'Intravenous Verapamil, Diltiazem, or Adenosine' },
      { key: 'B', text: 'Intravenous Procainamide' },
      { key: 'C', text: 'Intravenous Ibutilide' },
      { key: 'D', text: 'Direct-current synchronized cardioversion' }
    ],
    correct: 'A',
    explanation: 'The ECG findings confirm Wolff-Parkinson-White (WPW) Syndrome with an accessory pathway (Bundle of Kent). In pre-excited Atrial Fibrillation with WPW, agents that block conduction through the AV node (Adenosine, Beta-blockers, Calcium channel blockers - Verapamil/Diltiazem, Digoxin [ABCD]) can paradoxically accelerate conduction down the accessory pathway, degenerating the rhythm into Ventricular Fibrillation and cardiac arrest. IV Procainamide or synchronized cardioversion is preferred.'
  },
  {
    id: 9,
    vignette: 'An 82-year-old woman with chronic systolic heart failure and atrial fibrillation on Digoxin and Furosemide presents with nausea, vomiting, yellow-green visual halos (xanthopsia), and lethargy. Serum potassium is 3.1 mEq/L. ECG reveals bidirectional ventricular tachycardia.',
    question: 'Which electrolyte abnormality most significantly potentiates Digoxin toxicity, and what is the specific antidote for life-threatening toxicity?',
    options: [
      { key: 'A', text: 'Hypokalemia; Digoxin-specific antibody fragments (DigiFab)' },
      { key: 'B', text: 'Hypercalcemia; Intravenous Calcium gluconate' },
      { key: 'C', text: 'Hyponatremia; 3% Hypertonic saline' },
      { key: 'D', text: 'Hypermagnesemia; Intravenous Insulin and Dextrose' }
    ],
    correct: 'A',
    explanation: 'Digoxin exerts its inotropic effect by competing with K+ for binding to the myocardial Na+/K+-ATPase pump. Hypokalemia allows more digoxin to bind to the pump, drastically potentiating digoxin toxicity even at therapeutic serum levels. Bidirectional VT is virtually pathognomonic for severe digoxin toxicity. Definitive antidote: Digoxin immune Fab (DigiFab).'
  },
  {
    id: 10,
    vignette: 'A 28-year-old man presents for a routine employment physical. Blood pressure in the right upper arm is 168/96 mmHg, while blood pressure in the right lower extremity is 114/72 mmHg. Femoral arterial pulses are delayed and diminished compared to brachial pulses. Chest X-ray reveals notching of the inferior borders of the 3rd to 8th ribs.',
    question: 'Which congenital cardiovascular lesion is responsible for these findings, and what cardiac anomaly is most frequently co-associated?',
    options: [
      { key: 'A', text: 'Coarctation of the Aorta; Bicuspid Aortic Valve' },
      { key: 'B', text: 'Patent Ductus Arteriosus; Tetralogy of Fallot' },
      { key: 'C', text: 'Ventricular Septal Defect; Transposition of Great Arteries' },
      { key: 'D', text: 'Subaortic membrane; Ebstein anomaly' }
    ],
    correct: 'A',
    explanation: 'Coarctation of the Aorta is characterized by narrowing of the aortic lumen, typically distal to the origin of the left subclavian artery. Upper extremity hypertension with lower extremity hypotension and radial-femoral pulse delay is hallmark. Collateral blood flow through dilated, tortuous intercostal arteries erodes the inferior rib borders producing classic "rib notching". Bicuspid aortic valve is co-present in 50-80% of patients.'
  },
  {
    id: 11,
    vignette: 'A 29-year-old man presents with sharp pleuritic chest pain that began yesterday following a mild viral upper respiratory illness. The pain worsens when he lies supine and noticeably improves when he sits upright and leans forward. ECG shows diffuse concavity ST elevations across leads I, II, aVL, and V2-V6 with PR-segment depression.',
    question: 'What is the cornerstone first-line medical therapy for this condition in the absence of contraindications?',
    options: [
      { key: 'A', text: 'High-dose Nonsteroidal Anti-inflammatory Drugs (NSAIDs) plus Colchicine' },
      { key: 'B', text: 'Immediate emergent coronary angiography and primary percutaneous intervention' },
      { key: 'C', text: 'High-dose systemic Corticosteroids monotherapy' },
      { key: 'D', text: 'Anticoagulation with unfractionated heparin infusion' }
    ],
    correct: 'A',
    explanation: 'Acute Pericarditis typically presents with positional/pleuritic chest pain and diffuse concavity ST elevations with PR depression (and PR elevation in lead aVR). First-line therapy is high-dose NSAIDs (e.g. Ibuprofen 600-800 mg TID or Indomethacin) combined with Colchicine (0.5 mg daily to BID for 3 months) to reduce recurrence rates. Systemic steroids are second-line due to increased risk of recurrent pericarditis.'
  },
  {
    id: 12,
    vignette: 'A 38-year-old woman who emigrated from rural South Asia presents with exertional dyspnea, orthopnea, and occasional hemoptysis. Cardiac examination reveals a loud first heart sound (S1), an early diastolic opening snap, and a low-pitched mid-diastolic rumbling murmur heard best at the cardiac apex in the left lateral decubitus position.',
    question: 'The time interval between which two acoustic cardiac events correlates most inversely with the hemodynamic severity of this valvular lesion?',
    options: [
      { key: 'A', text: 'A2 to Opening Snap (A2-OS interval)' },
      { key: 'B', text: 'S1 to Systolic Click interval' },
      { key: 'C', text: 'Q-wave onset to S1 interval' },
      { key: 'D', text: 'P-wave to QRS interval' }
    ],
    correct: 'A',
    explanation: 'The patient has Rheumatic Mitral Stenosis. As left atrial pressure increases due to tighter stenosis, the mitral valve leaflets are forced open earlier in diastole following aortic valve closure. Thus, a shorter A2 to Opening Snap (A2-OS) interval indicates higher left atrial pressure and more severe mitral stenosis.'
  },
  {
    id: 13,
    vignette: 'A 55-year-old woman undergoing adjuvant chemotherapy for breast cancer with Doxorubicin develops progressive fatigue, bilateral pedal edema, and orthopnea. Transthoracic echocardiogram reveals global hypokinesis of the left ventricle with an ejection fraction of 28% and four-chamber cardiac enlargement.',
    question: 'What is the primary cellular mechanism of Doxorubicin-induced cardiotoxicity?',
    options: [
      { key: 'A', text: 'Formation of iron-dependent reactive oxygen species causing lipid peroxidation & myofibrillar loss' },
      { key: 'B', text: 'Inhibition of human epidermal growth factor receptor-2 (HER2/neu) signaling' },
      { key: 'C', text: 'Immune checkpoint-mediated cytotoxic T-cell myocardial lymphocytic infiltration' },
      { key: 'D', text: 'Microvascular coronary vasospasm leading to ischemic micro-infarctions' }
    ],
    correct: 'A',
    explanation: 'Anthracyclines (Doxorubicin, Daunorubicin) cause Type I (dose-dependent, irreversible) cardiotoxicity mediated by iron-dependent free radical generation (reactive oxygen species), causing lipid peroxidation of sarcoplasmic reticulum membranes, DNA topoisomerase II-beta cleavage, and myofibrillar vacuolization.'
  },
  {
    id: 14,
    vignette: 'A 34-year-old man of Southeast Asian descent is evaluated following an episode of unexplained syncope. He has a family history of sudden cardiac death in his uncle at age 38. ECG reveals coved ST-segment elevation ≥2 mm followed by a negative T-wave in leads V1 and V2 (Type 1 pattern).',
    question: 'Which cardiac ion channel gene mutation is most frequently implicated, and what is the definitive therapy for preventing sudden cardiac death?',
    options: [
      { key: 'A', text: 'SCN5A loss-of-function (voltage-gated cardiac sodium channel); Implantable Cardioverter-Defibrillator (ICD)' },
      { key: 'B', text: 'KCNQ1 potassium channel mutation; Oral Propranolol monotherapy' },
      { key: 'C', text: 'RYR2 ryanodine receptor gene mutation; Oral Verapamil' },
      { key: 'D', text: 'CACNA1C calcium channel mutation; Catheter ablation of AV node' }
    ],
    correct: 'A',
    explanation: 'Brugada Syndrome is an inherited channelopathy caused by loss-of-function mutations in SCN5A encoding the alpha-subunit of the cardiac voltage-gated Na+ channel. Type 1 ECG pattern shows "coved" ST elevation ≥2 mm in right precordial leads (V1-V2). In symptomatic patients (syncope or cardiac arrest), the only established therapy proven to prevent sudden cardiac death is an Implantable Cardioverter-Defibrillator (ICD).'
  },
  {
    id: 15,
    vignette: 'A 64-year-old male with ischemic cardiomyopathy (NYHA Class III, Left Ventricular Ejection Fraction 26%) is being optimized on guideline-directed medical therapy (GDMT). He is currently taking Enalapril, Carvedilol, and Furosemide.',
    question: 'According to modern heart failure guidelines, which combination of four drug classes constitutes standard foundational "Quadruple Therapy" for HFrEF?',
    options: [
      { key: 'A', text: 'ARNI (Sacubitril/Valsartan) + Evidence-based Beta-blocker + MRA + SGLT2 inhibitor' },
      { key: 'B', text: 'ACE inhibitor + Digoxin + Loop diuretic + Nitrate' },
      { key: 'C', text: 'Calcium channel blocker + Beta-blocker + Hydralazine + Statin' },
      { key: 'D', text: 'ARB + Thiazide diuretic + Ivabradine + Aspirin' }
    ],
    correct: 'A',
    explanation: 'The 4 pillars of Guideline-Directed Medical Therapy (GDMT) that independently reduce mortality in Heart Failure with Reduced Ejection Fraction (HFrEF) are: 1) ARNI (preferred over ACEi/ARB), 2) Evidence-based Beta-blocker (Bisoprolol, Carvedilol, Metoprolol succinate), 3) Mineralocorticoid Receptor Antagonist (Spironolactone/Eplerenone), and 4) SGLT2 inhibitor (Empagliflozin or Dapagliflozin).'
  },
  {
    id: 16,
    vignette: 'A 61-year-old hypertensive male presents with sudden-onset, excruciating tearing retrosternal chest pain radiating between his shoulder blades. Blood pressure is 184/102 mmHg in the right arm and 138/84 mmHg in the left arm. Transesophageal echocardiography confirms an intimal tear originating in the ascending aorta proximal to the brachiocephalic artery.',
    question: 'What is the Stanford classification of this dissection and the immediate definitive management strategy?',
    options: [
      { key: 'A', text: 'Stanford Type A; Emergent surgical repair with graft replacement' },
      { key: 'B', text: 'Stanford Type B; Medical management with IV labetalol infusion alone' },
      { key: 'C', text: 'Stanford Type A; Percutaneous catheter thrombolysis' },
      { key: 'D', text: 'Stanford Type B; Immediate endovascular stent-grafting' }
    ],
    correct: 'A',
    explanation: 'Aortic Dissection involving any portion of the ascending aorta (proximal to the left subclavian artery) is classified as Stanford Type A (DeBakey I and II). Stanford Type A dissections carry high mortality from rupture into the pericardium (tamponade) or acute severe aortic regurgitation; emergent open surgical repair is required. Dissections confined to the descending aorta are Stanford Type B and typically managed medically (IV beta-blockers).'
  },
  {
    id: 17,
    vignette: 'A 79-year-old woman is brought to the clinic after experiencing three episodes of syncope while standing at church. On examination, pulse is 34/min and regular; blood pressure is 152/62 mmHg. ECG reveals P waves with a constant P-P interval of 75/min and QRS complexes with a constant R-R interval of 34/min, with completely dissociated, unrelated PR intervals.',
    question: 'What is the diagnosis and definitive long-term therapeutic intervention?',
    options: [
      { key: 'A', text: 'Third-degree (Complete) AV Block; Permanent Dual-Chamber Pacemaker implantation' },
      { key: 'B', text: 'Mobitz Type I second-degree AV block; Oral Theophylline' },
      { key: 'C', text: 'Sinus Bradycardia; Discontinuation of calcium supplements' },
      { key: 'D', text: 'Atrial Flutter with 4:1 block; Radiofrequency catheter ablation' }
    ],
    correct: 'A',
    explanation: 'Third-Degree (Complete) AV Block is characterized by complete absence of AV conduction: atria and ventricles beat independently (AV dissociation), where atrial rate exceeds ventricular rate. Symptomatic third-degree heart block carries significant risk of sudden cardiac death and Stokes-Adams syncope attacks; definitive therapy is implantation of a permanent cardiac pacemaker.'
  },
  {
    id: 18,
    vignette: 'A premature infant born at 28 weeks gestation is noted to have a continuous "machine-like" murmur heard loudest in the left infraclavicular region. Pulses are bounding and pulse pressure is wide. Echocardiography confirms persistent patency between the proximal descending aorta and the left pulmonary artery.',
    question: 'Which pharmacological agent is indicated to promote closure of this vascular structure in premature infants?',
    options: [
      { key: 'A', text: 'Indomethacin or Ibuprofen (Prostaglandin synthesis inhibitors)' },
      { key: 'B', text: 'Alprostadil (PGE1 infusion)' },
      { key: 'C', text: 'Dopamine inotropic infusion' },
      { key: 'D', text: 'Dexamethasone systemic therapy' }
    ],
    correct: 'A',
    explanation: 'Patent Ductus Arteriosus (PDA) is maintained open in utero by placental prostaglandins (PGE2) and low fetal oxygen tension. In preterm neonates with symptomatic PDA, closure can be induced pharmacologically using cyclooxygenase (COX) inhibitors such as Indomethacin or IV Ibuprofen, which block prostaglandin synthesis. Conversely, PGE1 (Alprostadil) is used when a duct-dependent congenital heart defect requires keeping the duct open.'
  },
  {
    id: 19,
    vignette: 'A 50-year-old woman with severe vomiting and diarrhea from viral gastroenteritis has generalized muscle weakness and fatigue. Serum potassium is 2.4 mEq/L. Electrocardiography is performed.',
    question: 'Which of the following constellation of ECG findings is most characteristic of severe hypokalemia?',
    options: [
      { key: 'A', text: 'Flattened T waves, ST-segment depression, prominent U waves, and prolonged QT/QU' },
      { key: 'B', text: 'Tall, narrow, peaked "tented" T waves with PR prolongation' },
      { key: 'C', text: 'Shortened QT interval with prominent Osborn J waves' },
      { key: 'D', text: 'Electrical alternans with low QRS voltage across all leads' }
    ],
    correct: 'A',
    explanation: 'ECG features of Hypokalemia include: flattened or inverted T waves, mild ST depression, development of prominent U waves (best seen in precordial leads V2-V4), and apparent prolongation of the QT interval (due to fusion of T wave with U wave, creating a QU interval). In contrast, Hyperkalemia presents with tall, peaked T waves.'
  },
  {
    id: 20,
    vignette: 'A 6-month-old infant is evaluated for failure to thrive and recurrent chest infections. Examination reveals a harsh, loud holosystolic murmur heard best at the left lower sternal border accompanied by a systolic thrill.',
    question: 'Which is the most common congenital cardiac defect in pediatric populations, and what complication occurs if left untreated with chronic large left-to-right shunting?',
    options: [
      { key: 'A', text: 'Ventricular Septal Defect (VSD); Eisenmenger syndrome' },
      { key: 'B', text: 'Atrial Septal Defect (ASD); Pulmonary stenosis' },
      { key: 'C', text: 'Tetralogy of Fallot; Coarctation of aorta' },
      { key: 'D', text: 'Truncus Arteriosus; Left ventricular hypoplasia' }
    ],
    correct: 'A',
    explanation: 'Ventricular Septal Defect (VSD) is the most common congenital heart anomaly (accounting for ~25-30% of all congenital heart lesions). A large untreated VSD produces chronic high-volume left-to-right shunting into the pulmonary circulation, leading to irreversible pulmonary vascular remodeling, pulmonary hypertension, shunt reversal (right-to-left), and cyanosis—a phenomenon known as Eisenmenger Syndrome.'
  }
];
