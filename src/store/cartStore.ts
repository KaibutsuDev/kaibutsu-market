import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/db';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((item) => item.product.id === product.id);
        const currentQty = existing ? existing.quantity : 0;
        const targetQty = currentQty + quantity;

        // Validar stock disponible
        if (targetQty > product.stock) {
          return false;
        }

        if (existing) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: targetQty }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { product, quantity: targetQty }],
          });
        }
        return true;
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.product.id !== productId) });
          return;
        }

        set({
          items: items.map((item) => {
            if (item.product.id === productId) {
              const safeQty = Math.min(quantity, item.product.stock);
              return { ...item, quantity: safeQty };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'minimarket-cart-storage',
    }
  )
);
