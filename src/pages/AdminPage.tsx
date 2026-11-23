import { ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, Package, Pencil, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { ProductEditor } from "@/components/admin/ProductEditor";
import type { AdminProduct } from "@/components/admin/types";
import { ProductImage } from "@/components/ProductImage";
import { availabilityLabels, formatDate, formatPrice, orderStatusLabels } from "@/lib/format";
import { trpc } from "@/providers/trpc";

type Section = "dashboard" | "products" | "orders" | "categories";
const sectionTitles: Record<Section, string> = { dashboard: "Обзор", products: "Товары", orders: "Заказы", categories: "Категории" };

export default function AdminPage() {
  const me = trpc.admin.me.useQuery();
  const [section, setSection] = useState<Section>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct>();
  const [search, setSearch] = useState("");
  const enabled = Boolean(me.data);
  const dashboard = trpc.admin.dashboard.useQuery(undefined, { enabled });
  const products = trpc.admin.products.useQuery(undefined, { enabled });
  const categories = trpc.admin.categories.useQuery(undefined, { enabled });
  const utils = trpc.useUtils();
  const logout = trpc.admin.logout.useMutation({ onSuccess: () => { utils.admin.me.invalidate(); window.location.href = "/admin/login"; } });
  const remove = trpc.admin.deleteProduct.useMutation({ onSuccess: () => { utils.admin.products.invalidate(); utils.admin.dashboard.invalidate(); toast.success("Товар удалён"); }, onError: (error) => toast.error(error.message) });
  const filteredProducts = useMemo(() => products.data?.filter((product) => `${product.name} ${product.sku} ${product.categoryName}`.toLowerCase().includes(search.toLowerCase())), [products.data, search]);
  if (me.isLoading) return <div className="admin-loading">Загружаем панель администратора…</div>;
  if (!me.data) return <Navigate to="/admin/login" replace />;
  const selectSection = (next: Section) => { setSection(next); setMenuOpen(false); };
  const editProduct = (product?: AdminProduct) => { setSelectedProduct(product); setEditorOpen(true); };
  return <div className="admin-shell"><aside className={menuOpen ? "admin-sidebar is-open" : "admin-sidebar"}><div className="admin-sidebar__brand"><img src="/logo.svg" alt="Sitronics KT" /><span>CONTROL PANEL</span></div><nav aria-label="Разделы админ-панели"><button className={section === "dashboard" ? "active" : ""} onClick={() => selectSection("dashboard")}><LayoutDashboard /> Обзор</button><button className={section === "products" ? "active" : ""} onClick={() => selectSection("products")}><Package /> Товары</button><button className={section === "orders" ? "active" : ""} onClick={() => selectSection("orders")}><ShoppingBag /> Заказы{Boolean(dashboard.data?.newOrderCount) && <b>{dashboard.data?.newOrderCount}</b>}</button><button className={section === "categories" ? "active" : ""} onClick={() => selectSection("categories")}><FolderTree /> Категории</button></nav><div className="admin-sidebar__bottom"><Link to="/" target="_blank">Открыть магазин <ExternalLink size={16} /></Link><button onClick={() => logout.mutate()}><LogOut size={17} /> Выйти</button><small>{me.data.email}</small></div></aside>{menuOpen && <button className="admin-sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню" />}
    <main className="admin-main"><header className="admin-header"><button className="admin-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}>{menuOpen ? <X /> : <Menu />}</button><div><span>SITRONICS KT / ADMIN</span><h1>{sectionTitles[section]}</h1></div><div className="admin-header__status"><span className="signal-dot" /> Система активна</div></header>
      {section === "dashboard" && <div className="admin-dashboard"><div className="admin-stats"><button onClick={() => setSection("products")}><Package /><span>Товаров в каталоге</span><strong>{dashboard.data?.productCount ?? "—"}</strong><small>Все позиции каталога</small></button><button onClick={() => setSection("orders")}><ShoppingBag /><span>Всего заказов</span><strong>{dashboard.data?.orderCount ?? "—"}</strong><small>За всё время</small></button><button onClick={() => setSection("orders")} className="admin-stat--accent"><ShoppingBag /><span>Новые заявки</span><strong>{dashboard.data?.newOrderCount ?? "—"}</strong><small>Требуют обработки</small></button><button onClick={() => setSection("categories")}><FolderTree /><span>Категории</span><strong>{dashboard.data?.categoryCount ?? "—"}</strong><small>Разделы каталога</small></button></div><section className="admin-recent"><div className="admin-section-title"><div><span className="technical-label">ПОСЛЕДНИЕ ЗАЯВКИ</span><h2>Заказы</h2></div><button className="text-link" onClick={() => setSection("orders")}>Все заказы</button></div>{dashboard.data?.recentOrders.length ? <div className="admin-recent__list">{dashboard.data.recentOrders.map((order) => <button key={order.id} onClick={() => setSection("orders")}><span><strong>{order.orderNumber}</strong><small>{formatDate(order.createdAt)}</small></span><span>{order.company}</span><span>{order.total ? formatPrice(order.total) : "По расчёту"}</span><b className={`order-status order-status--${order.status}`}>{orderStatusLabels[order.status]}</b></button>)}</div> : <div className="admin-empty"><h3>Заявок пока нет</h3><p>Оформите тестовый заказ на витрине, чтобы проверить полный цикл.</p><Link to="/" target="_blank" className="button button--outline">Открыть магазин</Link></div>}</section></div>}
      {section === "products" && <section className="admin-panel"><div className="admin-panel__toolbar"><label className="admin-search"><span className="sr-only">Поиск товара</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Название, артикул или категория" /></label><button className="button button--primary" onClick={() => editProduct()} disabled={!categories.data?.length}><Plus size={17} /> Добавить товар</button></div>{products.isLoading ? <div className="admin-table-loading">Загружаем товары…</div> : products.isError ? <div className="form-error">{products.error.message}</div> : <div className="admin-product-table"><div className="admin-product-table__head"><span>Товар</span><span>Категория</span><span>Цена</span><span>Наличие</span><span>Статус</span><span>Действия</span></div>{filteredProducts?.map((product) => <div className="admin-product-row" key={product.id}><div className="admin-product-row__name"><ProductImage src={product.resolvedImageUrl} alt="" /><span><strong>{product.name}</strong><small>{product.sku ?? product.slug}</small></span></div><span>{product.categoryName}</span><strong>{formatPrice(product.price)}</strong><span>{availabilityLabels[product.availability]}<small className="table-subline">Остаток: {product.stock}</small></span><span className={product.isActive ? "publish-state" : "publish-state publish-state--off"}>{product.isActive ? "Опубликован" : "Скрыт"}</span><div className="admin-row-actions"><button onClick={() => editProduct(product)} aria-label={`Редактировать ${product.name}`}><Pencil size={17} /></button><button disabled={remove.isPending} onClick={() => { if (window.confirm(`Удалить «${product.name}»? Действие необратимо.`)) remove.mutate({ id: product.id }); }} aria-label={`Удалить ${product.name}`}><Trash2 size={17} /></button></div></div>)}</div>}</section>}
      {section === "orders" && <OrdersPanel />}{section === "categories" && <CategoriesPanel />}
    </main><ProductEditor open={editorOpen} onOpenChange={setEditorOpen} product={selectedProduct} categories={categories.data ?? []} />
  </div>;
}
