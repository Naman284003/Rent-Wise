import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activePortal, setActivePortal] = useState('landlord');

  const handleDemoAccess = async (role) => {
    await quickDemoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'landlord') navigate('/landlord');
    else if (role === 'tenant') navigate('/tenant');
  };

  const portalDetails = {
    landlord: {
      heading: 'Built for flat owners and property managers',
      summary: 'Keep every building, flat, leave-and-license agreement, and monthly rent receipt organized without messy notebooks or spreadsheets.',
      items: [
        { title: '01. Properties & Flats', text: 'List societies, flat numbers, floor details, monthly rent in rupees, and security deposits with live vacant or occupied status.' },
        { title: '02. Tenant Agreements', text: 'Assign verified tenants only to vacant flats, set monthly due dates, and automatically update room occupancy when a tenant moves out.' },
        { title: '03. Rent Register & Receipts', text: 'Generate monthly rent entries, log partial or full UPI / NEFT / cheque payments, and share printable receipts.' },
      ],
    },
    tenant: {
      heading: 'Clear visibility for every resident',
      summary: 'Tenants can check their lease dates, monthly rent dues, past receipts, and raise home maintenance requests directly with the owner.',
      items: [
        { title: '01. Home & Lease Summary', text: 'View flat specifications, security deposit held, agreement end date, and landlord contact details anytime.' },
        { title: '02. Rupee Statements & Receipts', text: 'Track paid, partial, or pending rent bills and print verified digital receipts for HRA tax claims.' },
        { title: '03. Maintenance Requests', text: 'Report plumbing, geyser, AC, or electrical issues with priority levels and follow repair status updates.' },
      ],
    },
    admin: {
      heading: 'Simple platform oversight for administrators',
      summary: 'View registered landlords, tenants, properties, total collected rent volume, and open repair tickets across the entire system.',
      items: [
        { title: '01. Account Controls', text: 'Search landlords and tenants across cities and activate or deactivate user access with a single click.' },
        { title: '02. Portfolio Summary', text: 'Monitor total properties, occupied vs vacant flats, and aggregate rental collection in Indian rupees.' },
        { title: '03. Maintenance Audit', text: 'Review unresolved maintenance complaints across all buildings to ensure timely resolution.' },
      ],
    },
  };

  const currentPortal = portalDetails[activePortal];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar: 3 clean zones */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <Link to="/" className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
            RentWise
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#workflow" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              How it works
            </a>
            <a href="#portals" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Portals
            </a>
            <a href="#residences" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Properties
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-md transition-colors cursor-pointer"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'landlord' ? '/landlord' : '/tenant'}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Open Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-16 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              Pune · Bengaluru · Mumbai · Gurugram · Chennai · Hyderabad
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.12] text-balance">
              Simple rent and tenant management for Indian homes.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              RentWise keeps your properties, flats, tenant agreements, monthly rupee rent records, and maintenance requests in one clear register.
            </p>

            {/* Primary Action + Quick Role Demos */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoAccess('landlord')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Try Landlord Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-md transition-colors whitespace-nowrap"
                >
                  Create Account
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Or jump directly into:</span>
                <button
                  type="button"
                  onClick={() => handleDemoAccess('tenant')}
                  className="font-semibold text-slate-800 dark:text-slate-200 underline underline-offset-4 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                >
                  Tenant View (Aarav Sharma)
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => handleDemoAccess('admin')}
                  className="font-semibold text-slate-800 dark:text-slate-200 underline underline-offset-4 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                >
                  Admin View (Rajeshwari Kulkarni)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <img
                src="/assets/images/indian_residency_hero_1795086777363.jpg"
                alt="Shanti Niketan Residency apartment building in Pune"
                referrerPolicy="no-referrer"
                className="w-full h-72 lg:h-full object-cover min-h-[320px]"
              />
            </div>
          </div>
        </div>

        {/* Full-width summary metrics strip below hero split */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Sample Properties</div>
            <div className="mt-1 text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-slate-100">7 Buildings</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Managed Units</div>
            <div className="mt-1 text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-slate-100">15 Flats</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Currency & Numbering</div>
            <div className="mt-1 text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-slate-100">₹ INR (Lakhs)</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Payment Tracking</div>
            <div className="mt-1 text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-slate-100">UPI · NEFT · Cheque</div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Workflow (Easy to explain!) */}
      <section id="workflow" className="py-16 px-6 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              How RentWise works in 3 simple steps
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Every action follows a straightforward flow from adding a building to collecting monthly rent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">Step 01</div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Add properties and flats
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Register each building with city and pin code, then add flat numbers along with monthly rent, deposit, and amenities.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">Step 02</div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Assign tenants to vacant units
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Link a tenant to an available flat with agreement start/end dates. The system automatically marks the flat as occupied and starts monthly rent tracking.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">Step 03</div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Record payments & resolve repairs
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Log UPI, NEFT, or cheque receipts against monthly bills, check pending dues in rupees, and track tenant maintenance tickets to closure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals */}
      <section id="portals" className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Three focused workspaces
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Each user only sees the records that belong to their role.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-md self-start">
            {[
              { id: 'landlord', label: 'Landlord' },
              { id: 'tenant', label: 'Tenant' },
              { id: 'admin', label: 'Admin' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePortal(tab.id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  activePortal === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentPortal.heading}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                {currentPortal.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDemoAccess(activePortal)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              Open {activePortal.charAt(0).toUpperCase() + activePortal.slice(1)} View
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {currentPortal.items.map((item) => (
              <div key={item.title} className="space-y-1.5">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sample Properties */}
      <section id="residences" className="pb-20 px-6 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sample residences in the register
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pre-loaded with realistic flats, tenants, rent history, and repair tickets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <img
              src="/assets/images/bengaluru_courtyard_homes_1795086774452.jpg"
              alt="Indiranagar Courtyard Homes in Bengaluru"
              referrerPolicy="no-referrer"
              className="w-full h-56 object-cover"
            />
            <div className="p-5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Bengaluru, Karnataka · 3 Flats
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Indiranagar Courtyard Homes
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                12th Main, HAL 2nd Stage, Indiranagar — 560038
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  ₹36,000 – ₹42,000 / mo
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  1 Vacant Flat
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <img
              src="/assets/images/mumbai_living_interior_1795086776293.jpg"
              alt="Pali Crest Apartments in Bandra West Mumbai"
              referrerPolicy="no-referrer"
              className="w-full h-56 object-cover"
            />
            <div className="p-5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Mumbai, Maharashtra · 2 Flats
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Pali Crest Apartments
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                14th Road, Pali Hill, Bandra West — 400050
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  ₹65,000 – ₹72,000 / mo
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  1 Vacant Flat
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-display font-bold text-slate-900 dark:text-slate-100">RentWise</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Rental Property & Tenant Management</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-slate-100">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-slate-900 dark:hover:text-slate-100">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
