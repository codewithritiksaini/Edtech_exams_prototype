import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Stethoscope, 
  ArrowRight, 
  Lock, 
  Mail, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { authService, USER_ROLES } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('demo12345');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // System auto-detects account role based on credentials (no manual toggle!)
      const account = authService.login(email);
      navigate(account.redirectTo);
    }, 450);
  };

  const handleQuickFill = (sampleEmail) => {
    setEmail(sampleEmail);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background soft ambient accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2 z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            MedPrep<span className="text-brand-600">Pro</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Centered Single Login Form */}
      <div className="max-w-md w-full mx-auto my-auto py-8 z-10">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Form Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-2xs border border-brand-100">
              <Stethoscope className="w-6 h-6" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to MedPrep Pro
            </h1>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered email and password to access your personalized dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500 font-medium transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-brand-600 hover:text-brand-700 cursor-pointer font-semibold">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500 font-medium transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Verifying Account...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New Here? Sign Up Link */}
          <div className="text-center pt-1 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              New medical aspirant?{' '}
              <Link to="/packages/neet-pg" className="text-brand-600 hover:text-brand-700 font-bold">
                Explore Packages & Enroll →
              </Link>
            </p>
          </div>

          {/* Demo Autofill Helper Chips (Convenient for Live Presentation) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px]">
                Demo Accounts (Click to test auto-routing):
              </span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-bold">
                Auto-Detect
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('student@demo.com')}
                className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  email === 'student@demo.com' 
                    ? 'bg-brand-50 border-brand-400 text-brand-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('faculty@demo.com')}
                className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  email === 'faculty@demo.com' 
                    ? 'bg-purple-50 border-purple-400 text-purple-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Faculty
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@demo.com')}
                className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  email === 'admin@demo.com' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Admin
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-tight">
              One login form for everyone. The account type automatically determines the dashboard destination.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-7xl mx-auto w-full text-center py-2 z-10">
        <p className="text-xs text-slate-400">
          MedPrep Pro • Global Medical Licensing Examination Prep Platform
        </p>
      </div>

    </div>
  );
}
