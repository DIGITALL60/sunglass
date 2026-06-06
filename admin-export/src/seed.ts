import bcrypt from "bcryptjs";
import { db, usersTable, productsTable } from "./db.js";
import { logger } from "./lib/logger.js";

const SEED_PRODUCTS = [
  { name: "Reloj Quantum Pro",   category: "Relojes",   price: 89900,  description: "Reloj de alta precisión.", image_url: "https://picsum.photos/600/600?random=1" },
  { name: "Pulsera Cosmos",      category: "Pulseras",  price: 24900,  description: "Pulsera minimalista.",     image_url: "https://picsum.photos/600/600?random=2" },
  { name: "Lentes Nebula",       category: "Lentes",    price: 45900,  description: "Anteojos UV400.",          image_url: "https://picsum.photos/600/600?random=3" },
  { name: "Anillo Aurora",       category: "Anillos",   price: 18900,  description: "Anillo plata 925.",        image_url: "https://picsum.photos/600/600?random=4" },
];

export async function seedDatabase() {
  try {
    const existingUsers = await db.select().from(usersTable).limit(1);
    if (existingUsers.length === 0) {
      const hashed = await bcrypt.hash("fiamayjorge", 10);
      await db.insert(usersTable).values({ email: "admin@tienda.com", password: hashed, role: "admin" });
      logger.info("Admin user seeded");
    }
    const existingProducts = await db.select().from(productsTable).limit(1);
    if (existingProducts.length === 0) {
      await db.insert(productsTable).values(SEED_PRODUCTS);
      logger.info("Products seeded");
    }
  } catch (err) {
    logger.error({ err }, "Seed error");
  }
}
