import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatDateIN } from '../../utils/formatters.js';
import { UserCheck, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [toggleUser, setToggleUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: { search, role: roleFilter, status: statusFilter },
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.total || res.data.users.length);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async () => {
    if (!toggleUser) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/users/${toggleUser._id}/toggle-status`);
      if (res.data.success) {
        toast.success(res.data.message || 'Account status updated.');
        setToggleUser(null);
        fetchUsers();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Users Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View all landlords, tenants, and administrators and control account access.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
          {total} total account{total === 1 ? '' : 's'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or phone..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="landlord">Landlords</option>
              <option value="tenant">Tenants</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No matching users"
          description="Try clearing your search or changing the role filter."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Emergency Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center text-[11px] shrink-0">
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge status={u.role} />
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 tabular-nums">
                        {u.phone || '—'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 max-w-[180px] truncate">
                        {u.emergencyContact || '—'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold ${
                            isActive
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 tabular-nums text-slate-500">
                        {formatDateIN(u.createdAt)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setToggleUser(u)}
                          className={`text-xs font-semibold hover:underline cursor-pointer ${
                            isActive
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!toggleUser}
        onClose={() => setToggleUser(null)}
        onConfirm={handleToggleStatus}
        title={toggleUser?.isActive !== false ? 'Deactivate Account?' : 'Reactivate Account?'}
        message={
          toggleUser?.isActive !== false
            ? `Deactivating ${toggleUser?.name} will immediately prevent them from signing in.`
            : `Reactivating ${toggleUser?.name} will restore their login access.`
        }
        confirmText={toggleUser?.isActive !== false ? 'Deactivate' : 'Activate'}
        isDestructive={toggleUser?.isActive !== false}
        loading={submitting}
      />
    </div>
  );
}
