export const examCategories = [
  {
    id: 'neet-pg',
    name: 'NEET PG & NExT',
    country: 'India',
    flag: '🇮🇳',
    regionCode: 'IN',
    tag: 'National Board of Examinations',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    accentColor: 'from-orange-500 to-amber-500',
    description: 'Targeted clinical revision and grand test series structured for Indian postgraduate residency.',
    highlights: [
      'Week-wise structured 19-subject clinical plan',
      'Live faculty grand rounds & daily doubt clearance',
      '15,000+ Next-pattern practice clinical vignettes'
    ],
    startingPrice: '₹14,999',
    originalPrice: '₹24,999',
    discount: '40% OFF',
    studentsEnrolled: '4,800+',
    rating: '4.9',
    popular: true,
  },
  {
    id: 'usmle',
    name: 'USMLE Step 1 & Step 2 CK',
    country: 'United States',
    flag: '🇺🇸',
    regionCode: 'US',
    tag: 'ECFMG / FSMB Aligned',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: 'from-blue-600 to-indigo-600',
    description: 'Organ-system integrated modules and clinical reasoning aligned with USMLE exam standards.',
    highlights: [
      'Organ system integrated concept modules',
      'High-yield Step 1 & Step 2 CK clinical QBank',
      'US residency match mentorship & ERAS guidance'
    ],
    startingPrice: '₹24,999',
    usdPrice: '$299',
    originalPrice: '₹34,999',
    discount: '30% OFF',
    studentsEnrolled: '3,200+',
    rating: '4.95',
    popular: false,
  },
  {
    id: 'plab',
    name: 'PLAB 1 & 2 / UKMLA',
    country: 'United Kingdom',
    flag: '🇬🇧',
    regionCode: 'UK',
    tag: 'General Medical Council (GMC)',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    accentColor: 'from-rose-600 to-red-600',
    description: 'Targeted NHS clinical guidelines, communication skills, and high-yield OSCE station drills.',
    highlights: [
      'NHS-aligned clinical decision-making scenarios',
      'Weekly live PLAB 1 mock exams with deep analytics',
      'PLAB 2 OSCE blueprints & patient communication'
    ],
    startingPrice: '₹19,999',
    gbpPrice: '£189',
    originalPrice: '₹28,999',
    discount: '31% OFF',
    studentsEnrolled: '2,650+',
    rating: '4.88',
    popular: false,
  },
  {
    id: 'europe',
    name: 'Europe Medical Licensing',
    country: 'Europe',
    flag: '🇪🇺',
    regionCode: 'EU',
    tag: 'Germany (FSP/KP), Italy & EU',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: 'from-emerald-600 to-teal-600',
    description: 'Navigate language medical terminology, Approbation exam prep, and clinical hospital pathways.',
    highlights: [
      'Fachsprachprüfung (FSP) medical German terminology',
      'Kenntnisprüfung (KP) clinical case simulations',
      'EU hospital residency application & licensing guide'
    ],
    startingPrice: '₹22,499',
    eurPrice: '€249',
    originalPrice: '₹31,999',
    discount: '30% OFF',
    studentsEnrolled: '1,950+',
    rating: '4.91',
    popular: false,
  }
];

export const howItWorksSteps = [
  {
    step: '01',
    title: 'Choose Your Exam',
    shortTitle: 'Select Exam',
    description: 'Select from NEET PG, USMLE, PLAB/UKMLA, or European medical licensing programs customized to your target destination.',
    icon: 'Stethoscope',
    actionText: 'Browse 4 Categories',
    bulletPoints: ['India, US, UK, & EU pathways', 'Personalized syllabus mapping', 'Free diagnostic baseline test']
  },
  {
    step: '02',
    title: 'Pick a Package',
    shortTitle: 'Pick Plan',
    description: 'Choose between Basic QBank, Pro Structured Course, or 1-on-1 Elite Clinical Mentorship according to your prep timeline.',
    icon: 'PackageCheck',
    actionText: 'Compare 3 Tier Plans',
    bulletPoints: ['Transparent pricing', 'Flexible 6/12/24 mo. validity', 'Scholarship discounts available']
  },
  {
    step: '03',
    title: 'Access Your Dashboard',
    shortTitle: 'Instant Access',
    description: 'Instant student dashboard setup with your week-wise calendar, weak-area analytics, and downloadable study packets.',
    icon: 'LayoutDashboard',
    actionText: 'Instant Activation',
    bulletPoints: ['Automated study scheduler', 'Personalized milestone tracker', '24/7 faculty doubt forum']
  },
  {
    step: '04',
    title: 'Learn Daily',
    shortTitle: 'Learn Daily',
    description: 'Receive bite-sized daily modules: concise PDF notes, crisp video concepts, Anki flashcard decks, and live evening clinics.',
    icon: 'Sparkles',
    actionText: 'Daily Study Routine',
    bulletPoints: ['High-yield 45-min daily units', 'Active recall flashcard reviews', 'Live case grand rounds']
  }
];

