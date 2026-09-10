"use client";

import { ProductImage } from "@/components/product-image";
import {
  getMaxAddQuantity,
  getSelectableVariants,
  pickInitialVariant,
} from "@/lib/product-variants";
import { money, type Product, type ProductVariant } from "@/lib/store-data";
import {
  showAvailabilityLimitToast,
  showStoreAlert,
} from "@/lib/store-alerts";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./cart-provider";
import { StockAlert } from "./stock-alert";

const FALLBACK_IMAGE = "/images/product/product1.png";

type ProductVariantModalProps = {
  product: Product;
  onClose: () => void;
};

function galleryImages(product: Product, variants: ProductVariant[]) {
  const images: string[] = [];
  const seen = new Set<string>();

  const add = (src?: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    images.push(src);
  };

  add(product.image);
  for (const variant of variants) add(variant.image);
  return images;
}

export function ProductVariantModal({
  product,
  onClose,
}: ProductVariantModalProps) {
  const selectableVariants = useMemo(
    () => getSelectableVariants(product.variants),
    [product.variants],
  );
  const initialVariant = useMemo(
    () =>
      pickInitialVariant(product.variants) ??
      (product.variantId
        ? selectableVariants.find((variant) => variant.id === product.variantId)
        : undefined) ??
      selectableVariants[0],
    [product.variants, product.variantId, selectableVariants],
  );
  const images = useMemo(
    () => galleryImages(product, selectableVariants),
    [product, selectableVariants],
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    () => initialVariant?.id ?? product.variantId ?? "",
  );
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(
    () => initialVariant?.image || product.image || FALLBACK_IMAGE,
  );
  const [mounted, setMounted] = useState(false);
  const { addItem, loading } = useCart();

  const selectedVariant =
    selectableVariants.find((variant) => variant.id === selectedVariantId) ??
    initialVariant;
  const activeVariantId = selectedVariant?.id ?? product.variantId;
  const displayPrice = selectedVariant?.price ?? product.price;
  const soldOut = selectedVariant?.availableForSale === false;
  const maxQty = getMaxAddQuantity(selectedVariant, {
    isPreorder: product.badge === "Preorder",
    hasPinPicker: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setQty((current) => Math.min(current, maxQty));
  }, [maxQty, selectedVariantId]);

  const handleSelectVariant = (variant: ProductVariant) => {
    if (variant.availableForSale === false) return;
    setSelectedVariantId(variant.id);
    if (variant.image) setActiveImage(variant.image);
  };

  const handleIncreaseQty = () => {
    if (qty >= maxQty) {
      showAvailabilityLimitToast(maxQty);
      return;
    }
    setQty((value) => value + 1);
  };

  const handleAdd = async () => {
    if (!activeVariantId || soldOut) return;

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
      onClose();
    } catch (error) {
      showStoreAlert(
        error instanceof Error ? error.message : "Could not add to cart",
      );
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="variant-modal-layer">
      <button
        type="button"
        className="variant-modal-backdrop"
        aria-label="Close variant picker"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`variant-modal-title-${product.id}`}
        className="variant-modal"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          className="variant-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="variant-modal-media-col">
          <div className="variant-modal-media">
            <ProductImage
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 760px) 90vw, 420px"
              className="variant-modal-img"
            />
          </div>
          {images.length ? (
            <div className="variant-modal-thumbs" aria-label="Product images">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`variant-modal-thumb${src === activeImage ? " is-active" : ""}`}
                  onClick={() => setActiveImage(src)}
                >
                  <ProductImage
                    src={src}
                    alt=""
                    width={88}
                    height={88}
                    className="variant-modal-thumb-img"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="variant-modal-info">
          {product.productType ? (
            <p className="variant-modal-kicker">{product.productType}</p>
          ) : null}
          <h2
            id={`variant-modal-title-${product.id}`}
            className="variant-modal-title"
          >
            {product.name}
          </h2>
          <p className="variant-modal-price">{money(displayPrice)}</p>

          {selectableVariants.length ? (
            <div className="variant-modal-pins">
              <p className="variant-modal-label">PIN</p>
                  <div className="variant-modal-chips">
                    {selectableVariants.map((variant) => {
                      const isSelected = variant.id === selectedVariantId;
                      const isSoldOut = variant.availableForSale === false;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          aria-pressed={isSelected}
                          className={`variant-modal-chip${isSelected ? " is-selected" : ""}${isSoldOut ? " is-sold-out" : ""}`}
                          disabled={isSoldOut || loading}
                          onClick={() => handleSelectVariant(variant)}
                        >
                          {variant.title}
                        </button>
                      );
                    })}
                  </div>
            </div>
          ) : null}

          <div className="variant-modal-qty" aria-label="Quantity">
            <button
              type="button"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
              aria-label="Decrease quantity"
              disabled={loading || qty <= 1}
            >
              −
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
            className="variant-modal-add"
            onClick={handleAdd}
            disabled={loading || !activeVariantId || soldOut}
          >
            {loading ? "Adding..." : soldOut ? "Sold out" : "Add to cart"}
          </button>

          <StockAlert quantityAvailable={selectedVariant?.quantityAvailable} />
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
