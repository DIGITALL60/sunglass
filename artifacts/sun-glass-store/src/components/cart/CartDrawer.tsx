import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCartStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckout = () => {
    setShowSuccess(true);
    clearCart();
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-card border-l border-primary/30 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-primary/20 flex items-center justify-between">
                <h2 className="font-orbitron font-bold text-xl text-primary">CARRITO</h2>
                <button onClick={onClose} className="p-2 hover:text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground font-orbitron">
                    TU CARRITO ESTÁ VACÍO
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-secondary/50 p-3 rounded-lg border border-primary/10">
                      <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-md border border-primary/20" />
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                        <p className="text-primary text-sm font-orbitron mb-2">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-3 mt-auto">
                          <div className="flex items-center gap-2 bg-background rounded-md px-2 py-1 border border-primary/20">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-primary"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-primary"><Plus className="w-3 h-3" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-auto">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-primary/20 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-orbitron text-sm">TOTAL</span>
                    <span className="font-orbitron font-bold text-xl text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full font-orbitron tracking-widest bg-primary text-primary-foreground hover:bg-primary/80 glow-hover"
                  >
                    FINALIZAR COMPRA
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="border-primary/30 bg-card/90 backdrop-blur-xl text-center">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-primary text-2xl mb-2">¡PEDIDO RECIBIDO!</DialogTitle>
            <DialogDescription className="text-foreground text-lg">
              Te contactaremos pronto para coordinar el envío.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
