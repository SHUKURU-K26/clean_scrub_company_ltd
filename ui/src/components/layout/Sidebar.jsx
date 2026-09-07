import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import cleanScrubLogo from '../../assets/clean_scrub_logo.png';
import { NAV_ITEMS } from '../../utils/navConfig';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-40 glass-strong border-r border-white/40 dark:border-white/5">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-navy-100/50 dark:border-white/5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg shadow-green-600/20 overflow-hidden">
          <div className="w-full h-full rounded-full border-2 border-green-600 p-0.5 bg-white/15 overflow-hidden">
            <img src={cleanScrubLogo} alt="Clean Scrub" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-navy-800 dark:text-white text-sm leading-tight">
            Clean & Scrub
          </p>
          <p className="text-[11px] text-navy-400 dark:text-navy-300 font-medium">
            Inventory System
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
          <NavLink
            key={key}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-600/25'
                  : 'text-navy-500 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-white/5 hover:text-navy-800 dark:hover:text-white'
              )
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2.2} />
            <span>{t(`nav.${key}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-navy-100/50 dark:border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center text-navy-700 dark:text-white font-semibold text-sm shrink-0">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-800 dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-navy-400 dark:text-navy-300 truncate">
              {user?.role || 'admin'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={2.2} />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}