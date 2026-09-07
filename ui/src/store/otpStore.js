import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Temporary stand-in for backend-stored OTP data, keyed by email.
// Will be fully replaced by FastAPI + Postgres — the secret and recovery
// codes must be stored server-side (hashed) in the real version, never
// sitting in browser storage like this. This is here purely so the full
// flow is clickable/testable before the backend exists.
export const useOtpStore = create(
  persist(
    (set, get) => ({
      byEmail: {},

      hasSecret: (email) => !!get().byEmail[email]?.secret,
      getSecret: (email) => get().byEmail[email]?.secret || null,
      getRecoveryCodes: (email) => get().byEmail[email]?.recoveryCodes || [],

      saveSecretAndCodes: (email, secret, recoveryCodes) =>
        set((state) => ({
          byEmail: {
            ...state.byEmail,
            [email]: {
              secret,
              recoveryCodes: recoveryCodes.map((code) => ({ code, used: false })),
            },
          },
        })),

      redeemRecoveryCode: (email, code) => {
        const entry = get().byEmail[email];
        const match = entry?.recoveryCodes.find((rc) => rc.code === code && !rc.used);
        if (!match) return false;
        set((state) => ({
          byEmail: {
            ...state.byEmail,
            [email]: {
              ...entry,
              recoveryCodes: entry.recoveryCodes.map((rc) =>
                rc.code === code ? { ...rc, used: true } : rc
              ),
            },
          },
        }));
        return true;
      },
       
      regenerateRecoveryCodes: (email, newCodes) =>
      set((state) => ({
        byEmail: {
          ...state.byEmail,
          [email]: {
            ...state.byEmail[email],
            recoveryCodes: newCodes.map((code) => ({ code, used: false })),
          },
        },
      })),

      clearSecret: (email) =>
        set((state) => {
          const updated = { ...state.byEmail };
          delete updated[email];
          return { byEmail: updated };
        }),

      getRecoveryCodesRemaining: (email) => {
        const codes = get().byEmail[email]?.recoveryCodes || [];
        return codes.filter((c) => !c.used).length;
      },
        
      }),
    { name: 'css-otp' }
  )
);