import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm, mkdir } from "node:fs/promises";
import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";

globalThis.require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });
  await mkdir(path.resolve(distDir, "public"), { recursive: true });

  console.log("▶ Building frontend...");
  await viteBuild({
    root: path.resolve(__dirname, "frontend"),
    plugins: [react()],
    build: {
      outDir: path.resolve(distDir, "public"),
      emptyOutDir: true,
    },
    logLevel: "warn",
  });
  console.log("✓ Frontend built → dist/public/");

  console.log("▶ Building backend...");
  await esbuild({
    entryPoints: [path.resolve(__dirname, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: path.resolve(distDir, "server.mjs"),
    logLevel: "info",
    external: [
      "*.node", "sharp", "better-sqlite3", "sqlite3", "canvas",
      "bcrypt", "argon2", "fsevents", "pg-native", "oracledb",
      "mysql2", "sequelize", "typeorm", "@prisma/client",
    ],
    sourcemap: "linked",
    plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);`,
    },
  });
  console.log("✓ Backend built → dist/server.mjs");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
