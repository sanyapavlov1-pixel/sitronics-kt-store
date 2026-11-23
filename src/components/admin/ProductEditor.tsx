import { Upload, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { slugify } from "@/lib/format";
import { trpc } from "@/providers/trpc";
import { ProductImage } from "../ProductImage";
import type { AdminCategory, AdminProduct } from "./types";

type FormState = {
  categoryId: number; name: string; slug: string; sku: string; shortDescription: string; description: string;
  specsText: string; price: string; stock: number; availability: "in_stock" | "on_order" | "out_of_stock";
  imageUrl: string; imageKey: string | null; isFeatured: boolean; isActive: boolean;
};

function emptyForm(categoryId = 0): FormState {
  return { categoryId, name: "", slug: "", sku: "", shortDescription: "", description: "", specsText: "", price: "", stock: 0, availability: "on_order", imageUrl: "", imageKey: null, isFeatured: false, isActive: true };
}

export function ProductEditor({ open, onOpenChange, product, categories }: { open: boolean; onOpenChange: (open: boolean) => void; product?: AdminProduct; categories: AdminCategory[] }) {
  const [form, setForm] = useState<FormState>(() => emptyForm(categories[0]?.id));
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(product ? { categoryId: product.categoryId, name: product.name, slug: product.slug, sku: product.sku ?? "", shortDescription: product.shortDescription, description: product.description, specsText: product.specs.join("\n"), price: product.price ?? "", stock: product.stock, availability: product.availability, imageUrl: product.imageUrl ?? "", imageKey: product.imageKey, isFeatured: product.isFeatured, isActive: product.isActive } : emptyForm(categories[0]?.id));
    setPreview(product?.resolvedImageUrl ?? null);
  }, [open, product, categories]);
  const saved = () => { utils.admin.products.invalidate(); utils.admin.dashboard.invalidate(); onOpenChange(false); toast.success(product ? "Товар обновлён" : "Товар добавлен"); };
  const create = trpc.admin.createProduct.useMutation({ onSuccess: saved, onError: (result) => setError(result.message) });
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: saved, onError: (result) => setError(result.message) });
  const upload = trpc.admin.uploadImage.useMutation();
  const pending = create.isPending || update.isPending;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function fileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Изображение должно быть не больше 5 МБ"); return; }
    setError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await upload.mutateAsync({ name: file.name, contentBase64: dataUrl.split(",")[1], contentType: file.type as "image/jpeg" | "image/png" | "image/webp" });
      setForm((current) => ({ ...current, imageKey: result.key })); setPreview(result.url); toast.success("Изображение загружено");
    } catch (result) { setError(result instanceof Error ? result.message : "Не удалось загрузить изображение"); }
  }

  function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const data = { categoryId: Number(form.categoryId), name: form.name, slug: form.slug, sku: form.sku, shortDescription: form.shortDescription, description: form.description, specs: form.specsText.split("\n").map((item) => item.trim()).filter(Boolean), price: form.price || null, stock: Number(form.stock), availability: form.availability, imageUrl: form.imageUrl || null, imageKey: form.imageKey, isFeatured: form.isFeatured, isActive: form.isActive };
    if (product) update.mutate({ id: product.id, data }); else create.mutate(data);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="admin-editor" onOpenAutoFocus={(event) => event.preventDefault()}><DialogHeader><DialogTitle>{product ? "Редактировать товар" : "Новый товар"}</DialogTitle><DialogDescription>Заполните сведения для витрины. Поля со звёздочкой обязательны.</DialogDescription></DialogHeader><form onSubmit={submit} className="admin-editor__form">
    <div className="admin-editor__columns"><div>
      <label>Название *<input required minLength={2} value={form.name} onChange={(e) => { set("name", e.target.value); if (!product) set("slug", slugify(e.target.value)); }} /></label>
      <label>URL (slug) *<input required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => set("slug", e.target.value)} /></label>
      <div className="form-grid"><label>Артикул<input value={form.sku} onChange={(e) => set("sku", e.target.value)} /></label><label>Категория *<select required value={form.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Цена, ₽<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="Пусто — по запросу" /></label><label>Остаток, шт.<input type="number" min="0" required value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} /></label></div>
      <label>Наличие<select value={form.availability} onChange={(e) => set("availability", e.target.value as FormState["availability"])}><option value="in_stock">В наличии</option><option value="on_order">Под заказ</option><option value="out_of_stock">Нет в наличии</option></select></label>
      <label>Краткое описание *<textarea required rows={3} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></label>
      <label>Полное описание *<textarea required rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
      <label>Характеристики — по одной на строку<textarea rows={5} value={form.specsText} onChange={(e) => set("specsText", e.target.value)} /></label>
    </div><div>
      <div className="admin-image-upload"><ProductImage src={preview} alt="Предпросмотр товара" /><label className="button button--outline"><Upload size={17} />{upload.isPending ? "Загрузка…" : "Загрузить фото"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={fileSelected} disabled={upload.isPending} hidden /></label>{form.imageKey && <button type="button" className="text-button" onClick={() => { set("imageKey", null); setPreview(form.imageUrl || null); }}><X size={15} /> Удалить загруженное фото</button>}<small>JPG, PNG или WebP, до 5 МБ</small></div>
      <label>Или ссылка на изображение<input type="text" inputMode="url" value={form.imageUrl} onChange={(e) => { set("imageUrl", e.target.value); if (!form.imageKey) setPreview(e.target.value || null); }} placeholder="https://…" /></label>
      <div className="admin-switches"><label><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} /><span>Опубликован на витрине</span></label><label><input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /><span>Показывать первым</span></label></div>
    </div></div>
    {error && <div className="form-error" role="alert">{error}</div>}<div className="admin-editor__footer"><button type="button" className="button button--ghost" onClick={() => onOpenChange(false)}>Отмена</button><button className="button button--primary" disabled={pending || upload.isPending}>{pending ? "Сохраняем…" : "Сохранить товар"}</button></div>
  </form></DialogContent></Dialog>;
}
