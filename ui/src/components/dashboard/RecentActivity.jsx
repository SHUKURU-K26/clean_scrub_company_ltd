import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import ChartCard from '../charts/ChartCard';
import { formatRelative } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

export default function RecentActivity({ transactions }) {
  return (
    <ChartCard title="Recent Activity" subtitle="Latest stock movements" delay={0.25}>
      <div className="space-y-1">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-navy-50 dark:border-white/5 last:border-0">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', tx.type === 'in' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600')}>
              {tx.type === 'in' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{tx.productName}</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 truncate">
                {tx.type === 'in' ? `From ${tx.supplier}` : `To ${tx.customerName}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn('text-sm font-bold', tx.type === 'in' ? 'text-green-600' : 'text-amber-600')}>
                {tx.type === 'in' ? '+' : '-'}{tx.quantity}
              </p>
              <p className="text-[11px] text-navy-300 dark:text-navy-500">{formatRelative(tx.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}