import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, PiggyBank, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, EXPENSE_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, getMonthName } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';

export default function Budget() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { category: 'Food', amount: '', alertAt: 80 }
  });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets', { params: { month, year } });
      setBudgets(data.data);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData, amount: Number(formData.amount), month, year };
      const { data } = await api.post('/budgets', payload);
      await fetchBudgets();
      toast.success('Budget set successfully');
      setModalOpen(false);
      reset();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to set budget'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/budgets/${deleteId}`);
      setBudgets(prev => prev.filter(b => b._id !== deleteId));
      toast.success('Budget removed');
      setDeleteId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.percentUsed > 100);
  const nearLimit = budgets.filter(b => b.percentUsed >= 80 && b.percentUsed <= 100);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Budget Planner</h1>
          <p className="text-slate-500 text-sm mt-1">Set and track monthly category budgets</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field w-36">
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-24">
            {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Set Budget
          </button>
        </div>
      </div>

      {(overBudget.length > 0 || nearLimit.length > 0) && (
        <div className="space-y-2">
          {overBudget.map(b => (
            <motion.div key={b._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm"><strong>{b.category}</strong> budget exceeded by {formatCurrency(b.spent - b.amount, user?.currency)}</p>
            </motion.div>
          ))}
          {nearLimit.map(b => (
            <motion.div key={b._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm"><strong>{b.category}</strong> at {b.percentUsed}% of budget</p>
            </motion.div>
          ))}
        </div>
      )}

      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card"><div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-600/5 rounded-2xl" /><div className="relative"><p className="label mb-1">Total Budget</p><p className="font-display text-2xl font-bold text-white">{formatCurrency(totalBudget, user?.currency)}</p></div></div>
          <div className="stat-card"><div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-rose-600/5 rounded-2xl" /><div className="relative"><p className="label mb-1">Total Spent</p><p className="font-display text-2xl font-bold text-red-400">{formatCurrency(totalSpent, user?.currency)}</p></div></div>
          <div className="stat-card"><div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 rounded-2xl" /><div className="relative"><p className="label mb-1">Remaining</p><p className={`font-display text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(Math.abs(totalBudget - totalSpent), user?.currency)}</p></div></div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">{getMonthName(month)} {year} Budgets</h3>
          <span className="text-slate-500 text-xs">{budgets.length} categories</span>
        </div>

        {loading ? (
          <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
        ) : budgets.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No budgets set" description={`Set category budgets for ${getMonthName(month)} ${year} to track your spending.`}
            action={<button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={15} />Set First Budget</button>} />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {budgets.map((b, i) => {
                const pct = Math.min(100, b.percentUsed);
                const isOver = b.percentUsed > 100;
                const isNear = b.percentUsed >= 80 && !isOver;
                return (
                  <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-dark rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${CATEGORY_COLORS[b.category]}20` }}>
                          {CATEGORY_ICONS[b.category]}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{b.category}</p>
                          <p className="text-slate-500 text-xs">
                            {formatCurrency(b.spent, user?.currency)} of {formatCurrency(b.amount, user?.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOver ? (
                          <span className="badge bg-red-500/10 text-red-400">Over by {formatCurrency(b.spent - b.amount, user?.currency)}</span>
                        ) : isNear ? (
                          <span className="badge bg-amber-500/10 text-amber-400">{b.percentUsed}%</span>
                        ) : (
                          <span className="badge bg-emerald-500/10 text-emerald-400"><CheckCircle size={10} />{b.percentUsed}%</span>
                        )}
                        <button onClick={() => setDeleteId(b._id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-slate-600 text-xs">0</span>
                      <span className="text-slate-500 text-xs">{formatCurrency(b.remaining >= 0 ? b.remaining : 0, user?.currency)} left</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Category Budget">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Category *</label>
            <select {...register('category')} className="input-field">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Monthly Budget Amount *</label>
            <input {...register('amount', { required: true, min: 1 })} type="number" step="0.01" placeholder="500" className="input-field" />
            {errors.amount && <p className="text-red-400 text-xs mt-1">Valid amount required</p>}
          </div>
          <div>
            <label className="label mb-1.5 block">Alert when reached (%)</label>
            <input {...register('alertAt')} type="number" min={1} max={100} className="input-field" />
            <p className="text-slate-500 text-xs mt-1">You'll be warned when spending reaches this threshold</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
              {saving ? 'Setting...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Remove Budget" message="Budget will be removed for this period." />
    </div>
  );
}
