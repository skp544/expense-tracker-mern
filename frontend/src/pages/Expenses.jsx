import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Trash2, Edit2, Receipt, X, Upload } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateInput, EXPENSE_CATEGORIES, PAYMENT_METHODS, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { SkeletonRow } from '../components/ui/Skeleton';

const defaultValues = { title: '', amount: '', category: 'Food', date: formatDateInput(new Date()), paymentMethod: 'Cash', notes: '', tags: '', location: '', isRecurring: false };

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All', sortBy: 'date', order: 'desc' });
  const [cards, setCards] = useState([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      if (filters.category === 'All') delete params.category;
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { api.get('/cards').then(r => setCards(r.data.data)).catch(() => {}); }, []);

  const openAdd = () => { setEditExpense(null); reset(defaultValues); setModalOpen(true); };
  const openEdit = (e) => {
    setEditExpense(e);
    reset({ ...e, date: formatDateInput(e.date), tags: e.tags?.join(', ') || '', amount: e.amount.toString() });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData, amount: Number(formData.amount), tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [] };
      if (editExpense) {
        const { data } = await api.put(`/expenses/${editExpense._id}`, payload);
        setExpenses(prev => prev.map(e => e._id === editExpense._id ? data.data : e));
        toast.success('Expense updated');
      } else {
        const { data } = await api.post('/expenses', payload);
        setExpenses(prev => [data.data, ...prev]);
        setTotal(t => t + 1);
        toast.success('Expense added');
      }
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/expenses/${deleteId}`);
      setExpenses(prev => prev.filter(e => e._id !== deleteId));
      setTotal(t => t - 1);
      toast.success('Expense deleted');
      setDeleteId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-slate-500 text-sm mt-1">{total} transactions · {formatCurrency(totalAmount, user?.currency)} this view</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.category}
              onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
              className="input-field w-36"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
              className="input-field w-32"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button
              onClick={() => setFilters(f => ({ ...f, order: f.order === 'desc' ? 'asc' : 'desc' }))}
              className="btn-secondary px-3 py-2 text-xs"
            >
              {filters.order === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div>{Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses found"
            description="Add your first expense to start tracking your spending."
            action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={15} />Add Expense</button>}
          />
        ) : (
          <AnimatePresence>
            {expenses.map((expense, i) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[expense.category]}20` }}>
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{expense.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 text-xs">{formatDate(expense.date)}</span>
                    <span className="text-slate-700">·</span>
                    <span className="badge text-xs" style={{ background: `${CATEGORY_COLORS[expense.category]}15`, color: CATEGORY_COLORS[expense.category] }}>
                      {expense.category}
                    </span>
                    {expense.paymentMethod !== 'Cash' && (
                      <span className="badge bg-white/5 text-slate-500 text-xs">{expense.paymentMethod}</span>
                    )}
                    {expense.isRecurring && <span className="badge bg-brand-500/10 text-brand-400 text-xs">Recurring</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-red-400 font-semibold">{formatCurrency(expense.amount, user?.currency)}</p>
                  {expense.notes && <p className="text-slate-600 text-xs truncate max-w-24">{expense.notes}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(expense)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(expense._id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editExpense ? 'Edit Expense' : 'Add Expense'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label mb-1.5 block">Title *</label>
              <input {...register('title', { required: 'Title is required' })} placeholder="e.g. Grocery Shopping" className="input-field" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label mb-1.5 block">Amount *</label>
              <input {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} type="number" step="0.01" placeholder="0.00" className="input-field" />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="label mb-1.5 block">Date *</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Category *</label>
              <select {...register('category')} className="input-field">
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Payment Method</label>
              <select {...register('paymentMethod')} className="input-field">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {cards.length > 0 && (
              <div>
                <label className="label mb-1.5 block">Credit Card</label>
                <select {...register('card')} className="input-field">
                  <option value="">None</option>
                  {cards.map(c => <option key={c._id} value={c._id}>{c.bankName} ••{c.cardNumber.slice(-4)}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label mb-1.5 block">Location</label>
              <input {...register('location')} placeholder="Optional" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label mb-1.5 block">Notes</label>
              <textarea {...register('notes')} rows={2} placeholder="Optional notes..." className="input-field resize-none" />
            </div>
            <div className="col-span-2">
              <label className="label mb-1.5 block">Tags (comma separated)</label>
              <input {...register('tags')} placeholder="food, weekend, dinner" className="input-field" />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input {...register('isRecurring')} type="checkbox" id="recurring" className="w-4 h-4 rounded accent-brand-500" />
              <label htmlFor="recurring" className="text-slate-300 text-sm">Recurring expense</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editExpense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Expense"
        message="This action cannot be undone."
      />
    </div>
  );
}
