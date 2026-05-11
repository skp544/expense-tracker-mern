import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Edit2, CreditCard, AlertTriangle, CheckCircle,
  Smartphone, Building2, Wallet, QrCode,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, maskCardNumber, CARD_GRADIENTS,
  PAYMENT_ACCOUNT_TYPES, PAYMENT_ACCOUNT_COLORS, ACCOUNT_COLOR_OPTIONS,
} from '../utils/helpers';
import CreditCardUI from '../components/ui/CreditCardUI';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SpendingBarChart from '../components/charts/BarChart';

const defaultCard = {
  cardHolderName: '', cardNumber: '', bankName: '', expiryDate: '',
  creditLimit: '', currentUsage: '', billingCycleDate: 1, dueDate: 15,
  cardColor: 'from-violet-600 to-indigo-800', cardType: 'Visa', isDefault: false, notes: '',
};

const defaultAccount = {
  type: 'UPI', displayName: '', accountId: '', bankName: '', color: '#6366f1', isDefault: false,
};

const ACCOUNT_TYPE_ICONS = {
  'UPI': QrCode,
  'Credit Card (UPI)': CreditCard,
  'Debit Card': CreditCard,
  'Net Banking': Building2,
  'Wallet': Wallet,
};

export default function Cards() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cards');

  // ── Credit Cards state ──────────────────────────────────────
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [deleteCardId, setDeleteCardId] = useState(null);
  const [deletingCard, setDeletingCard] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardSpending, setCardSpending] = useState(null);

  const {
    register, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm({ defaultValues: defaultCard });
  const watchedColor = watch('cardColor');

  // ── Payment Accounts state ───────────────────────────────────
  const [accounts, setAccounts] = useState([]);
  const [accLoading, setAccLoading] = useState(true);
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccId, setDeleteAccId] = useState(null);
  const [deletingAcc, setDeletingAcc] = useState(false);
  const [savingAcc, setSavingAcc] = useState(false);

  const {
    register: regAcc, handleSubmit: handleAccSubmit, reset: resetAcc,
    watch: watchAcc, setValue: setAccVal,
  } = useForm({ defaultValues: defaultAccount });
  const watchedAccColor = watchAcc('color');

  // ── Load data ────────────────────────────────────────────────
  useEffect(() => {
    api.get('/cards')
      .then(r => { setCards(r.data.data); if (r.data.data.length) setSelectedCard(r.data.data[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/payment-accounts')
      .then(r => setAccounts(r.data.data))
      .catch(() => {})
      .finally(() => setAccLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCard) {
      api.get(`/cards/${selectedCard._id}/spending`).then(r => setCardSpending(r.data.data)).catch(() => {});
    }
  }, [selectedCard]);

  // ── Credit Card CRUD ─────────────────────────────────────────
  const openAddCard = () => { setEditCard(null); reset(defaultCard); setCardModalOpen(true); };
  const openEditCard = (c) => {
    setEditCard(c);
    reset({ ...c, creditLimit: c.creditLimit.toString(), currentUsage: c.currentUsage.toString() });
    setCardModalOpen(true);
  };

  const onCardSubmit = async (formData) => {
    setSavingCard(true);
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
      setCardModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSavingCard(false); }
  };

  const handleDeleteCard = async () => {
    setDeletingCard(true);
    try {
      await api.delete(`/cards/${deleteCardId}`);
      const remaining = cards.filter(c => c._id !== deleteCardId);
      setCards(remaining);
      if (selectedCard?._id === deleteCardId) setSelectedCard(remaining[0] || null);
      toast.success('Card deleted');
      setDeleteCardId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeletingCard(false); }
  };

  // ── Payment Account CRUD ─────────────────────────────────────
  const openAddAccount = () => { setEditAccount(null); resetAcc(defaultAccount); setAccModalOpen(true); };
  const openEditAccount = (a) => { setEditAccount(a); resetAcc(a); setAccModalOpen(true); };

  const onAccSubmit = async (formData) => {
    setSavingAcc(true);
    try {
      if (editAccount) {
        const { data } = await api.put(`/payment-accounts/${editAccount._id}`, formData);
        setAccounts(prev => prev.map(a => a._id === editAccount._id ? data.data : a));
        toast.success('Account updated');
      } else {
        const { data } = await api.post('/payment-accounts', formData);
        setAccounts(prev => [data.data, ...prev]);
        toast.success('Account added');
      }
      setAccModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSavingAcc(false); }
  };

  const handleDeleteAccount = async () => {
    setDeletingAcc(true);
    try {
      await api.delete(`/payment-accounts/${deleteAccId}`);
      setAccounts(prev => prev.filter(a => a._id !== deleteAccId));
      toast.success('Account deleted');
      setDeleteAccId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeletingAcc(false); }
  };

  const totalLimit = cards.reduce((s, c) => s + c.creditLimit, 0);
  const totalUsed = cards.reduce((s, c) => s + c.currentUsage, 0);
  const overallUtil = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Cards & Accounts</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeTab === 'cards'
              ? `${cards.length} card${cards.length !== 1 ? 's' : ''} · ${overallUtil}% overall utilization`
              : `${accounts.length} payment account${accounts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-1 glass rounded-xl p-1">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'cards' ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
            >
              Credit Cards
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'accounts' ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
            >
              Payment Accounts
            </button>
          </div>
          <button
            onClick={activeTab === 'cards' ? openAddCard : openAddAccount}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {activeTab === 'cards' ? 'Add Card' : 'Add Account'}
          </button>
        </div>
      </div>

      {/* ── CREDIT CARDS TAB ───────────────────────────────── */}
      {activeTab === 'cards' && (
        <>
          {cards.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-600/5 rounded-2xl" />
                <div className="relative"><p className="label mb-1">Total Limit</p><p className="font-display text-2xl font-bold text-white">{formatCurrency(totalLimit, user?.currency)}</p></div>
              </div>
              <div className="stat-card">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-rose-600/5 rounded-2xl" />
                <div className="relative"><p className="label mb-1">Total Used</p><p className="font-display text-2xl font-bold text-red-400">{formatCurrency(totalUsed, user?.currency)}</p></div>
              </div>
              <div className="stat-card">
                <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl ${overallUtil > 80 ? 'from-red-500/20 to-red-600/5' : overallUtil > 50 ? 'from-amber-500/20 to-amber-600/5' : 'from-emerald-500/20 to-emerald-600/5'}`} />
                <div className="relative"><p className="label mb-1">Overall Utilization</p><p className={`font-display text-2xl font-bold ${overallUtil > 80 ? 'text-red-400' : overallUtil > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{overallUtil}%</p></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="section-title">Your Cards</h3>
              {loading ? (
                <div className="space-y-3">{Array(2).fill(0).map((_, i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}</div>
              ) : cards.length === 0 ? (
                <EmptyState icon={CreditCard} title="No cards added" description="Add your credit cards to track usage and limits." action={<button onClick={openAddCard} className="btn-primary flex items-center gap-2"><Plus size={15} />Add Card</button>} />
              ) : (
                <AnimatePresence>
                  {cards.map((card, i) => (
                    <div key={card._id} className="relative group">
                      <CreditCardUI card={card} index={i} onClick={setSelectedCard} />
                      {selectedCard?._id === card._id && (
                        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-400 shadow-glow-emerald" />
                      )}
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditCard(card)} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-all"><Edit2 size={12} /></button>
                        <button onClick={() => setDeleteCardId(card._id)} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-red-400 hover:text-red-300 transition-all"><Trash2 size={12} /></button>
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
        </>
      )}

      {/* ── PAYMENT ACCOUNTS TAB ──────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-5">
          {/* Type legend */}
          <div className="flex flex-wrap gap-2">
            {PAYMENT_ACCOUNT_TYPES.map(type => {
              const Icon = ACCOUNT_TYPE_ICONS[type];
              return (
                <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-xs font-medium text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ background: PAYMENT_ACCOUNT_COLORS[type] }} />
                  <Icon size={11} />
                  {type}
                </div>
              );
            })}
          </div>

          {accLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No payment accounts"
              description="Add your UPI IDs, bank accounts, and wallets to use as payment methods in expenses."
              action={<button onClick={openAddAccount} className="btn-primary flex items-center gap-2"><Plus size={15} />Add Account</button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {accounts.map((acc, i) => {
                  const Icon = ACCOUNT_TYPE_ICONS[acc.type] || Wallet;
                  return (
                    <motion.div
                      key={acc._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-5 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: acc.color }} />

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${acc.color}20` }}>
                            <Icon size={16} style={{ color: acc.color }} />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm leading-tight">{acc.displayName}</p>
                            {acc.bankName && <p className="text-slate-500 text-xs mt-0.5">{acc.bankName}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditAccount(acc)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => setDeleteAccId(acc._id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {acc.accountId && (
                        <p className="font-mono text-xs text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-lg truncate mb-3">{acc.accountId}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="badge text-xs" style={{ background: `${acc.color}15`, color: acc.color, border: `1px solid ${acc.color}30` }}>
                          {acc.type}
                        </span>
                        {acc.isDefault && (
                          <span className="badge bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                            <CheckCircle size={10} />Default
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ── CREDIT CARD MODAL ─────────────────────────────────── */}
      <Modal isOpen={cardModalOpen} onClose={() => setCardModalOpen(false)} title={editCard ? 'Edit Card' : 'Add Credit Card'} size="lg">
        <form onSubmit={handleSubmit(onCardSubmit)} className="space-y-4">
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
            <button type="button" onClick={() => setCardModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={savingCard} className="flex-1 btn-primary disabled:opacity-60">
              {savingCard ? 'Saving...' : editCard ? 'Update Card' : 'Add Card'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── PAYMENT ACCOUNT MODAL ─────────────────────────────── */}
      <Modal isOpen={accModalOpen} onClose={() => setAccModalOpen(false)} title={editAccount ? 'Edit Account' : 'Add Payment Account'} size="md">
        <form onSubmit={handleAccSubmit(onAccSubmit)} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Account Type *</label>
            <select {...regAcc('type', { required: true })} className="input-field">
              {PAYMENT_ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Display Name *</label>
            <input
              {...regAcc('displayName', { required: 'Name is required' })}
              placeholder="e.g. PhonePe, Google Pay, HDFC Savings"
              className="input-field"
            />
            <p className="text-slate-600 text-xs mt-1">This name will appear in the payment method selector.</p>
          </div>
          <div>
            <label className="label mb-1.5 block">Account ID / UPI ID</label>
            <input
              {...regAcc('accountId')}
              placeholder="e.g. user@phonepe, user@okaxis, ••••1234"
              className="input-field font-mono"
            />
            <p className="text-slate-600 text-xs mt-1">UPI ID, last 4 digits, or account number — shown as identifier.</p>
          </div>
          <div>
            <label className="label mb-1.5 block">Bank / Issuer</label>
            <input {...regAcc('bankName')} placeholder="e.g. HDFC Bank, SBI, Paytm" className="input-field" />
          </div>
          <div>
            <label className="label mb-2 block">Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {ACCOUNT_COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccVal('color', color)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${watchedAccColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1117] scale-110' : 'hover:scale-105'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input {...regAcc('isDefault')} type="checkbox" id="acc-default" className="w-4 h-4 accent-brand-500" />
            <label htmlFor="acc-default" className="text-slate-300 text-sm">Set as default for this type</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAccModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={savingAcc} className="flex-1 btn-primary disabled:opacity-60">
              {savingAcc ? 'Saving...' : editAccount ? 'Update' : 'Add Account'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCardId}
        onClose={() => setDeleteCardId(null)}
        onConfirm={handleDeleteCard}
        loading={deletingCard}
        title="Delete Card"
        message="This will unlink all associated expenses."
      />
      <ConfirmDialog
        isOpen={!!deleteAccId}
        onClose={() => setDeleteAccId(null)}
        onConfirm={handleDeleteAccount}
        loading={deletingAcc}
        title="Delete Account"
        message="This payment account will be removed from all future expense selections."
      />
    </div>
  );
}
