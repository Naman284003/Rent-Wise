import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res?.success) {
      const role = res.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'landlord') navigate('/landlord');
      else navigate('/tenant');
    } else {
      setErrorMsg(res?.message || 'Invalid email or password.');
    }
  };

  const handleQuickDemo = async (role) => {
    setSubmitting(true);
    const res = await quickDemoLogin(role);
    setSubmitting(false);
    if (res?.success) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'landlord') navigate('/landlord');
      else navigate('/tenant');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            RentWise
          </Link>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Sign in with your account or pick a sample role below.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-lg">
          {/* Quick Demo Accounts */}
          <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              Quick Demo Sign-In
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('landlord')}
                disabled={submitting}
                className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-500 bg-slate-50/70 dark:bg-slate-800/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Landlord</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Vikramaditya</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('tenant')}
                disabled={submitting}
                className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-500 bg-slate-50/70 dark:bg-slate-800/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Tenant</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Aarav Sharma</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={submitting}
                className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-500 bg-slate-50/70 dark:bg-slate-800/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Admin</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Rajeshwari</div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@rentwise.in"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            New to RentWise?{' '}
            <Link to="/register" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
