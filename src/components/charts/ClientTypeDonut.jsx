import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

const COLORS = { home: '#16A34A', office: '#0B2545', hotel: '#34D399', hospital: '#F59E0B' };
const LABELS = { home: 'Homes', office: 'Offices', hotel: 'Hotels', hospital: 'Hospitals' };

export default function ClientTypeDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title="Sales by Client Type" subtitle="Stock-out volume by segment" delay={0.2}>
      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || '#94A3B8'} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, LABELS[name] || name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-display font-bold text-navy-800 dark:text-white">{total}</p>
          <p className="text-[10px] text-navy-400 dark:text-navy-300">units</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs font-medium text-navy-500 dark:text-navy-300">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[d.name] }} />
            {LABELS[d.name] || d.name}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}