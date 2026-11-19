import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">404</div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
        Page not found
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors"
      >
        Back to RentWise
      </Link>
    </div>
  );
}
