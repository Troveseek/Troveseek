import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  slug?: string;
  image?: string;
};

type WishlistStore = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (!existing) {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'troveseek-wishlist',
    }
  )
);
