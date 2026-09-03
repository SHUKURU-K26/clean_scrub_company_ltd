import { motion } from 'framer-motion';

export default function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-navy-50 dark:border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-700 dark:text-white">{label}</p>
        {description && <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-navy-200 dark:bg-white/10'}`}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}