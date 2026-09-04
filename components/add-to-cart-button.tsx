"use client";

import { useState, type MouseEvent } from "react";
import { useCart } from "./cart-provider";

type AddToCartButtonProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    variantId?: string;
  };
  qty?: number;
  className?: string;
};

export function AddToCartButton({
  product,
  qty = 1,
  className = "cta-button",
}: AddToCartButtonProps) {
  const { addItem, loading } = useCart();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setError(null);

    if (!product.variantId) {
      setError("Unavailable for checkout");
      window.setTimeout(() => setError(null), 2200);
      return;
    }

    try {
      await addItem(
        {
          ...product,
          variantId: product.variantId,
        },
        qty,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
      window.setTimeout(() => setError(null), 2200);
    }
  };

  const label = error ? "Try again" : loading ? "Adding..." : "Add to Cart";

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
    >
      {label}
    </button>
  );
}
