import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  basePrice: number;
  bulkPricing?: any[];
  category: string;
  quantity: number;
  imageUrl?: string;
};

function getEffectivePrice(basePrice: number, quantity: number, bulkPricing?: any[]): number {
  if (!bulkPricing || bulkPricing.length === 0) return basePrice;
  const sorted = [...bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const active = sorted.find(t => quantity >= t.minQty && (!t.maxQty || quantity <= t.maxQty));
  if (active) {
    return basePrice * (1 - active.discountPercent / 100);
  }
  return basePrice;
}

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const qty = item.quantity || 1;
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          const newQty = existing.quantity + qty;
          const newPrice = getEffectivePrice(existing.basePrice, newQty, existing.bulkPricing);
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty, price: newPrice } : i
            ),
          });
        } else {
          const newPrice = getEffectivePrice(item.basePrice, qty, item.bulkPricing);
          set({ items: [...get().items, { ...item, quantity: qty, price: newPrice }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.id === id) {
              return { ...i, quantity, price: getEffectivePrice(i.basePrice, quantity, i.bulkPricing) };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'troveseek-cart',
    }
  )
);
