import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, ChevronRight, Receipt, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard, SkeletonRow, SkeletonChart } from '../components/ui/Skeleton';
import MonthlyAreaChart from '../components/charts/AreaChart';
import DonutChart from '../components/charts/DonutChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/monthly-trend'),
        ]);
        setStats(s.data.data);
        setTrend(t.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{greeting()},</p>
          <h1 className="font-display font-bold text-2xl text-white">{user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-slate-500 text-xs">Monthly Goal</p>
          <p className="font-display font-semibold text-white">{formatCurrency(user?.monthlyBudgetGoal || 5000, user?.currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Balance" value={stats?.totalBalance || 0} icon={Wallet} color="brand" currency={user?.currency} index={0} />
            <StatCard title="Monthly Expenses" value={stats?.totalExpenseMonth || 0} change={stats?.expenseChange} changeLabel="vs last month" icon={TrendingDown} color="rose" currency={user?.currency} index={1} />
            <StatCard title="Monthly Income" value={stats?.totalIncomeMonth || 0} change={stats?.incomeChange} changeLabel="vs last month" icon={TrendingUp} color="emerald" currency={user?.currency} index={2} />
            <StatCard title="Net Savings" value={stats?.savingsMonth || 0} icon={PiggyBank} color="amber" currency={user?.currency} index={3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">Income vs Expenses</h3>
            <span className="badge bg-white/5 text-slate-400 text-xs">Last 12 months</span>
          </div>
          {loading ? <div className="h-48 skeleton rounded-xl" /> : <MonthlyAreaChart data={trend} />}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Spending by Category</h3>
          </div>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : stats?.categoryBreakdown?.length ? (
            <>
              <DonutChart data={stats.categoryBreakdown} />
              <div className="space-y-2 mt-2">
                {stats.categoryBreakdown.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[c._id] || '#6b7280' }} />
                      <span className="text-slate-400 text-xs">{c._id}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{formatCurrency(c.total, user?.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Transactions</h3>
            <Link to="/expenses" className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 transition-colors">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
          ) : stats?.recentTransactions?.length ? (
            <div className="space-y-1">
              {stats.recentTransactions.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${CATEGORY_COLORS[tx.category] || CATEGORY_COLORS[tx.source] || '#6b7280'}20` }}>
                    {CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? '💰' : '💳')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{tx.title}</p>
                    <p className="text-slate-500 text-xs">{formatDate(tx.date)} · {tx.category || tx.source}</p>
                  </div>
                  <div className={`text-sm font-semibold flex items-center gap-1 ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {formatCurrency(tx.amount, user?.currency)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Receipt size={28} className="text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">No transactions yet</p>
              <Link to="/expenses" className="text-brand-400 text-xs mt-2">Add your first expense</Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Quick Insights</h3>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)
            ) : (
              <>
                <div className="glass-dark rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Savings Rate</p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold text-lg">
                      {stats?.totalIncomeMonth > 0
                        ? `${Math.max(0, Math.round(((stats.totalIncomeMonth - stats.totalExpenseMonth) / stats.totalIncomeMonth) * 100))}%`
                        : '0%'}
                    </p>
                    <span className="text-xs text-slate-500">of income saved</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.totalIncomeMonth > 0 ? Math.max(0, Math.min(100, ((stats.totalIncomeMonth - stats.totalExpenseMonth) / stats.totalIncomeMonth) * 100)) : 0}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full"
                    />
                  </div>
                </div>

                {stats?.categoryBreakdown?.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 glass-dark rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[c._id]}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{c._id}</p>
                        <p className="text-slate-500 text-xs">{c.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-semibold">{formatCurrency(c.total, user?.currency)}</p>
                      <p className="text-slate-500 text-xs">
                        {stats.totalExpenseMonth > 0 ? Math.round((c.total / stats.totalExpenseMonth) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
