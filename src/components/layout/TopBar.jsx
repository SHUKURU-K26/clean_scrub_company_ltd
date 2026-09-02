import { Sparkles } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileMenu from './ProfileMenu';

export default function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 glass border-b border-white/40 dark:border-white/5 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-navy-800 dark:text-white text-sm">
          Clean & Scrub
        </span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}