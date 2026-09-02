import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, TrendingUp, Boxes } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const FEATURES = [
  { icon: Boxes, text: 'Real-time stock tracking' },
  { icon: TrendingUp, text: 'Business growth insights' },
  { icon: ShieldCheck, text: 'Secured with two-factor authentication' },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-(--color-surface-light) dark:bg-(--color-surface-dark)">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-green-700">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-400 glow-ambient" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-mint-400 glow-ambient" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white text-lg">Clean & Scrub</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-md"
          >
            <h1 className="font-display text-3xl font-bold text-white leading-tight mb-4">
              Run your inventory with clarity and confidence.
            </h1>
            <p className="text-navy-100/80 text-sm leading-relaxed mb-8">
              Track every item in, every item out, and every business trend — all in one place.
            </p>

            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
                    <Icon className="w-4 h-4 text-mint-300" strokeWidth={2.2} />
                  </div>
                  <span className="text-sm text-white/90 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <p className="text-xs text-white/40">© {new Date().getFullYear()} Clean & Scrub Company Ltd</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 lg:hidden flex items-center gap-2.5 justify-center">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-navy-800 dark:text-white">Clean & Scrub</span>
            </div>

            {title && (
              <div className="mb-8 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-navy-800 dark:text-white mb-1.5">
                  {title}
                </h2>
                {subtitle && <p className="text-sm text-navy-400 dark:text-navy-300">{subtitle}</p>}
              </div>
            )}

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}