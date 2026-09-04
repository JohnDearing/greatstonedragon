import { isInternationalPreorderProduct } from "@/lib/shop-filters";
import type { Product } from "@/lib/store-data";

export type PromoProductContext = Pick<
  Product,
  "collection" | "badge" | "shopifyCollections"
>;

export type PromoPopupContext = {
  collection?: string;
  category?: string;
  page?: "products" | "product-detail";
  product?: PromoProductContext;
};

export type PromoPopupConfig = {
  id: string;
  storageKey: string;
  match: (context: PromoPopupContext) => boolean;
  kicker?: string;
  title: string;
  body: string;
  note?: string;
};

export { isInternationalPreorderProduct };

export const PROMO_POPUPS: PromoPopupConfig[] = [
  {
    id: "sticker-bundle",
    storageKey: "gsd_promo_sticker_bundle_v1",
    match: ({ collection, category, page, product }) =>
      page !== "product-detail" &&
      !product &&
      (collection === "stickers" || category === "stickers"),
    kicker: "Sticker Bundle!",
    title: "Buy 2 Stickers and Get the 3rd for 50% Off!",
    body: "Buy any 2 stickers and get the 3rd sticker for 50% off! This offer also stacks, so feel free to add more!",
    note: "No promo code needed. Offer is automatically applied at checkout!",
  },
  {
    id: "international-preorder",
    storageKey: "gsd_promo_international_preorder_v1",
    match: ({ page, product }) =>
      page === "product-detail" &&
      Boolean(product && isInternationalPreorderProduct(product)),
    title: "International Preorder Alert!",
    body: "This is an international preorder. Disneyland Paris items are expected to ship early to mid the month following your order. Asia items are expected to ship approximately 3-4 weeks after your order is placed. Shipping timelines may vary due to international transit, customs processing, or other unforeseen delays.",
  },
];

export function getPromoForPage(context: PromoPopupContext) {
  return PROMO_POPUPS.find((promo) => promo.match(context)) ?? null;
}

export function isPromoDismissed(storageKey: string) {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(storageKey) === "1";
}

export function dismissPromo(storageKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, "1");
}