export const whatYouGetFacilities = [
  {
    id: 'pdf-notes',
    title: 'PDF Notes',
    subtitle: 'High-Yield & Visual',
    icon: 'FileText',
    badge: 'Downloadable & Printable',
    color: 'blue',
    description: 'Clinically annotated, color-coded concise summaries with anatomical diagrams, flowcharts, histology slides, and drug tables.',
    metrics: '2,500+ Illustrated Pages',
    features: ['Organized by high-yield clinical systems', 'Mnemonics & rapid revision summary tables', 'Searchable & device-friendly format']
  },
  {
    id: 'video-lectures',
    title: 'Video Lectures',
    subtitle: 'Conceptual Mastery',
    icon: 'Video',
    badge: '4K Ultra-Clear',
    color: 'indigo',
    description: 'Crisp, high-yield lectures by renowned specialist MD faculty breaking down complex physiological mechanisms and clinical vignettes.',
    metrics: '600+ Hours of Clinical Content',
    features: ['1.5x & 2x playback speed with chapters', 'Clinical vignette walk-throughs', 'Timestamped doubt bookmarks']
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    subtitle: 'Spaced Repetition',
    icon: 'Brain',
    badge: 'Anki-Compatible Decks',
    color: 'emerald',
    description: 'Active recall spaced-repetition digital flashcards to rapidly cement pharmacokinetics, disease triads, and diagnostic criteria.',
    metrics: '8,000+ Pre-Made Smart Cards',
    features: ['Spaced-repetition algorithm integration', 'Bite-sized microlearning for mobile on the go', 'High-yield image occlusion cards']
  },
  {
    id: 'live-sessions',
    title: 'Live Sessions',
    subtitle: 'Interactive Faculty',
    icon: 'Radio',
    badge: 'Weekly Grand Rounds',
    color: 'amber',
    description: 'Weekly interactive live case presentations, differential diagnosis clinical drills, and direct two-way faculty doubt clearance.',
    metrics: '4 Live Sessions / Week',
    features: ['Direct voice & chat Q&A with specialist MDs', 'Real patient case discussion series', 'Full session recordings available in 2 hrs']
  },
  {
    id: 'test-series',
    title: 'Test Series',
    subtitle: 'Exam-Simulated CBT',
    icon: 'CheckCircle2',
    badge: 'National Benchmarking',
    color: 'rose',
    description: 'Full-length CBT mock exams mimicking exact test UI/time limits, coupled with percentile ranking, accuracy metrics, and time-per-question analytics.',
    metrics: '50+ Full Grand Tests',
    features: ['Exact CBT interface replicate', 'AI-powered weak-subject diagnosis', 'In-depth rationales for every option']
  }
];

export const testimonials = [
  {
    id: 1,
    name: 'Dr. Ananya Sharma',
    role: 'AIR 142 — NEET PG 2025',
    college: 'AIIMS New Delhi Residency',
    avatar: 'https://images.unsplash.com/photo-1594824813689-13e64883395b?w=150&auto=format&fit=crop&q=80',
    exam: 'NEET PG (India)',
    rating: 5,
    quote: 'The week-wise 19-subject structure took all the anxiety out of the prep. The high-yield PDF summaries and live faculty case discussions helped me jump from 68th to 99.8th percentile on my first attempt!'
  },
  {
    id: 2,
    name: 'Dr. Marcus Vance',
    role: 'Step 1 Pass • Step 2 CK 264',
    college: 'Johns Hopkins Internal Medicine Resident',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    exam: 'USMLE (United States)',
    rating: 5,
    quote: 'The organ system integration was pure perfection. The clinical vignette QBank explained not just why an answer was right, but precisely why the clinical distractors were wrong. Invaluable for Step 2 CK.'
  },
  {
    id: 3,
    name: 'Dr. Sarah Jenkins',
    role: 'PLAB 1: 159/180 • PLAB 2 Cleared',
    college: 'NHS Foundation Trust, London',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    exam: 'PLAB / UKMLA (United Kingdom)',
    rating: 5,
    quote: 'Relocating to practice in the UK was overwhelming until I found MedPrep. The NHS guideline modules and OSCE simulation blueprints gave me the exact bedside communication skills examiners looked for.'
  }
];

