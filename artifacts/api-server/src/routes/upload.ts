import { Router } from "express";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { requireAuth } from "../middlewares/auth.js";

// Configurar Cloudinary usando variables de entorno o fallbacks
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dafxkpvrz",
  api_key: process.env.CLOUDINARY_API_KEY || "147388198523844",
  api_secret: process.env.CLOUDINARY_API_SECRET || "XXvMhTebFxQpX_W7w1owXlTWrPc"
});

// Usar MemoryStorage en lugar de DiskStorage para Vercel
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".dng", ".heic", ".heif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"));
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
  
  try {
    const uploadFromBuffer = (req: any) => {
      return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: "sunglass",
            format: "webp", // Convertir automáticamente a webp para mejor rendimiento
            quality: "auto",
          },
          (error: any, result: any) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
      });
    };

    const result = await uploadFromBuffer(req) as any;
    
    // Devolvemos la URL segura provista por Cloudinary
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Error al subir la imagen a Cloudinary" });
  }
});

export default router;
