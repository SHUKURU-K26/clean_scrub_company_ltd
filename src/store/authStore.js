import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOtpVerified: false,
      pendingUser: null, // set once email+password succeed, before OTP is confirmed

      setPendingUser: (user) => set({ pendingUser: user }),

      completeLogin: (user) =>
        set({ user, isAuthenticated: true, isOtpVerified: true, pendingUser: null }),

      logout: () =>
        set({ user: null, isAuthenticated: false, isOtpVerified: false, pendingUser: null }),
    }),
    { name: 'css-auth' }
  )
);