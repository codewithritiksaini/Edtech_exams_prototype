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

// Phase 2: Exact 3 Tiers (Basic, Standard - Most Popular, Premium) for each exam
export const mockPackagesByExam = {
  'neet-pg': {
    examName: 'NEET PG & NExT',
    flag: '🇮🇳',
    country: 'India',
    subtitle: 'Comprehensive 19-Subject Clinical Mastery for Indian Postgraduate Residency',
    packages: [
      {
        id: 'basic',
        name: 'Basic',
        tierLabel: 'Essential Prep',
        price: '₹14,999',
        originalPrice: '₹22,999',
        discount: '35% OFF',
        duration: '3 Months',
        durationFull: '3 Months Full Access',
        description: 'Ideal for interns and repeaters focusing on active recall and high-yield question solving.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: '19 Subjects High-Yield' },
          { name: 'Video Lectures', included: true, detail: 'Core High-Yield Concepts' },
          { name: 'Flashcards', included: false, detail: 'Not Included' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '15 Full CBT Grand Tests' },
          { name: 'Doubt Support', included: false, detail: 'Community Forum Only' }
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        tierLabel: 'Most Recommended',
        price: '₹22,999',
        originalPrice: '₹34,999',
        discount: '34% OFF',
        duration: '6 Months',
        durationFull: '6 Months Complete Access',
        description: 'Our flagship complete system: full video library, active recall flashcards, and email faculty support.',
        popular: true,
        badge: 'MOST POPULAR',
        features: [
          { name: 'PDF Notes', included: true, detail: '19 Subjects + Annotated Diagrams' },
          { name: 'Video Lectures', included: true, detail: 'Full 600+ Hours Clinical Library' },
          { name: 'Flashcards', included: true, detail: '8,000+ Anki-Style Decks' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '35 Full CBT Grand Tests + Analytics' },
          { name: 'Doubt Support', included: true, detail: 'Email Support (24h response)' }
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        tierLabel: 'Residency Elite',
        price: '₹34,999',
        originalPrice: '₹49,999',
        discount: '30% OFF',
        duration: '12 Months',
        durationFull: '12 Months VIP Access',
        description: 'Maximum clinical immersion with weekly live faculty grand rounds, 1-on-1 mentorship, and priority live chat.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'All Notes + Spiral Hardcopies Shipped' },
          { name: 'Video Lectures', included: true, detail: 'Full HD Library + Masterclasses' },
          { name: 'Flashcards', included: true, detail: 'Unlimited Smart Recall Decks' },
          { name: 'Live Sessions', included: true, detail: 'Weekly Live Grand Rounds with MDs' },
          { name: 'Test Series', included: true, detail: '50+ CBT Tests + 1-on-1 Review' },
          { name: 'Doubt Support', included: true, detail: 'Priority (Live chat & WhatsApp)' }
        ]
      }
    ]
  },
  'usmle': {
    examName: 'USMLE Step 1 & Step 2 CK',
    flag: '🇺🇸',
    country: 'United States',
    subtitle: 'Integrated Organ Systems & US Clinical Match Mentorship',
    packages: [
      {
        id: 'basic',
        name: 'Basic',
        tierLabel: 'Essential QBank',
        price: '₹24,999',
        usdPrice: '$299',
        originalPrice: '₹34,999',
        discount: '28% OFF',
        duration: '3 Months',
        durationFull: '3 Months Full Access',
        description: 'Targeted test preparation for mastering Step 1 Pass/Fail and Step 2 CK question logic.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'Organ System First Aid Summaries' },
          { name: 'Video Lectures', included: true, detail: 'High-Yield Organ Physiology' },
          { name: 'Flashcards', included: false, detail: 'Not Included' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '6 Full-Length NBME-Style Forms' },
          { name: 'Doubt Support', included: false, detail: 'Community Q&A Only' }
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        tierLabel: 'Step Master',
        price: '₹38,999',
        usdPrice: '$469',
        originalPrice: '₹54,999',
        discount: '29% OFF',
        duration: '6 Months',
        durationFull: '6 Months Complete Access',
        description: 'Complete integrated continuum: dual Step 1 & 2 CK question bank, flashcards, and email tutor support.',
        popular: true,
        badge: 'MOST POPULAR',
        features: [
          { name: 'PDF Notes', included: true, detail: 'System Integrated Clinical Guides' },
          { name: 'Video Lectures', included: true, detail: 'Step 1 & 2 Comprehensive Lectures' },
          { name: 'Flashcards', included: true, detail: 'USMLE Anki High-Yield Decks' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '14 Full NBME-Style Practice Exams' },
          { name: 'Doubt Support', included: true, detail: 'Email Support (24h response)' }
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        tierLabel: 'Residency Match VIP',
        price: '₹56,999',
        usdPrice: '$689',
        originalPrice: '₹79,999',
        discount: '28% OFF',
        duration: '12 Months',
        durationFull: '12 Months All-Inclusive',
        description: 'Full clinical prep plus live weekly grand rounds, US residency ERAS mentorship, and priority doctor chat.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'Complete Physical + Digital Binders' },
          { name: 'Video Lectures', included: true, detail: 'Unlimited Clinical Masterclasses' },
          { name: 'Flashcards', included: true, detail: 'Personalized Diagnostic Decks' },
          { name: 'Live Sessions', included: true, detail: 'Weekly Live US Faculty Grand Rounds' },
          { name: 'Test Series', included: true, detail: '20+ Full Simulated Board Exams' },
          { name: 'Doubt Support', included: true, detail: 'Priority (Live chat & WhatsApp)' }
        ]
      }
    ]
  },
  'plab': {
    examName: 'PLAB 1 & 2 / UKMLA',
    flag: '🇬🇧',
    country: 'United Kingdom',
    subtitle: 'NHS Guidelines Mastery & PLAB 2 OSCE Clinical Stations',
    packages: [
      {
        id: 'basic',
        name: 'Basic',
        tierLabel: 'PLAB 1 Sprint',
        price: '₹19,999',
        gbpPrice: '£189',
        originalPrice: '₹28,999',
        discount: '31% OFF',
        duration: '3 Months',
        durationFull: '3 Months Full Access',
        description: 'Pass PLAB 1 on your first try with NHS guideline-tailored clinical vignettes and notes.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'NICE Guidelines & BNF Summaries' },
          { name: 'Video Lectures', included: true, detail: 'PLAB 1 High-Yield Clinical Concepts' },
          { name: 'Flashcards', included: false, detail: 'Not Included' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '8 Full Timed PLAB 1 Mock Exams' },
          { name: 'Doubt Support', included: false, detail: 'Forum Access Only' }
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        tierLabel: 'PLAB 1 + OSCE Pro',
        price: '₹31,999',
        gbpPrice: '£299',
        originalPrice: '₹44,999',
        discount: '29% OFF',
        duration: '6 Months',
        durationFull: '6 Months Complete Access',
        description: 'Complete UK pathway: PLAB 1 mock exams, OSCE communication modules, and active recall flashcards.',
        popular: true,
        badge: 'MOST POPULAR',
        features: [
          { name: 'PDF Notes', included: true, detail: 'Complete NHS Clinical Handbooks' },
          { name: 'Video Lectures', included: true, detail: 'PLAB 1 + 50 OSCE Video Breakdowns' },
          { name: 'Flashcards', included: true, detail: 'BNF Drug & Emergency Recall Decks' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '16 Full Mock Exams with Percentile' },
          { name: 'Doubt Support', included: true, detail: 'Email Support (24h response)' }
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        tierLabel: 'NHS FastTrack Elite',
        price: '₹46,999',
        gbpPrice: '£440',
        originalPrice: '₹64,999',
        discount: '28% OFF',
        duration: '12 Months',
        durationFull: '12 Months All-Inclusive',
        description: 'End-to-end NHS career package: live 1-on-1 OSCE drills with NHS doctors, GMC guidance, and priority chat.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'Printed Spiral Notes Shipped' },
          { name: 'Video Lectures', included: true, detail: 'Full Library + OSCE Simulations' },
          { name: 'Flashcards', included: true, detail: 'Unlimited Clinical Recall Decks' },
          { name: 'Live Sessions', included: true, detail: 'Live 1-on-1 Mock OSCE Practice' },
          { name: 'Test Series', included: true, detail: '25 Full Tests + Personal Review' },
          { name: 'Doubt Support', included: true, detail: 'Priority (Live chat & WhatsApp)' }
        ]
      }
    ]
  },
  'europe': {
    examName: 'Europe Medical Licensing',
    flag: '🇪🇺',
    country: 'Europe',
    subtitle: 'Germany (FSP/KP), Italy (SSM) & European Approbation Pathways',
    packages: [
      {
        id: 'basic',
        name: 'Basic',
        tierLabel: 'FSP Foundation',
        price: '₹22,499',
        eurPrice: '€249',
        originalPrice: '₹31,999',
        discount: '30% OFF',
        duration: '3 Months',
        durationFull: '3 Months Full Access',
        description: 'Specialized clinical terminology, medical documentation (Arztbrief), and foundation tests.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'Medical German/EU Terminology' },
          { name: 'Video Lectures', included: true, detail: 'Doctor-Patient Dialogue Breakdown' },
          { name: 'Flashcards', included: false, detail: 'Not Included' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '10 FSP Case Simulation Exams' },
          { name: 'Doubt Support', included: false, detail: 'Community Forum' }
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        tierLabel: 'FSP + KP Master',
        price: '₹35,999',
        eurPrice: '€399',
        originalPrice: '₹49,999',
        discount: '28% OFF',
        duration: '6 Months',
        durationFull: '6 Months Complete Access',
        description: 'Complete German & European medical licensing: language + clinical knowledge exams with flashcards.',
        popular: true,
        badge: 'MOST POPULAR',
        features: [
          { name: 'PDF Notes', included: true, detail: 'FSP Terminology + KP Clinical Notes' },
          { name: 'Video Lectures', included: true, detail: 'Complete Internal Medicine & Surgery' },
          { name: 'Flashcards', included: true, detail: 'Fachterminologie Anki Decks' },
          { name: 'Live Sessions', included: false, detail: 'Not Included' },
          { name: 'Test Series', included: true, detail: '20 Simulated Knowledge Exams' },
          { name: 'Doubt Support', included: true, detail: 'Email Support (24h response)' }
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        tierLabel: 'Approbation Concierge',
        price: '₹52,999',
        eurPrice: '€589',
        originalPrice: '₹74,999',
        discount: '29% OFF',
        duration: '12 Months',
        durationFull: '12 Months VIP Access',
        description: 'Full licensing prep plus weekly live sessions with German physicians, hospital job guidance, and priority support.',
        popular: false,
        features: [
          { name: 'PDF Notes', included: true, detail: 'Complete Printed Curriculum Shipped' },
          { name: 'Video Lectures', included: true, detail: 'All Language + Clinical Lectures' },
          { name: 'Flashcards', included: true, detail: 'Unlimited Clinical Anki Decks' },
          { name: 'Live Sessions', included: true, detail: 'Weekly Live Grand Rounds with Doctors' },
          { name: 'Test Series', included: true, detail: '30 Full Simulation Exams' },
          { name: 'Doubt Support', included: true, detail: 'Priority (Live chat & WhatsApp)' }
        ]
      }
    ]
  }
};

// Detailed comparison table rows across all 3 tiers
export const detailedComparisonRows = [
  {
    category: 'Core Clinical Content',
    items: [
      { feature: 'PDF Study Notes', basic: '✅ 19 Subjects Summary', standard: '✅ Annotated + Illustrations', premium: '✅ Digital + Hardcopy Shipped' },
      { feature: 'High-Yield Video Lectures', basic: '✅ Core Modules (150 hrs)', standard: '✅ Full Library (600+ hrs)', premium: '✅ Full Library + Masterclasses' },
      { feature: 'Spaced-Repetition Flashcards', basic: '❌ Not Included', standard: '✅ 8,000+ Pre-Made Decks', premium: '✅ Unlimited Smart Decks' },
      { feature: 'Searchable Clinical Transcripts', basic: '✅ Included', standard: '✅ Included', premium: '✅ Included' },
    ]
  },
  {
    category: 'Question Bank & Mock Tests',
    items: [
      { feature: 'Clinical Vignette QBank', basic: '5,000+ Questions', standard: '15,000+ Questions', premium: '20,000+ Questions (All Active)' },
      { feature: 'Full-Length CBT Grand Tests', basic: '15 Full Tests', standard: '35 Full Tests', premium: '50+ Full Tests + AI Diagnostics' },
      { feature: 'National Percentile & Analytics', basic: 'Basic Score Report', standard: 'Detailed Weak-Area Matrix', premium: 'Full AI Competency Breakdown' },
      { feature: 'Option-Wise In-Depth Rationales', basic: '✅ Included', standard: '✅ Included', premium: '✅ Included' },
    ]
  },
  {
    category: 'Live Sessions & Mentorship',
    items: [
      { feature: 'Live Faculty Grand Rounds', basic: '❌ Not Included', standard: '❌ Not Included', premium: '✅ Weekly Live Case Clinics' },
      { feature: 'Faculty Doubt Resolution', basic: '❌ Community Forum Only', standard: '✅ Email Support (24h SLA)', premium: '✅ Priority 1-on-1 Live Chat & WhatsApp' },
      { feature: 'Personal Study Schedule Planner', basic: 'Self-guided', standard: 'Automated Calendar', premium: 'Custom MD Mentor Schedule' },
      { feature: '1-on-1 Residency Counseling', basic: '❌ Not Included', standard: 'Group Webinar Access', premium: '✅ Bi-weekly 1:1 Strategy Calls' },
    ]
  }
];

export const packageFaqs = [
  {
    question: 'Can I upgrade my package later?',
    answer: 'Yes! You can upgrade from Basic to Standard or Premium at any point during your access window. You will only pay the pro-rated price difference between the two plans directly from your student dashboard with zero penalty fees.'
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Absolutely. We offer a 100% unconditional 7-Day Money-Back Guarantee on all packages. If you feel the lectures, high-yield PDF notes, or clinical question banks do not meet your expectations, simply tap "Request Refund" in your dashboard for a full refund.'
  },
  {
    question: 'How long will I have access to the content?',
    answer: 'Access duration depends on your plan: Basic includes 3 months, Standard includes 6 months, and Premium includes 12 months. If your official exam is rescheduled or deferred, we offer a complimentary 60-day pause & extension upon submitting your exam admit card.'
  },
  {
    question: 'Are the questions aligned with the latest 2026 exam pattern?',
    answer: 'Yes! All question vignettes, diagnostic criteria, and guidelines for NEET PG (NExT), USMLE Step 1 & 2 CK, and PLAB / UKMLA are audited monthly by practicing specialist physicians according to the latest 2026 NBE, USMLE, and GMC standards.'
  }
];

// Phase 3: Student Dashboard Mock Data
export const dashboardUserData = {
  name: 'Dr. Ritik Saini',
  email: 'ritik.doctor@example.com',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  enrolledCourse: 'NEET PG & NExT 2026',
  examCategory: 'neet-pg',
  packageTier: 'Standard Package (6 Months)',
  overallProgress: 32,
  daysLeft: 84,
  targetExamDate: 'Nov 29, 2026',
  completedDaysThisWeek: 4,
  totalDaysThisWeek: 7,
  dailyGoalHours: '3.5 hrs/day',
  streakDays: 5,
  qbankAccuracy: '92%'
};

export const studyPlanWeeks = [
  {
    weekNumber: 1,
    title: 'Cardiology & Clinical Hemodynamics',
    status: 'current',
    completionRate: '43%',
    badge: 'High-Yield Clinical System (28 Qs in exam)',
    description: 'Valvular pathologies, heart failure physiology, electrocardiography, and acute coronary syndromes.',
    days: [
      {
        dayNumber: 1,
        title: 'Valvular Heart Diseases & Murmurs',
        status: 'completed',
        score: '94%',
        duration: '45 mins',
        topics: ['Aortic Stenosis Triad', 'Mitral Regurgitation & Prolapse', 'Phonocardiogram Analysis'],
        hasNotes: true,
        hasVideo: true,
        hasFlashcards: true,
        hasQuiz: true
      },
      {
        dayNumber: 2,
        title: 'Congestive Heart Failure & Pharmacotherapy',
        status: 'completed',
        score: '88%',
        duration: '50 mins',
        topics: ['HFrEF vs HFpEF', 'ARNI & SGLT2i Trials', 'Inotropic Mechanisms'],
        hasNotes: true,
        hasVideo: true,
        hasFlashcards: true,
        hasQuiz: true
      },
      {
        dayNumber: 3,
        title: 'Cardiac Arrhythmias & ECG Interpretation',
        status: 'in-progress',
        current: true,
        duration: '55 mins',
        topics: ['Narrow vs Wide Complex Tachycardia', 'AV Blocks Degrees I-III', 'Vaughan-Williams Class I-IV'],
        hasNotes: true,
        hasVideo: true,
        hasFlashcards: true,
        hasQuiz: true
      },
      {
        dayNumber: 4,
        title: 'Acute Coronary Syndromes & Cardiac Biomarkers',
        status: 'locked',
        duration: '50 mins',
        topics: ['STEMI vs NSTEMI Evolution', 'High-Sensitivity Troponin I/T', 'Dual Antiplatelet Therapy (DAPT)'],
        hasNotes: true,
        hasVideo: true,
        hasFlashcards: true,
        hasQuiz: true
      },
      {
        dayNumber: 5,
        title: 'Congenital Heart Defects & Pediatric Shunts',
        status: 'locked',
        duration: '45 mins',
        topics: ['Tetralogy of Fallot (TOF)', 'Coarctation of the Aorta', 'Eisenmenger Syndrome'],
        hasNotes: true,
        hasVideo: true,
        hasFlashcards: true,
        hasQuiz: true
      },
      {
        dayNumber: 6,
        title: 'Cardiology Active Recall & Flashcard Sprint',
        status: 'locked',
        duration: '40 mins',
        topics: ['150 Pharmacology & Pathology Flashcards', 'High-Yield Diagnostic Triads'],
        hasNotes: true,
        hasVideo: false,
        hasFlashcards: true,
        hasQuiz: true
      },
      {
        dayNumber: 7,
        title: 'Subject Grand Test #01: Full Cardiology CBT',
        status: 'locked',
        duration: '60 mins',
        topics: ['50 Clinical Vignettes', 'Timed Examination Simulation with Percentile'],
        hasNotes: false,
        hasVideo: false,
        hasFlashcards: false,
        hasQuiz: true
      }
    ]
  },
  {
    weekNumber: 2,
    title: 'Respiratory Medicine & Pulmonary Pathology',
    status: 'locked',
    completionRate: '0%',
    badge: '19 Qs in Exam',
    description: 'Obstructive vs restrictive pulmonary function tests, ARDS management, and thoracic radiology.',
    days: [
      { dayNumber: 8, title: 'Pulmonary Function Tests & Flow-Volume Loops', status: 'locked', duration: '45 mins' },
      { dayNumber: 9, title: 'COPD, Asthma & Bronchiectasis', status: 'locked', duration: '50 mins' },
      { dayNumber: 10, title: 'Interstitial Lung Diseases & Pneumoconioses', status: 'locked', duration: '45 mins' },
      { dayNumber: 11, title: 'Pulmonary Embolism & Deep Vein Thrombosis', status: 'locked', duration: '45 mins' },
      { dayNumber: 12, title: 'Pneumonia & Mycobacterial Infections (TB)', status: 'locked', duration: '55 mins' },
      { dayNumber: 13, title: 'Thoracic Oncology: Small vs Non-Small Cell Lung Carcinoma', status: 'locked', duration: '40 mins' },
      { dayNumber: 14, title: 'Subject Grand Test #02: Pulmonology CBT', status: 'locked', duration: '60 mins' },
    ]
  },
  {
    weekNumber: 3,
    title: 'Renal & Acid-Base Clinical Physiology',
    status: 'locked',
    completionRate: '0%',
    badge: '18 Qs in Exam',
    description: 'Glomerulonephritis histology, Acute Kidney Injury (KDIGO criteria), and Davenport acid-base diagrams.',
    days: [
      { dayNumber: 15, title: 'Nephritic vs Nephrotic Syndromes (Biopsy Pearls)', status: 'locked', duration: '50 mins' },
      { dayNumber: 16, title: 'Acute Kidney Injury & Renal Replacement Criteria', status: 'locked', duration: '45 mins' },
      { dayNumber: 17, title: 'Acid-Base Disorders: Anion Gap & Winter\'s Formula', status: 'locked', duration: '55 mins' },
      { dayNumber: 18, title: 'Renal Tubular Acidosis (Types 1, 2, 4)', status: 'locked', duration: '40 mins' },
      { dayNumber: 19, title: 'Diuretics & Electrolyte Derangements', status: 'locked', duration: '45 mins' },
      { dayNumber: 20, title: 'Renal Pathology Recall Marathon', status: 'locked', duration: '40 mins' },
      { dayNumber: 21, title: 'Subject Grand Test #03: Nephrology CBT', status: 'locked', duration: '60 mins' },
    ]
  },
  {
    weekNumber: 4,
    title: 'Gastroenterology & Clinical Hepatology',
    status: 'locked',
    completionRate: '0%',
    badge: '22 Qs in Exam',
    description: 'Cirrhosis portal hypertension, inflammatory bowel diseases, and GI endoscopy vignettes.',
    days: [
      { dayNumber: 22, title: 'Esophageal Motility & Gastric Ulcer Disease', status: 'locked', duration: '45 mins' },
      { dayNumber: 23, title: 'Crohn\'s Disease vs Ulcerative Colitis Differentiation', status: 'locked', duration: '50 mins' },
      { dayNumber: 24, title: 'Cirrhosis, Portal HTN & Ascites Management', status: 'locked', duration: '50 mins' },
      { dayNumber: 25, title: 'Viral Hepatitis Serology & Acute Liver Failure', status: 'locked', duration: '45 mins' },
      { dayNumber: 26, title: 'Pancreatitis & Biliary Tree Pathologies', status: 'locked', duration: '45 mins' },
      { dayNumber: 27, title: 'GI Histology & Biopsy Rapid Review', status: 'locked', duration: '40 mins' },
      { dayNumber: 28, title: 'Subject Grand Test #04: Gastroenterology CBT', status: 'locked', duration: '60 mins' },
    ]
  }
];

export const dashboardLiveSessions = [
  {
    id: 'live-1',
    title: 'STEMI & Acute Coronary Syndrome Grand Rounds',
    faculty: 'Dr. Siddharth V. (MD, DM Interventional Cardiology)',
    college: 'AIIMS New Delhi Faculty',
    date: 'Today',
    time: '8:00 PM - 9:15 PM IST',
    status: 'Live Soon',
    badge: 'Tonight',
    zoomReady: true,
    registered: true,
    attendeesCount: 342,
    description: 'Interactive ECG interpretation, primary PCI vs thrombolysis decision-making drills, and student live Q&A.'
  },
  {
    id: 'live-2',
    title: 'ECG Mastery: Distinguishing VT vs SVT with Aberrancy',
    faculty: 'Dr. Ananya Roy (MD General Medicine, DNB)',
    college: 'Safdarjung Hospital Residency Mentor',
    date: 'Tomorrow',
    time: '7:30 PM - 8:45 PM IST',
    status: 'Scheduled',
    badge: 'Tomorrow',
    zoomReady: false,
    registered: false,
    attendeesCount: 285,
    description: 'Brugada criteria, Vereckei algorithm, and pharmacological cardioversion in hemodynamically stable patients.'
  },
  {
    id: 'live-3',
    title: 'Clinical Pharmacology: High-Yield Toxins & Antidotes',
    faculty: 'Dr. Rajiv Mehta (MD, Gold Medalist)',
    college: 'Clinical Faculty Leader',
    date: '15 Sep 2026',
    time: '8:00 PM - 9:30 PM IST',
    status: 'Scheduled',
    badge: 'Next Week',
    zoomReady: false,
    registered: false,
    attendeesCount: 410,
    description: 'High-yield poisonings, organophosphate toxidromes, and essential antidotes commonly tested in NExT/USMLE.'
  }
];

export const dashboardTests = [
  {
    id: 'test-1',
    name: 'National Grand Mock Test #08 (Full CBT)',
    type: 'Full 19-Subject Simulation',
    date: '14 Sep 2026',
    duration: '210 mins',
    questions: 200,
    status: 'Upcoming',
    badge: 'National Rank Benchmark',
    pattern: 'NExT 2026 Aligned'
  },
  {
    id: 'test-2',
    name: 'Cardiology Subject Mini-Mock #02',
    type: 'Subject Targeted Test',
    date: 'Today',
    duration: '45 mins',
    questions: 40,
    status: 'Upcoming',
    badge: 'Active Today',
    pattern: 'Clinical Vignettes'
  },
  {
    id: 'test-3',
    name: 'National Grand Mock Test #07',
    type: 'Full 19-Subject Simulation',
    date: '02 Sep 2026',
    duration: '210 mins',
    questions: 200,
    status: 'Completed',
    score: '684 / 800',
    percentile: '99.2%ile',
    rank: 'AIR 84',
    badge: 'Top 1% Score'
  }
];

// Phase 4: Day Content View Multi-Day Store
export const dayContentStore = {
  '1': {
    dayNumber: 1,
    weekNumber: 1,
    title: 'Valvular Heart Diseases & Heart Murmurs',
    estimatedTime: '1.5 hours',
    activeTabs: ['notes', 'images', 'video', 'flashcards', 'live'],
    pdf: {
      fileName: 'Valvular_Heart_Diseases_Comprehensive_Review.pdf',
      title: 'Valvular Heart Diseases: Pathophysiology & Auscultation Pearls',
      pages: 22,
      size: '4.8 MB',
      updated: 'August 2026',
      author: 'Dr. Rajiv Mehta (MD, DM Cardiology)'
    },
    images: [
      {
        id: 1,
        title: 'Cardiac Cycle & Auscultation Points (Wiggers Diagram)',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
        caption: 'Fig 1: Relationship of ventricular pressure, aortic flow, and cardiac heart sounds (S1, S2, S3, S4).'
      },
      {
        id: 2,
        title: 'Mitral Valve Prolapse Histopathology (Myxomatous Degeneration)',
        url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
        caption: 'Fig 2: Histological stain showing dermatan sulfate accumulation in the spongiosa layer of the mitral leaflet.'
      }
    ],
    video: {
      title: 'Clinical Auscultation & Systolic vs Diastolic Murmurs',
      duration: '32:15',
      instructor: 'Dr. Rajiv Mehta',
      chapters: [
        { time: '00:00', label: 'Anatomy of Heart Valves' },
        { time: '08:12', label: 'Aortic Stenosis vs Sclerosis' },
        { time: '18:40', label: 'Mitral Regurgitation & Austin Flint Murmur' },
        { time: '26:30', label: 'Dynamic Auscultation Maneuvers' }
      ]
    },
    flashcards: [
      { id: 1, question: 'Which physical exam maneuver uniquely INCREASES the intensity of Hypertrophic Cardiomyopathy (HCM) and Mitral Valve Prolapse (MVP) murmurs?', answer: 'Valsalva maneuver (strain phase) and sudden standing from a squatting position (both decrease left ventricular end-diastolic volume).' },
      { id: 2, question: 'What is the classic clinical symptom triad of severe aortic stenosis and what is the associated prognosis?', answer: 'SAD: Syncope (3-yr survival), Angina (5-yr survival), Dyspnea/Heart Failure (2-yr survival without valve replacement).' },
      { id: 3, question: 'What is the Austin Flint murmur and in which valvular disorder is it heard?', answer: 'A low-pitched rumbling mid-to-late diastolic murmur at the cardiac apex caused by the regurgitant jet of severe Aortic Regurgitation impinging on the anterior mitral leaflet.' }
    ],
    live: {
      hasSession: true,
      isScheduled: false,
      recordingAvailable: true,
      title: 'Grand Round Recording: Valvular Surgery Timing & Transcatheter Aortic Valve Implantation (TAVI)',
      faculty: 'Dr. Siddharth V.',
      duration: '58 mins',
      views: '1,420 views'
    }
  },

  '2': {
    dayNumber: 2,
    weekNumber: 1,
    title: 'Congestive Heart Failure & Pharmacotherapy',
    estimatedTime: '2 hours',
    // Demonstration of faculty-controlled assignment: Only 2 tabs active!
    activeTabs: ['notes', 'video'],
    pdf: {
      fileName: 'Heart_Failure_HFrEF_HFpEF_Pharmacology_Guide.pdf',
      title: 'HFrEF vs HFpEF: Guideline-Directed Medical Therapy (GDMT)',
      pages: 26,
      size: '5.2 MB',
      updated: 'July 2026',
      author: 'Dr. Siddharth V.'
    },
    images: [],
    video: {
      title: 'Quadruple Therapy in HFrEF: ARNI, Beta-Blockers, MRA & SGLT2i',
      duration: '44:10',
      instructor: 'Dr. Siddharth V.',
      chapters: [
        { time: '00:00', label: 'Neurohormonal Activation in Heart Failure' },
        { time: '12:00', label: 'DAPA-HF and EMPEROR-Reduced Trial Pearls' },
        { time: '28:15', label: 'Sacubitril/Valsartan Mechanism & Neprilysin Inhibition' }
      ]
    },
    flashcards: [],
    live: {
      hasSession: false,
      message: 'No live session assigned for Day 2. Focus on the core video lesson and GDMT guide.'
    }
  },

  '3': {
    dayNumber: 3,
    weekNumber: 1,
    title: 'Cardiac Arrhythmias & ECG Interpretation',
    estimatedTime: '2 hours',
    // All 5 tabs active with active live session countdown tonight!
    activeTabs: ['notes', 'images', 'video', 'flashcards', 'live'],
    pdf: {
      fileName: 'Clinical_ECG_Mastery_Arrhythmias_and_AV_Blocks.pdf',
      title: 'ECG Mastery: Tachyarrhythmias, Bradycardias & Pre-excitation',
      pages: 30,
      size: '6.4 MB',
      updated: 'September 2026',
      author: 'Dr. Siddharth V. & Dr. Rajiv Mehta'
    },
    images: [
      {
        id: 1,
        title: '12-Lead ECG: Monomorphic Ventricular Tachycardia (VT)',
        url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
        caption: 'Fig 1: Wide complex tachycardia with AV dissociation, extreme QRS axis deviation, and positive concordance in V1-V6.'
      },
      {
        id: 2,
        title: 'ECG: Atrial Fibrillation with Rapid Ventricular Response (RVR)',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
        caption: 'Fig 2: Irregularly irregular R-R intervals with undulating fibrillatory baseline waves and absence of P waves.'
      },
      {
        id: 3,
        title: 'Wolff-Parkinson-White (WPW) Pre-Excitation Pattern',
        url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&auto=format&fit=crop&q=80',
        caption: 'Fig 3: Short PR interval (< 120 ms) with slurred initial upstroke of the QRS complex (Delta wave) and secondary ST-T changes.'
      }
    ],
    video: {
      title: 'Wide Complex Tachycardias: Brugada vs Vereckei Algorithmic Mastery',
      duration: '28:40',
      instructor: 'Dr. Siddharth V. (AIIMS Interventional Cardiologist)',
      chapters: [
        { time: '00:00', label: 'Conduction System Physiology' },
        { time: '06:15', label: 'Differentiating VT from SVT with Aberrancy' },
        { time: '14:30', label: 'Step-by-Step Brugada 4-Step Algorithm' },
        { time: '22:10', label: 'Antiarrhythmic Drug Classification (Vaughan-Williams)' }
      ]
    },
    flashcards: [
      {
        id: 1,
        question: 'What is the definitive ECG hallmark of atrioventricular (AV) dissociation in ventricular tachycardia?',
        answer: 'The presence of independent sinus P waves marching across wide QRS complexes, along with intermittent capture beats (Dressler beats) and fusion beats.'
      },
      {
        id: 2,
        question: 'Which antiarrhythmic drug class prolongs both the action potential duration (APD) and QT interval by selectively blocking outward K+ channels?',
        answer: 'Class III antiarrhythmics (Amiodarone, Sotalol, Dofetilide, Ibutilide).'
      },
      {
        id: 3,
        question: 'What is the characteristic ECG finding and clinical antidote for acute Digoxin toxicity?',
        answer: 'ECG: "Scooped" ST segment depression (Salvador Dali mustache), bidirectional VT, and junctional tachycardia. Antidote: Digoxin-specific Fab fragments (DigiFab).'
      },
      {
        id: 4,
        question: 'Why are AV nodal blocking agents (Verapamil, Diltiazem, Beta-blockers, Adenosine) strictly contraindicated in antidromic WPW pre-excited Atrial Fibrillation?',
        answer: 'Blocking the AV node diverts all electrical impulses exclusively down the accessory pathway (Bundle of Kent) without normal physiological delay, precipitating ventricular fibrillation and cardiac arrest.'
      }
    ],
    live: {
      hasSession: true,
      isScheduled: true,
      recordingAvailable: false,
      title: 'STEMI & Acute Coronary Syndrome Grand Rounds',
      faculty: 'Dr. Siddharth V. (MD, DM)',
      time: 'Tonight @ 8:00 PM - 9:15 PM IST',
      attendeesCount: 342,
      badge: 'Live Tonight'
    }
  },

  '4': {
    dayNumber: 4,
    weekNumber: 1,
    title: 'Acute Coronary Syndromes & Cardiac Biomarkers',
    estimatedTime: '2.5 hours',
    activeTabs: ['notes', 'images', 'video'],
    pdf: {
      fileName: 'ACS_STEMI_NSTEMI_Unstable_Angina_Management.pdf',
      title: 'Acute Coronary Syndromes: TIMI Risk Score & Primary PCI',
      pages: 28,
      size: '5.8 MB',
      updated: 'August 2026',
      author: 'Dr. Siddharth V.'
    },
    images: [
      {
        id: 1,
        title: 'Evolution of STEMI ECG Changes over 24 Hours',
        url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
        caption: 'Fig 1: Hyperacute T waves → ST elevation → Pathological Q waves and T-wave inversion.'
      }
    ],
    video: {
      title: 'Thrombolysis vs Primary PCI in STEMI (Door-to-Balloon < 90 mins)',
      duration: '35:20',
      instructor: 'Dr. Siddharth V.',
      chapters: [
        { time: '00:00', label: 'Pathophysiology of Plaque Rupture' },
        { time: '14:10', label: 'Door-to-Needle vs Door-to-Balloon Time' },
        { time: '26:00', label: 'Post-MI Mechanical Complications (VSR, Papillary Muscle Rupture)' }
      ]
    },
    flashcards: [],
    live: {
      hasSession: false,
      message: 'No live session assigned for Day 4.'
    }
  }
};

// Phase 5: Faculty Portal Mock Data
export const facultyProfileData = {
  name: 'Dr. Siddharth V.',
  degree: 'MD, DM (Interventional Cardiology)',
  institution: 'AIIMS New Delhi Senior Clinical Faculty',
  email: 'dr.siddharth@medpreppro.com',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  specialization: 'Cardiovascular Medicine & Electrocardiography',
  activeModules: ['NEET PG Cardiology', 'USMLE Organ System Cardio']
};

export const facultySummaryMetrics = {
  coursesAssigned: '2 Active Tracks',
  coursesList: ['NEET PG 2026', 'USMLE Step 1 & 2 CK'],
  studentsEnrolled: 1420,
  contentUploadedThisWeek: 14,
  upcomingLiveSessions: 2,
  pendingDoubts: 4,
  averageQBankScore: '74.2%'
};

export const facultyRecentActivity = [
  {
    id: 1,
    action: 'Uploaded High-Yield PDF Notes',
    target: 'Day 3 — Cardiac Arrhythmias & ECG Interpretation',
    course: 'NEET PG & NExT',
    time: '2 hours ago',
    badge: 'Content'
  },
  {
    id: 2,
    action: 'Scheduled Live Case Grand Round',
    target: 'STEMI & Acute Coronary Syndrome Drills (Tonight @ 8:00 PM)',
    course: 'NEET PG & NExT',
    time: '4 hours ago',
    badge: 'Live Session'
  },
  {
    id: 3,
    action: 'Published Subject Test Series',
    target: 'Cardiology Subject Mini-Mock #02 (40 Questions)',
    course: 'NEET PG & NExT',
    time: 'Yesterday',
    badge: 'Test Released'
  },
  {
    id: 4,
    action: 'Added 4 Active Recall Flashcards',
    target: 'Day 1 — Valvular Heart Diseases',
    course: 'NEET PG & NExT',
    time: '2 days ago',
    badge: 'Flashcards'
  }
];

export const facultyStudentDirectory = [
  {
    id: 's-1',
    name: 'Dr. Ritik Saini',
    email: 'ritik.doctor@example.com',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
    course: 'NEET PG & NExT 2026',
    packageTier: 'Standard Package',
    progress: 32,
    qbankAccuracy: '92%',
    lastActive: '10 mins ago',
    status: 'Online'
  },
  {
    id: 's-2',
    name: 'Dr. Ananya Sharma',
    email: 'ananya.s@example.com',
    avatar: 'https://images.unsplash.com/photo-1594824813689-13e64883395b?w=100&auto=format&fit=crop&q=80',
    course: 'NEET PG & NExT 2026',
    packageTier: 'Premium Package',
    progress: 48,
    qbankAccuracy: '96%',
    lastActive: '1 hour ago',
    status: 'Active Today'
  },
  {
    id: 's-3',
    name: 'Dr. Marcus Vance',
    email: 'marcus.v@example.com',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80',
    course: 'USMLE Step 1 & 2 CK',
    packageTier: 'Premium Package',
    progress: 41,
    qbankAccuracy: '94%',
    lastActive: '3 hours ago',
    status: 'Active Today'
  },
  {
    id: 's-4',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
    course: 'PLAB 1 & 2 / UKMLA',
    packageTier: 'Standard Package',
    progress: 28,
    qbankAccuracy: '89%',
    lastActive: 'Yesterday',
    status: 'Offline'
  },
  {
    id: 's-5',
    name: 'Dr. Klaus Becker',
    email: 'klaus.b@example.com',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&auto=format&fit=crop&q=80',
    course: 'Europe Medical Licensing',
    packageTier: 'Basic Package',
    progress: 19,
    qbankAccuracy: '86%',
    lastActive: '2 days ago',
    status: 'Offline'
  }
];

// =============================================================================
// PHASE 6: TEST SCHEDULING & STUDENT CBT TEST ENGINE DATA STORE
// =============================================================================

export const phase6InitialTests = [
  {
    id: 'test-cardio-01',
    name: 'Cardiology Grand Mock Test #01',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Enrolled Students',
    date: 'Today',
    time: '18:00 IST',
    duration: '45 mins',
    durationSeconds: 2700,
    totalMarks: 100,
    questionsCount: 20,
    status: 'Live',
    badge: 'Active Today • Window Live',
    pattern: 'NExT Aligned Clinical Vignettes',
    startsIn: 'Test Window is LIVE',
    instructions: [
      'This examination consists of 20 high-yield clinical vignette multiple choice questions.',
      'Total duration allowed is 45 minutes. A persistent countdown clock is displayed at the top bar.',
      'Marking Scheme: +5 marks for each correct answer; -1 mark negative marking for incorrect responses; 0 for unattempted.',
      'Use the Question Palette on the right to review question status and jump across questions instantaneously.',
      'Color Codes: Green = Answered, Amber = Marked for Review, Slate/Grey = Unanswered, Blue Border = Current Question.',
      'You can alter choices anytime before final submission by clicking a new option or clicking "Clear Response".',
      'The test will automatically finalize and submit when the timer reaches 00:00.'
    ]
  },
  {
    id: 'test-full-08',
    name: 'National Grand Mock Test #08 (Full CBT)',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Standard & Premium Students',
    date: '14 Sep 2026',
    time: '10:00 IST',
    duration: '210 mins',
    durationSeconds: 12600,
    totalMarks: 800,
    questionsCount: 200,
    status: 'Upcoming',
    badge: 'National Rank Benchmark',
    pattern: 'Full 19-Subject Clinical Simulation',
    startsIn: 'Starts in 8 days',
    instructions: [
      'Comprehensive 19-subject grand mock test with all-India percentile ranking.',
      'Total duration is 210 minutes with 200 clinical vignette questions.',
      'Strict proctored simulation window.'
    ]
  },
  {
    id: 'test-full-07',
    name: 'National Grand Mock Test #07',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Enrolled Students',
    date: '02 Sep 2026',
    time: '10:00 IST',
    duration: '210 mins',
    durationSeconds: 12600,
    totalMarks: 800,
    questionsCount: 200,
    status: 'Completed',
    score: '684 / 800',
    percentage: '85.5%',
    percentile: '99.2%ile',
    rank: 'AIR 84',
    badge: 'Top 1% Score',
    startsIn: 'Completed'
  }
];

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

// Initial Cohort Results for Scheduled Tests (for Faculty Results View)
export const initialCohortTestResults = {
  'test-cardio-01': {
    testId: 'test-cardio-01',
    testName: 'Cardiology Grand Mock Test #01',
    summary: {
      averageScore: '74.6 / 100',
      highestScore: '96 / 100',
      attemptedCount: 412,
      totalEligible: 450,
      passRate: '88.4%',
      cutoffScore: 50
    },
    students: [
      {
        id: 'res-1',
        name: 'Dr. Ananya Sharma',
        avatar: 'https://images.unsplash.com/photo-1594824813589-3221a7112000?w=100&auto=format&fit=crop&q=80',
        course: 'NEET PG & NExT 2026',
        score: '92 / 100',
        percentage: '92%',
        correctCount: 19,
        incorrectCount: 1,
        timeTaken: '34m 12s',
        status: 'Pass',
        submittedAt: 'Today, 18:38 IST'
      },
      {
        id: 'res-2',
        name: 'Dr. Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80',
        course: 'USMLE Step 1 & 2 CK',
        score: '86 / 100',
        percentage: '86%',
        correctCount: 18,
        incorrectCount: 2,
        timeTaken: '38m 45s',
        status: 'Pass',
        submittedAt: 'Today, 18:42 IST'
      },
      {
        id: 'res-3',
        name: 'Dr. Priya Patel',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
        course: 'NEET PG & NExT 2026',
        score: '72 / 100',
        percentage: '72%',
        correctCount: 15,
        incorrectCount: 3,
        timeTaken: '41m 20s',
        status: 'Pass',
        submittedAt: 'Today, 18:45 IST'
      },
      {
        id: 'res-4',
        name: 'Dr. David Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        course: 'NEET PG & NExT 2026',
        score: '46 / 100',
        percentage: '46%',
        correctCount: 10,
        incorrectCount: 8,
        timeTaken: '44m 10s',
        status: 'Fail',
        submittedAt: 'Today, 18:49 IST'
      }
    ]
  }
};

// =============================================================================
// REACTIVE TEST SERVICE: Cross-Portal Synchronization Layer
// =============================================================================

const STORAGE_KEY_TESTS = 'medprep_phase6_tests';
const STORAGE_KEY_RESULTS = 'medprep_phase6_results';

export const testService = {
  getTests: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TESTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return phase6InitialTests;
  },

  getAllTests: () => {
    return testService.getTests();
  },

  getTestById: (id) => {
    const tests = testService.getTests();
    return tests.find((t) => t.id === id) || tests[0];
  },

  saveTest: (newTest) => {
    const tests = testService.getTests();
    const updated = [newTest, ...tests.filter((t) => t.id !== newTest.id)];
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('medprep-tests-updated', { detail: updated }));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    return updated;
  },

  addTest: (testData) => {
    const questionList = testData.questions && Array.isArray(testData.questions) ? testData.questions : [];
    const newTest = {
      id: `test-${Date.now()}`,
      name: testData.name,
      courseId: testData.courseId || 'neet-pg',
      course: testData.course || (testData.courseId === 'usmle' ? 'USMLE Step 1 & 2' : testData.courseId === 'plab' ? 'PLAB 1 & 2' : 'NEET PG & NExT 2026'),
      // Optional scoping down to a specific Subject -> Module -> Lecture (all left undefined for exam-wide mock tests)
      subjectId: testData.subjectId || null,
      moduleId: testData.moduleId || null,
      lectureId: testData.lectureId || null,
      batch: testData.batch || 'All Enrolled Students',
      date: testData.dateTime ? testData.dateTime.split('@')[0]?.trim() : 'Upcoming',
      time: testData.dateTime ? testData.dateTime.split('@')[1]?.trim() : '18:00 IST',
      duration: testData.duration || '45 mins',
      durationSeconds: 2700,
      totalMarks: testData.totalMarks || 100,
      questionsCount: questionList.length > 0 ? questionList.length : (testData.totalQuestions || 20),
      questions: questionList,
      status: 'Scheduled',
      badge: 'Assessment Scheduled',
      pattern: 'Clinical Vignettes (Single Best Response)',
      startsIn: 'Scheduled'
    };
    testService.saveTest(newTest);
    return newTest;
  },

  updateTestQuestions: (testId, questions) => {
    const tests = testService.getTests();
    const index = tests.findIndex((t) => t.id === testId);
    if (index !== -1) {
      tests[index].questions = questions;
      tests[index].questionsCount = questions.length;
      try {
        localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
        window.dispatchEvent(new CustomEvent('medprep-tests-updated', { detail: tests }));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
      return tests[index];
    }
    return null;
  },

  getQuestionsForTest: (testId) => {
    const test = testService.getTestById(testId);
    if (test && test.questions && Array.isArray(test.questions) && test.questions.length > 0) {
      return test.questions;
    }
    return sampleCbtQuestionBank;
  },

  subscribe: (callback) => {
    const handler = (e) => {
      callback(e.detail || testService.getTests());
    };
    window.addEventListener('medprep-tests-updated', handler);
    return () => window.removeEventListener('medprep-tests-updated', handler);
  },

  getStudentSubmissions: () => {
    return [];
  },

  getCohortResults: (testId) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RESULTS);
      if (stored) {
        const allResults = JSON.parse(stored);
        if (allResults[testId]) return allResults[testId];
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return initialCohortTestResults[testId] || {
      testId,
      testName: 'Scheduled Mock Test',
      summary: {
        averageScore: '72 / 100',
        highestScore: '94 / 100',
        attemptedCount: 388,
        totalEligible: 450,
        passRate: '86.2%',
        cutoffScore: 50
      },
      students: initialCohortTestResults['test-cardio-01']?.students || []
    };
  },

  submitStudentAttempt: (testId, attemptData) => {
    // 1. Update Test status to completed for the student
    const tests = testService.getTests();
    const testIndex = tests.findIndex((t) => t.id === testId);
    if (testIndex !== -1) {
      tests[testIndex] = {
        ...tests[testIndex],
        status: 'Completed',
        score: `${attemptData.score} / ${attemptData.totalMarks}`,
        percentage: `${attemptData.percentage}%`,
        percentile: attemptData.percentile || '94.2%ile',
        rank: attemptData.rank || 'AIR 42',
        badge: attemptData.status === 'Pass' ? 'PASSED • Result Available' : 'Attempted'
      };
      try {
        localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
    }

    // 2. Add Dr. Ritik Saini's submission to the Faculty results roster
    let allCohortResults = {};
    try {
      const storedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
      allCohortResults = storedResults ? JSON.parse(storedResults) : { ...initialCohortTestResults };
    } catch (e) {
      allCohortResults = { ...initialCohortTestResults };
    }

    const testResults = allCohortResults[testId] || {
      testId,
      testName: tests[testIndex]?.name || 'Scheduled Mock Test',
      summary: {
        averageScore: '75.2 / 100',
        highestScore: '96 / 100',
        attemptedCount: 412,
        totalEligible: 450,
        passRate: '89.1%',
        cutoffScore: 50
      },
      students: []
    };

    const newStudentResult = {
      id: `student-ritik-${Date.now()}`,
      name: 'Dr. Ritik Saini',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
      course: 'NEET PG & NExT 2026',
      score: `${attemptData.score} / ${attemptData.totalMarks}`,
      percentage: `${attemptData.percentage}%`,
      correctCount: attemptData.correctCount,
      incorrectCount: attemptData.incorrectCount,
      timeTaken: attemptData.timeTakenFormatted || '36m 20s',
      status: attemptData.status || 'Pass',
      submittedAt: 'Just now'
    };

    // Prepend or update Ritik's entry
    testResults.students = [
      newStudentResult,
      ...testResults.students.filter((s) => s.name !== 'Dr. Ritik Saini')
    ];
    testResults.summary.attemptedCount += 1;

    allCohortResults[testId] = testResults;

    try {
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(allCohortResults));
      window.dispatchEvent(new CustomEvent('medprep-tests-updated', { detail: tests }));
      window.dispatchEvent(new CustomEvent('medprep-results-updated', { detail: allCohortResults }));
    } catch (e) {
      console.warn('Storage write error:', e);
    }

    return { test: tests[testIndex], cohortResults: testResults };
  }
};

