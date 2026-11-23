import { TRPCError } from "@trpc/server";
import { asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery } from "./admin";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, orderItems, orders, products } from "@db/schema";
import { adminCookie, clearAdminCookie, createAdminSession, getAdminFromRequest, verifyAdminCredentials } from "./lib/admin-auth";
import { withProductImages } from "./lib/product-images";
import { storage } from "./lib/storage";

const productInput = z.object({
  categoryId: z.number().int().positive(), name: z.string().trim().min(2).max(255),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(2).max(255), sku: z.string().trim().max(100).optional(),
  shortDescription: z.string().trim().min(2).max(1000), description: z.string().trim().min(2).max(12000),
  specs: z.array(z.string().trim().min(1).max(500)).max(30),
  price: z.string().trim().regex(/^\d+(\.\d{1,2})?$/).nullable(),
  stock: z.number().int().min(0).max(1_000_000), availability: z.enum(["in_stock", "on_order", "out_of_stock"]),
  imageUrl: z.string().trim().max(2000).nullable(), imageKey: z.string().trim().max(512).nullable(),
  isFeatured: z.boolean(), isActive: z.boolean(),
});

const categoryInput = z.object({
  name: z.string().trim().min(2).max(180), slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(2).max(190),
  description: z.string().trim().max(2000).optional(), sortOrder: z.number().int().min(0).max(9999), isActive: z.boolean(),
});

export const adminRouter = createRouter({
  me: publicQuery.query(async ({ ctx }) => getAdminFromRequest(ctx.req)),
  login: publicQuery.input(z.object({ email: z.string().email(), password: z.string().min(8).max(200) })).mutation(async ({ ctx, input }) => {
    if (!verifyAdminCredentials(input.email, input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный email или пароль" });
    const token = await createAdminSession(input.email.trim().toLowerCase());
    ctx.resHeaders.append("Set-Cookie", adminCookie(token));
    return { email: input.email.trim().toLowerCase(), role: "admin" as const };
  }),
  logout: publicQuery.mutation(({ ctx }) => {
    ctx.resHeaders.append("Set-Cookie", clearAdminCookie());
    return { ok: true };
  }),
  dashboard: adminQuery.query(async () => {
    const db = getDb();
    const [[productCount], [orderCount], [newOrderCount], [categoryCount]] = await Promise.all([
      db.select({ value: count() }).from(products), db.select({ value: count() }).from(orders),
      db.select({ value: count() }).from(orders).where(eq(orders.status, "new")), db.select({ value: count() }).from(categories),
    ]);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);
    return { productCount: productCount.value, orderCount: orderCount.value, newOrderCount: newOrderCount.value, categoryCount: categoryCount.value, recentOrders };
  }),
  products: adminQuery.query(async () => {
    const rows = await getDb().select({
      id: products.id, categoryId: products.categoryId, categoryName: categories.name, name: products.name,
      slug: products.slug, sku: products.sku, shortDescription: products.shortDescription, description: products.description,
      specs: products.specs, price: products.price, currency: products.currency, stock: products.stock,
      availability: products.availability, imageUrl: products.imageUrl, imageKey: products.imageKey,
      isFeatured: products.isFeatured, isActive: products.isActive, createdAt: products.createdAt, updatedAt: products.updatedAt,
    }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.createdAt));
    return withProductImages(rows);
  }),
  createProduct: adminQuery.input(productInput).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
    if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "Товар с таким URL уже существует" });
    await db.insert(products).values({ ...input, sku: input.sku || null, imageUrl: input.imageUrl || null, imageKey: input.imageKey || null });
    return { ok: true };
  }),
  updateProduct: adminQuery.input(z.object({ id: z.number().int().positive(), data: productInput })).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.data.slug)).limit(1);
    if (existing[0] && existing[0].id !== input.id) throw new TRPCError({ code: "CONFLICT", message: "Товар с таким URL уже существует" });
    await db.update(products).set({ ...input.data, sku: input.data.sku || null, imageUrl: input.data.imageUrl || null, imageKey: input.data.imageKey || null, updatedAt: new Date() }).where(eq(products.id, input.id));
    return { ok: true };
  }),
  deleteProduct: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await getDb().delete(products).where(eq(products.id, input.id));
    return { ok: true };
  }),
  categories: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
    const productRows = await db.select({ categoryId: products.categoryId, value: count() }).from(products).groupBy(products.categoryId);
    return rows.map((row) => ({ ...row, productCount: productRows.find((item) => item.categoryId === row.id)?.value ?? 0 }));
  }),
  createCategory: adminQuery.input(categoryInput).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
    if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "Категория с таким URL уже существует" });
    await db.insert(categories).values({ ...input, description: input.description || null });
    return { ok: true };
  }),
  updateCategory: adminQuery.input(z.object({ id: z.number().int().positive(), data: categoryInput })).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.data.slug)).limit(1);
    if (existing[0] && existing[0].id !== input.id) throw new TRPCError({ code: "CONFLICT", message: "Категория с таким URL уже существует" });
    await db.update(categories).set({ ...input.data, description: input.data.description || null }).where(eq(categories.id, input.id));
    return { ok: true };
  }),
  deleteCategory: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = getDb();
    const [used] = await db.select({ value: count() }).from(products).where(eq(products.categoryId, input.id));
    if (used.value) throw new TRPCError({ code: "BAD_REQUEST", message: "Сначала переместите или удалите товары этой категории" });
    await db.delete(categories).where(eq(categories.id, input.id));
    return { ok: true };
  }),
  orders: adminQuery.query(async () => {
    const db = getDb();
    const [orderRows, itemRows] = await Promise.all([db.select().from(orders).orderBy(desc(orders.createdAt)), db.select().from(orderItems)]);
    return orderRows.map((order) => ({ ...order, items: itemRows.filter((item) => item.orderId === order.id) }));
  }),
  updateOrderStatus: adminQuery.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "processing", "quoted", "completed", "cancelled"]) })).mutation(async ({ input }) => {
    await getDb().update(orders).set({ status: input.status, updatedAt: new Date() }).where(eq(orders.id, input.id));
    return { ok: true };
  }),
  uploadImage: adminQuery.input(z.object({ name: z.string().min(1).max(180), contentBase64: z.string().max(7_000_000), contentType: z.enum(["image/jpeg", "image/png", "image/webp"]) })).mutation(async ({ input }) => {
    const extension = input.contentType === "image/jpeg" ? "jpg" : input.contentType === "image/png" ? "png" : "webp";
    const safeName = input.name.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80) || "product";
    const bytes = Uint8Array.from(Buffer.from(input.contentBase64, "base64"));
    if (bytes.byteLength > 5 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Максимальный размер изображения — 5 МБ" });
    const saved = await storage.uploadFile({ fileContent: bytes, fileName: `products/${safeName}.${extension}`, contentType: input.contentType });
    const { url } = await storage.getPresignedUrl({ key: saved.key });
    return { key: saved.key, url };
  }),
});
