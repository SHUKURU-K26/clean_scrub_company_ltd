import cleanScrubLogo from '../../assets/clean_scrub_logo.png';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileMenu from './ProfileMenu';

export default function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 glass border-b border-white/40 dark:border-white/5 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full flex-shrink-0">
          <div className="w-full h-full rounded-full border-2 border-green-600 p-0.5 bg-white/80 overflow-hidden">
            <img src={cleanScrubLogo} alt="Clean Scrub" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <p className="text-sm sm:text-base font-medium text-navy-800 dark:text-white max-w-xs truncate">
            Powered by:{' '}
            <span className="font-semibold text-green-600 inline-block animate-bounce">Ingabo Digital</span>
          </p>
        </div>
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