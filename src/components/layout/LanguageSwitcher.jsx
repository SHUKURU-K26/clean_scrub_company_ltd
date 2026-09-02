import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore';

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 h-9 rounded-full glass text-sm font-medium text-navy-600 dark:text-navy-100"
      >
        <Globe className="w-4 h-4" strokeWidth={2.2} />
        <span className="hidden sm:inline">{current?.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl glass-strong p-1.5 z-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-navy-700 dark:text-navy-100 hover:bg-navy-50 dark:hover:bg-white/10"
              >
                {lang.label}
                {lang.code === language && <Check className="w-4 h-4 text-green-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}