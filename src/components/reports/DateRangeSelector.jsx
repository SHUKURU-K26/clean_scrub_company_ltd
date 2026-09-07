import { Calendar } from 'lucide-react';
import { DATE_PRESETS } from '../../services/reportService';
import { cn } from '../../utils/cn';

export default function DateRangeSelector({ preset, onPresetChange, from, to, onCustomChange }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => onPresetChange(p.key)}
            className={cn(
              'px-3 py-1.5 cursor-pointer rounded-full text-xs font-semibold transition-colors',
              preset === p.key ? 'bg-green-500 text-white' : 'glass text-navy-500 dark:text-navy-300'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-navy-400" />
          <input type="date" value={from} onChange={(e) => onCustomChange(e.target.value, to)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
          <span className="text-xs text-navy-400">to</span>
          <input type="date" value={to} onChange={(e) => onCustomChange(from, e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
        </div>
      )}
    </div>
  );
}