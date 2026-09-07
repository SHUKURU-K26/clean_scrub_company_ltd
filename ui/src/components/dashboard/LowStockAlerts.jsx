import { AlertTriangle } from 'lucide-react';
import ChartCard from '../charts/ChartCard';
import MiniRing from './MiniRing';
import { cn } from '../../utils/cn';

export default function LowStockAlerts({ items }) {
  return (
    <ChartCard title="Low Stock Alerts" subtitle="Items at or below reorder level" delay={0.3}>
      {items.length === 0 ? (
        <p className="text-sm text-navy-400 dark:text-navy-300 py-6 text-center">All stock levels are healthy 🎉</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const pct = Math.min((item.quantity / item.reorderLevel) * 100, 100);
            const critical = item.quantity === 0;
            return (
              <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-navy-50 dark:border-white/5 last:border-0">
                <div className="relative shrink-0">
                  <MiniRing percent={pct} color={critical ? '#EF4444' : '#F59E0B'} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertTriangle className={cn('w-3.5 h-3.5', critical ? 'text-red-500' : 'text-amber-500')} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-700 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-navy-400 dark:text-navy-300">{item.quantity} of {item.reorderLevel} {item.unit} reorder level</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}