import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n/i18n';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'rw', label: 'Kinyarwanda' },
];

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (code) => {
        i18n.changeLanguage(code);
        set({ language: code });
      },

      // Run once on app boot to sync i18next with the persisted choice
      initLanguage: () => {
        i18n.changeLanguage(get().language);
      },
    }),
    { name: 'css-language' }
  )
);