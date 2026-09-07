import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, FileDown, FileSpreadsheet, X } from 'lucide-react';
import Button from '../ui/Button';

export default function BulkActionBar({ count, onClear, onDelete, onExportPdf, onExportExcel, deleting }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 glass-strong rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl"
        >
          <span className="text-sm font-semibold text-navy-800 dark:text-white whitespace-nowrap pl-1">
            {count} selected
          </span>
          <div className="w-px h-5 bg-navy-100 dark:bg-white/10" />
          <button onClick={onExportPdf} className="flex items-center gap-1.5 text-xs font-medium text-navy-500 dark:text-navy-200 hover:text-green-500 px-1.5">
            <FileDown className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={onExportExcel} className="flex items-center gap-1.5 text-xs font-medium text-navy-500 dark:text-navy-200 hover:text-green-500 px-1.5">
            <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
          </button>
          <Button variant="danger" onClick={onDelete} loading={deleting} className="h-9 px-3 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
          <button onClick={onClear} className="text-navy-300 hover:text-navy-500 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}