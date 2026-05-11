import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, formatCurrency } from '../../utils/helpers';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-xl p-3 shadow-2xl">
      <p className="text-white text-sm font-medium">{d.name}</p>
      <p className="text-slate-400 text-xs">{formatCurrency(d.value)}</p>
    </div>
  );
};

export default function DonutChart({ data, colors }) {
  const colorPalette = colors || data.map(d => CATEGORY_COLORS[d._id] || CATEGORY_COLORS[d.name] || '#6b7280');

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="total"
          nameKey="_id"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={colorPalette[index % colorPalette.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
