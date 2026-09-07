import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// In-app preferences only — no backend needed for these, they just
// control UI behavior (banners, sounds), not business data.
export const useSettingsStore = create(
  persist(
    (set) => ({
      lowStockAlerts: true,
      dailySummaryBanner: true,
      soundOnSave: false,

      setPreference: (key, value) => set({ [key]: value }),
    }),
    { name: 'css-settings' }
  )
);