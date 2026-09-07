"use client";

import Link from "next/link";
import { useEffect } from "react";

type CartToastProps = {
  message: string;
  count?: number;
  description?: string;
  visible: boolean;
  onDismiss: () => void;
  action?: {
    href: string;
    label: string;
  };
};

export function CartToast({
  message,
  count,
  description,
  visible,
  onDismiss,
  action,
}: CartToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  const detail =
    description ??
    (typeof count === "number"
      ? `${count} item${count === 1 ? "" : "s"} in your cart`
      : null);

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
          {detail ? <span>{detail}</span> : null}
        </div>
        {action ? (
          <Link href={action.href} className="cart-toast-action" onClick={onDismiss}>
            {action.label}
          </Link>
        ) : null}
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
