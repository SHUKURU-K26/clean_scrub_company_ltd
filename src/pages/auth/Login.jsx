import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/forms/FormInput';
import PasswordInput from '../../components/forms/PasswordInput';
import Button from '../../components/ui/Button';
import { loginSchema } from '../../utils/authSchemas';
import { loginRequest } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setPendingUser = useAuthStore((state) => state.setPendingUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await loginRequest(data);
      setPendingUser(user);
      toast.success('Credentials verified — enter your authenticator code');
      navigate('/verify-otp');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('auth.login')} subtitle="Welcome back — enter your details to continue.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t('auth.email')}
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label={t('auth.password')}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 text-navy-500 dark:text-navy-300 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded accent-green-500" {...register('remember')} />
            {t('auth.rememberMe')}
          </label>
          <Link to="/forgot-password" className="text-green-600 dark:text-green-400 font-medium hover:underline cursor-pointer">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2 cursor-pointer">
          {t('auth.login')}
        </Button>

        <p className="text-center text-sm text-navy-400 dark:text-navy-300 pt-2">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-green-600 dark:text-green-400 font-semibold hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}