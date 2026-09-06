import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Star, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  CreditCard,
  QrCode,
  Building,
  Check,
  HelpCircle,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { 
  mockPackagesByExam, 
  examCategories, 
  detailedComparisonRows, 
  packageFaqs 
} from '../data/mockData';
import { catalogService } from '../services/catalogService';

export default function PackageSelectionPage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();

  // Selected package for checkout simulation
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // 'summary' | 'processing' | 'success'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  
  // Interactive UI state
  const [showDetailedTable, setShowDetailedTable] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Catalog service subscriptions
  const [activeCatalogPackages, setActiveCatalogPackages] = useState(() => catalogService.getActivePackages(examId));
  const [activeCatalogExams, setActiveCatalogExams] = useState(() => catalogService.getActiveExams());

  useEffect(() => {
    const unsubscribe = catalogService.subscribe(() => {
      setActiveCatalogPackages(catalogService.getActivePackages(examId));
      setActiveCatalogExams(catalogService.getActiveExams());
    });
    return unsubscribe;
  }, [examId]);

  // Get current exam data or fallback to neet-pg
  const examInfo = mockPackagesByExam[examId] || mockPackagesByExam['neet-pg'];
  const examCategory = activeCatalogExams.find(e => e.id === examId) || examCategories.find(e => e.id === examId) || examCategories[0];

  // Base packages from mock data (filtered by active status in catalog)
  const basePackages = (mockPackagesByExam[examId]?.packages || mockPackagesByExam['neet-pg'].packages).filter(basePkg => {
    const match = activeCatalogPackages.find(p => 
      p.id.toLowerCase().includes(basePkg.id.toLowerCase()) || 
      p.name.toLowerCase().includes(basePkg.name.toLowerCase())
    );
    return match ? match.status === 'Active' : true;
  });

  // Custom packages added by Admin under this exam
  const customPackages = activeCatalogPackages
    .filter(p => !['neet-pg-basic', 'neet-pg-standard', 'neet-pg-premium', 'usmle-basic', 'usmle-standard', 'usmle-premium', 'plab-basic', 'plab-standard', 'plab-premium', 'europe-basic', 'europe-standard', 'europe-premium'].includes(p.id))
    .filter(p => p.examId === examId)
    .map(p => ({
      id: p.id,
      name: p.name,
      tierLabel: 'Custom Tier',
      price: p.formattedPrice,
      duration: p.duration,
      durationFull: `${p.duration} Access`,
      description: 'Admin-curated custom curriculum tier tailored for your clinical preparation.',
      popular: p.popular,
      badge: p.popular ? 'POPULAR' : undefined,
      features: [
        { name: 'PDF Notes', included: p.features?.pdfNotes, detail: p.features?.pdfNotes ? 'Included' : 'Not Included' },
        { name: 'Video Lectures', included: p.features?.videoLectures, detail: p.features?.videoLectures ? 'Included' : 'Not Included' },
        { name: 'Flashcards', included: p.features?.flashcards, detail: p.features?.flashcards ? 'Included' : 'Not Included' },
        { name: 'Live Sessions', included: p.features?.liveSessions, detail: p.features?.liveSessions ? 'Included' : 'Not Included' },
        { name: 'Test Series', included: p.features?.testSeries, detail: p.features?.testSeries ? 'Included' : 'Not Included' }
      ]
    }));

  const visiblePackages = mockPackagesByExam[examId] 
    ? [...basePackages, ...customPackages] 
    : (customPackages.length > 0 ? customPackages : basePackages);

  const handleSelectPackage = (pkg) => {
    setSelectedPlan(pkg);
    setPaymentStep('summary');
    setCheckoutModalOpen(true);
  };

  const handleSimulatePayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
    }, 1200);
  };

  const handleProceedToDashboard = () => {
    setCheckoutModalOpen(false);
    navigate(`/dashboard?exam=${examId}&plan=${encodeURIComponent(selectedPlan?.name || 'Standard')}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. Page Header: Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <a href="/#courses" className="hover:text-brand-600 transition-colors">
            Courses
          </a>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">
            {examInfo.examName}
          </span>
        </nav>

        {/* Page Heading & Subheading */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl" role="img" aria-label={examInfo.country}>
                  {examInfo.flag}
                </span>
                <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-200">
                  {examInfo.country} Medical Pathway
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {examInfo.examName} Packages
              </h1>

              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Choose the plan that fits your preparation timeline.
              </p>
            </div>

            {/* Exam category switcher tabs */}
            <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                Switch Exam Track:
              </span>
              <div className="flex flex-wrap gap-1.5 max-w-sm">
                {activeCatalogExams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => navigate(`/packages/${exam.id}`)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      exam.id === examId
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {exam.flag} {exam.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Package Comparison Section (MAIN SECTION) */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Compare 3 Preparation Tiers
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Clear, transparent pricing designed for focused revision or full clinical mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {visiblePackages.map((pkg) => {
              const isPopular = pkg.popular;
              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                    isPopular 
                      ? 'border-brand-500 shadow-xl shadow-brand-500/15 ring-2 ring-brand-500/30 -translate-y-2' 
                      : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  
                  {/* Highlight Banner for "Standard" (Most Popular) */}
                  {isPopular && (
                    <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white text-xs font-extrabold py-2 px-4 text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                      <span>{pkg.badge || 'MOST POPULAR'}</span>
                    </div>
                  )}

                  <div className="p-7 sm:p-8">
                    
                    {/* Tier Name & Sub-label */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-2xl font-black text-slate-900">
                        {pkg.name}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {pkg.tierLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 min-h-[36px] leading-relaxed mb-6">
                      {pkg.description}
                    </p>

                    {/* Price & Duration Box */}
                    <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
                            {pkg.price}
                          </span>
                          {pkg.usdPrice && (
                            <span className="text-xs font-semibold text-slate-500 ml-1.5">({pkg.usdPrice})</span>
                          )}
                          {pkg.gbpPrice && (
                            <span className="text-xs font-semibold text-slate-500 ml-1.5">({pkg.gbpPrice})</span>
                          )}
                          {pkg.eurPrice && (
                            <span className="text-xs font-semibold text-slate-500 ml-1.5">({pkg.eurPrice})</span>
                          )}
                        </div>
                        {pkg.discount && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {pkg.discount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div className="flex items-center gap-1 text-brand-700 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Duration: {pkg.duration}</span>
                        </div>
                        {pkg.originalPrice && (
                          <span className="text-slate-400 line-through">
                            {pkg.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feature List with Checkmarks and Crosses */}
                    <div className="space-y-3.5 mb-8">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Included Features:
                      </div>

                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2.5">
                            {feat.included ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <span className={`font-semibold ${feat.included ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                              {feat.name}
                            </span>
                          </div>

                          <span className={`text-xs text-right font-medium ${feat.included ? 'text-slate-500' : 'text-slate-400'}`}>
                            {feat.detail}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* "Select Package" / "Buy Now" CTA Button */}
                  <div className="p-7 sm:p-8 pt-0 mt-auto">
                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group ${
                        isPopular
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 active:scale-98'
                          : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                      }`}
                    >
                      <span>Buy Now — {pkg.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2.5">
                      7-day risk-free money-back guarantee
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Feature Comparison Table (Detailed View) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                Detailed Matrix
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Detailed Feature Comparison Table
              </h3>
              <p className="text-sm text-slate-500">
                Compare side-by-side capabilities before choosing your tier.
              </p>
            </div>

            <button
              onClick={() => setShowDetailedTable(!showDetailedTable)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              <span>{showDetailedTable ? 'Hide Detailed Table' : 'Expand Detailed Table'}</span>
              {showDetailedTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showDetailedTable && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-2/5">
                      Features & Capabilities
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider w-1/5">
                      Basic
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-600 uppercase tracking-wider w-1/5 bg-brand-50/50">
                      Standard (Popular)
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider w-1/5">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {detailedComparisonRows.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr className="bg-slate-100/60 font-bold text-slate-800">
                        <td colSpan={4} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-600">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {row.feature}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {row.basic}
                          </td>
                          <td className="py-3 px-4 font-medium text-brand-700 bg-brand-50/30">
                            {row.standard}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {row.premium}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. FAQ Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Got Questions?</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Everything you need to know about package upgrades, access validity, and refunds.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {packageFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-800 hover:bg-slate-50 text-sm sm:text-base transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'bg-brand-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. Interaction Flow: Dummy Checkout/Payment Screen + Payment Successful  */}
      {/* ========================================================================= */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Step 1: Summary & Dummy Payment Form */}
            {paymentStep === 'summary' && (
              <div>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                      Simulated Checkout
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      Order Summary
                    </h4>
                  </div>
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  
                  {/* Package Summary Box */}
                  <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-base">
                          {selectedPlan?.name} Package
                        </span>
                        <span className="text-[10px] font-bold bg-brand-200 text-brand-800 px-2 py-0.5 rounded-full">
                          {selectedPlan?.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Target Exam: <span className="font-semibold text-slate-800">{examInfo.examName}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 font-sans">
                        {selectedPlan?.price}
                      </span>
                      {selectedPlan?.originalPrice && (
                        <div className="text-[11px] text-slate-400 line-through">
                          {selectedPlan?.originalPrice}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Info Inputs (Pre-filled for Demo) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Doctor Name</label>
                      <input
                        type="text"
                        defaultValue="Dr. Ritik Saini"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Email ID</label>
                      <input
                        type="email"
                        defaultValue="ritik.doctor@example.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-2">
                      Select Payment Method (Simulated):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('upi')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedPaymentMethod === 'upi'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="text-[11px] font-bold">UPI / GPay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedPaymentMethod === 'card'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('netbanking')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedPaymentMethod === 'netbanking'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Net Banking</span>
                      </button>
                    </div>
                  </div>

                  {/* Security notice */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Demo mode: No actual payment will be deducted.</span>
                  </div>

                  {/* "Pay Now" Button */}
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Pay Now ({selectedPlan?.price})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Processing Simulator */}
            {paymentStep === 'processing' && (
              <div className="py-16 px-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">
                  Simulating Secure Transaction...
                </h4>
                <p className="text-xs text-slate-500">
                  Authorizing demo session for {selectedPlan?.name} plan.
                </p>
              </div>
            )}

            {/* Step 3: Payment Successful Confirmation Screen */}
            {paymentStep === 'success' && (
              <div className="p-8 text-center space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                    Transaction Complete
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Transaction ID: <span className="font-mono font-bold text-slate-700">MEDPREP-2026-TXN-88492</span>
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Enrolled Student:</span>
                    <span className="font-bold text-slate-900">Dr. Ritik Saini</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exam Pathway:</span>
                    <span className="font-bold text-slate-900">{examInfo.examName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purchased Tier:</span>
                    <span className="font-bold text-brand-700">{selectedPlan?.name} ({selectedPlan?.duration})</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500 font-semibold">Amount Paid:</span>
                    <span className="font-extrabold text-emerald-600 text-sm">{selectedPlan?.price}</span>
                  </div>
                </div>

                {/* Action to Phase 3: Student Dashboard */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleProceedToDashboard}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Student Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1"
                  >
                    Stay on Package Comparison Page
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
