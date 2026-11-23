import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, orderItems, orders, products } from "@db/schema";
import { withProductImages } from "./lib/product-images";

const productSelection = {
  id: products.id, categoryId: products.categoryId, categoryName: categories.name, categorySlug: categories.slug,
  name: products.name, slug: products.slug, sku: products.sku, shortDescription: products.shortDescription,
  description: products.description, specs: products.specs, price: products.price, currency: products.currency,
  stock: products.stock, availability: products.availability, imageUrl: products.imageUrl, imageKey: products.imageKey,
  isFeatured: products.isFeatured, isActive: products.isActive, createdAt: products.createdAt,
};

export const storeRouter = createRouter({
  categories: publicQuery.query(async () => {
    return getDb().select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.name);
  }),

  products: publicQuery
    .input(z.object({ search: z.string().max(120).optional(), category: z.string().max(190).optional() }).optional())
    .query(async ({ input }) => {
      const conditions = [eq(products.isActive, true)];
      if (input?.category) conditions.push(eq(categories.slug, input.category));
      if (input?.search?.trim()) {
        const term = `%${input.search.trim()}%`;
        const search = or(like(products.name, term), like(products.shortDescription, term), like(products.sku, term));
        if (search) conditions.push(search);
      }
      const rows = await getDb().select(productSelection).from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(products.isFeatured), desc(products.createdAt));
      return withProductImages(rows);
    }),

  productBySlug: publicQuery.input(z.object({ slug: z.string().min(1).max(255) })).query(async ({ input }) => {
    const rows = await getDb().select(productSelection).from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, input.slug), eq(products.isActive, true))).limit(1);
    if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Товар не найден" });
    return (await withProductImages(rows))[0];
  }),

  createOrder: publicQuery.input(z.object({
    customerName: z.string().trim().min(2).max(180),
    company: z.string().trim().min(2).max(255),
    inn: z.string().trim().regex(/^$|^\d{10}$|^\d{12}$/, "ИНН должен содержать 10 или 12 цифр").optional(),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(6).max(50),
    comment: z.string().trim().max(3000).optional(),
    items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).min(1).max(100),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const ids = input.items.map((item) => item.productId);
    const catalog = await db.select().from(products).where(and(eq(products.isActive, true), or(...ids.map((id) => eq(products.id, id)))));
    if (catalog.length !== new Set(ids).size) throw new TRPCError({ code: "BAD_REQUEST", message: "Некоторые товары недоступны. Обновите корзину." });
    const total = input.items.reduce((sum, item) => {
      const product = catalog.find((row) => row.id === item.productId);
      return sum + (product?.price ? Number(product.price) * item.quantity : 0);
    }, 0);
    const hasUnknownPrice = input.items.some((item) => !catalog.find((row) => row.id === item.productId)?.price);
    const orderNumber = `KT-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    await db.transaction(async (tx) => {
      const [{ id: orderId }] = await tx.insert(orders).values({
        orderNumber, customerName: input.customerName, company: input.company, inn: input.inn || null,
        email: input.email, phone: input.phone, comment: input.comment || null, total: hasUnknownPrice ? null : total.toFixed(2),
      }).$returningId();
      await tx.insert(orderItems).values(input.items.map((item) => {
        const product = catalog.find((row) => row.id === item.productId)!;
        return { orderId, productId: product.id, productName: product.name, sku: product.sku, price: product.price, quantity: item.quantity };
      }));
    });
    return { orderNumber };
  }),
});
