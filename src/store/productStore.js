import { create } from 'zustand';
import api from '../services/api';
import { camelize, snakeize } from '../utils/normalize';

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/products');
      set({ products: camelize(data), loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  addProduct: async (product) => {
    const { data } = await api.post('/products', snakeize(product));
    const newProduct = camelize(data);
    set((state) => ({ products: [newProduct, ...state.products] }));
    return newProduct;
  },

  updateProduct: async (id, updates) => {
    const { data } = await api.put(`/products/${id}`, snakeize(updates));
    const updated = camelize(data);
    set((state) => ({ products: state.products.map((p) => (p.id === id ? updated : p)) }));
    return updated;
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },

  getProductById: (id) => get().products.find((p) => p.id === id),
}));