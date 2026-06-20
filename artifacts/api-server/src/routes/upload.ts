import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { requireAuth } from "../middlewares/auth.js";

const execAsync = promisify(exec);

// Use process.cwd() — server runs from artifacts/api-server/
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".dng", ".heic", ".heif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpg, png, webp, gif, dng, heic)"));
    }
  },
});

const router = Router();

router.post("/", requireAuth, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: "La imagen es demasiado grande. El máximo permitido es 50MB." });
    } else if (err) {
      res.status(400).json({ error: err.message });
    } else {
      next();
    }
  });
}, async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ninguna imagen" });
    return;
  }
  
  let filename = req.file.filename;
  const ext = path.extname(filename).toLowerCase();
  
  // Convert RAW formats to JPG using ImageMagick
  if ([".dng", ".heic", ".heif"].includes(ext)) {
    const newFilename = filename.replace(ext, ".jpg");
    const newPath = path.join(UPLOADS_DIR, newFilename);
    try {
      await execAsync(`magick convert "${req.file.path}" "${newPath}"`);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      filename = newFilename;
    } catch (conversionError) {
      console.error("Error converting image:", conversionError);
      try {
        await execAsync(`convert "${req.file.path}" "${newPath}"`);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        filename = newFilename;
      } catch (e2) {
        console.error("Fallback conversion error:", e2);
      }
    }
  }

  const url = `/api/uploads/${filename}`;
  res.json({ url });
});

export default router;
