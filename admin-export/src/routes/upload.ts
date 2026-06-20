import { Router } from "express";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
import { requireAuth } from "../middlewares/auth.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

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
  limits: { fileSize: 50 * 1024 * 1024 }, // increased to 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".dng", ".heic", ".heif"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase()) || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo imágenes (jpg, png, webp, gif, dng, heic)"));
    }
  },
});

const router = Router();
router.post("/", requireAuth, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "La imagen es demasiado grande. El máximo es 50MB." });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No se recibió ninguna imagen" }); return; }
  
  let filename = req.file.filename;
  const ext = path.extname(filename).toLowerCase();
  
  // If the file is a RAW format like DNG or HEIC, convert it to JPG using ImageMagick
  if ([".dng", ".heic", ".heif"].includes(ext)) {
    const newFilename = filename.replace(ext, ".jpg");
    const newPath = path.join(UPLOADS_DIR, newFilename);
    try {
      await execAsync(`magick convert "${req.file.path}" "${newPath}"`);
      // Delete original
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      filename = newFilename;
    } catch (conversionError) {
      console.error("Error converting image:", conversionError);
      // Fallback: try using standard 'convert' if 'magick' alias fails
      try {
        await execAsync(`convert "${req.file.path}" "${newPath}"`);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        filename = newFilename;
      } catch (e2) {
        console.error("Fallback conversion error:", e2);
        // We will just serve the original and hope the browser can handle it
      }
    }
  }

  res.json({ url: `/api/uploads/${filename}` });
});

export default router;
