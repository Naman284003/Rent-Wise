import React from 'react';

export default function StatCard({ title, value, subValue, trendLabel }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {title}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight font-display">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {subValue}
          </span>
        )}
      </div>

      {trendLabel && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          {trendLabel}
        </div>
      )}
    </div>
  );
}
