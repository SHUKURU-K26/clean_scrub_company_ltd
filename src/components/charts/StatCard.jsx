import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../utils/cn';

export default function StatCard({ icon: Icon, label, value, change, gradient, loading, delay = 0 }) {
  if (loading) {
    return (
      <div className="rounded-2xl glass p-5 space-y-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-32 h-6" />
      </div>
    );
  }

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl glass p-5 hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md', gradient)}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        {typeof change === 'number' && (
          <span className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full', isPositive ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-500 bg-red-50 dark:bg-red-500/10')}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-navy-400 dark:text-navy-300 mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-navy-800 dark:text-white">{value}</p>
    </motion.div>
  );
}