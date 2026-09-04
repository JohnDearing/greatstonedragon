"use client";

import Link from "next/link";
import { useEffect } from "react";

type CartToastProps = {
  message: string;
  count: number;
  visible: boolean;
  onDismiss: () => void;
};

export function CartToast({
  message,
  count,
  visible,
  onDismiss,
}: CartToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div
      className={`cart-toast${visible ? " is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="cart-toast-inner">
        <span className="cart-toast-icon" aria-hidden="true">
          ✓
        </span>
        <div className="cart-toast-copy">
          <strong>{message}</strong>
          <span>
            {count} item{count === 1 ? "" : "s"} in your cart
          </span>
        </div>
        <Link href="/cart" className="cart-toast-action" onClick={onDismiss}>
          View cart
        </Link>
        <button
          type="button"
          className="cart-toast-close"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
    </div>
  );
}
