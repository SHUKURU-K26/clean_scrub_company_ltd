import { motion } from 'framer-motion';

export default function SettingsSection({ icon: Icon, title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl glass p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
        )}
        <div>
          <h3 className="font-display font-bold text-navy-800 dark:text-white text-sm sm:text-base">{title}</h3>
          {subtitle && <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}