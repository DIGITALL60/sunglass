import { useState, useMemo } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";
import { ListProductsSort } from "@workspace/api-client-react";

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<ListProductsSort | undefined>(ListProductsSort.newest);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: products = [], isLoading } = useListProducts({
    category,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  const { data: categories = [] } = useListCategories();
  const addToCart = useCartStore((state) => state.addToCart);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <h1 className="font-orbitron text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(255,0,153,0.3)]">
          COLECCIÓN
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/50 border-primary/20 focus-visible:ring-primary/50"
            />
          </div>
          
          <Select value={sort} onValueChange={(v) => setSort(v as ListProductsSort)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card/50 border-primary/20">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="price_asc">Precio menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio mayor a menor</SelectItem>
              <SelectItem value="name_az">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-orbitron font-semibold mb-4 text-primary">CATEGORÍAS</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <Button 
                variant={!category ? "default" : "outline"}
                className={`justify-start ${!category ? 'shadow-[0_0_10px_rgba(255,0,153,0.3)]' : 'border-primary/20'}`}
                onClick={() => setCategory(undefined)}
              >
                Todas
              </Button>
              {categories.map((c) => (
                <Button 
                  key={c}
                  variant={category === c ? "default" : "outline"}
                  className={`justify-start ${category === c ? 'shadow-[0_0_10px_rgba(255,0,153,0.3)]' : 'border-primary/20'}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-orbitron font-semibold mb-4 text-primary">PRECIO (ARS)</h3>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-card/50 border-primary/20"
              />
              <span>-</span>
              <Input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-card/50 border-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-80 bg-card/50 animate-pulse rounded-xl border border-primary/10" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground font-orbitron">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card border border-primary/15 rounded-xl overflow-hidden group hover:border-primary/40 glow-hover flex flex-col"
                >
                  <Link href={`/producto/${product.id}`} className="relative aspect-square block overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-orbitron font-bold text-primary border border-primary/30">
                      {product.category}
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <Link href={`/producto/${product.id}`}>
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="font-orbitron text-primary text-lg font-bold mb-4 mt-auto">
                      {formatPrice(product.price)}
                    </p>
                    <Button 
                      className="w-full font-orbitron tracking-wider bg-secondary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      onClick={() => addToCart(product)}
                    >
                      AGREGAR
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
