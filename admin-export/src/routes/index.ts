import { Router } from "express";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import categoriesRouter from "./categories.js";
import uploadRouter from "./upload.js";

const router = Router();

router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/upload", uploadRouter);

export default router;
