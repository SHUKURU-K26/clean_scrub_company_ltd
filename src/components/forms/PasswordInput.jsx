import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-navy-600 dark:text-navy-200 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-navy-300 dark:text-navy-400" strokeWidth={2} />
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full h-11 rounded-xl bg-white/60 dark:bg-white/5 border text-sm text-navy-800 dark:text-white placeholder:text-navy-300 dark:placeholder:text-navy-500 transition-all duration-200 outline-none pl-10 pr-11',
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-navy-100 dark:border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 dark:text-navy-400 hover:text-navy-500 dark:hover:text-navy-200"
        >
          {visible ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={2} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

export default PasswordInput;