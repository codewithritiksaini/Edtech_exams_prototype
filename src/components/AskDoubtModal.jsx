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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ask Faculty a Doubt</h3>
              <p className="text-[11px] text-slate-500">Direct response from specialist MD mentor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="p-3 bg-brand-50/70 rounded-xl border border-brand-100 text-xs text-brand-800">
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
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium text-slate-800"
                  required
                />
              </div>

              {/* Detailed Doubt */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Describe what you need clarification on:
                </label>
                <textarea
                  rows={4}
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-normal text-slate-800 leading-relaxed resize-none"
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      urgency === 'normal'
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Standard (24h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('priority')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      urgency === 'priority'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Priority (4h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      urgency === 'urgent'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Exam Tomorrow
                  </button>
                </div>
              </div>

              {/* Attach Screenshot dummy */}
              <div className="p-3 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Attach ECG strip / slide snapshot (optional)</span>
                </span>
                <span className="font-bold text-brand-600 cursor-pointer hover:underline">Browse</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Submit Query to MD Faculty</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
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
  );
}
