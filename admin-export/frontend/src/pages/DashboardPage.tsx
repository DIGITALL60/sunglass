import { useState, useEffect, useRef } from "react";
import { api, Product, ProductInput, Stats } from "../lib/api";

const pink = "#FF0099";

const S = {
  layout: { display:"flex", minHeight:"100vh", background:"#f9fafb" } as const,
  sidebar: { width:220, background:"#fff", borderRight:"1px solid #f3e8f0", padding:24, display:"flex", flexDirection:"column" as const, gap:8 },
  brand: { fontSize:18, fontWeight:800, color:pink, letterSpacing:2, marginBottom:24 },
  navBtn: (active=false) => ({ width:"100%", textAlign:"left" as const, padding:"10px 14px", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, letterSpacing:1, background:active?"#fce7f3":"transparent", color:active?pink:"#374151" }),
  main: { flex:1, padding:32, overflowY:"auto" as const },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 },
  h1: { fontSize:24, fontWeight:800 },
  btnPrimary: { background:pink, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:1 },
  btnOutline: { background:"transparent", color:pink, border:`1px solid ${pink}`, borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer" },
  btnDanger: { background:"transparent", color:"#ef4444", border:"1px solid #ef4444", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer" },
  stats: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 },
  statCard: { background:"#fff", border:"1px solid #f3e8f0", borderRadius:12, padding:20 },
  statLabel: { fontSize:11, color:"#9ca3af", fontWeight:600, letterSpacing:1, marginBottom:4 },
  statVal: { fontSize:32, fontWeight:800, color:pink },
  table: { background:"#fff", borderRadius:12, border:"1px solid #f3e8f0", overflow:"hidden" as const, width:"100%" },
  th: { padding:"12px 16px", fontSize:11, fontWeight:700, color:"#9ca3af", letterSpacing:1, borderBottom:"1px solid #f3e8f0", textAlign:"left" as const, background:"#fdf2f8" },
  td: { padding:"14px 16px", fontSize:13, borderBottom:"1px solid #f9fafb", verticalAlign:"middle" as const },
  img: { width:44, height:44, objectFit:"cover" as const, borderRadius:8, marginRight:12, border:"1px solid #f3e8f0" },
  badge: { background:"#fce7f3", color:pink, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 },
  price: { fontWeight:700, color:"#111", fontFamily:"monospace" },
  overlay: { position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" as const },
  label: { display:"block", fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:5, letterSpacing:1 },
  input: { width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:14, marginBottom:16, outline:"none", background:"#f9fafb" } as const,
  textarea: { width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:14, marginBottom:16, minHeight:80, resize:"vertical" as const, outline:"none", background:"#f9fafb" } as const,
  uploadZone: { border:`2px dashed ${pink}30`, borderRadius:12, padding:24, textAlign:"center" as const, cursor:"pointer", marginBottom:16, background:"#fdf9ff" },
};

function fmt(n: number) {
  return "$ " + n.toLocaleString("es-AR");
}

export default function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [p, s, c] = await Promise.all([api.getProducts(), api.getStats(), api.getCategories()]);
      setProducts(p); setStats(s); setCategories(c);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await api.deleteProduct(id);
    await load();
  };

  const handleSave = async (data: ProductInput) => {
    setLoading(true);
    try {
      if (editing) await api.updateProduct(editing.id, data);
      else await api.createProduct(data);
      await load();
      setModalOpen(false);
    } catch(e) { alert((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.layout}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.brand}>SG ADMIN</div>
        <button style={S.navBtn(true)}>📦 Productos</button>
        <button style={S.navBtn()} onClick={openNew}>➕ Nuevo</button>
        <div style={{ flex:1 }} />
        <button onClick={onLogout} style={{ ...S.navBtn(), color:"#ef4444" }}>🚪 Salir</button>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.header}>
          <h1 style={S.h1}>Panel de Control</h1>
          <button style={S.btnPrimary} onClick={openNew}>+ NUEVO PRODUCTO</button>
        </div>

        {stats && (
          <div style={S.stats}>
            <div style={S.statCard}>
              <div style={S.statLabel}>TOTAL PRODUCTOS</div>
              <div style={S.statVal}>{stats.totalProducts}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>CATEGORÍAS</div>
              <div style={S.statVal}>{stats.totalCategories}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>RANGO PRECIOS</div>
              <div style={{ fontSize:16, fontWeight:700, color:pink, marginTop:4 }}>
                {fmt(stats.priceRange.min)} – {fmt(stats.priceRange.max)}
              </div>
            </div>
          </div>
        )}

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>PRODUCTO</th>
              <th style={S.th}>CATEGORÍA</th>
              <th style={S.th}>PRECIO</th>
              <th style={{ ...S.th, textAlign:"right" }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <img src={p.image_url} alt={p.name} style={S.img} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                    <span style={{ fontWeight:600 }}>{p.name}</span>
                  </div>
                </td>
                <td style={S.td}><span style={S.badge}>{p.category}</span></td>
                <td style={S.td}><span style={S.price}>{fmt(p.price)}</span></td>
                <td style={{ ...S.td, textAlign:"right" }}>
                  <button style={S.btnOutline} onClick={() => openEdit(p)}>Editar</button>
                  {" "}
                  <button style={S.btnDanger} onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {modalOpen && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={loading}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSave, saving }: {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (data: ProductInput) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? categories[0] ?? "");
  const [newCat, setNewCat] = useState("");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [imgUrl, setImgUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      setImgUrl(url);
    } catch(e) { alert((e as Error).message); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCat = newCat.trim() || category;
    onSave({ name, category: finalCat, price: Number(price), description: desc, image_url: imgUrl });
  };

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:24 }}>
          {product ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={S.label}>NOMBRE *</label>
              <input required value={name} onChange={e => setName(e.target.value)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>PRECIO (ARS) *</label>
              <input required type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} style={S.input} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={S.label}>CATEGORÍA</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ ...S.input, marginBottom:16 }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>O NUEVA CATEGORÍA</label>
              <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Ej: Collares" style={S.input} />
            </div>
          </div>

          <label style={S.label}>IMAGEN *</label>
          <div style={S.uploadZone} onClick={() => fileRef.current?.click()}>
            {uploading ? <span style={{ color:pink }}>Subiendo...</span> : (
              <>
                <div style={{ fontSize:28, marginBottom:6 }}>📷</div>
                <div style={{ fontSize:13, fontWeight:600, color:pink }}>ELEGIR FOTO</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>JPG, PNG, WEBP — hasta 10 MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />

          {imgUrl && (
            <img src={imgUrl} alt="preview"
              style={{ width:"100%", height:140, objectFit:"cover", borderRadius:10, marginBottom:16, border:"1px solid #f3e8f0" }}
              onError={e => { (e.target as HTMLImageElement).style.display="none"; }}
            />
          )}

          <label style={S.label}>URL DE IMAGEN (alternativa)</label>
          <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://..." style={S.input} />

          <label style={S.label}>DESCRIPCIÓN *</label>
          <textarea required value={desc} onChange={e => setDesc(e.target.value)} style={S.textarea} />

          <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:8 }}>
            <button type="button" onClick={onClose} style={S.btnOutline}>Cancelar</button>
            <button type="submit" disabled={saving || uploading || !imgUrl}
              style={{ ...S.btnPrimary, opacity: (saving || uploading || !imgUrl) ? 0.6 : 1 }}>
              {saving ? "GUARDANDO..." : "GUARDAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
