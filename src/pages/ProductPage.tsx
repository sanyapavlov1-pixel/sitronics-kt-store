import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { ProductImage } from "@/components/ProductImage";
import { StoreLayout } from "@/components/StoreLayout";
import { useCart } from "@/context/CartContext";
import { availabilityLabels, formatPrice } from "@/lib/format";
import { trpc } from "@/providers/trpc";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = trpc.store.productBySlug.useQuery({ slug });
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  if (product.isLoading) return <StoreLayout><div className="page-loading"><span className="loading-line" /><p>Загружаем информацию о товаре…</p></div></StoreLayout>;
  if (product.isError || !product.data) return <StoreLayout><div className="empty-state empty-state--page"><h1>Товар не найден</h1><p>Возможно, он был снят с публикации.</p><Link to="/#catalog" className="button button--primary">Вернуться в каталог</Link></div></StoreLayout>;
  const item = product.data;
  const unavailable = item.availability === "out_of_stock";
  return <StoreLayout><div className="container product-page">
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link to="/#catalog"><ArrowLeft size={16} /> Каталог</Link><span>/</span><span>{item.categoryName}</span></nav>
    <div className="product-detail"><div className="product-detail__media"><ProductImage src={item.resolvedImageUrl} alt={item.name} eager /><span className="product-detail__sku">{item.sku ?? "SITRONICS KT"}</span></div><div className="product-detail__info">
      <span className="technical-label">{item.categoryName}</span><h1>{item.name}</h1><p className="product-detail__lead">{item.shortDescription}</p>
      <div className="product-detail__price"><strong>{formatPrice(item.price, item.currency)}</strong><span className={`availability availability--${item.availability}`}>{availabilityLabels[item.availability]}</span></div>
      <p className="price-note">{item.price ? "Цена предварительная и подтверждается при оформлении заявки." : "Стоимость рассчитывается по комплектации и техническому заданию."}</p>
      <div className="product-detail__actions"><div className="quantity-control quantity-control--large"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Уменьшить количество"><Minus /></button><span>{quantity}</span><button onClick={() => setQuantity((value) => Math.min(99, value + 1))} disabled={quantity >= 99} aria-label="Увеличить количество"><Plus /></button></div><button className="button button--primary" disabled={unavailable} onClick={() => addItem({ productId: item.id, slug: item.slug, name: item.name, sku: item.sku, price: item.price, currency: item.currency, image: item.resolvedImageUrl }, quantity)}><ShoppingBag size={19} />{unavailable ? "Нет в наличии" : "Добавить в корзину"}</button></div>
      <a className="text-link" href={`mailto:sale@sitronics-kt.ru?subject=Вопрос о ${item.name}`}>Задать вопрос инженеру</a>
      <div className="product-assurances"><span><Check size={17} /> Официальное оборудование</span><span><Check size={17} /> Помощь с комплектацией</span><span><Check size={17} /> Документация и поддержка</span></div>
    </div></div>
    <div className="product-description"><div><span className="technical-label">ОПИСАНИЕ</span><h2>Назначение решения</h2></div><div><p>{item.description}</p>{item.specs.length > 0 && <><h3>Основные характеристики</h3><ul className="spec-list">{item.specs.map((spec, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span>{spec}</li>)}</ul></>}</div></div>
  </div></StoreLayout>;
}
