import React, { useState } from 'react';
import { 
  X, 
  Send, 
  HelpCircle, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Paperclip
} from 'lucide-react';

export default function AskDoubtModal({ isOpen, onClose, dayTitle }) {
  if (!isOpen) return null;

  const [subject, setSubject] = useState('ECG Rhythm Confusion: VT vs Aberrant SVT');
  const [doubtText, setDoubtText] = useState('In lead V1, how do we reliably differentiate a rabbit-ear right bundle branch block pattern from ventricular tachycardia when both show positive concordance?');
  const [urgency, setUrgency] = useState('normal');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Ask Faculty a Doubt</h3>
                <p className="text-xs text-slate-500">Direct response from specialist MD mentor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="p-3.5 bg-brand-50/70 rounded-xl border border-brand-100 text-xs text-brand-800 leading-relaxed">
                  <strong>Context:</strong> {dayTitle || 'Day 3 Content'}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Query Subject / Term
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium text-slate-800"
                    required
                  />
                </div>

                {/* Detailed Doubt */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Describe what you need clarification on:
                  </label>
                  <textarea
                    rows={5}
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-normal text-slate-800 leading-relaxed resize-none"
                    required
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Resolution Priority:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUrgency('normal')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        urgency === 'normal'
                          ? 'bg-brand-50 border-brand-500 text-brand-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Standard (24h)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('priority')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        urgency === 'priority'
                          ? 'bg-amber-50 border-amber-500 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Priority (4h)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('urgent')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        urgency === 'urgent'
                          ? 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Exam Tomorrow
                    </button>
                  </div>
                </div>

                {/* Attach Screenshot dummy */}
                <div className="p-3.5 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span>Attach ECG strip / slide snapshot (optional)</span>
                  </span>
                  <span className="font-bold text-brand-600 cursor-pointer hover:underline">Browse</span>
                </div>

                {/* Submit CTA */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Submit Query to MD Faculty</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Doubt Dispatched to Faculty!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Ticket #MD-8821 assigned to <span className="font-semibold text-slate-800">Dr. Siddharth V.</span> You will receive an in-app notification upon response.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
