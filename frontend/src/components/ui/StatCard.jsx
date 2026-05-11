import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'brand', currency = 'INR', index = 0 }) {
  const colorMap = {
    brand: { bg: 'from-brand-500/20 to-brand-600/5', icon: 'bg-brand-500/20 text-brand-400', glow: 'rgba(99,102,241,0.15)' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', icon: 'bg-emerald-500/20 text-emerald-400', glow: 'rgba(16,185,129,0.15)' },
    amber: { bg: 'from-amber-500/20 to-amber-600/5', icon: 'bg-amber-500/20 text-amber-400', glow: 'rgba(245,158,11,0.15)' },
    rose: { bg: 'from-rose-500/20 to-rose-600/5', icon: 'bg-rose-500/20 text-rose-400', glow: 'rgba(244,63,94,0.15)' },
    sky: { bg: 'from-sky-500/20 to-sky-600/5', icon: 'bg-sky-500/20 text-sky-400', glow: 'rgba(14,165,233,0.15)' },
  };
  const c = colorMap[color] || colorMap.brand;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="stat-card group"
      style={{ '--glow': c.glow }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300" style={{ background: c.glow.replace('0.15', '1') }} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
            <Icon size={18} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="font-display text-2xl font-bold text-white tracking-tight">
          {formatCurrency(value, currency)}
        </p>
        {changeLabel && (
          <p className="text-slate-500 text-xs mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
