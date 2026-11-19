import React from 'react';

export default function SkeletonLoader({ type = 'table', rows = 4, cols = 4 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5 space-y-4">
            <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
            <div className="pt-2 flex justify-between">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-24 ml-auto" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-36" />
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-24" />
              </div>
            </div>
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24 hidden sm:block" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-20 hidden md:block" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
