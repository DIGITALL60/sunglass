import { Router } from "express";
import { db, productsTable } from "../db.js";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.selectDistinct({ category: productsTable.category }).from(productsTable).orderBy(sql`${productsTable.category} ASC`);
    res.json(rows.map(r => r.category));
  } catch { res.status(500).json({ error: "Error al obtener categorías" }); }
});

export default router;
