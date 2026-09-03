import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS as SEED_PRODUCTS } from '../data/mockData';

// Client-side product store — acts as the database until FastAPI + Postgres
// exist. Actions are written async (with a simulated delay) so pages already
// handle loading states correctly; swapping these bodies for real axios
// calls later won't require touching any page component.
export const useProductStore = create(
  persist(
    (set, get) => ({
      products: SEED_PRODUCTS,

      addProduct: async (product) => {
        await new Promise((r) => setTimeout(r, 500));
        const newProduct = { ...product, id: `p${Date.now()}` };
        set((state) => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },

      updateProduct: async (id, updates) => {
        await new Promise((r) => setTimeout(r, 500));
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

        // Synchronous stock adjustment — used internally by transaction logic
        // (edits, deletes, bulk deletes) so multiple adjustments made in sequence
        // don't race against each other the way stacked async calls with delays would
        adjustQuantity: (id, delta) => {
        set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p)),
        }));
        },

      deleteProduct: async (id) => {
        await new Promise((r) => setTimeout(r, 400));
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },

      getProductById: (id) => get().products.find((p) => p.id === id),
    }),
    { name: 'css-products' }
  )
);