import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className,
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-600/25 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5',
    outline: 'border border-navy-200 dark:border-white/10 text-navy-700 dark:text-white hover:bg-navy-50 dark:hover:bg-white/5',
    ghost: 'text-navy-500 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-white/5',
    danger: 'bg-red-500 text-white shadow-md shadow-red-500/25 hover:bg-red-600',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}