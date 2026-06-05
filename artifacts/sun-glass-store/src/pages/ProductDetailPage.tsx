import { useParams, Link } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { getGetProductQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: product, isLoading } = useGetProduct(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id)
    }
  });

  if (isLoading) {
    return <div className="min-h-screen pt-32 px-6 max-w-6xl mx-auto"><div className="h-96 bg-card/50 animate-pulse rounded-2xl border border-primary/10"></div></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center">
        <h2 className="font-orbitron text-2xl text-destructive mb-4">Producto no encontrado</h2>
        <Link href="/tienda"><Button variant="outline">Volver a la tienda</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 max-w-6xl mx-auto">
      <Link href="/tienda" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-orbitron text-sm">
        <ArrowLeft className="w-4 h-4" /> VOLVER
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square rounded-2xl overflow-hidden border border-primary/20 bg-card relative shadow-[0_0_30px_rgba(255,0,153,0.05)]"
        >
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="inline-block bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full font-orbitron text-sm font-bold tracking-widest mb-6 w-fit">
            {product.category}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
          
          <p className="font-orbitron text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(255,0,153,0.3)] mb-8">
            {formatPrice(product.price)}
          </p>
          
          <div className="prose prose-invert max-w-none text-muted-foreground text-lg mb-10">
            <p>{product.description}</p>
          </div>

          <Button 
            size="lg" 
            className="h-14 text-lg font-orbitron tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-hover w-full sm:w-auto"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            AGREGAR AL CARRITO
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
