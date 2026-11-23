import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDate, formatPrice, orderStatusLabels } from "@/lib/format";
import { trpc } from "@/providers/trpc";

type Status = keyof typeof orderStatusLabels;

export function OrdersPanel() {
  const orders = trpc.admin.orders.useQuery();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const update = trpc.admin.updateOrderStatus.useMutation({ onSuccess: () => { utils.admin.orders.invalidate(); utils.admin.dashboard.invalidate(); toast.success("Статус заказа обновлён"); }, onError: (error) => toast.error(error.message) });
  const filtered = useMemo(() => orders.data?.filter((order) => `${order.orderNumber} ${order.company} ${order.customerName} ${order.email}`.toLowerCase().includes(search.toLowerCase())), [orders.data, search]);
  return <section className="admin-panel"><div className="admin-panel__toolbar"><label className="admin-search"><span className="sr-only">Поиск заказа</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Номер, компания или контакт" /></label><span className="admin-panel__count">Всего: {filtered?.length ?? 0}</span></div>
    {orders.isLoading ? <div className="admin-table-loading">Загружаем заказы…</div> : orders.isError ? <div className="form-error">{orders.error.message}</div> : filtered?.length ? <div className="admin-order-list">{filtered.map((order) => <details className="admin-order" key={order.id}><summary><div className="admin-order__number"><strong>{order.orderNumber}</strong><span>{formatDate(order.createdAt)}</span></div><div className="admin-order__company"><strong>{order.company}</strong><span>{order.customerName} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} шт.</span></div><div className="admin-order__total">{order.total ? formatPrice(order.total) : "По расчёту"}</div><select aria-label={`Статус ${order.orderNumber}`} className={`status-select status-select--${order.status}`} value={order.status} disabled={update.isPending} onClick={(e) => e.stopPropagation()} onChange={(e) => update.mutate({ id: order.id, status: e.target.value as Status })}>{Object.entries(orderStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></summary><div className="admin-order__details"><div className="admin-order__contacts"><h3>Контакты</h3><p>{order.customerName}<br />{order.company}{order.inn && <> · ИНН {order.inn}</>}<br /><a href={`mailto:${order.email}`}>{order.email}</a><br /><a href={`tel:${order.phone}`}>{order.phone}</a></p>{order.comment && <><h3>Комментарий</h3><p>{order.comment}</p></>}</div><div><h3>Состав заказа</h3><div className="admin-order__items">{order.items.map((item) => <div key={item.id}><span>{item.productName}<small>{item.sku}</small></span><span>{item.quantity} шт.</span><strong>{item.price ? formatPrice(Number(item.price) * item.quantity) : "По запросу"}</strong></div>)}</div></div></div></details>)}</div> : <div className="admin-empty"><h3>Заказы не найдены</h3><p>Новые заявки с витрины появятся здесь автоматически.</p></div>}
  </section>;
}
