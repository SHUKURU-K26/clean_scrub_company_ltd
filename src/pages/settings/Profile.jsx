import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsSection from '../../components/settings/SettingsSection';
import AvatarUpload from '../../components/ui/AvatarUpload';
import FormInput from '../../components/forms/FormInput';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { profileSchema } from '../../utils/profileSchemas';
import { updateProfileRequest } from '../../services/profileService';
import { useAuthStore } from '../../store/authStore';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  const onSubmit = async (data) => {
    try {
      const updated = await updateProfileRequest({ ...data, avatarUrl });
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Something went wrong — please try again');
    }
  };

  const handleAvatarChange = async (dataUrl) => {
    setAvatarUrl(dataUrl);
    try {
      const updated = await updateProfileRequest({ avatarUrl: dataUrl });
      updateUser(updated);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update photo');
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Profile</h1>
        <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">Manage your personal information</p>
      </div>

      <SettingsSection title="Personal Information" subtitle="This is how you appear across the system">
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <AvatarUpload name={user?.name} avatarUrl={avatarUrl} onChange={handleAvatarChange} />
          <div className="flex-1 flex flex-col justify-center items-center sm:items-start gap-1.5">
            <p className="font-display font-bold text-navy-800 dark:text-white">{user?.name}</p>
            <Badge variant="green" className="capitalize">{user?.role || 'admin'}</Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput label="Full name" error={errors.name?.message} {...register('name')} />
          <FormInput label="Email address" type="email" error={errors.email?.message} {...register('email')} />
          <FormInput label="Phone number" placeholder="0788123456" error={errors.phone?.message} {...register('phone')} />

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection icon={ShieldCheck} title="Security" subtitle="Password and two-factor authentication" delay={0.05}>
        <Link
          to="/settings/change-password"
          className="flex items-center justify-between rounded-xl glass px-4 py-3.5 hover:bg-navy-50/60 dark:hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-navy-400" />
            <span className="text-sm font-medium text-navy-700 dark:text-white">Change password</span>
          </div>
          <span className="text-xs text-navy-400 dark:text-navy-300">→</span>
        </Link>
      </SettingsSection>
    </div>
  );
}