import React from 'react';

export default function QuestionDifficultyBadge({ difficulty = 'medium', className = '' }) {
  const normalized = String(difficulty).toLowerCase();

  const config = {
    easy: {
      label: 'Easy',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    medium: {
      label: 'Medium',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    hard: {
      label: 'Hard',
      className: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  };

  const item = config[normalized] || {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 ${item.className} ${className}`}
    >
      {item.label}
    </span>
  );
}
