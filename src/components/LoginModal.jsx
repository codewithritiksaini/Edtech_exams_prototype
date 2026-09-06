import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Stethoscope, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('demo12345');
  const [submitted, setSubmitted] = useState(false);
  const [routedAccount, setRoutedAccount] = useState(null);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Auto-detect role from account credentials
    const account = authService.login(email);
    setRoutedAccount(account);

    setTimeout(() => {
      setSubmitted(false);
      onClose();
      navigate(account.redirectTo);
    }, 900);
  };

  const handleQuickFill = (sample) => {
    setEmail(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign In to MedPrep Pro</h3>
              <p className="text-xs text-slate-500">Unified Portal Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {submitted && routedAccount ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Account Verified!</h4>
              <p className="text-xs text-slate-500">
                Welcome <span className="font-semibold text-slate-800">{routedAccount.name}</span> ({routedAccount.roleLabel}).
              </p>
              <p className="text-[11px] text-brand-600 font-bold">
                Auto-routing to {routedAccount.role === 'student' ? 'Student LMS' : 'Admin Panel'}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Autofill Helper */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold">Demo Auto-Routing (Click to test):</span>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">Auto-Detect</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('student@demo.com')}
                    className={`py-1 text-[11px] font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      email === 'student@demo.com' ? 'bg-brand-50 border-brand-400 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('faculty@demo.com')}
                    className={`py-1 text-[11px] font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      email === 'faculty@demo.com' ? 'bg-purple-50 border-purple-400 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@demo.com')}
                    className={`py-1 text-[11px] font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      email === 'admin@demo.com' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
