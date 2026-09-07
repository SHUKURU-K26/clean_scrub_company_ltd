import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Pagination({ page, pageCount, onPageChange, totalItems, pageSize }) {
  if (pageCount <= 1) return null;

  const pages = [];
  const delta = 1;
  for (let i = 0; i < pageCount; i++) {
    if (i === 0 || i === pageCount - 1 || Math.abs(i - page) <= delta) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="hidden md:flex items-center justify-between mt-4 pt-4 border-t border-navy-50 dark:border-white/5">
      <p className="text-xs text-navy-400 dark:text-navy-300">
        Showing <span className="font-semibold text-navy-600 dark:text-navy-200">{start}-{end}</span> of{' '}
        <span className="font-semibold text-navy-600 dark:text-navy-200">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-navy-300 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                p === page ? 'bg-green-500 text-white' : 'text-navy-500 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-white/5'
              )}
            >
              {p + 1}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
          disabled={page === pageCount - 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}