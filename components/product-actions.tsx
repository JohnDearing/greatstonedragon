"use client";

import {
  getMaxAddQuantity,
  getSelectableVariants,
  hasPinVariantPicker,
  pickInitialVariant,
} from "@/lib/product-variants";
import type { ProductVariant } from "@/lib/store-data";
import { money } from "@/lib/store-data";
import {
  showAvailabilityLimitToast,
  showStoreAlert,
} from "@/lib/store-alerts";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "./cart-provider";
import { PinVariantDropdown } from "./pin-variant-dropdown";

type ProductActionsProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    variantId?: string;
    variants?: ProductVariant[];
    badge?: string;
  };
};

export function ProductActions({ product }: ProductActionsProps) {
  const selectableVariants = useMemo(
    () => getSelectableVariants(product.variants),
    [product.variants],
  );
  const showPinPicker = hasPinVariantPicker(product.variants);
  const initialVariant = useMemo(
    () =>
      pickInitialVariant(product.variants) ??
      (product.variantId
        ? selectableVariants.find((variant) => variant.id === product.variantId)
        : undefined) ??
      selectableVariants[0],
    [product.variants, product.variantId, selectableVariants],
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id ?? product.variantId ?? "",
  );
  const [qty, setQty] = useState(1);
  const { addItem, loading } = useCart();

  const selectedVariant =
    selectableVariants.find((variant) => variant.id === selectedVariantId) ??
    initialVariant;

  const activeVariantId = selectedVariant?.id ?? product.variantId;
  const displayPrice = selectedVariant?.price ?? product.price;
  const maxQty = getMaxAddQuantity(selectedVariant, {
    isPreorder: product.badge === "Preorder",
    hasPinPicker: showPinPicker,
  });

  useEffect(() => {
    setQty((current) => Math.min(current, maxQty));
  }, [maxQty, selectedVariantId]);

  const handleIncreaseQty = () => {
    if (qty >= maxQty) {
      showAvailabilityLimitToast(maxQty);
      return;
    }
    setQty((value) => value + 1);
  };

  const handleAdd = async () => {
    if (!activeVariantId) return;

    try {
      await addItem(
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: displayPrice,
          variantId: activeVariantId,
          href: `/products/${product.slug}`,
        },
        qty,
      );
    } catch (error) {
      showStoreAlert(
        error instanceof Error ? error.message : "Could not add to cart",
      );
    }
  };

  return (
    <div className="product-purchase">
      <div className="product-meta">
        <strong>{money(displayPrice)}</strong>
        {product.compareAtPrice && product.compareAtPrice > displayPrice ? (
          <small>{money(product.compareAtPrice)}</small>
        ) : null}
      </div>

      <div className="product-actions">
        {showPinPicker ? (
          <div className="product-variant-field">
            <label className="product-variant-label" htmlFor="product-pin-variant">
              PIN
            </label>
            <PinVariantDropdown
              id="product-pin-variant"
              variants={selectableVariants}
              value={selectedVariantId}
              onChange={setSelectedVariantId}
              disabled={loading}
            />
          </div>
        ) : null}

        <div className="qty-row" aria-label="Quantity">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            aria-label="Decrease quantity"
            disabled={loading}
          >
            -
          </button>
          <span>{qty}</span>
          <button
            type="button"
            onClick={handleIncreaseQty}
            aria-label="Increase quantity"
            disabled={loading}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="cta-button product-add-btn"
          onClick={handleAdd}
          disabled={loading || !activeVariantId}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
