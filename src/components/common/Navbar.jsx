import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, LogOut } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle, breadcrumbs = [] }) {
  const { user, logout, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role) => {
    if (user?.role === role) return;
    await quickDemoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'landlord') navigate('/landlord');
    else if (role === 'tenant') navigate('/tenant');
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          <Link to="/" className="font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400">
            RentWise
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">/</span>
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-slate-900 dark:hover:text-slate-100">
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-slate-200 font-medium">{crumb.name}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Quick Role Switcher + Theme + Account */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Segmented role switcher for easy walkthroughs */}
        <div className="hidden md:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
          {['landlord', 'tenant', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleSwitch(r)}
              className={`px-2.5 py-1 rounded font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                user?.role === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <Link to="/profile" className="flex items-center gap-2.5 text-left group">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-semibold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 leading-tight truncate max-w-[140px]">
                {user?.name}
              </div>
              <div className="text-[11px] text-slate-500 capitalize">
                {user?.role}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
