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
