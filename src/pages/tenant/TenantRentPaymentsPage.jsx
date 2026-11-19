import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import { formatINR, formatDateIN, formatPaymentMethod, formatBillingPeriod } from '../../utils/formatters.js';
import { CheckCircle2, Printer } from 'lucide-react';

export default function TenantRentPaymentsPage() {
  const [rentRecords, setRentRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recordsRes, paymentsRes] = await Promise.all([
          api.get('/rent-records'),
          api.get('/payments'),
        ]);

        if (recordsRes.data.success) {
          setRentRecords(recordsRes.data.records);
        }
        if (paymentsRes.data.success) {
          setPayments(paymentsRes.data.payments);
        }
      } catch (err) {
        console.error('Failed to load tenant rent records:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader rows={4} />
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Rent Bills & Receipts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monthly rent statements and verified digital receipts issued by your landlord.
        </p>
      </div>

      {/* Monthly Statements */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Monthly Rent Bills
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rent cycles generated for your flat
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Month</th>
                <th className="px-5 py-3 font-semibold">Property & Flat</th>
                <th className="px-5 py-3 font-semibold">Due Date</th>
                <th className="px-5 py-3 font-semibold text-right">Rent</th>
                <th className="px-5 py-3 font-semibold text-right">Paid</th>
                <th className="px-5 py-3 font-semibold text-right">Balance</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No rent bills issued yet.
                  </td>
                </tr>
              ) : (
                rentRecords.map((r) => {
                  const balance = r.balanceDue !== undefined ? r.balanceDue : (r.rentAmount - r.amountPaid);
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {formatBillingPeriod(r.month, r.year)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {r.property?.name}
                        </div>
                        <div className="text-[11px] text-teal-700 dark:text-teal-400">
                          Flat {r.room?.roomNumber}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 tabular-nums">
                        {formatDateIN(r.dueDate)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatINR(r.rentAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatINR(r.amountPaid)}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-bold tabular-nums ${balance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-400'}`}>
                        {formatINR(balance)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={r.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Receipts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Payment Receipts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Receipts useful for HRA tax claims and personal records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Reference / UTR</th>
                <th className="px-5 py-3 font-semibold">Property & Flat</th>
                <th className="px-5 py-3 font-semibold text-right">Amount Paid</th>
                <th className="px-5 py-3 font-semibold">Mode</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No receipts recorded yet. Payments recorded by your landlord will appear here.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {p.referenceNumber || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {p.property?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Flat {p.room?.roomNumber}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {formatPaymentMethod(p.paymentMethod)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDateIN(p.paymentDate)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                Date: {formatDateIN(selectedReceipt.paymentDate)}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
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
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Notes</span>
                <span className="text-slate-700 dark:text-slate-300 text-right">{selectedReceipt.notes || 'Verified rent receipt'}</span>
              </div>
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
