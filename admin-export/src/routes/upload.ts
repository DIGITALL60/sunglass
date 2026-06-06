import { Router } from "express";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
import { requireAuth } from "../middlewares/auth.js";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase()) || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo imágenes (jpg, png, webp, gif)"));
    }
  },
});

const router = Router();
router.post("/", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No se recibió ninguna imagen" }); return; }
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

export default router;
