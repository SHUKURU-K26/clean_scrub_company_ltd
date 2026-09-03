import { useState } from 'react';
import { Copy, Check, Download, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { generateRecoveryCodes } from '../../services/otpService';
import { useOtpStore } from '../../store/otpStore';
import { useAuthStore } from '../../store/authStore';

export default function RegenerateCodesModal({ open, onClose }) {
  const user = useAuthStore((state) => state.user);
  const regenerateRecoveryCodes = useOtpStore((state) => state.regenerateRecoveryCodes);
  const [codes, setCodes] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const newCodes = generateRecoveryCodes(8);
    regenerateRecoveryCodes(user.email, newCodes);
    setCodes(newCodes);
    setLoading(false);
    toast.success('New recovery codes generated');
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean-scrub-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCodes(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Regenerate Recovery Codes" size="sm">
      {!codes ? (
        <div className="text-center py-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-sm text-navy-500 dark:text-navy-300 mb-6">
            Your old recovery codes will stop working immediately. Make sure you can save the new ones before continuing.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 cursor-pointer">Cancel</Button>
            <Button onClick={handleGenerate} loading={loading} className="flex-1 cursor-pointer">Generate New Codes</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl glass p-4">
            {codes.map((code) => (
              <code key={code} className="text-sm font-mono text-navy-700 dark:text-navy-100 text-center py-1.5">{code}</code>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyAll} className="flex-1 cursor-pointer">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy all'}
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1 cursor-pointer">
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
          <Button onClick={handleClose} className="w-full cursor-pointer">Done</Button>
        </div>
      )}
    </Modal>
  );
}