export const mockPackagesByExam = {
  'neet-pg': {
    examName: 'NEET PG & NExT 2026',
    flag: '🇮🇳',
    subtitle: 'Comprehensive 19-Subject Clinical Mastery for Indian Residency',
    packages: [
      {
        id: 'starter',
        name: 'Rapid QBank & Notes',
        price: '₹14,999',
        originalPrice: '₹24,999',
        validity: '6 Months Validity',
        description: 'Ideal for interns and repeaters focusing on active recall and rapid clinical practice.',
        popular: false,
        features: [
          '15,000+ NExT Pattern Clinical Vignette QBank',
          'Downloadable High-Yield PDF Notes (19 Subjects)',
          '15 Grand Mock Tests with National Percentile',
          'Standard Community Forum Doubt Support'
        ]
      },
      {
        id: 'pro',
        name: 'Comprehensive Clinical Pro',
        price: '₹22,999',
        originalPrice: '₹34,999',
        validity: '12 Months Validity',
        description: 'Our flagship complete system: complete video library, flashcards, and live doubt clinics.',
        popular: true,
        badge: 'Recommended by Top 100 Rankers',
        features: [
          'Everything in Rapid QBank plan',
          '600+ Hours Full Clinical Video Lectures (2x playback)',
          '8,000+ Pre-made Smart Anki Flashcards',
          'Weekly Live Faculty Grand Rounds & Cases',
          '35 Full CBT Grand Tests + Subject-wise Tests',
          'AI Weakness Tracker & Revision Scheduler'
        ]
      },
      {
        id: 'elite',
        name: '1-on-1 Residency Elite',
        price: '₹34,999',
        originalPrice: '₹49,999',
        validity: '24 Months Validity',
        description: 'Dedicated faculty mentorship, personal study schedule, and guaranteed doubt resolution.',
        popular: false,
        features: [
          'Everything in Comprehensive Clinical Pro',
          'Dedicated Faculty Mentor (AIR Top 50 Alumnus)',
          'Bi-weekly 1-on-1 Strategy & Mentorship Calls',
          'Priority 1-Hour WhatsApp Doubt Resolution',
          'Printed Color Spiral Notes Shipped to Doorstep'
        ]
      }
    ]
  },
  'usmle': {
    examName: 'USMLE Step 1 & Step 2 CK',
    flag: '🇺🇸',
    subtitle: 'Integrated Organ Systems & US Clinical Match Mentorship',
    packages: [
      {
        id: 'starter',
        name: 'Step 1 QBank & Decks',
        price: '₹24,999',
        usd: '$299',
        validity: '6 Months Validity',
        description: 'Focused test preparation for conquering the Step 1 Pass/Fail benchmark.',
        popular: false,
        features: [
          '3,800+ High-Yield Step 1 Clinical Vignettes',
          'First Aid Aligned Visual Organ-System Notes',
          'Pre-made Anki Active Recall Decks',
          '6 Full-Length Simulated NBME-style Forms'
        ]
      },
      {
        id: 'pro',
        name: 'Dual Step 1 & Step 2 CK Master',
        price: '₹39,999',
        usd: '$479',
        validity: '18 Months Validity',
        description: 'Complete integrated continuum to pass Step 1 and achieve 250+ on Step 2 CK.',
        popular: true,
        badge: 'Most Popular for IMGs',
        features: [
          'Complete Step 1 & Step 2 CK Video & QBank Bundle',
          '7,500+ Board-style Clinical Decision Cases',
          'Bi-weekly Live US Clinical Faculty Grand Rounds',
          'ERAS Residency Match & CV Strategy Session',
          '12 Full Simulated Practice Examinations'
        ]
      },
      {
        id: 'elite',
        name: 'US Clinical Match Mentorship',
        price: '₹59,999',
        usd: '$719',
        validity: '24 Months Validity',
        description: 'End-to-end guidance including US clinical electives advice, LoR review, and residency mock interviews.',
        popular: false,
        features: [
          'Everything in Dual Master Plan',
          '1-on-1 Mentorship from Match 2025 US Residents',
          'Personal Statement & ERAS Application Polishing',
          '3 Live Mock Residency Match Interviews with Feedback'
        ]
      }
    ]
  },
  'plab': {
    examName: 'PLAB 1 & 2 / UKMLA Pathway',
    flag: '🇬🇧',
    subtitle: 'NHS Guidelines Mastery & PLAB 2 OSCE Clinical Stations',
    packages: [
      {
        id: 'starter',
        name: 'PLAB 1 High-Yield Sprint',
        price: '₹19,999',
        gbp: '£189',
        validity: '6 Months Validity',
        description: 'Pass PLAB 1 on your first try with NHS guideline-tailored clinical questions.',
        popular: false,
        features: [
          '4,500+ GMC / NICE Guidelines Aligned Questions',
          'High-Yield British National Formulary (BNF) Notes',
          '10 Full-Length Timed PLAB 1 CBT Simulations',
          'Weekly Live Doubt Solving Webinars'
        ]
      },
      {
        id: 'pro',
        name: 'PLAB 1 + PLAB 2 OSCE Complete',
        price: '₹32,999',
        gbp: '£310',
        validity: '12 Months Validity',
        description: 'End-to-end preparation including hands-on live online OSCE patient simulations.',
        popular: true,
        badge: 'Top Rated for UK Relocation',
        features: [
          'Everything in PLAB 1 Sprint',
          '50+ Interactive PLAB 2 OSCE Station Video Breakdowns',
          'NHS Communication Skills & Ethical Scenarios',
          '4 Live 1-on-1 Mock OSCE Station Drills with NHS Doctors',
          'NHS CV & Foundation Programme / Trust Grade Job Guide'
        ]
      },
      {
        id: 'elite',
        name: 'NHS Doctor FastTrack Elite',
        price: '₹47,999',
        gbp: '£450',
        validity: '18 Months Validity',
        description: 'Comprehensive mentorship from exam day until your first NHS hospital placement.',
        popular: false,
        features: [
          'Everything in PLAB 1 + 2 Complete Plan',
          'Unlimited Mock OSCE Practice with Senior NHS Faculty',
          'Dedicated GMC Registration & Visa Guidance Concierge',
          'NHS Job Application & Interview Prep Masterclass'
        ]
      }
    ]
  },
  'europe': {
    examName: 'European Medical Licensing (Germany, Italy & EU)',
    flag: '🇪🇺',
    subtitle: 'FSP Medical Terminology, Kenntnisprüfung (KP) & Approbation',
    packages: [
      {
        id: 'starter',
        name: 'Fachsprachprüfung (FSP) Intensive',
        price: '₹22,499',
        eur: '€249',
        validity: '6 Months Validity',
        description: 'Specialized medical German terminology and doctor-patient dialogue simulations.',
        popular: false,
        features: [
          'Clinical German Vocabulary & Medical Documentation (Arztbrief)',
          'Doctor-Patient Dialogue Simulation Audio & Scripts',
          '15 Live FSP Case Simulation Sessions',
          'Standard Approbation Application Checklist'
        ]
      },
      {
        id: 'pro',
        name: 'Full Approbation (FSP + KP) Master',
        price: '₹36,999',
        eur: '€410',
        validity: '12 Months Validity',
        description: 'Complete German & EU medical licensing bundle: language + clinical knowledge exam.',
        popular: true,
        badge: 'Comprehensive EU Pathway',
        features: [
          'Full FSP Medical Language + KP Clinical Modules',
          'German Clinical Pharmacology & Internal Medicine Focus',
          'Weekly Live Grand Rounds with German Specialist Physicians',
          'Kenntnisprüfung (KP) Case Question Bank (3,000+ Vignettes)',
          'Hospital Hospitation & Assistenzarzt Job Search Blueprint'
        ]
      },
      {
        id: 'elite',
        name: 'European Residency Concierge',
        price: '₹54,999',
        eur: '€610',
        validity: '24 Months Validity',
        description: '1-on-1 mentorship by licensed doctors working in Germany, Italy, and Switzerland.',
        popular: false,
        features: [
          'Everything in Full Approbation Master Plan',
          '1-on-1 German Medical CV & Motivation Letter Review',
          'Hospital Job Interview Simulations in German / English',
          'Direct Assistance with State Medical Chamber (Landesprüfungsamt)'
        ]
      }
    ]
  }
};
