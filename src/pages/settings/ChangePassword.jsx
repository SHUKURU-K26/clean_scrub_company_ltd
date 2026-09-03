import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import SettingsSection from '../../components/settings/SettingsSection';
import PasswordInput from '../../components/forms/PasswordInput';
import PasswordStrengthMeter from '../../components/forms/PasswordStrengthMeter';
import Button from '../../components/ui/Button';
import { changePasswordSchema } from '../../utils/profileSchemas';
import { changePasswordRequest } from '../../services/profileService';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await changePasswordRequest(data);
      toast.success('Password updated');
      setDone(true);
      reset();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md space-y-5">
      <button onClick={() => navigate('/settings')} className="flex items-center gap-1.5 text-sm text-navy-400 dark:text-navy-300 hover:text-navy-600 dark:hover:text-white cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Change Password</h1>
        <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">Use a strong password you don't use elsewhere</p>
      </div>

      <SettingsSection title="Update Password">
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm text-navy-500 dark:text-navy-300 mb-5">Your password has been updated successfully.</p>
            <Button onClick={() => setDone(false)} variant="outline" className="w-full cursor-pointer">Change it again</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PasswordInput label="Current password" placeholder="••••••••" error={errors.currentPassword?.message} {...register('currentPassword')} />
            <div>
              <PasswordInput label="New password" placeholder="••••••••" error={errors.newPassword?.message} {...register('newPassword')} />
              <PasswordStrengthMeter password={newPassword} />
            </div>
            <PasswordInput label="Confirm new password" placeholder="••••••••" error={errors.confirmNewPassword?.message} {...register('confirmNewPassword')} />

            <Button type="submit" loading={isSubmitting} className="w-full mt-2 cursor-pointer">Update Password</Button>
          </form>
        )}
      </SettingsSection>
    </div>
  );
}