import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, maskCardNumber, CARD_GRADIENTS } from '../utils/helpers';
import CreditCardUI from '../components/ui/CreditCardUI';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SpendingBarChart from '../components/charts/BarChart';

const defaultCard = { cardHolderName: '', cardNumber: '', bankName: '', expiryDate: '', creditLimit: '', currentUsage: '', billingCycleDate: 1, dueDate: 15, cardColor: 'from-violet-600 to-indigo-800', cardType: 'Visa', isDefault: false, notes: '' };

export default function Cards() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardSpending, setCardSpending] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: defaultCard });
  const watchedColor = watch('cardColor');

  useEffect(() => {
    api.get('/cards').then(r => { setCards(r.data.data); if (r.data.data.length) setSelectedCard(r.data.data[0]); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCard) {
      api.get(`/cards/${selectedCard._id}/spending`).then(r => setCardSpending(r.data.data)).catch(() => {});
    }
  }, [selectedCard]);

  const openAdd = () => { setEditCard(null); reset(defaultCard); setModalOpen(true); };
  const openEdit = (c) => {
    setEditCard(c);
    reset({ ...c, creditLimit: c.creditLimit.toString(), currentUsage: c.currentUsage.toString() });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData, creditLimit: Number(formData.creditLimit), currentUsage: Number(formData.currentUsage || 0) };
      if (editCard) {
        const { data } = await api.put(`/cards/${editCard._id}`, payload);
        setCards(prev => prev.map(c => c._id === editCard._id ? data.data : c));
        if (selectedCard?._id === editCard._id) setSelectedCard(data.data);
        toast.success('Card updated');
      } else {
        const { data } = await api.post('/cards', payload);
        setCards(prev => [data.data, ...prev]);
        setSelectedCard(data.data);
        toast.success('Card added');
      }
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/cards/${deleteId}`);
      setCards(prev => prev.filter(c => c._id !== deleteId));
      if (selectedCard?._id === deleteId) setSelectedCard(cards.find(c => c._id !== deleteId) || null);
      toast.success('Card deleted');
      setDeleteId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const totalLimit = cards.reduce((s, c) => s + c.creditLimit, 0);
  const totalUsed = cards.reduce((s, c) => s + c.currentUsage, 0);
  const overallUtil = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Credit Cards</h1>
          <p className="text-slate-500 text-sm mt-1">{cards.length} cards · {overallUtil}% overall utilization</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Card
        </button>
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card"><div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-600/5 rounded-2xl" /><div className="relative"><p className="label mb-1">Total Limit</p><p className="font-display text-2xl font-bold text-white">{formatCurrency(totalLimit, user?.currency)}</p></div></div>
          <div className="stat-card"><div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-rose-600/5 rounded-2xl" /><div className="relative"><p className="label mb-1">Total Used</p><p className="font-display text-2xl font-bold text-red-400">{formatCurrency(totalUsed, user?.currency)}</p></div></div>
          <div className="stat-card"><div className={`absolute inset-0 bg-gradient-to-br rounded-2xl ${overallUtil > 80 ? 'from-red-500/20 to-red-600/5' : overallUtil > 50 ? 'from-amber-500/20 to-amber-600/5' : 'from-emerald-500/20 to-emerald-600/5'}`} /><div className="relative"><p className="label mb-1">Overall Utilization</p><p className={`font-display text-2xl font-bold ${overallUtil > 80 ? 'text-red-400' : overallUtil > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{overallUtil}%</p></div></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="section-title">Your Cards</h3>
          {loading ? (
            <div className="space-y-3">{Array(2).fill(0).map((_, i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}</div>
          ) : cards.length === 0 ? (
            <EmptyState icon={CreditCard} title="No cards added" description="Add your credit cards to track usage and limits." action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={15} />Add Card</button>} />
          ) : (
            <AnimatePresence>
              {cards.map((card, i) => (
                <div key={card._id} className="relative group">
                  <CreditCardUI card={card} index={i} onClick={setSelectedCard} />
                  {selectedCard?._id === card._id && (
                    <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-400 shadow-glow-emerald" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(card)} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-all"><Edit2 size={12} /></button>
                    <button onClick={() => setDeleteId(card._id)} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-red-400 hover:text-red-300 transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {selectedCard && (
          <div className="lg:col-span-3 space-y-5">
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title">{selectedCard.bankName} Details</h3>
                {selectedCard.isDefault && <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20"><CheckCircle size={11} />Default</span>}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="glass-dark rounded-xl p-3"><p className="label mb-1">Credit Limit</p><p className="text-white font-semibold">{formatCurrency(selectedCard.creditLimit, user?.currency)}</p></div>
                <div className="glass-dark rounded-xl p-3"><p className="label mb-1">Available</p><p className="text-emerald-400 font-semibold">{formatCurrency(selectedCard.availableLimit, user?.currency)}</p></div>
                <div className="glass-dark rounded-xl p-3"><p className="label mb-1">Current Balance</p><p className="text-red-400 font-semibold">{formatCurrency(selectedCard.currentUsage, user?.currency)}</p></div>
                <div className="glass-dark rounded-xl p-3"><p className="label mb-1">Billing Cycle</p><p className="text-white font-semibold">Day {selectedCard.billingCycleDate}</p></div>
                <div className="glass-dark rounded-xl p-3"><p className="label mb-1">Due Date</p><p className="text-amber-400 font-semibold">Day {selectedCard.dueDate}</p></div>
                <div className="glass-dark rounded-xl p-3"><p className="label mb-1">Card Type</p><p className="text-white font-semibold">{selectedCard.cardType}</p></div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Credit Utilization</span>
                  <span className={`font-semibold ${selectedCard.utilizationPercent > 80 ? 'text-red-400' : selectedCard.utilizationPercent > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedCard.utilizationPercent}%
                  </span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, selectedCard.utilizationPercent)}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`h-full rounded-full ${selectedCard.utilizationPercent > 80 ? 'bg-red-500' : selectedCard.utilizationPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
                {selectedCard.utilizationPercent > 70 && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                    <p className="text-amber-400 text-xs">High utilization may impact credit score. Consider paying down balance.</p>
                  </div>
                )}
              </div>
            </div>

            {cardSpending?.spending && (
              <div className="card">
                <h3 className="section-title mb-4">6-Month Spending</h3>
                <SpendingBarChart
                  data={cardSpending.spending.map(s => ({ ...s, label: `${s.month}/${String(s.year).slice(-2)}` }))}
                  dataKey="total"
                  nameKey="label"
                  color="#6366f1"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCard ? 'Edit Card' : 'Add Credit Card'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label mb-1.5 block">Card Holder Name *</label>
              <input {...register('cardHolderName', { required: true })} placeholder="John Doe" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label mb-1.5 block">Card Number *</label>
              <input {...register('cardNumber', { required: true })} placeholder="1234 5678 9012 3456" maxLength={19} className="input-field font-mono" />
            </div>
            <div>
              <label className="label mb-1.5 block">Bank Name *</label>
              <input {...register('bankName', { required: true })} placeholder="Chase Bank" className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Expiry Date *</label>
              <input {...register('expiryDate', { required: true })} placeholder="MM/YY" maxLength={5} className="input-field font-mono" />
            </div>
            <div>
              <label className="label mb-1.5 block">Credit Limit *</label>
              <input {...register('creditLimit', { required: true, min: 1 })} type="number" placeholder="10000" className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Current Balance</label>
              <input {...register('currentUsage')} type="number" placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Billing Cycle Day</label>
              <input {...register('billingCycleDate')} type="number" min={1} max={31} className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Due Date Day</label>
              <input {...register('dueDate')} type="number" min={1} max={31} className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Card Type</label>
              <select {...register('cardType')} className="input-field">
                {['Visa', 'Mastercard', 'Amex', 'RuPay', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Card Color Theme</label>
              <select {...register('cardColor')} className="input-field">
                {CARD_GRADIENTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input {...register('isDefault')} type="checkbox" id="card-default" className="w-4 h-4 accent-brand-500" />
              <label htmlFor="card-default" className="text-slate-300 text-sm">Set as default card</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editCard ? 'Update Card' : 'Add Card'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Card" message="This will unlink all associated expenses." />
    </div>
  );
}
