import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TRANSACTIONS as SEED_TRANSACTIONS } from '../data/mockData';
import { useProductStore } from './productStore';

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: SEED_TRANSACTIONS,

      addStockIn: async ({ productId, quantity, supplier, date }) => {
        await new Promise((r) => setTimeout(r, 500));
        const product = useProductStore.getState().getProductById(productId);
        if (!product) throw new Error('Product not found');

        await useProductStore.getState().updateProduct(productId, { quantity: product.quantity + quantity });

        const tx = {
          id: `tx${Date.now()}`,
          type: 'in',
          productId,
          productName: product.name,
          category: product.category,
          quantity,
          unitPrice: product.unitPrice,
          supplier,
          date: new Date(date).toISOString(),
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        return tx;
      },

      addStockOut: async ({ productId, quantity, customer, date }) => {
        await new Promise((r) => setTimeout(r, 500));
        const product = useProductStore.getState().getProductById(productId);
        if (!product) throw new Error('Product not found');
        if (quantity > product.quantity) throw new Error('Not enough stock available');

        await useProductStore.getState().updateProduct(productId, { quantity: product.quantity - quantity });

        const tx = {
          id: `tx${Date.now()}`,
          type: 'out',
          productId,
          productName: product.name,
          category: product.category,
          quantity,
          unitPrice: product.unitPrice,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerType: customer.type,
          date: new Date(date).toISOString(),
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        return tx;
      },

      // Reverses the stock effect on delete so removing a mistaken entry
      // keeps inventory counts accurate instead of leaving them skewed
      deleteTransaction: async (id) => {
        await new Promise((r) => setTimeout(r, 400));
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx) return;

        const product = useProductStore.getState().getProductById(tx.productId);
        if (product) {
          const revertedQty = tx.type === 'in' ? product.quantity - tx.quantity : product.quantity + tx.quantity;
          await useProductStore.getState().updateProduct(tx.productId, { quantity: Math.max(0, revertedQty) });
        }

        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },
    }),
    { name: 'css-transactions' }
  )
);