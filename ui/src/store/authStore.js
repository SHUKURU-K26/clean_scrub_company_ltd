import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      pendingUser: null,
      pendingToken: null,
      otpSetupRequired: false,
      otpProvisioningUri: null,
      otpSecret: null,

      setPendingAuth: ({ user, pendingToken, otpSetupRequired, otpProvisioningUri, otpSecret }) =>
        set({
          pendingUser: user,
          pendingToken,
          otpSetupRequired: !!otpSetupRequired,
          otpProvisioningUri: otpProvisioningUri || null,
          otpSecret: otpSecret || null,
        }),

      completeLogin: (user, accessToken) =>
        set({
          user, accessToken, isAuthenticated: true,
          pendingUser: null, pendingToken: null, otpSetupRequired: false, otpProvisioningUri: null, otpSecret: null,
        }),

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      logout: () =>
        set({
          user: null, accessToken: null, isAuthenticated: false,
          pendingUser: null, pendingToken: null, otpSetupRequired: false, otpProvisioningUri: null, otpSecret: null,
        }),
    }),
    { name: 'css-auth' }
  )
);