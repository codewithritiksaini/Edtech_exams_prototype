import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle, PlayCircle } from 'lucide-react';
import { FACULTY_TEST_STATUS } from '../../../services/cbtTestService';

export default function FacultyTestStatusBadge({ status, className = '' }) {
  const normStatus = (status || '').toUpperCase();

  switch (normStatus) {
    case FACULTY_TEST_STATUS.DRAFT:
    case 'DRAFT':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Draft
        </span>
      );

    case FACULTY_TEST_STATUS.UPCOMING:
    case 'UPCOMING':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}>
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          Upcoming
        </span>
      );

    case FACULTY_TEST_STATUS.LIVE:
    case 'LIVE':
    case 'AVAILABLE':
    case 'IN-PROGRESS':
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping"></span>
          Live Now
        </span>
      );

    case FACULTY_TEST_STATUS.COMPLETED:
    case 'COMPLETED':
    case 'SUBMITTED':
    case 'EXPIRED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
          Completed
        </span>
      );

    case FACULTY_TEST_STATUS.CANCELLED:
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50/70 text-rose-600 border border-rose-200/60 line-through ${className}`}>
          <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
          Cancelled
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
          {status || 'Unknown'}
        </span>
      );
  }
}
