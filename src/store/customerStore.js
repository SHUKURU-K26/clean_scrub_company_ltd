import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CUSTOMERS as SEED_CUSTOMERS } from '../data/mockData';

export const useCustomerStore = create(
  persist(
    (set, get) => ({
      customers: SEED_CUSTOMERS,

      addCustomer: async (customer) => {
        await new Promise((r) => setTimeout(r, 300));
        const newCustomer = { ...customer, id: `c${Date.now()}` };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
        return newCustomer;
      },

      updateCustomer: async (id, updates) => {
        await new Promise((r) => setTimeout(r, 400));
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCustomer: async (id) => {
        await new Promise((r) => setTimeout(r, 400));
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
      },

      getCustomerById: (id) => get().customers.find((c) => c.id === id),
    }),
    { name: 'css-customers' }
  )
);