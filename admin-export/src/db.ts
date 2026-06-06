import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("admin").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof productsTable.$inferSelect;
export type User   = typeof usersTable.$inferSelect;

const schema = { productsTable, usersTable };
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db   = drizzle(pool, { schema });

export async function initDb() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
}
