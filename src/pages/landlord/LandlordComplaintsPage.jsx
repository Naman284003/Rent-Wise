import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatDateIN } from '../../utils/formatters.js';
import { Wrench } from 'lucide-react';

export default function LandlordComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints', {
        params: { status: statusFilter, priority: priorityFilter },
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status || 'in_progress');
    setResolutionNotes(ticket.resolutionNotes || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmitting(true);
    try {
      const res = await api.patch(`/complaints/${selectedTicket._id}/status`, {
        status: newStatus,
        resolutionNotes,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Maintenance request updated.');
        setIsModalOpen(false);
        fetchComplaints();
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
            Maintenance Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review repair requests from your tenants, assign technicians, and log resolution notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests found"
          description="No tenant repair complaints match your selected filters."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800">
          {complaints.map((ticket) => (
            <div key={ticket._id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {ticket.title}
                    </h3>
                    <Badge status={ticket.status} />
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <Badge status={ticket.priority} />
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                      {ticket.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {ticket.tenant?.name || 'Tenant'} ({ticket.tenant?.phone || 'No phone'})
                    </span>
                    <span>·</span>
                    <span>
                      {ticket.property?.name || 'Property'}, Flat {ticket.room?.roomNumber || 'N/A'}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">
                      Logged {formatDateIN(ticket.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openUpdateModal(ticket)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer self-start shrink-0"
                >
                  Update Status
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {ticket.description}
              </p>

              {ticket.resolutionNotes && (
                <div className="mt-3 pl-3 border-l-2 border-emerald-600 dark:border-emerald-500 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Technician / Owner Note: </span>
                  {ticket.resolutionNotes}
                  {ticket.resolvedAt && (
                    <span className="text-[11px] text-slate-500 block mt-0.5 tabular-nums">
                      Resolved on {formatDateIN(ticket.resolvedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Maintenance Request"
        subtitle={selectedTicket ? selectedTicket.title : ''}
        maxWidth="max-w-md"
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="open">Open (Awaiting Inspection)</option>
                <option value="in_progress">In Progress (Technician Assigned)</option>
                <option value="resolved">Resolved (Work Completed)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resolution / Technician Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Society plumber Ramesh inspected and replaced the inlet valve..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Update'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
