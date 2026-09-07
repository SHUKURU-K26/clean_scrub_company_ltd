import { create } from 'zustand';
import api from '../services/api';
import { camelize, snakeize } from '../utils/normalize';
import { useProductStore } from './productStore';
import { useCustomerStore } from './customerStore';

// After any stock-in/out create, edit, or delete, product quantities (and
// possibly the customer list, if a new customer was created inline) change
// server-side. Rather than duplicating that math on the frontend, we just
// refetch — same "invalidate and refetch" pattern as the rest of the app,
// and it guarantees the UI never drifts from what Postgres actually has.
async function refreshRelatedData() {
  await Promise.all([
    useProductStore.getState().fetchProducts(),
    useCustomerStore.getState().fetchCustomers(),
  ]);
}

export const useTransactionStore = create((set) => ({
  transactions: [],
  suppliers: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/transactions');
      set({ transactions: camelize(data), loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchSuppliers: async () => {
    const { data } = await api.get('/transactions/suppliers');
    set({ suppliers: camelize(data) });
  },

  addStockIn: async ({ productId, quantity, supplier, date }) => {
    const { data } = await api.post('/transactions/stock-in', snakeize({ productId, quantity, supplier, date }));
    const tx = camelize(data);
    set((state) => ({ transactions: [tx, ...state.transactions] }));
    await useProductStore.getState().fetchProducts();
    return tx;
  },

  addStockOut: async (payload) => {
    const { data } = await api.post('/transactions/stock-out', snakeize(payload));
    const tx = camelize(data);
    set((state) => ({ transactions: [tx, ...state.transactions] }));
    await refreshRelatedData();
    return tx;
  },

  updateStockIn: async (id, { productId, quantity, supplier, date }) => {
    const { data } = await api.put(`/transactions/stock-in/${id}`, snakeize({ productId, quantity, supplier, date }));
    const updated = camelize(data);
    set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? updated : t)) }));
    await useProductStore.getState().fetchProducts();
    return updated;
  },

  updateStockOut: async (id, payload) => {
    const { data } = await api.put(`/transactions/stock-out/${id}`, snakeize(payload));
    const updated = camelize(data);
    set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? updated : t)) }));
    await refreshRelatedData();
    return updated;
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
    await useProductStore.getState().fetchProducts();
  },

  deleteMultipleTransactions: async (ids) => {
    await api.post('/transactions/bulk-delete', { ids });
    set((state) => ({ transactions: state.transactions.filter((t) => !ids.includes(t.id)) }));
    await useProductStore.getState().fetchProducts();
  },
}));