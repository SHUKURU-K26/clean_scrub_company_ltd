import { AlertTriangle } from 'lucide-react';
import ChartCard from '../charts/ChartCard';
import { cn } from '../../utils/cn';

export default function LowStockAlerts({ items }) {
  return (
    <ChartCard title="Low Stock Alerts" subtitle="Items at or below reorder level" delay={0.3}>
      {items.length === 0 ? (
        <p className="text-sm text-navy-400 dark:text-navy-300 py-6 text-center">All stock levels are healthy 🎉</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const pct = Math.min((item.quantity / item.reorderLevel) * 100, 100);
            const critical = item.quantity === 0;
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertTriangle className={cn('w-3.5 h-3.5 shrink-0', critical ? 'text-red-500' : 'text-amber-500')} />
                    <span className="text-sm font-medium text-navy-700 dark:text-white truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-navy-400 dark:text-navy-300 shrink-0">
                    {item.quantity} / {item.reorderLevel} {item.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-50 dark:bg-white/5 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', critical ? 'bg-red-500' : 'bg-amber-400')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}