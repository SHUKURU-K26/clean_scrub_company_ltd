import { create } from 'zustand';
import api from '../services/api';
import { camelize, snakeize } from '../utils/normalize';

export const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/customers');
      set({ customers: camelize(data), loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  addCustomer: async (customer) => {
    const { data } = await api.post('/customers', snakeize(customer));
    const newCustomer = camelize(data);
    set((state) => ({ customers: [newCustomer, ...state.customers] }));
    return newCustomer;
  },

  updateCustomer: async (id, updates) => {
    const { data } = await api.put(`/customers/${id}`, snakeize(updates));
    const updated = camelize(data);
    set((state) => ({ customers: state.customers.map((c) => (c.id === id ? updated : c)) }));
    return updated;
  },

  deleteCustomer: async (id) => {
    await api.delete(`/customers/${id}`);
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
  },

  deleteMultipleCustomers: async (ids) => {
    await api.post('/customers/bulk-delete', { ids });
    set((state) => ({ customers: state.customers.filter((c) => !ids.includes(c.id)) }));
  },

  getCustomerById: (id) => get().customers.find((c) => c.id === id),
}));