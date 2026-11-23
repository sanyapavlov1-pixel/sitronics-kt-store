import { bigint, boolean, decimal, int, json, mysqlEnum, mysqlTable, serial, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(), name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 190 }).notNull(), description: text("description"),
  sortOrder: int("sort_order").notNull().default(0), isActive: boolean("is_active").notNull().default(true),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }).notNull().references(() => categories.id),
  name: varchar("name", { length: 255 }).notNull(), slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).unique(), shortDescription: text("short_description").notNull(),
  description: text("description").notNull(), specs: json("specs").$type<string[]>().notNull(),
  price: decimal("price", { precision: 14, scale: 2 }), currency: varchar("currency", { length: 3 }).notNull().default("RUB"),
  stock: int("stock").notNull().default(0),
  availability: mysqlEnum("availability", ["in_stock", "on_order", "out_of_stock"]).notNull().default("on_order"),
  imageUrl: text("image_url"), imageKey: varchar("image_key", { length: 512 }),
  isFeatured: boolean("is_featured").notNull().default(false), isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(), orderNumber: varchar("order_number", { length: 40 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 180 }).notNull(), company: varchar("company", { length: 255 }).notNull(),
  inn: varchar("inn", { length: 12 }), email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(), comment: text("comment"),
  status: mysqlEnum("status", ["new", "processing", "quoted", "completed", "cancelled"]).notNull().default("new"),
  total: decimal("total", { precision: 14, scale: 2 }), createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }).notNull(), sku: varchar("sku", { length: 100 }),
  price: decimal("price", { precision: 14, scale: 2 }), quantity: int("quantity").notNull(),
});
