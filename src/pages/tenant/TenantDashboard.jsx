import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatINR, formatDateIN, formatBillingPeriod } from '../../utils/formatters.js';
import { Home, Receipt, Wrench, CheckCircle2, Phone, Mail, ArrowRight } from 'lucide-react';

export default function TenantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load tenant dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader rows={2} />
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  const {
    activeLease,
    totalPendingBalance = 0,
    totalPaid = 0,
    currentBill,
    openComplaintsCount = 0,
    recentComplaints = [],
  } = data || {};

  if (!activeLease) {
    return (
      <EmptyState
        icon={Home}
        title="No active flat assignment yet"
        description="Your account does not have an active Leave & License agreement yet. Once your landlord assigns a flat to you, your rent details and receipts will show here."
      />
    );
  }

  const property = activeLease.property;
  const room = activeLease.room;
  const landlord = activeLease.landlord;

  const today = new Date();
  const leaseEnd = new Date(activeLease.leaseEnd);
  const diffDays = Math.ceil((leaseEnd - today) / (1000 * 60 * 60 * 24));
  const coverImage =
    (property?.images && property.images.length > 0 && property.images[0]) ||
    '/assets/images/indian_residency_hero_1795086777363.jpg';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Home & Rent
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {property?.name} · Flat {room?.roomNumber}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/tenant/payments"
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Rent & Receipts</span>
          </Link>
          <Link
            to="/tenant/complaints"
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Rent"
          value={formatINR(activeLease.monthlyRent)}
          subValue={`Due on ${activeLease.rentDueDate}th of every month`}
        />

        <StatCard
          title="Pending Balance"
          value={formatINR(totalPendingBalance)}
          subValue={totalPendingBalance > 0 ? 'Pay via UPI / NEFT to landlord' : 'All bills paid'}
          tone={totalPendingBalance > 0 ? 'warning' : 'positive'}
        />

        <StatCard
          title="Total Paid"
          value={formatINR(totalPaid)}
          subValue="Verified rent receipts"
          tone="positive"
        />

        <StatCard
          title="Agreement Remaining"
          value={`${diffDays > 0 ? diffDays : 0} Days`}
          subValue={`Ends ${formatDateIN(activeLease.leaseEnd)} · ${openComplaintsCount} open request${openComplaintsCount === 1 ? '' : 's'}`}
        />
      </div>

      {/* Assigned Residence Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 h-60 lg:h-auto relative bg-slate-100 dark:bg-slate-800">
          <img
            src={coverImage}
            alt={property?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900/85 text-white">
              Flat {room?.roomNumber} · Floor {room?.floor || 1}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Assigned Residence
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                  {property?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {property?.address}, {property?.city}, {property?.state} {property?.zipCode}
                </p>
              </div>
              <Badge status={activeLease.status} />
            </div>

            {room?.facilities && room.facilities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Flat Features
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {room.facilities.join(' · ')}
                </p>
              </div>
            )}

            {/* Landlord Contact */}
            <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Property Owner / Landlord
                </span>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {landlord?.name || 'Property Owner'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  {landlord?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {landlord.phone}
                    </span>
                  )}
                  {landlord?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {landlord.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-semibold flex items-center justify-center text-sm shrink-0">
                {landlord?.name ? landlord.name[0] : 'L'}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="tabular-nums">
              Agreement: {formatDateIN(activeLease.leaseStart)} to {formatDateIN(activeLease.leaseEnd)}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              Security Deposit: {formatINR(activeLease.depositPaid)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Bill & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Current Rent Bill
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest pending or upcoming billing cycle
              </p>
            </div>
            <Link
              to="/tenant/payments"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>All Receipts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {currentBill ? (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {formatBillingPeriod(currentBill.month, currentBill.year)}
                  </span>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    Due by {formatDateIN(currentBill.dueDate)}
                  </p>
                </div>
                <Badge status={currentBill.status} />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatINR(currentBill.rentAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Paid So Far</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatINR(currentBill.amountPaid || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200">Balance Due</span>
                <span className="text-rose-700 dark:text-rose-400 tabular-nums text-sm">
                  {formatINR(currentBill.balanceDue)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-7 h-7 text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                No Pending Dues
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All rent statements are settled up to date.
              </p>
            </div>
          )}
        </div>

        {/* Recent Maintenance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Maintenance Requests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recent repair requests shared with your landlord
              </p>
            </div>
            <Link
              to="/tenant/complaints"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>New Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentComplaints.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No maintenance requests filed yet.
              </div>
            ) : (
              recentComplaints.map((c) => (
                <div key={c._id} className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {c.title}
                    </span>
                    <Badge status={c.status} />
                  </div>
                  <p className="text-slate-500 line-clamp-1 text-xs">
                    {c.description}
                  </p>
                  {c.resolutionNotes && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Owner note: {c.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
