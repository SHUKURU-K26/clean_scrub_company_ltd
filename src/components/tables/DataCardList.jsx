import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

export default function DataCardList({
  data, renderCard, loading, onCardClick, emptyMessage = 'No results found', initialCount = 6, step = 6,
  selectable = false, selectedIds = [], onToggleSelect,
}) {
  const [visible, setVisible] = useState(initialCount);

  if (loading) {
    return (
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="md:hidden text-center py-10 text-navy-400 dark:text-navy-300 text-sm">{emptyMessage}</div>;
  }

  const shown = data.slice(0, visible);

  return (
    <div className="md:hidden space-y-3">
      {shown.map((item, i) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <motion.div
            key={item.id ?? i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 5) * 0.03 }}
            onClick={() => onCardClick?.(item)}
            className={cn('relative rounded-2xl glass p-4 active:scale-[0.98] transition-transform cursor-pointer', isSelected && 'ring-2 ring-green-400')}
          >
            {selectable && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect?.(item.id); }}
                className={cn(
                  'absolute top-3 right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center z-10 transition-colors',
                  isSelected ? 'bg-green-500 border-green-500' : 'bg-white/80 dark:bg-white/10 border-navy-200 dark:border-white/20'
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
            )}
            <div className={selectable ? 'pr-8' : ''}>{renderCard(item)}</div>
          </motion.div>
        );
      })}
      {visible < data.length && (
        <Button variant="outline" onClick={() => setVisible((v) => v + step)} className="w-full cursor-pointer">
          Load more ({data.length - visible} remaining)
        </Button>
      )}
    </div>
  );
}