"use client";

import { getLowStockCount } from "@/lib/product-variants";

export function StockAlert({
  quantityAvailable,
}: {
  quantityAvailable?: number | null;
}) {
  const left = getLowStockCount(quantityAvailable);
  if (left == null) return null;

  return (
    <div className="product-stock-alert" role="status">
      <p>Act fast! Only {left} Left!</p>
      <span className="product-stock-bar" aria-hidden="true">
        <span style={{ width: `${(left / 5) * 100}%` }} />
      </span>
    </div>
  );
}
