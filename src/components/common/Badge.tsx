import React from 'react';
import { EvidenceStatus } from '@/types';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface BadgeProps {
  status: EvidenceStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '', showIcon = true }) => {
  switch (status) {
    case 'approved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          معتمد
        </span>
      );
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          قيد المراجعة
        </span>
      );
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          مرفوض
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {status}
        </span>
      );
  }
};
