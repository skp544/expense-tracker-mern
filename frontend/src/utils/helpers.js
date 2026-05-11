export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const getMonthName = (month) => {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
};

export const maskCardNumber = (num) => {
  const cleaned = num.replace(/\s/g, '');
  return `•••• •••• •••• ${cleaned.slice(-4)}`;
};

export const getCardBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6/.test(n)) return 'Discover';
  return 'Other';
};

export const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Investments', 'EMI', 'Others'];
export const INCOME_SOURCES = ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Gift', 'Bonus', 'Other'];
export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Credit Card (UPI)', 'Net Banking', 'Wallet', 'Other'];
export const PAYMENT_ACCOUNT_TYPES = ['UPI', 'Credit Card (UPI)', 'Debit Card', 'Net Banking', 'Wallet'];
export const PAYMENT_ACCOUNT_COLORS = {
  'UPI': '#8b5cf6',
  'Credit Card (UPI)': '#6366f1',
  'Debit Card': '#3b82f6',
  'Net Banking': '#10b981',
  'Wallet': '#f59e0b',
};
export const ACCOUNT_COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b',
];
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'];

export const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Education: '#06b6d4',
  Investments: '#6366f1',
  EMI: '#f97316',
  Others: '#6b7280',
};

export const CATEGORY_ICONS = {
  Food: '🍽️',
  Travel: '✈️',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Education: '📚',
  Investments: '📈',
  EMI: '🏦',
  Others: '📦',
};

export const SOURCE_COLORS = {
  Salary: '#6366f1',
  Freelance: '#10b981',
  Investment: '#f59e0b',
  Business: '#3b82f6',
  Rental: '#ec4899',
  Gift: '#8b5cf6',
  Bonus: '#06b6d4',
  Other: '#6b7280',
};

export const CARD_GRADIENTS = [
  { label: 'Indigo', value: 'from-violet-600 to-indigo-800' },
  { label: 'Emerald', value: 'from-emerald-500 to-teal-700' },
  { label: 'Amber', value: 'from-amber-500 to-orange-600' },
  { label: 'Rose', value: 'from-rose-500 to-pink-700' },
  { label: 'Sky', value: 'from-sky-500 to-blue-700' },
  { label: 'Slate', value: 'from-slate-600 to-slate-800' },
];

export const truncate = (str, n = 24) => str?.length > n ? str.slice(0, n) + '…' : str;

export const getPercentChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
