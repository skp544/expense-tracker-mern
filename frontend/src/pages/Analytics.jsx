import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import MonthlyAreaChart from '../components/charts/AreaChart';
import DonutChart from '../components/charts/DonutChart';
import SpendingBarChart from '../components/charts/BarChart';
import { SkeletonChart } from '../components/ui/Skeleton';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, c] = await Promise.all([
          api.get('/analytics/monthly-trend'),
          api.get('/analytics/category-trend'),
        ]);
        setMonthly(m.data.data);
        setCategories(c.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalExpense = categories.reduce((s, c) => s + c.total, 0);
  const avgMonthly = monthly.length > 0 ? monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length : 0;
  const bestMonth = monthly.reduce((best, m) => m.savings > (best?.savings || -Infinity) ? m : best, null);
  const topCategory = categories[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Financial overview for the last 12 months</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent (YTD)', value: formatCurrency(totalExpense, user?.currency), icon: BarChart3, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Avg Monthly Expense', value: formatCurrency(avgMonthly, user?.currency), icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Best Savings Month', value: bestMonth?.label || '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Top Category', value: topCategory?._id || '—', icon: PieChart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={17} className={s.color} />
              </div>
              <p className="label mb-1">{s.label}</p>
              <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title">Income vs Expenses vs Savings</h3>
          <span className="badge bg-white/5 text-slate-400 text-xs">12-month trend</span>
        </div>
        {loading ? <div className="h-60 skeleton rounded-xl" /> : <MonthlyAreaChart data={monthly} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-5">Category Breakdown (YTD)</h3>
          {loading ? <div className="h-52 skeleton rounded-xl" /> : categories.length ? (
            <DonutChart data={categories} />
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data</div>
          )}
          <div className="space-y-2 mt-4">
            {categories.slice(0, 6).map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: `${CATEGORY_COLORS[c._id]}20` }}>
                  {CATEGORY_ICONS[c._id]}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{c._id}</span>
                    <span className="text-white font-medium">{totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalExpense > 0 ? (c.total / totalExpense) * 100 : 0}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: CATEGORY_COLORS[c._id] || '#6b7280' }}
                    />
                  </div>
                </div>
                <span className="text-white text-xs font-medium w-20 text-right">{formatCurrency(c.total, user?.currency)}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-5">Monthly Spending Bar</h3>
          {loading ? <div className="h-52 skeleton rounded-xl" /> : <SpendingBarChart data={monthly} dataKey="expenses" nameKey="label" color="#6366f1" />}

          <div className="mt-6 space-y-3">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Month-by-Month Savings</h4>
            {monthly.slice(-6).map((m, i) => {
              const rate = m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-12">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, rate))}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${rate >= 20 ? 'bg-emerald-500' : rate >= 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <span className={`text-xs font-medium w-12 text-right ${rate >= 20 ? 'text-emerald-400' : rate >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                    {rate.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-5">Spending Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.slice(0, 3).map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-dark rounded-xl p-4 border-l-2" style={{ borderColor: CATEGORY_COLORS[c._id] || '#6b7280' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{CATEGORY_ICONS[c._id]}</span>
                <div>
                  <p className="text-white font-medium text-sm">{c._id}</p>
                  <p className="text-slate-500 text-xs">{c.count} transactions</p>
                </div>
              </div>
              <p className="font-display text-xl font-bold text-white">{formatCurrency(c.total, user?.currency)}</p>
              <p className="text-slate-500 text-xs mt-1">
                ~{formatCurrency(c.total / 12, user?.currency)}/month avg
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
