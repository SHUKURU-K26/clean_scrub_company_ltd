import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import ChartCard from './ChartCard';

const PERIODS = [
  { key: 7, label: '7D' },
  { key: 14, label: '14D' },
  { key: 30, label: '30D' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-navy-700 dark:text-white mb-1">{format(new Date(label), 'MMM d')}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.dataKey === 'stockIn' ? 'Stock In' : 'Stock Out'}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function StockTrendChart({ data }) {
  const [period, setPeriod] = useState(14);
  const sliced = useMemo(() => data.slice(-period), [data, period]);

  return (
    <ChartCard
      title="Stock Movement Trend"
      subtitle="Units moving in vs out over time"
      delay={0.1}
      className="col-span-1 lg:col-span-2"
      action={
        <div className="flex gap-1 p-1 rounded-full glass">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                period === p.key ? 'bg-green-500 text-white' : 'text-navy-400 dark:text-navy-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-64 sm:h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B2545" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0B2545" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-navy-100 dark:text-white/5" />
            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'MMM d')} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="text-navy-400" />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="text-navy-400" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="stockIn" stroke="#16A34A" strokeWidth={2.5} fill="url(#inGradient)" />
            <Area type="monotone" dataKey="stockOut" stroke="#0B2545" strokeWidth={2.5} fill="url(#outGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-5 mt-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-navy-500 dark:text-navy-300">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Stock In
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-navy-500 dark:text-navy-300">
          <span className="w-2.5 h-2.5 rounded-full bg-navy-700 dark:bg-navy-300" /> Stock Out
        </span>
      </div>
    </ChartCard>
  );
}