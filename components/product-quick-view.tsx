"use client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { money, Product } from "@/lib/store-data";
import Link from "next/link";

type ProductQuickViewProps = {
  product: Product;
  previousHref?: string;
  closeHref?: string;
};

export function ProductQuickView({
  product,
  previousHref = "/products",
  closeHref = "/products",
}: ProductQuickViewProps) {
  const imageSrc = product.image || "/images/product/product1.png";

  return (
    <div className="product-detail-main">
      <div className="product-detail-top">
        <h1 className="product-detail-heading">{product.name}</h1>
        <Link href={`/products/${product.slug}`} className="product-detail-full">
          View full product page
        </Link>
      </div>

      <div className="product-detail-stage">
        <span className="product-detail-price-pill">{money(product.price)}</span>

        <div className="product-detail-media">
          <ProductImage
            src={imageSrc}
            alt={product.name}
            width={1100}
            height={900}
            className="product-detail-img"
            priority
          />
        </div>

        <div className="product-detail-modal" role="dialog" aria-modal="true">
          <Link href={closeHref} className="product-detail-close">
            Close
          </Link>
          <h2>{product.name}</h2>
          <p>{money(product.price)}</p>
          <AddToCartButton
            className="product-detail-cart"
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              variantId: product.variantId,
            }}
          />
          <Link href="/contact" className="product-detail-photos">
            Request More Photos
          </Link>
          <Link href={`/products/${product.slug}`} className="product-detail-photos">
            View Full Details
          </Link>
        </div>
      </div>

      <div className="product-detail-nav">
        <Link href={previousHref} className="product-detail-prev">
          ← Previous
        </Link>
      </div>
    </div>
  );
}
