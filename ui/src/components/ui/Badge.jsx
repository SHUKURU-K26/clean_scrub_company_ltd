import { cn } from '../../utils/cn';

const VARIANTS = {
  green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  navy: 'bg-navy-50 text-navy-600 dark:bg-white/5 dark:text-navy-200',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
};

export default function Badge({ children, variant = 'navy', className }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', VARIANTS[variant], className)}>
      {children}
    </span>
  );
}