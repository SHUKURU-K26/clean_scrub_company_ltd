import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { User, Mail } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/forms/FormInput';
import PasswordInput from '../../components/forms/PasswordInput';
import PasswordStrengthMeter from '../../components/forms/PasswordStrengthMeter';
import Button from '../../components/ui/Button';
import { signupSchema } from '../../utils/authSchemas';
import { signupRequest } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setPendingUser = useAuthStore((state) => state.setPendingUser);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await signupRequest(data);
      setPendingUser(user);
      toast.success('Account created — secure it with an authenticator app');
      navigate('/verify-otp');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('auth.signup')} subtitle="Create your account to get started.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Full name"
          icon={User}
          placeholder="Jane Uwase"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormInput
          label={t('auth.email')}
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <PasswordInput
            label={t('auth.password')}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <PasswordInput
          label={t('auth.confirmPassword')}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" loading={loading} className="w-full mt-2">
          {t('auth.signup')}
        </Button>

        <p className="text-center text-sm text-navy-400 dark:text-navy-300 pt-2">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-green-600 dark:text-green-400 font-semibold hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}