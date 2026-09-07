"use client";

import Image, { ImageProps } from "next/image";

function isShopifyCdn(src: string) {
  return (
    src.includes("cdn.shopify.com") ||
    src.includes("cdn.shopifycdn.net") ||
    src.includes("shopify.com/s/files")
  );
}

/** Resize via Shopify CDN so Next.js does not re-optimize remote files. */
export function shopifyImageSrc(src: string, width?: number) {
  if (!isShopifyCdn(src)) return src;
  try {
    const url = new URL(src);
    if (width) url.searchParams.set("width", String(width));
    return url.toString();
  } catch {
    return src;
  }
}

type ProductImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * Product images from Shopify CDN must bypass Next.js `/_next/image`
 * optimization — remote Shopify assets often timeout and return 500.
 */
export function ProductImage({
  src,
  alt,
  width,
  sizes,
  style,
  ...props
}: ProductImageProps) {
  const shopify = isShopifyCdn(src);
  const requestedWidth =
    typeof width === "number"
      ? width
      : sizes?.includes("220px")
        ? 440
        : 800;
  const sized = shopify ? shopifyImageSrc(src, requestedWidth) : src;

  return (
    <Image
      {...props}
      src={sized}
      alt={alt}
      width={props.fill ? undefined : width}
      sizes={sizes}
      style={{ objectFit: "contain", ...style }}
      unoptimized={shopify || props.unoptimized}
    />
  );
}
