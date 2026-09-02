import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/forms/FormInput';
import Button from '../../components/ui/Button';
import { forgotPasswordSchema } from '../../utils/authSchemas';
import { requestPasswordResetEmail } from '../../services/authService';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await requestPasswordResetEmail(data.email);
      setEmailSentTo(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We've sent a password reset link to ${emailSentTo}`}>
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl glass flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-green-500" strokeWidth={2} />
          </div>
          <p className="text-xs text-navy-400 dark:text-navy-300 leading-relaxed">
            Didn't get it? Check your spam folder, or wait a minute and try again.
          </p>

          {/* Dev-only stand-in until the backend actually sends emails —
              simulates clicking the link from an inbox. Remove once real
              email delivery is wired up. */}
          <button
            onClick={() => navigate('/reset-password')}
            className="text-xs text-navy-300 dark:text-navy-500 underline decoration-dotted"
          >
            (Dev preview) Simulate clicking the email link
          </button>

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-semibold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('auth.login')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.resetPassword')} subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t('auth.email')}
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" loading={loading} className="w-full mt-2">
          Send reset link
        </Button>

        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-navy-400 dark:text-navy-300 hover:text-navy-600 dark:hover:text-white pt-2">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('auth.login')}
        </Link>
      </form>
    </AuthLayout>
  );
}