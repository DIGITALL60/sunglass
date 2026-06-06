import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { seedDatabase } from "./seed.js";

const app: Express = express();

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/api", router);

// Serve built React admin frontend (SPA fallback)
const publicDir = path.join(process.cwd(), "dist/public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

seedDatabase().catch((err) => logger.error({ err }, "Seed failed"));

export default app;
