import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../../components/layout/AuthLayout';
import PasswordInput from '../../components/forms/PasswordInput';
import PasswordStrengthMeter from '../../components/forms/PasswordStrengthMeter';
import Button from '../../components/ui/Button';
import { resetPasswordSchema } from '../../utils/authSchemas';
import { resetPasswordRequest } from '../../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // In production, the token comes from the URL query string in the
      // emailed link, e.g. /reset-password?token=xxxx — read via useSearchParams
      await resetPasswordRequest({ token: 'dev-token', password: data.password });
      setDone(true);
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now log in with your new password.">
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl glass flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-500" strokeWidth={2} />
          </div>
          <Button onClick={() => navigate('/login')} className="w-full">
            Continue to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Make it strong — you'll use it every time you log in.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <PasswordInput
            label="New password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <PasswordInput
          label="Confirm new password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" loading={loading} className="w-full mt-2">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}