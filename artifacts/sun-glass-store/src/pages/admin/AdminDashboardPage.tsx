import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  useGetProductStats, 
  useListProducts, 
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct,
  useListCategories,
  getListProductsQueryKey,
  getGetProductStatsQueryKey,
  getListCategoriesQueryKey,
  Product
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { LogOut, Plus, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/admin/login");
  };

  const { data: stats } = useGetProductStats();
  const { data: products = [] } = useListProducts();
  const { data: categories = [] } = useListCategories();

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      }
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteMutation.mutate({ id });
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-primary/20 flex flex-col p-6">
        <div className="font-orbitron font-bold text-2xl text-primary mb-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">SG</div>
          ADMIN
        </div>
        
        <nav className="flex-1 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-orbitron tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30">
            Productos
          </Button>
          <Button variant="ghost" className="w-full justify-start font-orbitron tracking-wider hover:text-primary hover:bg-primary/10" onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
          </Button>
        </nav>

        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-auto" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold">Panel de Control</h1>
          <Button className="bg-primary text-primary-foreground glow-hover font-orbitron" onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> AGREGAR
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-card p-6 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
              <h3 className="text-muted-foreground text-sm font-orbitron mb-2">Total Productos</h3>
              <p className="text-4xl font-bold text-primary">{stats.totalProducts}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
              <h3 className="text-muted-foreground text-sm font-orbitron mb-2">Categorías</h3>
              <p className="text-4xl font-bold text-primary">{stats.totalCategories}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
              <h3 className="text-muted-foreground text-sm font-orbitron mb-2">Rango de Precios</h3>
              <p className="text-xl font-bold text-primary">{formatPrice(stats.priceRange.min)} - {formatPrice(stats.priceRange.max)}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border border-primary/20 overflow-hidden shadow-[0_0_15px_rgba(0,245,255,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 border-b border-primary/20">
                <tr>
                  <th className="p-4 font-orbitron text-xs text-primary/80">PRODUCTO</th>
                  <th className="p-4 font-orbitron text-xs text-primary/80">CATEGORÍA</th>
                  <th className="p-4 font-orbitron text-xs text-primary/80">PRECIO</th>
                  <th className="p-4 font-orbitron text-xs text-primary/80 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded object-cover border border-primary/20" />
                      <span className="font-bold">{p.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs border border-primary/20">{p.category}</span>
                    </td>
                    <td className="p-4 font-orbitron">{formatPrice(p.price)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="hover:text-primary hover:bg-primary/10" onClick={() => openEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ProductFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        product={editingProduct} 
        categories={categories}
      />
    </div>
  );
}

function ProductFormDialog({ isOpen, onClose, product, categories }: { isOpen: boolean; onClose: () => void; product: Product | null; categories: string[] }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCat, setNewCat] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price.toString());
      setDesc(product.description);
      setImgUrl(product.image_url);
      setNewCat("");
    } else {
      setName("");
      setCategory(categories[0] || "");
      setPrice("");
      setDesc("");
      setImgUrl("");
      setNewCat("");
    }
  }, [product, isOpen, categories]);

  const onMutateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    onClose();
  };

  const createMut = useCreateProduct({ mutation: { onSuccess: onMutateSuccess } });
  const updateMut = useUpdateProduct({ mutation: { onSuccess: onMutateSuccess } });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = newCat.trim() !== "" ? newCat.trim() : category;
    
    const data = {
      name,
      category: finalCategory,
      price: Number(price),
      description: desc,
      image_url: imgUrl
    };

    if (product) {
      updateMut.mutate({ id: product.id, data });
    } else {
      createMut.mutate({ data });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-primary text-xl">
            {product ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} className="bg-background/50 border-primary/30" />
            </div>
            <div className="space-y-2">
              <Label>Precio (ARS)</Label>
              <Input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-background/50 border-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría Existente</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-primary/30 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>O Nueva Categoría</Label>
              <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Ej: Relojes" className="bg-background/50 border-primary/30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL de Imagen</Label>
            <Input required value={imgUrl} onChange={e => setImgUrl(e.target.value)} className="bg-background/50 border-primary/30" />
            {imgUrl && <img src={imgUrl} alt="Preview" className="h-20 object-cover mt-2 rounded border border-primary/30" />}
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea required value={desc} onChange={e => setDesc(e.target.value)} className="bg-background/50 border-primary/30 h-24" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-primary text-primary-foreground glow-hover font-orbitron" disabled={isPending}>
              {isPending ? "GUARDANDO..." : "GUARDAR"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
