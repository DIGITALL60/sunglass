import { pgTable, serial, text, real, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const productVariantsTable = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  available: boolean("available").default(true).notNull(),
});

export const productsRelations = relations(productsTable, ({ many }) => ({
  variants: many(productVariantsTable),
}));

export const productVariantsRelations = relations(productVariantsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productVariantsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, created_at: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type ProductVariant = typeof productVariantsTable.$inferSelect;
export type InsertProductVariant = typeof productVariantsTable.$inferInsert;
