import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, UserCircle, Settings, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 h-9 rounded-full glass"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center text-white font-semibold text-xs">
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-navy-500 dark:text-navy-200 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 rounded-2xl glass-strong p-1.5 z-50"
          >
            <div className="px-3 py-2 mb-1 border-b border-navy-100/50 dark:border-white/5">
              <p className="text-sm font-semibold text-navy-800 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-navy-400 dark:text-navy-300 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={() => { navigate('/profile'); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-navy-700 dark:text-navy-100 hover:bg-navy-50 dark:hover:bg-white/10"
            >
              <UserCircle className="w-4 h-4" /> {t('nav.profile')}
            </button>
            <button
              onClick={() => { navigate('/settings'); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-navy-700 dark:text-navy-100 hover:bg-navy-50 dark:hover:bg-white/10"
            >
              <Settings className="w-4 h-4" /> {t('nav.settings')}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" /> {t('nav.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}