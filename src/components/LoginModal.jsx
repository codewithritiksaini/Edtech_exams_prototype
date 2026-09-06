import React, { useState } from 'react';
import { X, UserCheck, Stethoscope, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('demo.student@medpreppro.com');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('demo.student@medpreppro.com');
    } else {
      setEmail('dr.faculty@medpreppro.com');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Prototype Demo Login</h3>
              <p className="text-xs text-slate-500">Quick 1-click test access</p>
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
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Demo Session Verified!</h4>
              <p className="text-xs text-slate-500">
                Logged in as <span className="font-semibold text-slate-800">{email}</span>. Navigating to prototype view...
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Role Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Demo Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      selectedRole === 'student'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500/30'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👨‍⚕️ Medical Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('faculty')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      selectedRole === 'faculty'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500/30'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🩺 MD Faculty / Admin
                  </button>
                </div>
              </div>

              {/* Email Input (Pre-filled) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white"
                  required
                />
              </div>

              {/* Password Input (Pre-filled Dummy) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="medprep2026demo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white"
                  required
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Launch Demo Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                *Prototype mode: No password required, pre-configured demo credentials.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
