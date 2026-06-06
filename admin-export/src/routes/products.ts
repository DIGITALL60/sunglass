import { Router } from "express";
import { db, productsTable } from "../db.js";
import { eq, ilike, gte, lte, and, desc, asc, sql } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { z } from "zod";

const ProductBody = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(1),
  image_url: z.string().url(),
});
const UpdateBody = ProductBody.partial();
const QueryParams = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["newest","price_asc","price_desc","name_az"]).optional(),
});

const router = Router();

// GET /products/stats
router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const all = await db.select().from(productsTable);
    const categories = [...new Set(all.map(p => p.category))];
    const prices = all.map(p => p.price);
    res.json({
      totalProducts: all.length,
      totalCategories: categories.length,
      byCategory: categories.map(cat => ({ category: cat, count: all.filter(p => p.category === cat).length })),
      priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    });
  } catch { res.status(500).json({ error: "Error al obtener estadísticas" }); }
});

// GET /products
router.get("/", async (req, res) => {
  try {
    const params = QueryParams.safeParse(req.query).data ?? {};
    const filters = [];
    if (params.category) filters.push(eq(productsTable.category, params.category));
    if (params.search) filters.push(ilike(productsTable.name, `%${params.search}%`));
    if (params.minPrice !== undefined) filters.push(gte(productsTable.price, params.minPrice));
    if (params.maxPrice !== undefined) filters.push(lte(productsTable.price, params.maxPrice));
    const base = filters.length ? db.select().from(productsTable).where(and(...filters)) : db.select().from(productsTable);
    const results = params.sort === "price_asc" ? await base.orderBy(asc(productsTable.price))
      : params.sort === "price_desc" ? await base.orderBy(desc(productsTable.price))
      : params.sort === "name_az" ? await base.orderBy(asc(productsTable.name))
      : await base.orderBy(desc(productsTable.created_at));
    res.json(results);
  } catch { res.status(500).json({ error: "Error al obtener productos" }); }
});

// GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }
    res.json(product);
  } catch { res.status(500).json({ error: "Error al obtener producto" }); }
});

// POST /products
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = ProductBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const [product] = await db.insert(productsTable).values(parsed.data).returning();
    res.status(201).json(product);
  } catch { res.status(500).json({ error: "Error al crear producto" }); }
});

// PUT /products/:id
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    const parsed = UpdateBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }
    const [updated] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Producto no encontrado" }); return; }
    res.json(updated);
  } catch { res.status(500).json({ error: "Error al actualizar producto" }); }
});

// DELETE /products/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Error al eliminar producto" }); }
});

export default router;
