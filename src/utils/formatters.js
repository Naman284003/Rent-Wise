/**
 * Indian Currency & Date Formatting Helpers
 * Uses Indian numbering system (Lakhs / Crores, e.g. ₹1,25,000)
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount) {
  const num = Number(amount || 0);
  if (Number.isNaN(num)) return '₹0';
  return inrFormatter.format(num);
}

export function formatINRCompact(amount) {
  const num = Number(amount || 0);
  if (Number.isNaN(num)) return '₹0';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return inrFormatter.format(num);
}

export function formatDateIN(dateValue) {
  if (!dateValue) return '—';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const METHOD_LABELS = {
  upi: 'UPI',
  neft_imps: 'NEFT / IMPS',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  check: 'Cheque',
  cash: 'Cash',
  card: 'Card',
  credit_card: 'Card',
  other: 'Other',
};

export function formatPaymentMethod(method) {
  if (!method) return '—';
  return METHOD_LABELS[method] || method.replace('_', ' ');
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatBillingPeriod(month, year) {
  const m = Number(month);
  if (m >= 1 && m <= 12) {
    return `${MONTH_NAMES[m - 1].slice(0, 3)} ${year}`;
  }
  return `${month}/${year}`;
}
