import React from 'react';

const statusColors = {
  vacant: 'text-emerald-700 dark:text-emerald-400',
  occupied: 'text-teal-700 dark:text-teal-400',
  maintenance: 'text-amber-700 dark:text-amber-400',

  paid: 'text-emerald-700 dark:text-emerald-400',
  partially_paid: 'text-sky-700 dark:text-sky-400',
  unpaid: 'text-amber-700 dark:text-amber-400',
  overdue: 'text-rose-700 dark:text-rose-400',

  active: 'text-emerald-700 dark:text-emerald-400',
  terminated: 'text-slate-500 dark:text-slate-400',
  expired: 'text-slate-500 dark:text-slate-400',

  open: 'text-amber-700 dark:text-amber-400',
  in_progress: 'text-teal-700 dark:text-teal-400',
  resolved: 'text-emerald-700 dark:text-emerald-400',
  closed: 'text-slate-500 dark:text-slate-400',

  low: 'text-slate-600 dark:text-slate-400',
  medium: 'text-sky-700 dark:text-sky-400',
  high: 'text-amber-700 dark:text-amber-400',
  urgent: 'text-rose-700 dark:text-rose-400',

  admin: 'text-slate-800 dark:text-slate-200',
  landlord: 'text-teal-700 dark:text-teal-400',
  tenant: 'text-sky-700 dark:text-sky-400',
};

const labels = {
  vacant: 'Vacant',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  paid: 'Paid',
  partially_paid: 'Partial',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
  active: 'Active',
  terminated: 'Closed',
  expired: 'Expired',
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
  admin: 'Admin',
  landlord: 'Landlord',
  tenant: 'Tenant',
};

export default function Badge({ status, text, size = 'sm' }) {
  const norm = String(status || '').toLowerCase().replace('-', '_');
  const color = statusColors[norm] || 'text-slate-600 dark:text-slate-400';
  const label = text || labels[norm] || status;
  const textSize = size === 'xs' ? 'text-[11px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center font-semibold whitespace-nowrap shrink-0 ${textSize} ${color}`}>
      {label}
    </span>
  );
}
