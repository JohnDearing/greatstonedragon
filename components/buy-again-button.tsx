"use client";

import { useCart } from "@/components/cart-provider";
import { MouseEvent, useState } from "react";

export type BuyAgainItem = {
  variantId: string;
  name: string;
  price: number;
  slug: string;
  href: string;
};

export function BuyAgainButton({
  items,
  className,
}: {
  items: BuyAgainItem[];
  className?: string;
}) {
  const { addItems } = useCart();
  const [busy, setBusy] = useState(false);
  const ready = items.filter((item) => item.variantId);

  if (!ready.length) return null;

  async function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await addItems(
        ready.map((item) => ({
          id: item.variantId,
          slug: item.slug || item.variantId,
          name: item.name,
          price: item.price,
          variantId: item.variantId,
          href: item.href,
        })),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={busy}>
      {busy ? "Adding" : "Buy again"}
    </button>
  );
}
