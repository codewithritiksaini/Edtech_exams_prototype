import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Mail, 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Phone,
  GraduationCap
} from 'lucide-react';
import { dashboardUserData } from '../../data/mockData';

export default function StudentSettingsPage() {
  const [formData, setFormData] = useState({
    name: dashboardUserData.name || 'Dr. Ritik Saini',
    email: dashboardUserData.email || 'dr.ritiksaini@aiims.edu',
    phone: '+91 98765 43210',
    examTrack: 'neet-pg',
    examYear: '2026 Examination Cycle',
    aspiration: 'Internal Medicine / Cardiology',
    college: 'All India Institute of Medical Sciences (AIIMS New Delhi)'
  });

  const [notifications, setNotifications] = useState({
    dailyPearl: true,
    liveReminders: true,
    scorecardAlerts: true,
    spacedRepetition: true
  });

  const [toastMessage, setToastMessage] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToastMessage('✅ Doctor profile and clinical study preferences saved successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDownloadInvoice = () => {
    setToastMessage('📄 Official GST Tax Invoice MED-INV-89201 downloaded to your device.');
    setTimeout(() => setToastMessage(''), 4500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>Account & Study Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Doctor Profile & LMS Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your verified candidate profile, target medical licensing preferences, study reminders, and package billing.
        </p>
      </div>

      {/* Candidate Profile Card */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center font-black text-xl text-brand-600 shrink-0">
              DR
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
              <p className="text-xs text-slate-500">Candidate Roll No: <strong className="text-slate-700">MED-2026-904</strong></p>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-1 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified MBBS Candidate</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Full Name (with Title)</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-brand-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-brand-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">WhatsApp / Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-brand-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Target Licensing Exam</label>
            <select 
              value={formData.examTrack}
              onChange={(e) => setFormData({ ...formData, examTrack: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-brand-600 transition-colors"
            >
              <option value="neet-pg">NEET PG & NExT Elite Track (India)</option>
              <option value="usmle">USMLE Step 1 & Step 2 CK (United States)</option>
              <option value="plab">PLAB 1 & 2 / UKMLA (United Kingdom)</option>
              <option value="europe">Europe Medical Licensing (FSP / Approbation)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Target Examination Cycle</label>
            <select 
              value={formData.examYear}
              onChange={(e) => setFormData({ ...formData, examYear: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-brand-600 transition-colors"
            >
              <option>2026 Examination Cycle</option>
              <option>2027 Examination Cycle</option>
              <option>2028 Examination Cycle</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Specialization Aspiration</label>
            <input 
              type="text" 
              value={formData.aspiration}
              onChange={(e) => setFormData({ ...formData, aspiration: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-brand-600 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700">Medical College / Alma Mater</label>
            <input 
              type="text" 
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-brand-600 transition-colors"
            />
          </div>
        </div>
      </form>

      {/* Alerts & Study Reminders */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <span>Study Notifications & Clinical Reminders</span>
        </h3>
        
        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900 block">Daily Morning High-Yield Clinical Pearl</span>
              <span className="text-slate-500">Receive 1 high-yield clinical vignette breakdown via WhatsApp & Email at 07:00 AM</span>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.dailyPearl} 
              onChange={(e) => setNotifications({ ...notifications, dailyPearl: e.target.checked })}
              className="accent-brand-600 w-4 h-4 cursor-pointer" 
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900 block">Live Grand Rounds 30-Minute Broadcast Alert</span>
              <span className="text-slate-500">Push notification and SMS prior to live interactive faculty classes</span>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.liveReminders} 
              onChange={(e) => setNotifications({ ...notifications, liveReminders: e.target.checked })}
              className="accent-brand-600 w-4 h-4 cursor-pointer" 
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900 block">CBT Test Series Scorecard Alerts</span>
              <span className="text-slate-500">Instant notification when All India Rank (AIR) and national percentiles are computed</span>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.scorecardAlerts} 
              onChange={(e) => setNotifications({ ...notifications, scorecardAlerts: e.target.checked })}
              className="accent-brand-600 w-4 h-4 cursor-pointer" 
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900 block">Spaced Repetition Review Due Cards</span>
              <span className="text-slate-500">Daily reminder to review cards due under the SuperMemo-2 spaced recall algorithm</span>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.spacedRepetition} 
              onChange={(e) => setNotifications({ ...notifications, spacedRepetition: e.target.checked })}
              className="accent-brand-600 w-4 h-4 cursor-pointer" 
            />
          </div>
        </div>
      </div>

      {/* Package & Subscription Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-600" />
          <span>Current Package & Subscription</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-brand-50 border border-brand-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider bg-brand-200/60 px-2 py-0.5 rounded">
              ACTIVE SUBSCRIPTION
            </span>
            <h4 className="text-lg font-black text-slate-900">{dashboardUserData.packageTier} Plan</h4>
            <p className="text-xs text-slate-600">
              Access valid until <strong>Nov 29, 2026</strong> • Proctored CBT Assessments & Live Grand Rounds Included
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleDownloadInvoice}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice</span>
            </button>
            <Link
              to="/packages"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Upgrade Tier
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
