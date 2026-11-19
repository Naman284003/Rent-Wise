import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatINR, formatDateIN, formatBillingPeriod } from '../../utils/formatters.js';
import { CreditCard, Search, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RentManagementPage() {
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState({ totalRentExpected: 0, totalRentCollected: 0, totalRentPending: 0 });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentDate, setPaymentDate] = useState(now.toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchRentData = async () => {
    try {
      setLoading(true);
      const [recordsRes, propsRes] = await Promise.all([
        api.get('/rent-records', {
          params: {
            month: selectedMonth,
            year: selectedYear,
            status: statusFilter,
            propertyId: propertyFilter,
            search,
          },
        }),
        api.get('/properties'),
      ]);

      if (recordsRes.data.success) {
        setRecords(recordsRes.data.records);
        if (recordsRes.data.metrics) {
          setMetrics(recordsRes.data.metrics);
        }
      }
      if (propsRes.data.success) {
        setProperties(propsRes.data.properties);
      }
    } catch (err) {
      console.error('Failed to load rent records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentData();
  }, [selectedMonth, selectedYear, statusFilter, propertyFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRentData();
  };

  const handleGenerateInvoices = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/rent-records/generate', {
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Monthly rent bills generated.');
        fetchRentData();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setGenerating(false);
    }
  };

  const openPaymentModal = (record) => {
    setActiveRecord(record);
    const balance = record.balanceDue !== undefined ? record.balanceDue : (record.rentAmount - record.amountPaid);
    setPaymentAmount(String(balance));
    setPaymentMethod('upi');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReferenceNumber(`RW-${Date.now().toString().slice(-6)}`);
    setPaymentNotes(`Rent payment for ${record.property?.name || 'flat'} (${formatBillingPeriod(record.month, record.year)})`);
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!activeRecord) return;

    const amountNum = Number(paymentAmount);
    const balance = activeRecord.balanceDue !== undefined ? activeRecord.balanceDue : (activeRecord.rentAmount - activeRecord.amountPaid);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    if (amountNum > balance) {
      toast.error(`Amount (${formatINR(amountNum)}) cannot exceed balance due (${formatINR(balance)}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rentRecordId: activeRecord._id,
        amount: amountNum,
        paymentMethod,
        paymentDate,
        referenceNumber,
        notes: paymentNotes,
      };

      const res = await api.post('/payments', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Payment recorded.');
        setIsPayModalOpen(false);
        fetchRentData();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const months = [
    { num: '1', name: 'January' },
    { num: '2', name: 'February' },
    { num: '3', name: 'March' },
    { num: '4', name: 'April' },
    { num: '5', name: 'May' },
    { num: '6', name: 'June' },
    { num: '7', name: 'July' },
    { num: '8', name: 'August' },
    { num: '9', name: 'September' },
    { num: '10', name: 'October' },
    { num: '11', name: 'November' },
    { num: '12', name: 'December' },
  ];

  const collectionRate = metrics.totalRentExpected > 0
    ? Math.round((metrics.totalRentCollected / metrics.totalRentExpected) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Rent Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate monthly rent bills, track partial or full collections, and issue verified receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateInvoices}
          disabled={generating}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : `Generate Bills (${formatBillingPeriod(selectedMonth, selectedYear)})`}</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed"
          value={formatINR(metrics.totalRentExpected)}
          subValue={`For ${formatBillingPeriod(selectedMonth, selectedYear)}`}
        />
        <StatCard
          title="Collected"
          value={formatINR(metrics.totalRentCollected)}
          subValue={`${collectionRate}% received`}
          tone="positive"
        />
        <StatCard
          title="Pending Balance"
          value={formatINR(metrics.totalRentPending)}
          subValue={metrics.totalRentPending > 0 ? 'Remaining receivables' : 'All dues settled'}
          tone={metrics.totalRentPending > 0 ? 'warning' : 'positive'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant, property, or flat..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Property:</span>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No rent bills for this month"
          description={`No rent records exist for ${formatBillingPeriod(selectedMonth, selectedYear)} matching your filters. Generate bills for all active tenant agreements.`}
          actionLabel={`Generate Bills for ${formatBillingPeriod(selectedMonth, selectedYear)}`}
          onAction={handleGenerateInvoices}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tenant</th>
                  <th className="px-5 py-3 font-semibold">Property & Flat</th>
                  <th className="px-5 py-3 font-semibold">Billing Month</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Rent</th>
                  <th className="px-5 py-3 font-semibold text-right">Paid</th>
                  <th className="px-5 py-3 font-semibold text-right">Balance</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((rec) => {
                  const balance = rec.balanceDue !== undefined ? rec.balanceDue : (rec.rentAmount - rec.amountPaid);
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {rec.tenant?.name || 'Tenant'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {rec.tenant?.email}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {rec.property?.name || 'Property'}
                        </div>
                        <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                          Flat {rec.room?.roomNumber || 'N/A'}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {formatBillingPeriod(rec.month, rec.year)}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 tabular-nums">
                        {formatDateIN(rec.dueDate)}
                      </td>

                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatINR(rec.rentAmount)}
                      </td>

                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatINR(rec.amountPaid)}
                      </td>

                      <td className={`px-5 py-3.5 text-right font-bold tabular-nums ${balance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-400'}`}>
                        {formatINR(balance)}
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge status={rec.status} />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {balance > 0 ? (
                          <button
                            type="button"
                            onClick={() => openPaymentModal(rec)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Rent Payment"
        subtitle={activeRecord ? `${activeRecord.tenant?.name} · Flat ${activeRecord.room?.roomNumber}` : ''}
        maxWidth="max-w-lg"
      >
        {activeRecord && (
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatINR(activeRecord.rentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid So Far</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatINR(activeRecord.amountPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-slate-700 dark:text-slate-200">Balance Due</span>
                <span className="text-rose-700 dark:text-rose-400 tabular-nums">
                  {formatINR(activeRecord.balanceDue)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Received (₹) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max={activeRecord.balanceDue}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-base tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Enter full balance or a partial instalment (₹1 to {formatINR(activeRecord.balanceDue)}).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="neft_imps">NEFT / IMPS</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                  <option value="card">Debit / Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UTR / Reference No. *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UPI-4309128"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Note
              </label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Bank name, cheque number, or UPI remark..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : `Record ${formatINR(Number(paymentAmount) || 0)}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
