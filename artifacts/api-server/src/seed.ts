import bcrypt from "bcryptjs";
import { db, usersTable, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./lib/logger.js";

const SEED_PRODUCTS = [
  {
    name: "Reloj Quantum Pro",
    category: "Relojes",
    price: 89900,
    description: "Reloj de alta precisión con caja de acero inoxidable y correa de cuero genuino. Resistente al agua hasta 50m.",
    image_url: "https://picsum.photos/600/600?random=1",
  },
  {
    name: "Pulsera Cosmos",
    category: "Pulseras",
    price: 24900,
    description: "Pulsera minimalista de plata 925 con incrustaciones de cristal. Perfecta para cualquier ocasión.",
    image_url: "https://picsum.photos/600/600?random=2",
  },
  {
    name: "Lentes Nebula",
    category: "Lentes",
    price: 45900,
    description: "Anteojos de sol con marco de acetato premium y lentes polarizadas UV400. Estilo futurista.",
    image_url: "https://picsum.photos/600/600?random=3",
  },
  {
    name: "Anillo Aurora",
    category: "Anillos",
    price: 18900,
    description: "Anillo de plata 925 con baño en oro rosado. Diseño moderno con piedra sintética violeta.",
    image_url: "https://picsum.photos/600/600?random=4",
  },
  {
    name: "Reloj Eclipse",
    category: "Relojes",
    price: 124900,
    description: "Reloj automático con mecanismo visible. Caja de titanio, correa milanesa. Edición limitada.",
    image_url: "https://picsum.photos/600/600?random=5",
  },
  {
    name: "Pulsera Infinita",
    category: "Pulseras",
    price: 32900,
    description: "Set de 3 pulseras de acero inoxidable con acabado dorado. Apilables y versátiles.",
    image_url: "https://picsum.photos/600/600?random=6",
  },
  {
    name: "Lentes Solar Pulse",
    category: "Lentes",
    price: 38900,
    description: "Gafas de sol estilo aviador con lentes espejadas en degradé azul-verde. Marco metálico ligero.",
    image_url: "https://picsum.photos/600/600?random=7",
  },
  {
    name: "Anillo Helix",
    category: "Anillos",
    price: 22900,
    description: "Anillo de acero inoxidable con diseño geométrico grabado. Unisex. Acabado cepillado.",
    image_url: "https://picsum.photos/600/600?random=8",
  },
];

export async function seedDatabase() {
  try {
    // Seed admin user
    const existingUsers = await db.select().from(usersTable).limit(1);
    if (existingUsers.length === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await db.insert(usersTable).values({
        email: "admin@tienda.com",
        password: hashed,
        role: "admin",
      });
      logger.info("Admin user seeded");
    }

    // Seed products
    const existingProducts = await db.select().from(productsTable).limit(1);
    if (existingProducts.length === 0) {
      await db.insert(productsTable).values(SEED_PRODUCTS);
      logger.info("Products seeded");
    }
  } catch (err) {
    logger.error({ err }, "Error seeding database");
  }
}
