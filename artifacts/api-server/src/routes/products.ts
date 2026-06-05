import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, desc, asc, sql } from "drizzle-orm";
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

    res.json(results);
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

    const [product] = await db.insert(productsTable).values(parsed.data).returning();
    res.status(201).json(product);
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

    res.json(products[0]);
  } catch {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// PUT /products/:id
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
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

    const [updated] = await db
      .update(productsTable)
      .set(parsed.data)
      .where(eq(productsTable.id, id))
      .returning();

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE /products/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
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
