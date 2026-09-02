import { useState } from 'react';
import { motion } from 'framer-motion';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';

export default function DataCardList({ data, renderCard, loading, onCardClick, emptyMessage = 'No results found', initialCount = 6, step = 6 }) {
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
      {shown.map((item, i) => (
        <motion.div
          key={item.id ?? i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i, 5) * 0.03 }}
          onClick={() => onCardClick?.(item)}
          className="rounded-2xl glass p-4 active:scale-[0.98] transition-transform cursor-pointer"
        >
          {renderCard(item)}
        </motion.div>
      ))}
      {visible < data.length && (
        <Button variant="outline" onClick={() => setVisible((v) => v + step)} className="w-full">
          Load more ({data.length - visible} remaining)
        </Button>
      )}
    </div>
  );
}