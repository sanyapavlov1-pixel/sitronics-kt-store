import { Radio } from "lucide-react";
import { useState } from "react";

export function ProductImage({ src, alt, className = "", eager = false }: { src: string | null; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`product-image-placeholder ${className}`} role="img" aria-label={alt}>
      <Radio strokeWidth={1.2} />
      <span>SITRONICS KT</span>
    </div>;
  }
  return <img className={className} src={src} alt={alt} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />;
}
