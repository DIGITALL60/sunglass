import { useState, useMemo } from "react";
import { useListProducts, useListCategories, ListProductsSort } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<ListProductsSort>(ListProductsSort.newest);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

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

  const handleAddToCart = (product: typeof filteredProducts[0]) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-orbitron font-semibold mb-3 text-primary text-sm tracking-widest">CATEGORÍAS</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-orbitron border transition-all ${
              !category
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/30 text-muted-foreground hover:border-primary hover:text-primary"
            }`}
            onClick={() => { setCategory(undefined); setFiltersOpen(false); }}
            data-testid="filter-all"
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-full text-sm font-orbitron border transition-all ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-primary/30 text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              onClick={() => { setCategory(c); setFiltersOpen(false); }}
              data-testid={`filter-${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-orbitron font-semibold mb-3 text-primary text-sm tracking-widest">PRECIO (ARS)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-card/50 border-primary/20 h-10"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-card/50 border-primary/20 h-10"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-orbitron text-2xl sm:text-4xl font-bold text-primary">COLECCIÓN</h1>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <button
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 text-primary font-orbitron text-xs hover:bg-primary/10 transition-all"
            onClick={() => setFiltersOpen(true)}
            data-testid="button-open-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            FILTROS
            {(category || minPrice || maxPrice) && (
              <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>
            )}
          </button>

          <Select value={sort} onValueChange={(v) => setSort(v as ListProductsSort)}>
            <SelectTrigger className="w-36 sm:w-[180px] bg-card/50 border-primary/20 text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="price_asc">Menor precio</SelectItem>
              <SelectItem value="price_desc">Mayor precio</SelectItem>
              <SelectItem value="name_az">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/50 border-primary/20 focus-visible:ring-primary/50 h-11"
          data-testid="input-search"
        />
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-card border-r border-primary/20 z-50 p-6 flex flex-col gap-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-orbitron font-bold text-primary">FILTROS</h2>
                <button onClick={() => setFiltersOpen(false)} className="p-1 hover:text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <FilterPanel />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active filters chips */}
          {(category || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="flex items-center gap-1 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1 rounded-full font-orbitron">
                  {category}
                  <button onClick={() => setCategory(undefined)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1 rounded-full font-orbitron">
                  {minPrice || "0"} – {maxPrice || "∞"}
                  <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="aspect-square bg-card/50 animate-pulse rounded-xl border border-primary/10" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground font-orbitron">Sin resultados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="bg-card border border-primary/15 rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col"
                  data-testid={`card-product-${product.id}`}
                >
                  <Link href={`/producto/${product.id}`} className="relative block overflow-hidden" style={{ paddingBottom: "100%" }}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-background/85 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-orbitron font-bold text-primary border border-primary/30">
                      {product.category}
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <Link href={`/producto/${product.id}`}>
                      <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-orbitron text-primary text-sm sm:text-base font-bold mb-3 mt-auto">
                      {formatPrice(product.price)}
                    </p>
                    <button
                      className={`w-full py-2.5 rounded-lg font-orbitron text-xs sm:text-sm tracking-wider border transition-all duration-300 flex items-center justify-center gap-2 ${
                        addedId === product.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}
                      onClick={() => handleAddToCart(product)}
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {addedId === product.id ? "AGREGADO!" : "AGREGAR"}
                    </button>
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
