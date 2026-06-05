import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: { id: number; name: string; price: number; image_url: string }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  addToCart: (product) => {
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        cart: [...state.cart, { ...product, quantity: 1 }],
      };
    });
  },
  removeFromCart: (id) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    }));
  },
  updateQuantity: (id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.id !== id) };
      }
      return {
        cart: state.cart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    });
  },
  clearCart: () => {
    set({ cart: [] });
  },
  get cartTotal() {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  get cartCount() {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
