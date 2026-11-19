import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import { formatINR, formatINRCompact, formatDateIN } from '../../utils/formatters.js';
import { Building2, UserCheck, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
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
    totalLandlords = 0,
    totalTenants = 0,
    activeUsers = 0,
    deactivatedUsers = 0,
    totalProperties = 0,
    totalRooms = 0,
    occupiedRooms = 0,
    vacantRooms = 0,
    occupancyRate = 0,
    totalPlatformVolume = 0,
    totalComplaints = 0,
    openComplaints = 0,
    recentUsers = [],
    propertyDistribution = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Admin Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform-wide landlords, tenants, properties, rent volume, and maintenance requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/users"
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/properties"
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>All Properties</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Users"
          value={activeUsers + deactivatedUsers}
          subValue={`${totalLandlords} landlords · ${totalTenants} tenants`}
        />

        <StatCard
          title="Properties & Flats"
          value={totalProperties}
          subValue={`${occupiedRooms}/${totalRooms} flats occupied (${occupancyRate}%)`}
        />

        <StatCard
          title="Rent Recorded"
          value={formatINRCompact(totalPlatformVolume)}
          subValue={`${formatINR(totalPlatformVolume)} total receipts`}
          tone="positive"
        />

        <StatCard
          title="Maintenance Tickets"
          value={totalComplaints}
          subValue={`${openComplaints} open · ${vacantRooms} vacant flats`}
          tone={openComplaints > 0 ? 'warning' : 'positive'}
        />
      </div>

      {/* Chart + Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Properties by Type
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution across residential buildings, apartments, villas, and studios
              </p>
            </div>
            <Link
              to="/admin/properties"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} properties`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Account Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
              Active accounts and role breakdown
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Active Accounts</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{activeUsers}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Deactivated Accounts</span>
                <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">{deactivatedUsers}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Registered Landlords</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalLandlords}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Registered Tenants</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalTenants}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link
              to="/admin/users"
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open User Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Recent User Accounts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest landlords and tenants added to RentWise
            </p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>All Users</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={u.role} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 tabular-nums">
                    {u.phone || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold ${
                        u.isActive !== false
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {u.isActive !== false ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-500">
                    {formatDateIN(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
