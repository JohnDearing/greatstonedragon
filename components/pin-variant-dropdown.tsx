"use client";

import type { ProductVariant } from "@/lib/store-data";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type PinVariantDropdownProps = {
  id: string;
  variants: ProductVariant[];
  value: string;
  onChange: (variantId: string) => void;
  disabled?: boolean;
};

export function PinVariantDropdown({
  id,
  variants,
  value,
  onChange,
  disabled = false,
}: PinVariantDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = variants.find((variant) => variant.id === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (variant: ProductVariant) => {
    if (variant.availableForSale === false) return;
    onChange(variant.id);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`product-variant-dropdown${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        id={id}
        className="product-variant-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="product-variant-trigger-label">
          {selected?.title ?? "Select pin"}
        </span>
        <svg
          className="product-variant-chevron"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={id}
            className="product-variant-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {variants.map((variant) => {
              const isSelected = variant.id === value;
              const isSoldOut = variant.availableForSale === false;

              return (
                <li key={variant.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`product-variant-option${isSelected ? " is-selected" : ""}${isSoldOut ? " is-disabled" : ""}`}
                    disabled={isSoldOut}
                    onClick={() => handleSelect(variant)}
                  >
                    <span className="product-variant-check" aria-hidden="true">
                      {isSelected ? (
                        <svg viewBox="0 0 24 24">
                          <path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="product-variant-option-label">
                      {variant.title}
                      {isSoldOut ? " (Sold out)" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
