import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, TrendingUp, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateInput, INCOME_SOURCES, SOURCE_COLORS } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { SkeletonRow, SkeletonCard } from '../components/ui/Skeleton';
import DonutChart from '../components/charts/DonutChart';

const sourceIcons = { Salary: '💼', Freelance: '💻', Investment: '📈', Business: '🏢', Rental: '🏠', Gift: '🎁', Bonus: '🎯', Other: '💰' };
const defaultValues = { title: '', amount: '', source: 'Salary', date: formatDateInput(new Date()), notes: '', isRecurring: false, recurringFrequency: null };

export default function Income() {
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, source: filter !== 'All' ? filter : undefined };
      const [r, s] = await Promise.all([api.get('/income', { params }), api.get('/income/stats')]);
      setIncome(r.data.data);
      setTotal(r.data.total);
      setPages(r.data.pages);
      setStats(s.data.data);
    } catch { toast.error('Failed to load income'); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchIncome(); }, [fetchIncome]);

  const openAdd = () => { setEditItem(null); reset(defaultValues); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    reset({ ...item, date: formatDateInput(item.date), amount: item.amount.toString() });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (editItem) {
        const { data } = await api.put(`/income/${editItem._id}`, payload);
        setIncome(prev => prev.map(i => i._id === editItem._id ? data.data : i));
        toast.success('Income updated');
      } else {
        const { data } = await api.post('/income', payload);
        setIncome(prev => [data.data, ...prev]);
        setTotal(t => t + 1);
        toast.success('Income added');
      }
      setModalOpen(false);
      fetchIncome();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/income/${deleteId}`);
      setIncome(prev => prev.filter(i => i._id !== deleteId));
      setTotal(t => t - 1);
      toast.success('Income deleted');
      setDeleteId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="text-slate-500 text-sm mt-1">{total} entries this period</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Add Income
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <div className="stat-card">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 rounded-2xl" />
              <div className="relative">
                <p className="label mb-2">Monthly Total</p>
                <p className="font-display text-2xl font-bold text-emerald-400">{formatCurrency(stats?.monthlyTotal || 0, user?.currency)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-600/5 rounded-2xl" />
              <div className="relative">
                <p className="label mb-2">Top Source</p>
                <p className="font-display text-2xl font-bold text-white">{stats?.sourceBreakdown?.[0]?._id || '—'}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-2xl" />
              <div className="relative">
                <p className="label mb-2">Total Entries</p>
                <p className="font-display text-2xl font-bold text-amber-400">{total}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="section-title">Income History</h3>
            <div className="flex gap-1">
              {['All', ...INCOME_SOURCES.slice(0, 4)].map(s => (
                <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />) : income.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No income yet" description="Start adding your income sources." action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={15} />Add Income</button>} />
          ) : (
            <AnimatePresence>
              {income.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${SOURCE_COLORS[item.source] || '#6b7280'}20` }}>
                    {sourceIcons[item.source] || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 text-xs">{formatDate(item.date)}</span>
                      <span className="badge text-xs" style={{ background: `${SOURCE_COLORS[item.source]}15`, color: SOURCE_COLORS[item.source] }}>{item.source}</span>
                      {item.isRecurring && <span className="badge bg-brand-500/10 text-brand-400 text-xs">Recurring</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-emerald-400 font-semibold flex items-center gap-1"><ArrowUpRight size={13} />{formatCurrency(item.amount, user?.currency)}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-white/5">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">By Source</h3>
          {!loading && stats?.sourceBreakdown?.length ? (
            <>
              <DonutChart data={stats.sourceBreakdown} colors={stats.sourceBreakdown.map(s => SOURCE_COLORS[s._id] || '#6b7280')} />
              <div className="space-y-2 mt-2">
                {stats.sourceBreakdown.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[s._id] || '#6b7280' }} />
                      <span className="text-slate-400 text-xs">{s._id}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{formatCurrency(s.total, user?.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Title *</label>
            <input {...register('title', { required: true })} placeholder="e.g. Monthly Salary" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1.5 block">Amount *</label>
              <input {...register('amount', { required: true, min: 0.01 })} type="number" step="0.01" placeholder="0.00" className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Date *</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Source *</label>
            <select {...register('source')} className="input-field">
              {INCOME_SOURCES.map(s => <option key={s} value={s}>{sourceIcons[s]} {s}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Notes</label>
            <textarea {...register('notes')} rows={2} placeholder="Optional notes..." className="input-field resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <input {...register('isRecurring')} type="checkbox" id="inc-recurring" className="w-4 h-4 accent-brand-500" />
            <label htmlFor="inc-recurring" className="text-slate-300 text-sm">Recurring income</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editItem ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Income" message="This cannot be undone." />
    </div>
  );
}
