import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import ChartCard from './ChartCard';
import { formatCurrency } from '../../utils/formatCurrency';

const BAR_COLORS = ['#16A34A', '#128A3E', '#34D399', '#0B2545', '#1B3A5C', '#2E5F92'];

export default function CategoryBarChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <ChartCard title="Stock Value by Category" subtitle="Current inventory worth per category" delay={0.15} className="col-span-1 lg:col-span-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }} onMouseLeave={() => setHoverIndex(null)}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              className="text-navy-500 dark:text-navy-200"
            />
            <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: 'rgba(22,163,74,0.06)' }} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18} animationDuration={800} onMouseEnter={(_, idx) => setHoverIndex(idx)}>
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={BAR_COLORS[i % BAR_COLORS.length]}
                  opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.35}
                  style={{ transition: 'opacity 0.2s ease' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}