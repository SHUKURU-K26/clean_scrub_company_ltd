import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function AutocompleteInput({ label, value, onChange, suggestions = [], placeholder, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = suggestions.filter((s) => s.toLowerCase().includes((value || '').toLowerCase()));
  const showList = open && filtered.length > 0 && !(filtered.length === 1 && filtered[0] === value);

  return (
    <div className="w-full relative" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-navy-600 dark:text-navy-200 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          value={value || ''}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full h-11 rounded-xl bg-white/60 dark:bg-white/5 border text-sm text-navy-800 dark:text-white placeholder:text-navy-300 dark:placeholder:text-navy-500 outline-none px-3.5 pr-9 transition-all duration-200',
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-navy-100 dark:border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20'
          )}
        />
        <ChevronDown className={cn('absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300 dark:text-navy-500 pointer-events-none transition-transform', open && 'rotate-180')} />
      </div>

      {showList && (
        <div className="absolute z-20 mt-1.5 w-full max-h-48 overflow-y-auto rounded-xl glass-strong p-1.5">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-navy-700 dark:text-navy-100 hover:bg-navy-50 dark:hover:bg-white/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {!error && suggestions.length === 0 && (
        <p className="mt-1.5 text-xs text-navy-300 dark:text-navy-500">Type a new supplier name — it'll be remembered for next time.</p>
      )}
    </div>
  );
}