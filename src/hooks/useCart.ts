"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: string | number;
    image: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    flyItem: { x: number, y: number, image: string } | null;
    addItem: (product: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    toggleCart: () => void;
    clearCart: () => void;
    triggerFly: (x: number, y: number, image: string) => void;
    clearFly: () => void;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({

            items: [],
            isOpen: false,
            flyItem: null,
            triggerFly: (x, y, image) => {
                set({ flyItem: { x, y, image } });
            },
            clearFly: () => set({ flyItem: null }),
            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
                    ).filter(item => item.quantity > 0),
                });
            },
            toggleCart: () => set({ isOpen: !get().isOpen }),
            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items } as any), // Only persist items
        }
    )
);

export const getCartTotal = (items: CartItem[]) => {
    return items.reduce((acc, item) => {
        const priceStr = String(item.price);
        const priceValue = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
        return acc + (isNaN(priceValue) ? 0 : priceValue) * item.quantity;
    }, 0);
};
