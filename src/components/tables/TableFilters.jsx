import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function TableFilters({ search, onSearchChange, placeholder = 'Search...', children, activeCount = 0 }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300 dark:text-navy-500" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-800 dark:text-white placeholder:text-navy-300 dark:placeholder:text-navy-500 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20 transition-all"
          />
          {search && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {children && (
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              'relative h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium border transition-colors shrink-0',
              filtersOpen ? 'bg-green-500 border-green-500 text-white' : 'bg-white/60 dark:bg-white/5 border-navy-100 dark:border-white/10 text-navy-600 dark:text-navy-200'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-green-600 text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {filtersOpen && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}