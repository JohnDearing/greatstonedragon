import type { BoardPin } from "./boards";

export type BoardPinCheckout = {
  variantId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  href: string;
};

export function resolveBoardPinCheckoutMap(
  pins: BoardPin[],
  boardHref: string,
): Record<string, BoardPinCheckout | undefined> {
  const map: Record<string, BoardPinCheckout | undefined> = {};

  for (const pin of pins) {
    if (!pin.variantId || !pin.slug) continue;

    map[pin.id] = {
      variantId: pin.variantId,
      slug: pin.slug,
      name: pin.pinName,
      price: pin.price ?? 0,
      image: pin.image,
      href: `/products/${pin.slug}`,
    };
  }

  return map;
}

export function absoluteImageUrl(path: string, origin?: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  let base = origin ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!base && process.env.VERCEL_URL) {
    base = process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }
  if (!base) base = "https://greatstonedragon.com";

  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
