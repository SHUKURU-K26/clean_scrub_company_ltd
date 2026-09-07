import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyThemeClass = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark'

      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeClass(next);
        set({ theme: next });
      },

      // Called once when the app boots — syncs the <html> class with
      // whatever was persisted, or falls back to system preference
      initTheme: () => {
        const stored = get().theme;
        if (stored) {
          applyThemeClass(stored);
          return;
        }
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'light';
        applyThemeClass(initial);
        set({ theme: initial });
      },
    }),
    { name: 'css-theme' } // localStorage key
  )
);