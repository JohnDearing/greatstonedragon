"use client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { Product } from "@/lib/store-data";
import Link from "next/link";

const FALLBACK_IMAGES = [
  "/images/home/ReleaseCard1.png",
  "/images/home/releaseCard2.png",
  "/images/home/releaseCard3.png",
  "/images/home/releaseCard4.png",
  "/images/product/product1.png",
  "/images/product/product2.png",
  "/images/product/product3.png",
];

export function ShopProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const badgeLabel =
    product.badge === "Best Seller"
      ? "BESTSELLER"
      : product.badge
        ? product.badge.toUpperCase()
        : null;

  const imageSrc =
    product.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const detailHref = `/products/${product.slug}`;

  return (
    <article className="shop-product-card">
      <Link href={detailHref} className="shop-product-media" tabIndex={-1}>
        <ProductImage
          src={imageSrc}
          alt={product.name}
          width={800}
          height={800}
          sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 320px"
          className="shop-product-img"
        />
      </Link>

      <span className="shop-product-shade" aria-hidden="true" />
      {badgeLabel ? <em className="shop-product-badge">{badgeLabel}</em> : null}

      <div className="shop-product-actions">
        <AddToCartButton
          className="shop-product-action is-cart"
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            variantId: product.variantId,
          }}
        />
        <Link href={detailHref} className="shop-product-action is-detail">
          View Detail
        </Link>
      </div>

      <Link href={detailHref} className="shop-product-title">
        {product.name}
      </Link>
    </article>
  );
}
