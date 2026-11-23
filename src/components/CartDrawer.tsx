import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCart();
  const total = items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const hasUnknownPrice = items.some((item) => !item.price);
  return <Sheet open={isOpen} onOpenChange={setIsOpen}>
    <SheetContent className="cart-drawer" aria-describedby="cart-description">
      <SheetHeader className="cart-drawer__header"><SheetTitle>Корзина <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></SheetTitle><SheetDescription id="cart-description">Оборудование для включения в заявку</SheetDescription></SheetHeader>
      {items.length === 0 ? <div className="cart-empty"><ShoppingBag size={42} strokeWidth={1.2} /><h3>Корзина пока пуста</h3><p>Добавьте оборудование из каталога, чтобы отправить заявку менеджеру.</p><button className="button button--primary" onClick={() => setIsOpen(false)}>Вернуться в каталог</button></div> : <>
        <div className="cart-drawer__items">{items.map((item) => <div className="cart-item" key={item.productId}>
          <ProductImage src={item.image} alt="" />
          <div className="cart-item__content"><Link to={`/product/${item.slug}`} onClick={() => setIsOpen(false)}>{item.name}</Link><small>{item.sku}</small><strong>{formatPrice(item.price, item.currency)}</strong>
            <div className="quantity-control"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Уменьшить количество"><Minus size={15} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= 99} aria-label="Увеличить количество"><Plus size={15} /></button></div>
          </div>
          <button className="cart-item__remove" onClick={() => removeItem(item.productId)} aria-label={`Удалить ${item.name}`}><Trash2 size={17} /></button>
        </div>)}</div>
        <div className="cart-drawer__footer"><div className="cart-total"><span>Предварительная сумма</span><strong>{hasUnknownPrice ? "Рассчитаем после заявки" : formatPrice(total)}</strong></div><p>Окончательную стоимость, сроки поставки и комплектацию подтвердит менеджер.</p><Link to="/checkout" className="button button--primary button--wide" onClick={() => setIsOpen(false)}>Оформить заявку</Link></div>
      </>}
    </SheetContent>
  </Sheet>;
}
