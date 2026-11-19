import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Building2,
  LayoutDashboard,
  Home,
  DoorOpen,
  Users,
  IndianRupee,
  Receipt,
  Wrench,
  UserCheck,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'tenant';

  const landlordNav = [
    { name: 'Dashboard', path: '/landlord', icon: LayoutDashboard },
    { name: 'Properties', path: '/landlord/properties', icon: Building2 },
    { name: 'Flats & Rooms', path: '/landlord/rooms', icon: DoorOpen },
    { name: 'Tenants & Leases', path: '/landlord/tenants', icon: Users },
    { name: 'Rent Register', path: '/landlord/rent', icon: IndianRupee },
    { name: 'Payment Receipts', path: '/landlord/payments', icon: Receipt },
    { name: 'Maintenance', path: '/landlord/complaints', icon: Wrench },
  ];

  const tenantNav = [
    { name: 'My Home', path: '/tenant', icon: Home },
    { name: 'Rent & Receipts', path: '/tenant/payments', icon: Receipt },
    { name: 'Maintenance', path: '/tenant/complaints', icon: Wrench },
  ];

  const adminNav = [
    { name: 'Overview', path: '/admin', icon: BarChart3 },
    { name: 'Users', path: '/admin/users', icon: UserCheck },
    { name: 'Properties', path: '/admin/properties', icon: Building2 },
    { name: 'Maintenance', path: '/admin/complaints', icon: Wrench },
  ];

  const navLinks = role === 'admin' ? adminNav : role === 'landlord' ? landlordNav : tenantNav;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="font-display font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
            RentWise
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize">
            {role} menu
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/landlord' || item.path === '/admin' || item.path === '/tenant'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Account
          </div>
          <NavLink
            to="/profile"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Profile & Password</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
