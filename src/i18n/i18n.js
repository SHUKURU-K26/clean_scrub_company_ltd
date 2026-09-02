import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import rw from './locales/rw.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      rw: { translation: rw },
    },
    lng: 'en', // overridden by languageStore.initLanguage() on app boot
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes output, so no double-escaping
    },
  });

export default i18n;