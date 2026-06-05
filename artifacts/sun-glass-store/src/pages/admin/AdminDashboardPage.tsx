import { useEffect, useState, useRef } from "react";
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
import { LogOut, Plus, Edit, Trash2, Upload, ImageIcon } from "lucide-react";
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
    if (!token) setLocation("/admin/login");
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
      <aside className="w-full md:w-64 bg-card border-r border-primary/20 flex flex-col p-6 shrink-0">
        <div className="font-orbitron font-bold text-2xl text-primary mb-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">SG</div>
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
          <Button className="bg-primary text-primary-foreground font-orbitron" onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> NUEVO
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-card p-6 rounded-xl border border-primary/20">
              <h3 className="text-muted-foreground text-sm font-orbitron mb-2">Total Productos</h3>
              <p className="text-4xl font-bold text-primary">{stats.totalProducts}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-primary/20">
              <h3 className="text-muted-foreground text-sm font-orbitron mb-2">Categorías</h3>
              <p className="text-4xl font-bold text-primary">{stats.totalCategories}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-primary/20">
              <h3 className="text-muted-foreground text-sm font-orbitron mb-2">Rango de Precios</h3>
              <p className="text-xl font-bold text-primary">{formatPrice(stats.priceRange.min)} – {formatPrice(stats.priceRange.max)}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border border-primary/20 overflow-hidden">
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
                  <tr key={p.id} className="border-b border-border hover:bg-secondary/20 transition-colors" data-testid={`row-product-${p.id}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded object-cover border border-primary/20 shrink-0" />
                        <span className="font-bold text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs border border-primary/20">{p.category}</span>
                    </td>
                    <td className="p-4 font-orbitron text-sm">{formatPrice(p.price)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="hover:text-primary hover:bg-primary/10" onClick={() => openEdit(p)} data-testid={`button-edit-${p.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)} data-testid={`button-delete-${p.id}`}>
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

function ProductFormDialog({
  isOpen,
  onClose,
  product,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: string[];
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCat, setNewCat] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
    setUploadError("");
  }, [product, isOpen, categories]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al subir imagen");
      }

      const data = await res.json();
      setImgUrl(data.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

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
    const data = { name, category: finalCategory, price: Number(price), description: desc, image_url: imgUrl };
    if (product) {
      updateMut.mutate({ id: product.id, data });
    } else {
      createMut.mutate({ data });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-primary/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-primary text-xl">
            {product ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-orbitron text-primary/70">NOMBRE *</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} className="bg-background/50 border-primary/30" data-testid="input-product-name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-orbitron text-primary/70">PRECIO (ARS) *</Label>
              <Input required type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} className="bg-background/50 border-primary/30" data-testid="input-product-price" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-orbitron text-primary/70">CATEGORÍA</Label>
              <select
                className="flex h-10 w-full rounded-md border border-primary/30 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={category}
                onChange={e => setCategory(e.target.value)}
                data-testid="select-product-category"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-orbitron text-primary/70">O NUEVA CATEGORÍA</Label>
              <Input
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="Ej: Collares"
                className="bg-background/50 border-primary/30"
                data-testid="input-new-category"
              />
            </div>
          </div>

          {/* Image upload section */}
          <div className="space-y-3">
            <Label className="text-xs font-orbitron text-primary/70">IMAGEN *</Label>

            {/* File picker button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
            >
              {uploading ? (
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-orbitron">Subiendo...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-primary/50" />
                  <p className="text-sm text-primary font-orbitron">ELEGIR FOTO</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — hasta 10 MB</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-product-image-file"
            />

            {uploadError && <p className="text-destructive text-xs">{uploadError}</p>}

            {/* Preview */}
            {imgUrl && (
              <div className="relative">
                <img
                  src={imgUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-primary/30"
                  onError={() => setUploadError("No se pudo cargar la imagen")}
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-primary flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Vista previa
                </div>
              </div>
            )}

            {/* Optional URL fallback */}
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-primary transition-colors font-orbitron">O ingresar URL de imagen</summary>
              <Input
                value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                placeholder="https://..."
                className="bg-background/50 border-primary/30 mt-2 text-xs"
                data-testid="input-product-image-url"
              />
            </details>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-orbitron text-primary/70">DESCRIPCIÓN *</Label>
            <Textarea
              required
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="bg-background/50 border-primary/30 h-24 resize-none"
              data-testid="textarea-product-description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-primary/30">Cancelar</Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground font-orbitron tracking-wider"
              disabled={isPending || uploading || !imgUrl}
              data-testid="button-save-product"
            >
              {isPending ? "GUARDANDO..." : "GUARDAR"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
