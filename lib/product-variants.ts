import type { ProductVariant } from "@/lib/store-data";

export function isDefaultVariantTitle(title: string) {
  return title.trim().toLowerCase() === "default title";
}

/** True when the product has named pin variants (even a single pin like "Kuzco"). */
export function hasPinVariantPicker(variants?: ProductVariant[]) {
  if (!variants?.length) return false;
  return variants.some((variant) => !isDefaultVariantTitle(variant.title));
}

export function getSelectableVariants(variants?: ProductVariant[]) {
  if (!variants?.length) return [];
  const named = variants.filter((variant) => !isDefaultVariantTitle(variant.title));
  return named.length > 0 ? named : variants;
}

export function pickInitialVariant(variants?: ProductVariant[]) {
  const selectable = getSelectableVariants(variants);
  if (!selectable.length) return undefined;
  return selectable.find((variant) => variant.availableForSale !== false) ?? selectable[0];
}

/** UI cap for the quantity picker based on Shopify inventory + quantity rules. */
export function getMaxAddQuantity(
  variant?: ProductVariant,
  options?: { isPreorder?: boolean; hasPinPicker?: boolean },
) {
  const caps: number[] = [];

  if (variant?.quantityMaximum != null && variant.quantityMaximum > 0) {
    caps.push(variant.quantityMaximum);
  }

  if (variant?.quantityAvailable != null && variant.quantityAvailable >= 0) {
    caps.push(Math.max(1, variant.quantityAvailable));
  }

  if (options?.isPreorder && options?.hasPinPicker) {
    caps.push(1);
  }

  if (!caps.length) return 99;
  return Math.max(1, Math.min(...caps));
}
