import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MOBILE_PRIMARY_NAV, MOBILE_MORE_NAV } from '../../utils/navConfig';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

export default function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-40 glass-strong border-t border-white/40 dark:border-white/5 flex items-center justify-around px-2">
        {MOBILE_PRIMARY_NAV.map(({ key, path, icon: Icon }) => (
          <NavLink
            key={key}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 h-full text-[11px] font-medium transition-colors',
                isActive ? 'text-green-500' : 'text-navy-400 dark:text-navy-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
                <span>{t(`nav.${key}`)}</span>
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-[11px] font-medium text-navy-400 dark:text-navy-300"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
          <span>More</span>
        </button>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="lg:hidden fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong rounded-t-3xl p-5 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-navy-800 dark:text-white">Menu</span>
                <button onClick={() => setMoreOpen(false)}>
                  <X className="w-5 h-5 text-navy-500 dark:text-navy-200" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOBILE_MORE_NAV.map(({ key, path, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={path}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-navy-50 dark:bg-white/5 text-navy-600 dark:text-navy-200'
                      )
                    }
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                    {t(`nav.${key}`)}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-500"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2.2} />
                  {t('nav.logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}