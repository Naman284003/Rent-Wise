import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatDateIN } from '../../utils/formatters.js';
import { Wrench } from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints', { params: { status: statusFilter } });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load platform complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            All Maintenance Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor repair tickets and resolution progress across all landlords and properties.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={5} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests found"
          description="No requests match your selected status filter."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800">
          {complaints.map((ticket) => (
            <div key={ticket._id} className="p-5 space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {ticket.title}
                </h3>
                <Badge status={ticket.status} />
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <Badge status={ticket.priority} />
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-medium text-slate-500 capitalize">
                  {ticket.category}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  {ticket.property?.name} (Flat {ticket.room?.roomNumber})
                </span>
                <span>·</span>
                <span>Tenant: {ticket.tenant?.name}</span>
                <span>·</span>
                <span className="tabular-nums">Logged {formatDateIN(ticket.createdAt)}</span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {ticket.description}
              </p>

              {ticket.resolutionNotes && (
                <div className="pl-3 border-l-2 border-emerald-600 dark:border-emerald-500 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Resolution: </span>
                  {ticket.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
