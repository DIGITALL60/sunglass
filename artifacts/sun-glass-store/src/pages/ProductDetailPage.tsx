import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { getGetProductQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";
import { getFullImgUrl, cn } from "@/lib/utils";
import { ShoppingCart, Minus, Plus, Info, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const addToCart = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useGetProduct(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <>
        <SEO title="Cargando Producto" />
        <div className="min-h-screen pt-32 px-6 max-w-6xl mx-auto"><div className="h-96 bg-card/50 animate-pulse rounded-2xl border border-primary/10"></div></div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SEO title="Producto no encontrado" />
        <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center">
        <h2 className="font-orbitron text-2xl text-destructive mb-4">Producto no encontrado</h2>
        <Link href="/tienda"><Button variant="outline">Volver a la tienda</Button></Link>
      </div>
      </>
    );
  }


  const productVariants = (product as any)?.variants || [];
  const allImages = product ? [product.image_url, ...((product as any).extra_images || [])].map(getFullImgUrl) : [];
  const currentDisplayImage = allImages.length > 0 ? allImages[activeImage] : "";
  
  // Set initial selected model if available
  if (!selectedModel && productVariants.length > 0) {
    const firstAvailable = productVariants.find((v: any) => v.available && v.quantity > 0);
    setSelectedModel(firstAvailable ? firstAvailable.name : productVariants[0].name);
  }

  const selectedVariantObj = productVariants.find((m: any) => m.name === selectedModel);
  const maxStock = selectedVariantObj?.quantity ?? 99;

  return (
    <>
      <SEO 
        title={product.name} 
        description={product.description ? product.description.substring(0, 150) : "Detalles exclusivos del producto en Sun Glass"} 
        image={currentDisplayImage} 
      />
      <div className="min-h-[100dvh] pt-28 pb-20 px-6 max-w-6xl mx-auto font-orbitron">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors cursor-pointer">Inicio</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/tienda" className="hover:text-primary transition-colors uppercase cursor-pointer">{product.category}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
           <div className="flex md:flex-col gap-3 md:w-20 shrink-0 overflow-x-auto md:overflow-visible">
              {allImages.map((thumb, i) => (
                 <button 
                   key={i} 
                   onClick={() => setActiveImage(i)}
                   className={cn(
                     "border-2 rounded-md overflow-hidden aspect-[3/4] bg-card w-16 md:w-full shrink-0 transition-all", 
                     i === activeImage ? "border-primary shadow-[0_0_10px_rgba(255,0,153,0.2)]" : "border-transparent opacity-70 hover:opacity-100"
                   )}
                 >
                   <img src={thumb} className="w-full h-full object-cover" alt="thumbnail" />
                 </button>
              ))}
           </div>
           
           {/* Main Image */}
           <motion.div 
             key={activeImage}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.3 }}
             className="flex-1 rounded-2xl overflow-hidden border border-primary/20 bg-card relative shadow-[0_0_30px_rgba(255,0,153,0.05)] aspect-[4/5] md:aspect-square"
           >
             <img 
               src={currentDisplayImage} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
             />
           </motion.div>
        </div>

        {/* Right: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <h1 className="text-3xl md:text-4xl font-normal mb-4">{product.name}</h1>
          
          {/* Price section */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            <span className="text-xl text-muted-foreground line-through font-medium">
              {formatPrice(product.price * 1.15)}
            </span>
            <span className="text-xs font-bold bg-white text-black px-2 py-0.5 rounded border border-gray-300 tracking-wider">
              15% OFF
            </span>
          </div>

          {/* Models */}
          {productVariants.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Modelo</h3>
              <div className="flex flex-wrap gap-2">
                {productVariants.map((m: any) => (
                   <button
                     key={m.name}
                     disabled={!m.available}
                     onClick={() => {
                       setSelectedModel(m.name);
                       setQuantity(1);
                     }}
                     className={cn(
                       "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                       !m.available && "opacity-40 cursor-not-allowed text-muted-foreground relative after:absolute after:left-0 after:top-1/2 after:w-full after:h-[1px] after:bg-current",
                       m.available && selectedModel === m.name && "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white",
                       m.available && selectedModel !== m.name && "bg-card text-foreground hover:border-foreground/30 border-border"
                     )}
                   >
                     {m.name} {m.available ? `(${m.quantity ?? 0})` : ""}
                   </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wide">Cantidad</h3>
              {selectedVariantObj && (
                <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {selectedVariantObj.quantity} disponibles
                </span>
              )}
            </div>
            <div className="flex items-center border border-border rounded-md w-fit bg-card">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="p-3 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                disabled={maxStock === 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{maxStock === 0 ? 0 : quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))} 
                className="p-3 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                disabled={quantity >= maxStock || maxStock === 0}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <Button 
            className="h-14 text-lg font-medium bg-[#ffb6c1] hover:bg-[#ff9eb0] text-black w-full mb-8 rounded-md shadow-none font-orbitron tracking-wider disabled:opacity-50"
            disabled={maxStock === 0}
            onClick={() => {
               for(let i=0; i<quantity; i++) {
                 addToCart(product);
               }
            }}
          >
            {maxStock === 0 ? "Agotado" : "Agregar al carrito"}
          </Button>
        </motion.div>
      </div>
    </div>
    </>
  );
}
