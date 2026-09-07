import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const FormSelect = forwardRef(function FormSelect(
  { label, error, options, placeholder = 'Select...', className, ...props },
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
        <select
          ref={ref}
          className={cn(
            'w-full h-11 cursor-pointer rounded-xl bg-white/60 dark:bg-white/5 border text-sm text-navy-800 dark:text-white appearance-none outline-none px-3.5 pr-9 transition-all duration-200',
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-navy-100 dark:border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20',
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300 dark:text-navy-500 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

export default FormSelect;