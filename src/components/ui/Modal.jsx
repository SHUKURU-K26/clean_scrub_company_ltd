import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', full: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className={cn('relative w-full glass-strong rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col', sizes[size])}
          >
            {title && (
              <div className="flex items-center justify-between px-5 sm:px-6 h-16 border-b border-navy-100/50 dark:border-white/5 shrink-0">
                <h3 className="font-display font-bold text-navy-800 dark:text-white">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-50 dark:hover:bg-white/5 hover:text-navy-700 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 sm:px-6 h-16 border-t border-navy-100/50 dark:border-white/5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}