import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-xl p-3 shadow-2xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-medium">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function SpendingBarChart({ data, dataKey = 'total', nameKey = '_id', color = '#6366f1' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey={nameKey} tick={{ fill: '#64748b', fontSize: 11, fontFamily: '"DM Sans"' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, index) => (
            <Cell key={index} fill={color} opacity={0.7 + (index / data.length) * 0.3} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
