import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, KeyRound, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../../components/layout/AuthLayout';
import OtpInputGroup from '../../components/forms/OtpInputGroup';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { verifyOtpSetup, verifyOtpLogin, verifyRecoveryCodeRequest } from '../../services/authService';

export default function VerifyOtp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pendingUser = useAuthStore((state) => state.pendingUser);
  const pendingToken = useAuthStore((state) => state.pendingToken);
  const otpSetupRequired = useAuthStore((state) => state.otpSetupRequired);
  const otpProvisioningUri = useAuthStore((state) => state.otpProvisioningUri);
  const otpSecret = useAuthStore((state) => state.otpSecret);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const completeLogin = useAuthStore((state) => state.completeLogin);

  const [mode, setMode] = useState('code');
  const [otp, setOtp] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  useEffect(() => {
    if (!pendingUser && !isAuthenticated) navigate('/login', { replace: true });
  }, [pendingUser, isAuthenticated, navigate]);

  if (!pendingUser) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(otpSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const handleVerifySetup = async () => {
    setError('');
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    setLoading(true);
    try {
      const res = await verifyOtpSetup(otp, pendingToken); // { accessToken, user, recoveryCodes }
      toast.success('Authenticator connected');
      navigate('/recovery-codes', { state: { codes: res.recoveryCodes, accessToken: res.accessToken, user: res.user } });
    } catch (err) {
      setError(err.message || 'Incorrect code — please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = mode === 'code'
        ? (otp.length === 6 ? await verifyOtpLogin(otp, pendingToken) : (() => { throw new Error('Enter the 6-digit code'); })())
        : await verifyRecoveryCodeRequest(recoveryCode.trim().toUpperCase(), pendingToken);

      completeLogin(res.user, res.accessToken);
      toast.success(`Welcome back, ${res.user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (otpSetupRequired) {
    return (
      <AuthLayout title="Set up your authenticator" subtitle="Scan this once — you won't see it again after today.">
        <div className="space-y-5">
          <div className="flex justify-center p-4 rounded-2xl glass">
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={otpProvisioningUri} size={168} />
            </div>
          </div>

          {otpSecret && (
            <div className="rounded-xl glass p-3 flex items-center justify-between gap-2">
              <code className="text-xs text-navy-600 dark:text-navy-200 truncate">{otpSecret}</code>
              <button onClick={handleCopySecret} className="shrink-0 text-navy-400 hover:text-green-500">
                {secretCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <p className="text-xs text-navy-400 dark:text-navy-300 text-center">
            Can't scan? Enter that key manually in Google Authenticator, Authy, or 1Password.
          </p>

          <div className="pt-2">
            <p className="text-sm font-medium text-navy-600 dark:text-navy-200 mb-3 text-center">{t('auth.enterOtpCode')}</p>
            <OtpInputGroup value={otp} onChange={setOtp} error={error} />
          </div>

          <Button onClick={handleVerifySetup} loading={loading} className="w-full">
            <ShieldCheck className="w-4 h-4" /> Confirm & Activate
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.verifyOtp')} subtitle={mode === 'code' ? t('auth.enterOtpCode') : 'Enter one of your saved recovery codes'}>
      <div className="space-y-5">
        {mode === 'code' ? (
          <OtpInputGroup value={otp} onChange={setOtp} error={error} />
        ) : (
          <div>
            <input
              value={recoveryCode}
              onChange={(e) => { setRecoveryCode(e.target.value); setError(''); }}
              placeholder="XXXX-XXXX"
              className="w-full h-11 rounded-xl bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-center tracking-widest font-mono text-sm text-navy-800 dark:text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20"
            />
            {error && <p className="mt-2 text-xs text-red-500 font-medium text-center">{error}</p>}
          </div>
        )}

        <Button onClick={handleVerifyLogin} loading={loading} className="w-full cursor-pointer">
          {t('auth.verifyOtp')}
        </Button>

        <button
          onClick={() => { setMode(mode === 'code' ? 'recovery' : 'code'); setError(''); setOtp(''); setRecoveryCode(''); }}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-navy-400 dark:text-navy-300 hover:text-green-500 font-medium cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          {mode === 'code' ? t('auth.recoveryCode') : 'Use authenticator code instead'}
        </button>

        <button onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-1.5 text-sm text-navy-400 dark:text-navy-300 hover:text-navy-600 dark:hover:text-white cursor-pointer font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('common.back')}
        </button>
      </div>
    </AuthLayout>
  );
}