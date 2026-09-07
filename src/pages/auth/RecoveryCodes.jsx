import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, Download, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export default function RecoveryCodes() {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingUser = useAuthStore((state) => state.pendingUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const [copied, setCopied] = useState(false);

  const codes = location.state?.codes;
  const accessToken = location.state?.accessToken;
  const user = location.state?.user || pendingUser;

  useEffect(() => {
    if ((!codes || !accessToken) && !isAuthenticated) navigate('/login', { replace: true });
  }, [codes, accessToken, isAuthenticated, navigate]);

  if (!codes || !accessToken) return null;

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    toast.success('Recovery codes copied');
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

  const handleContinue = () => {
    completeLogin(user, accessToken);
    navigate('/', { replace: true });
  };

  return (
    <AuthLayout title="Save your recovery codes" subtitle="Each code works once. You'll need one if you ever lose your authenticator.">
      <div className="space-y-5">
        <div className="rounded-2xl glass p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
            This is the only time these codes are shown. Anyone with a code can bypass your authenticator, so keep them private.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl glass p-4">
          {codes.map((code) => (
            <code key={code} className="text-sm font-mono text-navy-700 dark:text-navy-100 text-center py-1.5">{code}</code>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyAll} className="flex-1">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy all'}
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>

        <Button onClick={handleContinue} className="w-full">I've saved these codes — Continue</Button>
      </div>
    </AuthLayout>
  );
}