import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ProductImage } from "@/components/ProductImage";
import { StoreLayout } from "@/components/StoreLayout";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { trpc } from "@/providers/trpc";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string>();
  const createOrder = trpc.store.createOrder.useMutation({
    onSuccess: (result) => { setOrderNumber(result.orderNumber); clearCart(); window.scrollTo({ top: 0, behavior: "smooth" }); },
  });
  const total = items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const hasUnknownPrice = items.some((item) => !item.price);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createOrder.mutate({
      customerName: String(data.get("customerName")), company: String(data.get("company")), inn: String(data.get("inn") ?? ""),
      email: String(data.get("email")), phone: String(data.get("phone")), comment: String(data.get("comment") ?? ""),
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
  }
  if (orderNumber) return <StoreLayout><div className="container order-success"><CheckCircle2 size={64} strokeWidth={1.2} /><span className="technical-label">ЗАЯВКА ПРИНЯТА</span><h1>Спасибо за обращение</h1><p>Номер заявки</p><strong>{orderNumber}</strong><div className="order-success__note">Менеджер Sitronics KT проверит состав, стоимость и сроки поставки, после чего свяжется с вами по указанным контактам.</div><Link to="/#catalog" className="button button--primary">Вернуться в каталог</Link></div></StoreLayout>;
  return <StoreLayout><div className="container checkout-page"><Link to="/#catalog" className="back-link"><ArrowLeft size={17} /> Продолжить выбор</Link><div className="section-heading section-heading--compact"><div><span className="technical-label">ОФОРМЛЕНИЕ / B2B</span><h1>Заявка на оборудование</h1></div><p>Без онлайн-оплаты. После проверки заявки менеджер выставит счёт и согласует условия поставки.</p></div>
    {items.length === 0 ? <div className="empty-state"><ShoppingBag size={40} /><h2>В корзине нет товаров</h2><p>Сначала добавьте оборудование из каталога.</p><Link to="/#catalog" className="button button--primary">Перейти в каталог</Link></div> : <form className="checkout-grid" onSubmit={submit}>
      <div className="checkout-form"><section><h2><span>01</span> Контактные данные</h2><div className="form-grid"><label>Контактное лицо *<input name="customerName" required minLength={2} maxLength={180} autoComplete="name" placeholder="Иван Петров" /></label><label>Компания *<input name="company" required minLength={2} maxLength={255} autoComplete="organization" placeholder="ООО «Название»" /></label><label>ИНН<input name="inn" inputMode="numeric" pattern="(\d{10}|\d{12})?" title="10 или 12 цифр" placeholder="Необязательно" /></label><label>Телефон *<input name="phone" required minLength={6} maxLength={50} type="tel" autoComplete="tel" placeholder="+7 900 000-00-00" /></label><label className="form-grid__wide">Email *<input name="email" required type="email" autoComplete="email" placeholder="name@company.ru" /></label></div></section><section><h2><span>02</span> Комментарий к заявке</h2><label>Задача, комплектация, сроки<textarea name="comment" rows={5} maxLength={3000} placeholder="Укажите тип судна, требуемую комплектацию или другие пожелания" /></label></section><label className="consent-field"><input type="checkbox" required /><span>Согласен на обработку персональных данных для подготовки ответа на заявку *</span></label>{createOrder.isError && <div className="form-error" role="alert">Не удалось отправить заявку: {createOrder.error.message}</div>}<button className="button button--primary button--wide" disabled={createOrder.isPending}>{createOrder.isPending ? "Отправляем заявку…" : "Отправить заявку менеджеру"}</button></div>
      <aside className="checkout-summary"><h2>Состав заявки <span>{items.length}</span></h2>{items.map((item) => <div className="checkout-summary__item" key={item.productId}><ProductImage src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.quantity} шт. · {formatPrice(item.price, item.currency)}</span></div></div>)}<div className="checkout-summary__total"><span>Предварительно</span><strong>{hasUnknownPrice ? "По результатам расчёта" : formatPrice(total)}</strong></div><p>Стоимость доставки и дополнительные работы при необходимости рассчитываются отдельно.</p></aside>
    </form>}
  </div></StoreLayout>;
}
