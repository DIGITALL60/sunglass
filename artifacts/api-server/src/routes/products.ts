import { Router } from "express";
import { db, productsTable, productVariantsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, desc, asc, sql, inArray } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
} from "@workspace/api-zod";

const router = Router();

// GET /products/stats — must be before /:id
router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const all = await db.select().from(productsTable);
    const categories = [...new Set(all.map((p) => p.category))];
    const prices = all.map((p) => p.price);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    const byCategory = categories.map((cat) => ({
      category: cat,
      count: all.filter((p) => p.category === cat).length,
    }));

    res.json({
      totalProducts: all.length,
      totalCategories: categories.length,
      byCategory,
      priceRange: { min, max, avg: Math.round(avg) },
    });
  } catch {
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// GET /products
router.get("/", async (req, res) => {
  try {
    const parsed = ListProductsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    const filters = [];

    if (params.category) {
      filters.push(eq(productsTable.category, params.category));
    }
    if (params.search) {
      filters.push(ilike(productsTable.name, `%${params.search}%`));
    }
    if (params.minPrice !== undefined) {
      filters.push(gte(productsTable.price, params.minPrice));
    }
    if (params.maxPrice !== undefined) {
      filters.push(lte(productsTable.price, params.maxPrice));
    }

    const baseQuery = filters.length
      ? db.select().from(productsTable).where(and(...filters))
      : db.select().from(productsTable);

    let results;
    if (params.sort === "price_asc") {
      results = await baseQuery.orderBy(asc(productsTable.price));
    } else if (params.sort === "price_desc") {
      results = await baseQuery.orderBy(desc(productsTable.price));
    } else if (params.sort === "name_az") {
      results = await baseQuery.orderBy(asc(productsTable.name));
    } else {
      results = await baseQuery.orderBy(desc(productsTable.created_at));
    }

    if (results.length > 0) {
      const productIds = results.map(p => p.id);
      const allVariants = await db.select().from(productVariantsTable).where(inArray(productVariantsTable.product_id, productIds));
      
      const productsWithVariants = results.map(p => ({
        ...p,
        extra_images: (() => { try { return JSON.parse(p.extra_images || '[]'); } catch { return []; } })(),
        variants: allVariants.filter(v => v.product_id === p.id).map(v => ({ id: v.id, name: v.name, available: v.available, quantity: v.quantity }))
      }));
      res.json(productsWithVariants);
    } else {
      res.json([]);
    }
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// POST /products
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateProductBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos: " + parsed.error.message });
      return;
    }

    const { variants, extra_images, ...productData } = parsed.data;
    const [product] = await db.insert(productsTable).values({
      ...productData,
      extra_images: JSON.stringify(extra_images || [])
    }).returning();

    let createdVariants: any[] = [];
    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map(v => ({
        product_id: product.id,
        name: v.name,
        available: v.available,
        quantity: v.quantity ?? 0
      }));
      createdVariants = await db.insert(productVariantsTable).values(variantsToInsert).returning();
    }

    res.status(201).json({
      ...product,
      extra_images: extra_images || [],
      variants: createdVariants.map(v => ({ id: v.id, name: v.name, available: v.available, quantity: v.quantity }))
    });
  } catch {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const products = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (products.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    const product = products[0];
    const variants = await db.select().from(productVariantsTable).where(eq(productVariantsTable.product_id, id));
    res.json({
      ...product,
      extra_images: (() => { try { return JSON.parse(product.extra_images || '[]'); } catch { return []; } })(),
      variants: variants.map(v => ({ id: v.id, name: v.name, available: v.available, quantity: v.quantity }))
    });
  } catch {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// PUT /products/:id
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const parsed = UpdateProductBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos" });
      return;
    }

    const existing = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    const { variants, extra_images, ...productData } = parsed.data;
    let updatedProduct = existing[0];

    const updatePayload: any = { ...productData };
    if (extra_images !== undefined) {
      updatePayload.extra_images = JSON.stringify(extra_images);
    }

    if (Object.keys(updatePayload).length > 0) {
      const [updated] = await db
        .update(productsTable)
        .set(updatePayload)
        .where(eq(productsTable.id, id))
        .returning();
      updatedProduct = updated;
    }

    let finalVariants: any[] = [];
    if (variants !== undefined) {
      await db.delete(productVariantsTable).where(eq(productVariantsTable.product_id, id));
      if (variants.length > 0) {
        const variantsToInsert = variants.map(v => ({
          product_id: id,
          name: v.name,
          available: v.available,
          quantity: v.quantity ?? 0
        }));
        finalVariants = await db.insert(productVariantsTable).values(variantsToInsert).returning();
      }
    } else {
      finalVariants = await db.select().from(productVariantsTable).where(eq(productVariantsTable.product_id, id));
    }

    res.json({
      ...updatedProduct,
      extra_images: (() => { try { return JSON.parse(updatedProduct.extra_images || '[]'); } catch { return []; } })(),
      variants: finalVariants.map(v => ({ id: v.id, name: v.name, available: v.available, quantity: v.quantity }))
    });
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE /products/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const existing = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
