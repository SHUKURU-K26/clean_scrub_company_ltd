import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, action, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-2xl glass p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-navy-800 dark:text-white text-sm sm:text-base">{title}</h3>
          {subtitle && <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}