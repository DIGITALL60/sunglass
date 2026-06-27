import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";
import { getFullImgUrl } from "@/lib/utils";
import { X, Minus, Plus, Trash2, MessageCircle, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5493534069127";

function buildWhatsAppMessage(
  cart: { name: string; price: number; quantity: number; model?: string }[], 
  total: number,
  shipping: { requires: boolean; address: { province: string, city: string, street: string, number: string, cp: string, apt: string } }
): string {
  const lines = cart.map((item) => {
    const modelText = item.model ? ` (${item.model})` : "";
    return `• ${item.name}${modelText} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
  });

  const message = [
    "¡Hola! Quiero realizar el siguiente pedido:",
    "",
    "🛍️ *PEDIDO SUN GLASS*",
    "",
    ...lines,
    "",
    `*TOTAL: ${formatPrice(total)}*`,
  ];

  if (shipping.requires) {
    const { street, number, apt, city, province, cp } = shipping.address;
    message.push(
      "", 
      "🚚 *DATOS DE ENVÍO*", 
      `Calle: ${street || '-'} ${number || '-'}`,
      apt ? `Piso/Depto: ${apt}` : null,
      `Localidad: ${city || '-'}`,
      `Provincia: ${province || '-'}`,
      `Código Postal: ${cp || '-'}`
    );
  }

  // Filter out nulls from message array
  const finalMessage = message.filter(line => line !== null);
  finalMessage.push("", "¡Gracias!");

  return finalMessage.join("\n");
}

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCartStore();
  const [requiresShipping, setRequiresShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    province: "", city: "", street: "", number: "", cp: "", apt: ""
  });

  const handleCheckout = () => {
    const message = buildWhatsAppMessage(cart, cartTotal, { requires: requiresShipping, address: shippingAddress });
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    clearCart();
    onClose();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
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
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-[#FF0099]/10 backdrop-blur-3xl border-l border-primary/30 z-50 shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-primary/20 flex items-center justify-between">
              <h2 className="font-orbitron font-bold text-xl text-primary">CARRITO</h2>
              <button onClick={onClose} className="p-2 hover:text-primary transition-colors" data-testid="button-close-cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground font-orbitron text-sm text-center px-4">
                  TU CARRITO ESTA VACIO
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-secondary/50 p-3 rounded-lg border border-primary/10" data-testid={`cart-item-${item.id}`}>
                    <div className="w-20 h-20 bg-primary/5 rounded-xl border border-primary/20 shrink-0 overflow-hidden">
                      <img src={getFullImgUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <h3 className="font-bold text-sm line-clamp-2 mb-1">{item.name}</h3>
                      {item.model && <p className="text-xs text-muted-foreground mb-1">Modelo: {item.model}</p>}
                      <p className="text-primary text-sm font-orbitron mb-2">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center gap-2 bg-background rounded-md px-2 py-1 border border-primary/20">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="hover:text-primary transition-colors"
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs w-5 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="hover:text-primary transition-colors"
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-primary/20 bg-secondary/30 space-y-3">
                <div className="space-y-2 pb-3 border-b border-primary/10">
                  <label className="flex items-center gap-2 text-sm font-orbitron cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={requiresShipping} 
                      onChange={(e) => setRequiresShipping(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded-sm border-primary/40"
                    />
                    Quiero envío a domicilio
                  </label>
                  {requiresShipping && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Provincia"
                        value={shippingAddress.province}
                        onChange={(e) => setShippingAddress({...shippingAddress, province: e.target.value})}
                        className="col-span-2 text-sm p-2 rounded-md border border-primary/20 bg-background/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Localidad/Ciudad"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="col-span-2 text-sm p-2 rounded-md border border-primary/20 bg-background/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Calle"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="col-span-1 text-sm p-2 rounded-md border border-primary/20 bg-background/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Altura"
                        value={shippingAddress.number}
                        onChange={(e) => setShippingAddress({...shippingAddress, number: e.target.value})}
                        className="col-span-1 text-sm p-2 rounded-md border border-primary/20 bg-background/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Piso/Depto (Opc)"
                        value={shippingAddress.apt}
                        onChange={(e) => setShippingAddress({...shippingAddress, apt: e.target.value})}
                        className="col-span-1 text-sm p-2 rounded-md border border-primary/20 bg-background/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Código Postal"
                        value={shippingAddress.cp}
                        onChange={(e) => setShippingAddress({...shippingAddress, cp: e.target.value})}
                        className="col-span-1 text-sm p-2 rounded-md border border-primary/20 bg-background/50 focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-orbitron text-sm text-muted-foreground">TOTAL</span>
                  <span className="font-orbitron font-bold text-xl text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full font-orbitron tracking-widest bg-[#25D366] hover:bg-[#20ba59] text-white gap-2 text-sm"
                  data-testid="button-checkout-whatsapp"
                >
                  <MessageCircle className="w-4 h-4" />
                  PEDIR POR WHATSAPP
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Te redirigimos a WhatsApp con tu pedido listo
                </p>
                <div className="pt-2 border-t border-primary/10 flex flex-col gap-1.5 mt-2 text-xs text-foreground/80 font-medium font-orbitron">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" /> Envios a todo el pais
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Todos los medios de pago
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
