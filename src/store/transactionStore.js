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

        useProductStore.getState().adjustQuantity(productId, quantity);

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

        useProductStore.getState().adjustQuantity(productId, -quantity);

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

      updateStockIn: async (id, { productId, quantity, supplier, date }) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx) throw new Error('Entry not found');
        await new Promise((r) => setTimeout(r, 500));

        // Revert the original quantity, then apply the new one — this works
        // correctly whether the product stayed the same or changed
        useProductStore.getState().adjustQuantity(tx.productId, -tx.quantity);
        useProductStore.getState().adjustQuantity(productId, quantity);

        const product = useProductStore.getState().getProductById(productId);
        const updatedTx = {
          ...tx,
          productId,
          productName: product.name,
          category: product.category,
          quantity,
          unitPrice: product.unitPrice,
          supplier,
          date: new Date(date).toISOString(),
        };

        set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? updatedTx : t)) }));
        return updatedTx;
      },

      updateStockOut: async (id, { productId, quantity, customer, date }) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx) throw new Error('Entry not found');
        await new Promise((r) => setTimeout(r, 500));

        const targetProduct = useProductStore.getState().getProductById(productId);
        if (!targetProduct) throw new Error('Product not found');

        // If staying on the same product, the original quantity is still
        // "reserved" against it, so it counts back toward what's available
        // for validating this edit
        const available = productId === tx.productId ? targetProduct.quantity + tx.quantity : targetProduct.quantity;
        if (quantity > available) throw new Error(`Only ${available} ${targetProduct.unit} available`);

        useProductStore.getState().adjustQuantity(tx.productId, tx.quantity);
        useProductStore.getState().adjustQuantity(productId, -quantity);

        const product = useProductStore.getState().getProductById(productId);
        const updatedTx = {
          ...tx,
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

        set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? updatedTx : t)) }));
        return updatedTx;
      },

      // Internal, synchronous — reverts a transaction's stock effect and
      // removes it. Shared by single and bulk delete so bulk operations
      // don't stack per-item delays or race on stock updates.
      _revertAndRemove: (id) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx) return;
        const delta = tx.type === 'in' ? -tx.quantity : tx.quantity;
        useProductStore.getState().adjustQuantity(tx.productId, delta);
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },

      deleteTransaction: async (id) => {
        await new Promise((r) => setTimeout(r, 400));
        get()._revertAndRemove(id);
      },

      deleteMultipleTransactions: async (ids) => {
        await new Promise((r) => setTimeout(r, 500));
        ids.forEach((id) => get()._revertAndRemove(id));
      },
    }),
    { name: 'css-transactions' }
  )
);