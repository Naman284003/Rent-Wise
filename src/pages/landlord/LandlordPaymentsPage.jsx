import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatINR, formatDateIN, formatPaymentMethod } from '../../utils/formatters.js';
import { Receipt, Search, Printer, CheckCircle2 } from 'lucide-react';

export default function LandlordPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments', { params: { search } });
      if (res.data.success) {
        setPayments(res.data.payments);
        setTotalCollected(res.data.totalCollected || 0);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Payment Receipts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verified record of all UPI, NEFT/IMPS, bank transfer, cheque, and cash collections.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-baseline gap-3 self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Collected
          </span>
          <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatINR(totalCollected)}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search UTR / ref no., tenant, or property..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payment receipts found"
          description="Recorded rent payments will appear here with reference numbers and printable receipts."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Reference / UTR</th>
                  <th className="px-5 py-3 font-semibold">Tenant</th>
                  <th className="px-5 py-3 font-semibold">Property & Flat</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold">Mode</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Recorded By</th>
                  <th className="px-5 py-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {p.referenceNumber || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.tenant?.name || 'Tenant'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.tenant?.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {p.property?.name || 'Property'}
                      </div>
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                        Flat {p.room?.roomNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {formatPaymentMethod(p.paymentMethod)}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                      {formatDateIN(p.paymentDate)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {p.recordedBy?.name || 'Landlord'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(p)}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="RentWise Rent Receipt"
        subtitle={`Reference: ${selectedReceipt?.referenceNumber}`}
        maxWidth="max-w-md"
      >
        {selectedReceipt && (
          <div className="space-y-5">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment Verified</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1.5">
                {formatINR(selectedReceipt.amount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Received on {formatDateIN(selectedReceipt.paymentDate)}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Tenant</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedReceipt.tenant?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Property</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedReceipt.property?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Flat / Room</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Flat {selectedReceipt.room?.roomNumber}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Payment Mode</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatPaymentMethod(selectedReceipt.paymentMethod)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Reference / UTR</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Verified By</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedReceipt.recordedBy?.name || 'Landlord'}</span>
              </div>
              {selectedReceipt.notes && (
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-slate-500 shrink-0">Notes</span>
                  <span className="text-slate-700 dark:text-slate-300 text-right">{selectedReceipt.notes}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
