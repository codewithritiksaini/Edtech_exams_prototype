import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { mockPackagesByExam, examCategories } from '../data/mockData';

export default function PackageSelectionPage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);

  // Get current exam data or fallback to neet-pg
  const examInfo = mockPackagesByExam[examId] || mockPackagesByExam['neet-pg'];
  const examCategory = examCategories.find(e => e.id === examId) || examCategories[0];

  const handleSelectPackage = (pkg) => {
    setSelectedPlan(pkg);
    setCheckoutModalOpen(true);
    setEnrolledSuccess(false);
  };

  const handleConfirmEnrollment = () => {
    setEnrolledSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link & Phase 2 Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Exam Categories</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-brand-100 text-brand-800 rounded-full">
              Phase 2: Package Selection
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Demo Preview Flow
            </span>
          </div>
        </div>

        {/* Exam Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{examInfo.flag}</span>
                <span className="px-3 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                  Target Program
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {examInfo.examName} Packages
              </h1>
              <p className="text-base text-slate-600 max-w-2xl">
                {examInfo.subtitle}. Select the tier tailored to your preparation timeline and clinical review needs.
              </p>
            </div>

            {/* Quick Switcher between other exams */}
            <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Switch Exam Track:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {examCategories.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => navigate(`/packages/${exam.id}`)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      exam.id === examId
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {exam.flag} {exam.id === 'neet-pg' ? 'NEET PG' : exam.id.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Tier Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {examInfo.packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                pkg.popular 
                  ? 'border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/30 -translate-y-1' 
                  : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-1.5">
                  <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{pkg.badge || 'MOST RECOMMENDED'}</span>
                </div>
              )}

              <div className="p-8">
                
                {/* Package Name & Description */}
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {pkg.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
                      {pkg.price}
                    </span>
                    {pkg.usd && (
                      <span className="text-sm font-semibold text-slate-500">({pkg.usd})</span>
                    )}
                    {pkg.gbp && (
                      <span className="text-sm font-semibold text-slate-500">({pkg.gbp})</span>
                    )}
                    {pkg.eur && (
                      <span className="text-sm font-semibold text-slate-500">({pkg.eur})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-xs font-semibold text-brand-700">
                      {pkg.validity}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-xs text-slate-400 line-through ml-auto">
                        {pkg.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included in this plan:
                  </div>
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Package Card CTA */}
              <div className="p-8 pt-0 mt-auto">
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group ${
                    pkg.popular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 active:scale-98'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                  }`}
                >
                  <span>Select {pkg.name.split(' ')[0]} Plan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Feature comparison table banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-3xl mx-auto space-y-4">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">
            100% Risk-Free 7-Day Money-Back Guarantee
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            All MedPrep Pro packages include unrestricted access to our clinical video units, 
            QBank diagnostic tests, and downloadable high-yield notes. If you are not completely satisfied, 
            request a full refund within 7 days.
          </p>
        </div>

      </div>

      {/* Interactive Mock Enrollment Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 relative">
            {!enrolledSuccess ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase">Selected Plan</span>
                    <h3 className="text-lg font-bold text-slate-900">{selectedPlan?.name}</h3>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900">{selectedPlan?.price}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Target Exam:</span>
                    <span className="font-bold text-slate-800">{examInfo.examName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access Duration:</span>
                    <span className="font-bold text-slate-800">{selectedPlan?.validity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Curriculum Version:</span>
                    <span className="font-bold text-emerald-600">2026 Updated NExT / USMLE</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Doctor / Student Full Name</label>
                    <input 
                      type="text" 
                      defaultValue="Dr. Ritik Saini" 
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email for Course Delivery</label>
                    <input 
                      type="email" 
                      defaultValue="ritik.doctor@example.com" 
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConfirmEnrollment}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Confirm Demo Enrollment (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel & Review Other Packages
                </button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Prototype Enrollment Successful!
                </h3>
                <p className="text-sm text-slate-600">
                  In a production system, this step seamlessly provisions your student dashboard with{' '}
                  <span className="font-bold text-slate-800">{selectedPlan?.name}</span> for {examInfo.examName}.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      navigate('/');
                    }}
                    className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    Return to Homepage
                  </button>
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    View Other Plans
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
