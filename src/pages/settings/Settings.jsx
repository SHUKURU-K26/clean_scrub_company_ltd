import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Palette, Bell, ShieldCheck, Globe, RefreshCw, KeyRound } from 'lucide-react';
import SettingsSection from '../../components/settings/SettingsSection';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import RegenerateCodesModal from '../../components/settings/RegenerateCodesModal';
import { useSettingsStore } from '../../store/settingsStore';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { useOtpStore } from '../../store/otpStore';
import { useAuthStore } from '../../store/authStore';

export default function Settings() {
  const lowStockAlerts = useSettingsStore((state) => state.lowStockAlerts);
  const dailySummaryBanner = useSettingsStore((state) => state.dailySummaryBanner);
  const soundOnSave = useSettingsStore((state) => state.soundOnSave);
  const setPreference = useSettingsStore((state) => state.setPreference);

  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const getRecoveryCodesRemaining = useOtpStore((state) => state.getRecoveryCodesRemaining);
  const clearSecret = useOtpStore((state) => state.clearSecret);
  const navigate = useNavigate();

  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [resetAuthOpen, setResetAuthOpen] = useState(false);

  const codesRemaining = user ? getRecoveryCodesRemaining(user.email) : 0;

  const handleResetAuthenticator = () => {
    clearSecret(user.email);
    logout();
    toast.success('Authenticator reset — set it up again on your next login');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Settings</h1>
        <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">Manage app preferences and security</p>
      </div>

      <SettingsSection icon={Palette} title="Appearance" subtitle="Customize how Clean & Scrub looks">
        <div className="flex items-center justify-between py-3 border-b border-navy-50 dark:border-white/5">
          <div>
            <p className="text-sm font-semibold text-navy-700 dark:text-white">Theme</p>
            <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-navy-400" />
            <div>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">Language</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">Choose your preferred language</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${language === l.code ? 'bg-green-500 text-white' : 'glass text-navy-500 dark:text-navy-300'}`}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notifications" subtitle="Control in-app alerts" delay={0.05}>
        <ToggleSwitch
          checked={lowStockAlerts}
          onChange={(v) => setPreference('lowStockAlerts', v)}
          label="Low stock alerts"
          description="Show a banner when items fall below reorder level"
        />
        <ToggleSwitch
          checked={dailySummaryBanner}
          onChange={(v) => setPreference('dailySummaryBanner', v)}
          label="Daily summary"
          description="Show a quick summary card each time you open the dashboard"
        />
        <ToggleSwitch
          checked={soundOnSave}
          onChange={(v) => setPreference('soundOnSave', v)}
          label="Sound on save"
          description="Play a subtle sound when a form saves successfully"
        />
      </SettingsSection>

      <SettingsSection icon={ShieldCheck} title="Security" subtitle="Two-factor authentication and recovery" delay={0.1}>
        <div className="flex items-center justify-between py-3 border-b border-navy-50 dark:border-white/5">
          <div>
            <p className="text-sm font-semibold text-navy-700 dark:text-white">Authenticator app</p>
            <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">Required on every login</p>
          </div>
          <Badge variant="green">Enabled</Badge>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-navy-50 dark:border-white/5">
          <div>
            <p className="text-sm font-semibold text-navy-700 dark:text-white">Recovery codes</p>
            <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">{codesRemaining} unused codes remaining</p>
          </div>
          <Button variant="outline" onClick={() => setRegenerateOpen(true)} className="h-9 px-3 text-xs cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </Button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-navy-50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-navy-400" />
            <div>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">Password</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">Change your account password</p>
            </div>
          </div>
          <Link to="/settings/change-password">
            <Button variant="outline" className="h-9 px-3 text-xs cursor-pointer">Change</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm font-semibold text-red-500">Reset authenticator</p>
            <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">Disconnects your current app — you'll set up a new one at next login</p>
          </div>
          <Button variant="danger" onClick={() => setResetAuthOpen(true)} className="h-9 px-3 text-xs cursor-pointer">Reset</Button>
        </div>
      </SettingsSection>

      <RegenerateCodesModal open={regenerateOpen} onClose={() => setRegenerateOpen(false)} />

      <ConfirmDialog
        open={resetAuthOpen}
        onClose={() => setResetAuthOpen(false)}
        onConfirm={handleResetAuthenticator}
        title="Reset your authenticator?"
        description="You'll be logged out and required to scan a new QR code on your next login."
      />
    </div>
  );
}