import { create } from "zustand";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (product: { id: number; name: string; price: number; image_url: string }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

function computeTotals(cart: CartItem[]) {
  return {
    cartTotal: cart.reduce((t, i) => t + i.price * i.quantity, 0),
    cartCount: cart.reduce((c, i) => c + i.quantity, 0),
  };
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  cartTotal: 0,
  cartCount: 0,

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === product.id);
      const newCart = existing
        ? state.cart.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.cart, { ...product, quantity: 1 }];
      return { cart: newCart, ...computeTotals(newCart) };
    }),

  removeFromCart: (id) =>
    set((state) => {
      const newCart = state.cart.filter((i) => i.id !== id);
      return { cart: newCart, ...computeTotals(newCart) };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => {
      const newCart =
        quantity <= 0
          ? state.cart.filter((i) => i.id !== id)
          : state.cart.map((i) => (i.id === id ? { ...i, quantity } : i));
      return { cart: newCart, ...computeTotals(newCart) };
    }),

  clearCart: () => set({ cart: [], cartTotal: 0, cartCount: 0 }),
}));
