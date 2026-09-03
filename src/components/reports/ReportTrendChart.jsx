import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import ChartCard from '../charts/ChartCard';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ReportTrendChart({ data }) {
  return (
    <ChartCard title="Stock In vs Stock Out Value" subtitle="Daily value comparison for the selected period" delay={0.2}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-navy-100 dark:text-white/5" />
            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'MMM d')} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(l) => format(new Date(l), 'MMM d, yyyy')} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="stockIn" name="Stock In" fill="#16A34A" radius={[6, 6, 0, 0]} />
            <Bar dataKey="stockOut" name="Stock Out" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}