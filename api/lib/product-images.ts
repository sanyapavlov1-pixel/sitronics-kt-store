import { storage } from "./storage";

export async function withProductImages<T extends { imageKey: string | null; imageUrl: string | null }>(rows: T[]) {
  const keys = [...new Set(rows.map((row) => row.imageKey).filter((key): key is string => Boolean(key)))];
  const urls = keys.length ? (await storage.getPresignedUrls({ keys })).urls : [];
  const urlByKey = new Map(urls.map((item) => [item.key, item.url]));
  return rows.map((row) => ({ ...row, resolvedImageUrl: row.imageKey ? (urlByKey.get(row.imageKey) ?? null) : row.imageUrl }));
}
