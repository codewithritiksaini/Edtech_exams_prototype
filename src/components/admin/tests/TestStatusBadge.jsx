import React from 'react';
import { TEST_STATUS } from '../../../services/adminTestService';

export default function TestStatusBadge({ status, className = '' }) {
  const normalizedStatus = (status || TEST_STATUS.DRAFT).toUpperCase();

  const getBadgeConfig = () => {
    switch (normalizedStatus) {
      case TEST_STATUS.DRAFT:
        return {
          label: 'Draft',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
          dotClass: 'bg-slate-400'
        };
      case TEST_STATUS.CONFIGURING:
        return {
          label: 'Configuring',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500 animate-pulse'
        };
      case TEST_STATUS.READY:
        return {
          label: 'Ready',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
          dotClass: 'bg-sky-500'
        };
      case TEST_STATUS.PUBLISHED:
        return {
          label: 'Published',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dotClass: 'bg-indigo-500'
        };
      case TEST_STATUS.ACTIVE:
        return {
          label: 'Active',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500 animate-pulse'
        };
      case TEST_STATUS.COMPLETED:
        return {
          label: 'Completed',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500'
        };
      case TEST_STATUS.ARCHIVED:
        return {
          label: 'Archived',
          badgeClass: 'bg-rose-50/70 text-rose-600 border-rose-200',
          dotClass: 'bg-rose-400'
        };
      default:
        return {
          label: normalizedStatus,
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
          dotClass: 'bg-slate-400'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border transition-all ${config.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
