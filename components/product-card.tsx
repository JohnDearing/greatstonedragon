"use client";

import { hasPinVariantPicker } from "@/lib/product-variants";
import { Product, money } from "@/lib/store-data";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";
import { ProductVariantModal } from "./product-variant-modal";

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const needsVariantPicker = hasPinVariantPicker(product.variants);
  const [pickerOpen, setPickerOpen] = useState(false);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  return (
    <motion.article
      className="product-tile"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/products/${product.slug}`} className="thumb-wrap">
        {product.image ? (
          <ProductImage
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            className="thumb-art-img"
          />
        ) : (
          <div
            className="thumb-art"
            style={{
              background: `linear-gradient(145deg, ${product.colors[0]}, ${product.colors[1]})`,
            }}
          />
        )}
      </Link>
      <div className="tile-body">
        {product.badge ? <p className="pill">{product.badge}</p> : null}
        <Link href={`/products/${product.slug}`} className="tile-title">
          {product.name}
        </Link>
        <span className="tile-copy">{product.shortDescription}</span>
        <div className="tile-meta">
          <strong>{money(product.price)}</strong>
          <small>
            {product.reviews > 0
              ? `${product.rating.toFixed(1)} (${product.reviews})`
              : "Shopify product"}
          </small>
        </div>
        {needsVariantPicker ? (
          <button
            type="button"
            className="cta-button"
            onClick={() => setPickerOpen(true)}
          >
            Add to Cart
          </button>
        ) : (
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              variantId: product.variantId,
            }}
          />
        )}
      </div>
      {needsVariantPicker && pickerOpen ? (
        <ProductVariantModal product={product} onClose={closePicker} />
      ) : null}
    </motion.article>
  );
}
