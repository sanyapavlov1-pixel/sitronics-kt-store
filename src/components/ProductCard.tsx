import { ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "@/context/CartContext";
import { availabilityLabels, formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";

type ProductCardProps = {
  product: {
    id: number; name: string; slug: string; sku: string | null; categoryName: string;
    shortDescription: string; price: string | null; currency: string;
    availability: "in_stock" | "on_order" | "out_of_stock"; resolvedImageUrl: string | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const disabled = product.availability === "out_of_stock";
  return <article className="product-card">
    <Link to={`/product/${product.slug}`} className="product-card__media" aria-label={`Открыть ${product.name}`}>
      <ProductImage src={product.resolvedImageUrl} alt={product.name} />
      <span className="product-card__open"><ArrowUpRight size={20} /></span>
    </Link>
    <div className="product-card__body">
      <div className="product-card__meta"><span>{product.categoryName}</span><span>{product.sku ?? "SITRONICS KT"}</span></div>
      <Link to={`/product/${product.slug}`} className="product-card__title">{product.name}</Link>
      <p>{product.shortDescription}</p>
      <div className="product-card__footer">
        <div><strong>{formatPrice(product.price, product.currency)}</strong><small>{availabilityLabels[product.availability]}</small></div>
        <button className="icon-action" disabled={disabled} onClick={() => addItem({ productId: product.id, slug: product.slug, name: product.name, sku: product.sku, price: product.price, currency: product.currency, image: product.resolvedImageUrl })} aria-label={`Добавить ${product.name} в корзину`} title="Добавить в корзину"><Plus size={21} /></button>
      </div>
    </div>
  </article>;
}
