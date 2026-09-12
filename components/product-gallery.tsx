"use client";

import { ProductImage } from "@/components/product-image";
import {
  externalVideoSrc,
  productGalleryMedia,
} from "@/lib/product-media";
import type { Product, ProductMedia } from "@/lib/store-data";
import { useState } from "react";

const FALLBACK = "/images/product/product1.png";

function thumbSrc(item: ProductMedia) {
  if (item.type === "image") return item.url;
  return item.preview || FALLBACK;
}

export function ProductGallery({ product }: { product: Product }) {
  const items = productGalleryMedia(product);
  const gallery = items.length
    ? items
    : [{ type: "image" as const, url: FALLBACK, alt: product.name }];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div className="product-gallery">
      <div className="product-media">
        {current.type === "image" ? (
          <ProductImage
            src={current.url}
            alt={current.alt || product.name}
            width={900}
            height={900}
            className="product-media-img"
            priority
          />
        ) : current.type === "video" ? (
          <video
            className="product-media-video"
            src={current.url}
            poster={current.preview}
            controls
            playsInline
            preload="metadata"
          >
            Your browser cannot play this video.
          </video>
        ) : (
          <iframe
            className="product-media-embed"
            src={externalVideoSrc(current.url)}
            title={current.alt || `${product.name} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {gallery.length > 1 ? (
        <div className="product-gallery-thumbs" aria-label="Product media">
          {gallery.map((item, index) => (
            <button
              key={`${item.type}-${item.url}-${index}`}
              type="button"
              className={`product-gallery-thumb${index === active ? " is-active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={
                item.type === "image"
                  ? `View image ${index + 1}`
                  : `Play video ${index + 1}`
              }
              aria-current={index === active ? "true" : undefined}
            >
              <ProductImage
                src={thumbSrc(item)}
                alt=""
                width={144}
                height={144}
                className="product-gallery-thumb-img"
              />
              {item.type !== "image" ? (
                <span className="product-gallery-play" aria-hidden="true">
                  ▶
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
