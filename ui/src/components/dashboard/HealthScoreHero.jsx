import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, PackageX, Wallet } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';

export default function HealthScoreHero({ score, lowStockCount, totalValue, netMovement, loading }) {
  const animatedScore = useCountUp(loading ? 0 : score, { duration: 1200 });
  const size = 168;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const tone = score >= 80
    ? { color: '#16A34A', label: 'Healthy' }
    : score >= 50
    ? { color: '#F59E0B', label: 'Needs attention' }
    : { color: '#EF4444', label: 'At risk' };

  return (
    <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-green-400 glow-ambient" />
      <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-navy-500 glow-ambient" />

      <div className="relative flex flex-col lg:flex-row items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative shrink-0"
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-navy-50 dark:stroke-white/5" />
            <motion.circle
              cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} strokeLinecap="round"
              stroke={tone.color}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: loading ? circumference : offset }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold text-navy-800 dark:text-white">{loading ? '—' : animatedScore}</span>
            <span className="text-[11px] font-medium text-navy-400 dark:text-navy-300">out of 100</span>
          </div>
        </motion.div>

        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">Inventory Health</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-800 dark:text-white mb-1.5">
            {loading ? 'Crunching your numbers…' : `${tone.label} — ${score}% of your catalog is well-stocked`}
          </h2>
          <p className="text-sm text-navy-400 dark:text-navy-300 mb-6 max-w-md mx-auto lg:mx-0">
            Based on how many products are sitting at or below their reorder level right now.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl glass px-4 py-2.5">
              <PackageX className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <p className="text-sm font-bold text-navy-800 dark:text-white">{loading ? '—' : formatNumber(lowStockCount)}</p>
                <p className="text-[10px] text-navy-400 dark:text-navy-300">Low stock</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl glass px-4 py-2.5">
              <Wallet className="w-4 h-4 text-green-500" />
              <div className="text-left">
                <p className="text-sm font-bold text-navy-800 dark:text-white">{loading ? '—' : formatCurrency(totalValue)}</p>
                <p className="text-[10px] text-navy-400 dark:text-navy-300">Catalog value</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl glass px-4 py-2.5">
              {netMovement >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              <div className="text-left">
                <p className="text-sm font-bold text-navy-800 dark:text-white">{loading ? '—' : `${netMovement >= 0 ? '+' : ''}${formatNumber(netMovement)}`}</p>
                <p className="text-[10px] text-navy-400 dark:text-navy-300">Net movement today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}