import React from 'react';
import { QUESTION_STATUSES, QUESTION_STATUS_LABELS } from '../../utils/questionTypes.js';

export default function QuestionStatusBadge({ status = 'draft', className = '' }) {
  const normalized = String(status).toLowerCase();

  const config = {
    [QUESTION_STATUSES.DRAFT]: {
      label: QUESTION_STATUS_LABELS[QUESTION_STATUSES.DRAFT] || 'Draft',
      className: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    [QUESTION_STATUSES.REVIEW]: {
      label: QUESTION_STATUS_LABELS[QUESTION_STATUSES.REVIEW] || 'Under Review',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    [QUESTION_STATUSES.APPROVED]: {
      label: QUESTION_STATUS_LABELS[QUESTION_STATUSES.APPROVED] || 'Approved',
      className: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    [QUESTION_STATUSES.PUBLISHED]: {
      label: QUESTION_STATUS_LABELS[QUESTION_STATUSES.PUBLISHED] || 'Published',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    [QUESTION_STATUSES.ARCHIVED]: {
      label: QUESTION_STATUS_LABELS[QUESTION_STATUSES.ARCHIVED] || 'Archived',
      className: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  };

  const item = config[normalized] || {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${item.className} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70 shrink-0" />
      {item.label}
    </span>
  );
}
