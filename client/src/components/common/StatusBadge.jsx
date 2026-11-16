import React from 'react';

// Status badge colours: Applied=blue, Under Review=amber, Shortlisted=green, Rejected=red, Withdrawn=gray.
const statusConfig = {
  APPLIED: {
    label: 'Applied',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className: 'bg-slate-100 text-slate-600 border-slate-300'
  }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
