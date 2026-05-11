import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, Edit2, ArrowLeftRight, ArrowRight, User } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateInput, TRANSFER_ELIGIBLE_TYPES, PAYMENT_ACCOUNT_COLORS } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { SkeletonRow } from '../components/ui/Skeleton';

const defaultValues = {
  toType: 'own_account',
  fromAccount: '',
  toAccount: '',
  toName: '',
  toAccountId: '',
  amount: '',
  date: formatDateInput(new Date()),
  reference: '',
  notes: '',
};

const getFromLabel = (t) =>
  t.fromAccount ? t.fromAccount.displayName : 'Cash';

const getToLabel = (t) =>
  t.toType === 'own_account'
    ? (t.toAccount?.displayName || 'Deleted Account')
    : t.toName;

const getFromColor = (t) =>
  t.fromAccount?.color || '#64748b';

export default function Transfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ monthlyTotal: 0, monthlyCount: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTransfer, setEditTransfer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [paymentAccounts, setPaymentAccounts] = useState([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ defaultValues });
  const watchedToType    = watch('toType');
  const watchedFromAcc   = watch('fromAccount');

  // eligible accounts (no credit cards)
  const eligibleAccounts = paymentAccounts.filter(a => TRANSFER_ELIGIBLE_TYPES.includes(a.type));

  // to-account list excludes whatever is selected as "from"
  const toAccountOptions = eligibleAccounts.filter(a => a._id !== watchedFromAcc);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sortBy: 'date', order: 'desc' };
      if (search) params.search = search;
      const { data } = await api.get('/transfers', { params });
      setTransfers(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load transfers'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);
  useEffect(() => {
    api.get('/payment-accounts').then(r => setPaymentAccounts(r.data.data)).catch(() => {});
    api.get('/transfers/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  // clear toAccount when toType switches
  useEffect(() => { setValue('toAccount', ''); setValue('toName', ''); setValue('toAccountId', ''); }, [watchedToType, setValue]);

  const openAdd = () => { setEditTransfer(null); reset(defaultValues); setModalOpen(true); };
  const openEdit = (t) => {
    setEditTransfer(t);
    reset({
      toType: t.toType,
      fromAccount: t.fromAccount?._id || '',
      toAccount: t.toAccount?._id || '',
      toName: t.toName || '',
      toAccountId: t.toAccountId || '',
      amount: t.amount.toString(),
      date: formatDateInput(t.date),
      reference: t.reference || '',
      notes: t.notes || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        fromAccount: formData.fromAccount || null,
        toAccount: formData.toType === 'own_account' ? formData.toAccount || null : null,
      };
      if (editTransfer) {
        const { data } = await api.put(`/transfers/${editTransfer._id}`, payload);
        setTransfers(prev => prev.map(t => t._id === editTransfer._id ? data.data : t));
        toast.success('Transfer updated');
      } else {
        const { data } = await api.post('/transfers', payload);
        setTransfers(prev => [data.data, ...prev]);
        setTotal(n => n + 1);
        // refresh stats
        api.get('/transfers/stats').then(r => setStats(r.data.data)).catch(() => {});
        toast.success('Transfer recorded');
      }
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/transfers/${deleteId}`);
      setTransfers(prev => prev.filter(t => t._id !== deleteId));
      setTotal(n => n - 1);
      api.get('/transfers/stats').then(r => setStats(r.data.data)).catch(() => {});
      toast.success('Transfer deleted');
      setDeleteId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Transfers</h1>
          <p className="text-slate-500 text-sm mt-1">{total} transfer{total !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-600/5 rounded-2xl" />
          <div className="relative">
            <p className="label mb-1">Transferred This Month</p>
            <p className="font-display text-2xl font-bold text-brand-400">{formatCurrency(stats.monthlyTotal, user?.currency)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-600/5 rounded-2xl" />
          <div className="relative">
            <p className="label mb-1">Transactions This Month</p>
            <p className="font-display text-2xl font-bold text-white">{stats.monthlyCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by recipient, reference, notes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Transfer list */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div>{Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transfers yet"
            description="Record money you've sent between your accounts or to other people."
            action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={15} />New Transfer</button>}
          />
        ) : (
          <AnimatePresence>
            {transfers.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-500/10">
                  <ArrowLeftRight size={16} className="text-brand-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* From label */}
                    <span className="flex items-center gap-1 text-sm font-medium text-white">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getFromColor(t) }} />
                      {getFromLabel(t)}
                    </span>
                    <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
                    {/* To label */}
                    {t.toType === 'own_account' ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-white">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.toAccount?.color || '#94a3b8' }} />
                        {getToLabel(t)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-slate-300">
                        <User size={12} className="text-slate-500 flex-shrink-0" />
                        {getToLabel(t)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-slate-500 text-xs">{formatDate(t.date)}</span>
                    {t.toType === 'person' && t.toAccountId && (
                      <span className="badge bg-white/5 text-slate-500 text-xs font-mono">{t.toAccountId}</span>
                    )}
                    {t.reference && (
                      <span className="badge bg-white/5 text-slate-600 text-xs font-mono">UTR: {t.reference}</span>
                    )}
                    {t.notes && (
                      <span className="text-slate-600 text-xs truncate max-w-40">{t.notes}</span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-brand-400 font-semibold">{formatCurrency(t.amount, user?.currency)}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{t.toType === 'own_account' ? 'Own Account' : 'Person'}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
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

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTransfer ? 'Edit Transfer' : 'New Transfer'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Destination type toggle */}
          <div>
            <label className="label mb-2 block">Transfer To</label>
            <div className="flex gap-1 glass rounded-xl p-1">
              <button
                type="button"
                onClick={() => setValue('toType', 'own_account')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${watchedToType === 'own_account' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                My Account
              </button>
              <button
                type="button"
                onClick={() => setValue('toType', 'person')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${watchedToType === 'person' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A Person
              </button>
            </div>
            <input type="hidden" {...register('toType')} />
          </div>

          {/* From */}
          <div>
            <label className="label mb-1.5 block">From *</label>
            <select {...register('fromAccount')} className="input-field">
              <option value="">Cash</option>
              {eligibleAccounts.map(a => (
                <option key={a._id} value={a._id}>
                  {a.displayName}{a.accountId ? ` (${a.accountId})` : ''}{a.bankName ? ` · ${a.bankName}` : ''}
                </option>
              ))}
            </select>
            <p className="text-slate-600 text-xs mt-1">Credit cards are not available for transfers.</p>
          </div>

          {/* To — own account */}
          {watchedToType === 'own_account' && (
            <div>
              <label className="label mb-1.5 block">To Account *</label>
              {toAccountOptions.length === 0 ? (
                <p className="text-slate-500 text-sm p-3 glass rounded-xl">
                  No other accounts available. Add accounts in <strong className="text-brand-400">Cards &amp; Accounts</strong>.
                </p>
              ) : (
                <select {...register('toAccount', { validate: v => watchedToType !== 'own_account' || !!v || 'Select an account' })} className="input-field">
                  <option value="">— Select account —</option>
                  {toAccountOptions.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.displayName}{a.accountId ? ` (${a.accountId})` : ''}{a.bankName ? ` · ${a.bankName}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.toAccount && <p className="text-red-400 text-xs mt-1">{errors.toAccount.message}</p>}
            </div>
          )}

          {/* To — person */}
          {watchedToType === 'person' && (
            <>
              <div>
                <label className="label mb-1.5 block">Recipient Name *</label>
                <input
                  {...register('toName', { validate: v => watchedToType !== 'person' || !!v.trim() || 'Name is required' })}
                  placeholder="e.g. Rahul Sharma"
                  className="input-field"
                />
                {errors.toName && <p className="text-red-400 text-xs mt-1">{errors.toName.message}</p>}
              </div>
              <div>
                <label className="label mb-1.5 block">UPI ID / Account No.</label>
                <input
                  {...register('toAccountId')}
                  placeholder="e.g. rahul@upi or 9876543210"
                  className="input-field font-mono"
                />
              </div>
            </>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1.5 block">Amount *</label>
              <input
                {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })}
                type="number" step="0.01" placeholder="0.00" className="input-field"
              />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="label mb-1.5 block">Date *</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="label mb-1.5 block">Reference / UTR No.</label>
            <input {...register('reference')} placeholder="Optional transaction ID" className="input-field font-mono" />
          </div>

          {/* Notes */}
          <div>
            <label className="label mb-1.5 block">Notes</label>
            <textarea {...register('notes')} rows={2} placeholder="Optional notes..." className="input-field resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editTransfer ? 'Update' : 'Record Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Transfer"
        message="This transfer record will be permanently deleted."
      />
    </div>
  );
}
