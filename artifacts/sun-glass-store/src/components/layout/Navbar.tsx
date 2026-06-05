import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import logoPath from "@assets/f9a8c8eb-e8b8-48c1-9ca2-dde803a0afde_1780655788028.jpeg";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import { CartDrawer } from "../cart/CartDrawer";

export function Navbar() {
  const cartCount = useCartStore((state) => state.cartCount);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-20 bg-glass border-b border-border px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <img 
            src={logoPath} 
            alt="Sun Glass Logo" 
            className="w-12 h-12 rounded-full border border-primary/30 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all"
          />
          <span className="font-orbitron font-bold text-lg hidden sm:block tracking-wider text-primary">
            SUN GLASS
          </span>
        </Link>

        <div className="flex items-center gap-8 font-orbitron text-sm font-semibold tracking-wide">
          <Link href="/" className="hover:text-primary transition-colors data-[active=true]:text-primary">INICIO</Link>
          <Link href="/tienda" className="hover:text-primary transition-colors data-[active=true]:text-primary">TIENDA</Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:text-primary transition-colors"
            data-testid="button-open-cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
