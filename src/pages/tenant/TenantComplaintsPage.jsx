import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatDateIN } from '../../utils/formatters.js';
import { Wrench, Plus } from 'lucide-react';

export default function TenantComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('plumbing');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
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
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/complaints', {
        title,
        category,
        priority,
        description,
      });

      if (res.data.success) {
        toast.success('Maintenance request sent to your landlord.');
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setCategory('plumbing');
        setPriority('medium');
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
            Report plumbing, electrical, appliance, or society repair issues directly to your landlord.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {loading ? (
        <SkeletonLoader rows={4} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests yet"
          description="Everything in your flat looks good. Raise a request if you need plumbing, electrical, or appliance repair."
          actionLabel="Raise Request"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800">
          {complaints.map((ticket) => (
            <div key={ticket._id} className="p-5 space-y-2.5">
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

              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  {ticket.property?.name || 'Property'}, Flat {ticket.room?.roomNumber}
                </span>
                <span>·</span>
                <span className="tabular-nums">
                  Logged on {formatDateIN(ticket.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {ticket.description}
              </p>

              {ticket.resolutionNotes && (
                <div className="pl-3 border-l-2 border-emerald-600 dark:border-emerald-500 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Owner / Technician Update: </span>
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

      {/* New Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Maintenance Request"
        subtitle="Your landlord will see this request immediately."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kitchen RO purifier leaking or geyser MCB tripping"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="plumbing">Plumbing & Water</option>
                <option value="electrical">Electrical & Power Backup</option>
                <option value="appliance">AC / Geyser / RO Appliance</option>
                <option value="carpentry">Carpentry & Door Locks</option>
                <option value="pest_control">Pest Control</option>
                <option value="cleanliness">Cleaning / Society Area</option>
                <option value="noise">Noise / Disturbance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Urgency *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (Leak / Power Fault)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Details *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share where the issue is, when it started, and preferred visiting time for the technician..."
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
              {submitting ? 'Sending...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
