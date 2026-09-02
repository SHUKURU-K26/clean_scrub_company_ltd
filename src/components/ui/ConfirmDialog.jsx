import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, loading }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-display font-bold text-navy-800 dark:text-white mb-1.5">{title}</h3>
        {description && <p className="text-sm text-navy-400 dark:text-navy-300 mb-6">{description}</p>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">Delete</Button>
        </div>
      </div>
    </Modal>
  );
}