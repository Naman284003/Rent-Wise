import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import StatCard from '../../components/common/StatCard.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import { formatINR, formatINRCompact, formatDateIN, formatPaymentMethod } from '../../utils/formatters.js';
import { ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function LandlordDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load landlord dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader rows={1} />
          <SkeletonLoader rows={1} />
          <SkeletonLoader rows={1} />
          <SkeletonLoader rows={1} />
        </div>
        <SkeletonLoader rows={5} />
      </div>
    );
  }

  const {
    totalProperties = 0,
    totalRooms = 0,
    occupiedRooms = 0,
    vacantRooms = 0,
    maintenanceRooms = 0,
    occupancyRate = 0,
    monthlyRentCollected = 0,
    monthlyRentExpected = 0,
    monthlyRentPending = 0,
    openComplaints = 0,
    recentPayments = [],
    revenueTrend = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monthly rent summary, flat occupancy, and recent receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/landlord/properties"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors whitespace-nowrap"
          >
            Add Property
          </Link>
          <Link
            to="/landlord/tenants"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-md transition-colors whitespace-nowrap"
          >
            Assign Tenant
          </Link>
          <Link
            to="/landlord/rent"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-md transition-colors whitespace-nowrap"
          >
            Record Payment
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy"
          value={`${occupancyRate}%`}
          subValue={`${occupiedRooms}/${totalRooms} flats`}
          trendLabel={`${vacantRooms} vacant · ${maintenanceRooms} in repair`}
        />

        <StatCard
          title="Properties"
          value={totalProperties}
          subValue="Buildings"
          trendLabel={`${totalRooms} total flats listed`}
        />

        <StatCard
          title="Rent Collected (This Month)"
          value={formatINR(monthlyRentCollected)}
          trendLabel={`Out of ${formatINR(monthlyRentExpected)} billed`}
        />

        <StatCard
          title="Pending Dues"
          value={formatINR(monthlyRentPending)}
          trendLabel={`${openComplaints} open maintenance requests`}
        />
      </div>

      {/* Chart + Flat Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                Monthly Rent Collection (INR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expected rent vs verified payments received
              </p>
            </div>
            <Link
              to="/landlord/rent"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Rent Register</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.18} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatINRCompact(val)}
                />
                <Tooltip
                  formatter={(value) => [formatINR(value), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="expected" name="Billed Rent" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#0f766e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
              Flat Availability
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
              Status across {totalRooms} flats
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Occupied Flats</span>
                <span className="font-mono font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                  {occupiedRooms} ({totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%)
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Vacant (Ready to Let)</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {vacantRooms} ({totalRooms > 0 ? Math.round((vacantRooms / totalRooms) * 100) : 0}%)
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Under Maintenance</span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                  {maintenanceRooms}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Open Repair Tickets</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {openComplaints}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/landlord/rooms"
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage All Flats</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Verified Receipts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
              Recent Payment Receipts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest verified rent payments logged
            </p>
          </div>
          <Link
            to="/landlord/payments"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            <span>All Receipts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Receipt Ref</th>
                <th className="px-5 py-3 font-semibold">Tenant</th>
                <th className="px-5 py-3 font-semibold">Building & Flat</th>
                <th className="px-5 py-3 font-semibold text-right">Amount</th>
                <th className="px-5 py-3 font-semibold">Mode</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No rent payments recorded yet.
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {p.referenceNumber || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.tenant?.name || 'Tenant'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.tenant?.email}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-800 dark:text-slate-200">{p.property?.name || 'Property'}</div>
                      <div className="text-[11px] text-slate-500">Flat {p.room?.roomNumber || '—'}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {formatPaymentMethod(p.paymentMethod)}
                    </td>
                    <td className="px-5 py-3 text-slate-500 tabular-nums">
                      {formatDateIN(p.paymentDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
