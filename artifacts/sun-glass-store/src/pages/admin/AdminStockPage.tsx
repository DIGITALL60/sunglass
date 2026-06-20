import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useListProducts, useUpdateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut, Package, PackageOpen, Minus, Plus } from "lucide-react";
import { getFullImgUrl } from "@/lib/utils";

export default function AdminStockPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/admin/login");
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/");
  };

  const { data: products = [] } = useListProducts();
  const updateMut = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      }
    }
  });

  const productsWithVariants = products.filter((p: any) => p.variants && p.variants.length > 0);

  const updateVariant = (product: any, variantIndex: number, changes: { available?: boolean; quantity?: number }) => {
    const updatedVariants = product.variants.map((v: any, i: number) => {
      if (i === variantIndex) return { ...v, ...changes };
      return v;
    });
    updateMut.mutate({
      id: product.id,
      data: {
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        variants: updatedVariants
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-primary/20 flex flex-col p-6 shrink-0">
        <div className="font-orbitron font-bold text-2xl text-primary mb-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">SG</div>
          ADMIN
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start font-orbitron tracking-wider hover:text-primary hover:bg-primary/10">
              <Package className="w-4 h-4 mr-2" /> Productos
            </Button>
          </Link>
          <Button variant="secondary" className="w-full justify-start font-orbitron tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30">
            <PackageOpen className="w-4 h-4 mr-2" /> Stock
          </Button>
        </nav>

        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-auto" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl font-bold">Control de Stock</h1>
          <p className="text-muted-foreground mt-2 text-sm font-sans">
            Administrá la disponibilidad y la cantidad de cada modelo.
          </p>
        </div>

        {productsWithVariants.length === 0 ? (
          <div className="bg-card p-10 rounded-xl border border-primary/20 text-center flex flex-col items-center">
            <PackageOpen className="w-12 h-12 text-primary/30 mb-4" />
            <h3 className="font-orbitron text-xl mb-2">No hay productos con modelos</h3>
            <p className="text-muted-foreground font-sans max-w-sm">
              Agrega variantes o modelos a tus productos desde la sección de Productos para que aparezcan aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {productsWithVariants.map((p: any) => (
              <div key={p.id} className="bg-card rounded-xl border border-primary/20 overflow-hidden shadow-sm">
                {/* Product header */}
                <div className="p-4 border-b border-border flex items-center gap-3 bg-secondary/30">
                  <img src={getFullImgUrl(p.image_url)} alt={p.name} className="w-10 h-10 rounded object-cover border border-primary/20 shrink-0" />
                  <div>
                    <h3 className="font-bold font-orbitron text-sm leading-tight">{p.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-orbitron">{p.category}</span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground font-sans">{p.variants.length} modelo{p.variants.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Column headers */}
                <div className="px-4 py-2 grid grid-cols-[1fr_120px_80px] gap-4 border-b border-border/50 bg-muted/30">
                  <span className="text-[11px] font-orbitron text-muted-foreground uppercase tracking-wider">Modelo</span>
                  <span className="text-[11px] font-orbitron text-muted-foreground uppercase tracking-wider text-center">Cantidad</span>
                  <span className="text-[11px] font-orbitron text-muted-foreground uppercase tracking-wider text-center">En stock</span>
                </div>

                {/* Variants */}
                <div className="divide-y divide-border/30">
                  {p.variants.map((v: any, idx: number) => (
                    <div key={idx} className="px-4 py-3 grid grid-cols-[1fr_120px_80px] gap-4 items-center hover:bg-muted/10 transition-colors">
                      {/* Name */}
                      <span className={`font-medium text-sm ${!v.available ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {v.name}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateVariant(p, idx, { quantity: Math.max(0, (v.quantity ?? 0) - 1) })}
                          disabled={updateMut.isPending || (v.quantity ?? 0) <= 0}
                          className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-8 text-center font-orbitron text-sm font-bold ${(v.quantity ?? 0) === 0 ? 'text-destructive' : (v.quantity ?? 0) <= 3 ? 'text-yellow-500' : 'text-foreground'}`}>
                          {v.quantity ?? 0}
                        </span>
                        <button
                          onClick={() => updateVariant(p, idx, { quantity: (v.quantity ?? 0) + 1 })}
                          disabled={updateMut.isPending}
                          className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Toggle available */}
                      <div className="flex justify-center">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={v.available}
                              onChange={(e) => updateVariant(p, idx, { available: e.target.checked })}
                              disabled={updateMut.isPending}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${v.available ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${v.available ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
