import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Stethoscope, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ExternalLink,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { facultyProfileData } from '../data/mockData';

export default function FacultyLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(facultyProfileData.email);
  const [password, setPassword] = useState('faculty2026pass');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/faculty');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background soft color accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2 z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            MedPrep<span className="text-indigo-600">Pro</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Student Landing Page</span>
        </Link>
      </div>

      {/* Login Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8 z-10">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supply-Side Faculty Portal</span>
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Faculty Management Sign In
            </h1>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Curate and control daily clinical curricula, high-yield PDFs, live grand rounds, and CBT question banks.
            </p>
          </div>

          {/* Quick Demo Fill Notice */}
          <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Demo Account Pre-Configured</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Assigned Lead: {facultyProfileData.name} ({facultyProfileData.institution})
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Faculty Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Sign In to Faculty Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              to="/dashboard"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
            >
              <span>Are you a student? Go to Student Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center py-2 text-[11px] text-slate-400 z-10">
        MedPrep Pro Prototype • Faculty Supply-Side Content Management Engine
      </div>

    </div>
  );
}
