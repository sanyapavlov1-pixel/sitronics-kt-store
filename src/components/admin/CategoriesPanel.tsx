import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { slugify } from "@/lib/format";
import { trpc } from "@/providers/trpc";
import type { AdminCategory } from "./types";

const empty = { name: "", slug: "", description: "", sortOrder: 0, isActive: true };

export function CategoriesPanel() {
  const categories = trpc.admin.categories.useQuery();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory>();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  useEffect(() => { setForm(editing ? { name: editing.name, slug: editing.slug, description: editing.description ?? "", sortOrder: editing.sortOrder, isActive: editing.isActive } : empty); setError(""); }, [editing, open]);
  const done = () => { utils.admin.categories.invalidate(); utils.store.categories.invalidate(); setOpen(false); setEditing(undefined); toast.success("Категория сохранена"); };
  const create = trpc.admin.createCategory.useMutation({ onSuccess: done, onError: (e) => setError(e.message) });
  const update = trpc.admin.updateCategory.useMutation({ onSuccess: done, onError: (e) => setError(e.message) });
  const remove = trpc.admin.deleteCategory.useMutation({ onSuccess: () => { utils.admin.categories.invalidate(); toast.success("Категория удалена"); }, onError: (e) => toast.error(e.message) });
  function submit(event: FormEvent) { event.preventDefault(); const data = { ...form, sortOrder: Number(form.sortOrder) }; if (editing) update.mutate({ id: editing.id, data }); else create.mutate(data); }
  return <section className="admin-panel"><div className="admin-panel__toolbar"><p className="admin-panel__hint">Категории используются для фильтрации товаров на витрине.</p><button className="button button--primary" onClick={() => { setEditing(undefined); setOpen(true); }}><Plus size={17} /> Добавить категорию</button></div>
    {categories.isLoading ? <div className="admin-table-loading">Загружаем категории…</div> : <div className="admin-category-list">{categories.data?.map((category) => <div className="admin-category" key={category.id}><div><strong>{category.name}</strong><span>/{category.slug}</span></div><p>{category.description}</p><span>{category.productCount} товаров</span><span className={category.isActive ? "publish-state" : "publish-state publish-state--off"}>{category.isActive ? "Активна" : "Скрыта"}</span><div className="admin-row-actions"><button onClick={() => { setEditing(category); setOpen(true); }} aria-label={`Редактировать ${category.name}`}><Pencil size={17} /></button><button disabled={category.productCount > 0 || remove.isPending} onClick={() => { if (window.confirm(`Удалить категорию «${category.name}»?`)) remove.mutate({ id: category.id }); }} aria-label={`Удалить ${category.name}`}><Trash2 size={17} /></button></div></div>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="category-editor"><DialogHeader><DialogTitle>{editing ? "Редактировать категорию" : "Новая категория"}</DialogTitle><DialogDescription>Название будет отображаться в фильтрах каталога.</DialogDescription></DialogHeader><form onSubmit={submit}><label>Название *<input required minLength={2} value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value, slug: editing ? current.slug : slugify(e.target.value) }))} /></label><label>URL (slug) *<input required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} /></label><label>Описание<textarea rows={3} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></label><label>Порядок сортировки<input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))} /></label><label className="checkbox-line"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))} /> Показывать на витрине</label>{error && <div className="form-error">{error}</div>}<button className="button button--primary button--wide" disabled={create.isPending || update.isPending}>Сохранить</button></form></DialogContent></Dialog>
  </section>;
}
