import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const FormInput = forwardRef(function FormInput(
  { label, icon: Icon, error, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-navy-600 dark:text-navy-200 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-navy-300 dark:text-navy-400" strokeWidth={2} />
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 rounded-xl bg-white/60 dark:bg-white/5 border text-sm text-navy-800 dark:text-white placeholder:text-navy-300 dark:placeholder:text-navy-500 transition-all duration-200 outline-none px-3.5',
            Icon && 'pl-10',
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-navy-100 dark:border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

export default FormInput;