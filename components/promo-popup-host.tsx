"use client";

import { PromoPopup } from "@/components/promo-popup";
import { getPromoForPage, type PromoProductContext } from "@/lib/promo-popups";

type PromoPopupHostProps = {
  collection?: string;
  category?: string;
  page?: "products" | "product-detail";
  product?: PromoProductContext;
};

export function PromoPopupHost({
  collection,
  category,
  page = "products",
  product,
}: PromoPopupHostProps) {
  const promo = getPromoForPage({ collection, category, page, product });
  if (!promo) return null;
  return <PromoPopup promo={promo} />;
}
