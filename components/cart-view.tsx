"use client";

import type { CartLineItem } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { CHECKOUT_TERMS_MESSAGE } from "@/lib/checkout-terms";
import { BOARDS_UI_ENABLED } from "@/lib/feature-flags";
import { money } from "@/lib/store-data";
import {
  showAvailabilityLimitToast,
  showStoreAlert,
} from "@/lib/store-alerts";
import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { useCart } from "./cart-provider";

function CartLine({
  item,
  loading,
  onUpdateQty,
  onRemove,
}: {
  item: CartLineItem;
  loading: boolean;
  onUpdateQty: (id: string, qty: number) => Promise<void>;
  onRemove: (id: string) => void;
}) {
  const href = item.href ?? `/products/${item.slug}`;
  const imageSrc = item.image ?? "/images/product/product1.png";
  const maxQty = item.quantityMaximum ?? null;

  const handleUpdateQty = async (qty: number) => {
    if (maxQty != null && qty > maxQty) {
      showAvailabilityLimitToast(maxQty);
      return;
    }

    try {
      await onUpdateQty(item.id, qty);
    } catch (error) {
      showStoreAlert(
        error instanceof Error ? error.message : "Could not update quantity",
      );
    }
  };

  return (
    <article className="cart-line">
      <Link href={href} className="cart-line-media" aria-label={item.name}>
        <ProductImage
          src={imageSrc}
          alt={item.name}
          width={120}
          height={120}
          sizes="120px"
          className="cart-line-img"
        />
      </Link>

      <div className="cart-line-body">
        <Link href={href} className="cart-line-title">
          {item.name}
        </Link>
        {item.subtitle ? (
          <p className="cart-line-subtitle">{item.subtitle}</p>
        ) : null}
        <p className="cart-line-price">{money(item.price)} each</p>
      </div>

      <div className="cart-line-actions">
        <div className="cart-qty">
          <button
            type="button"
            className="cart-qty-btn"
            disabled={loading}
            aria-label={`Decrease quantity of ${item.name}`}
            onClick={() => void handleUpdateQty(item.qty - 1)}
          >
            −
          </button>
          <span className="cart-qty-value">{item.qty}</span>
          <button
            type="button"
            className="cart-qty-btn"
            disabled={loading}
            aria-label={`Increase quantity of ${item.name}`}
            onClick={() => void handleUpdateQty(item.qty + 1)}
          >
            +
          </button>
        </div>
        <p className="cart-line-total">{money(item.lineTotal)}</p>
        <button
          type="button"
          className="cart-line-remove"
          disabled={loading}
          onClick={() => void onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    </article>
  );
}

export function CartView() {
  const {
    items,
    count,
    subtotal,
    checkoutUrl,
    loading,
    updateQty,
    removeItem,
    clearCart,
  } = useCart();
  const termsId = useId();
  const termsRef = useRef<HTMLInputElement>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const showTermsRequiredToast = useCallback(() => {
    showStoreAlert(CHECKOUT_TERMS_MESSAGE);
    termsRef.current?.focus();
  }, []);

  const handleCheckout = useCallback(() => {
    if (!checkoutUrl) return;

    if (!termsAccepted) {
      showTermsRequiredToast();
      return;
    }

    window.location.assign(checkoutUrl);
  }, [checkoutUrl, showTermsRequiredToast, termsAccepted]);

  if (!items.length && !loading) {
    return (
      <section className="container page-block cart-page">
        <div className="cart-empty">
          <p className="cart-empty-kicker">Shopping cart</p>
          <h1>Your cart is empty</h1>
          <p className="muted">
            Add pins from the store or pick selections from a board frame.
          </p>
          <div className="cart-empty-actions">
            <Link className="cta-button" href="/products">
              Shop products
            </Link>
            {BOARDS_UI_ENABLED ? (
              <Link className="soft-button" href="/products?collection=boards">
                Browse boards
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container page-block cart-page">
      <div className="cart-page-head">
        <div>
          <p className="cart-page-kicker">Shopping cart</p>
          <h1>Your Cart</h1>
          <p className="muted cart-page-count">
            {count} item{count === 1 ? "" : "s"} ready for checkout
          </p>
        </div>
        <button
          type="button"
          className="soft-button"
          onClick={clearCart}
          disabled={loading || !items.length}
        >
          Clear cart
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-panel">
          {loading && !items.length ? (
            <div className="cart-loading">Loading your cart...</div>
          ) : (
            items.map((item) => (
              <CartLine
                key={item.id}
                item={item}
                loading={loading}
                onUpdateQty={updateQty}
                onRemove={(id) =>
                  void removeItem(id).catch((error) => {
                    showStoreAlert(
                      error instanceof Error
                        ? error.message
                        : "Could not remove item",
                    );
                  })
                }
              />
            ))
          )}
        </div>

        <aside className="cart-summary cart-summary-sticky">
          <p className="cart-summary-kicker">Order summary</p>
          <h2>Total</h2>

          <div className="cart-summary-rows">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="cart-summary-row is-muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="cart-summary-row is-muted">
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="cart-summary-total-row">
            <span>Estimated total</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <p className="cart-summary-disclaimer">
            Taxes and shipping calculated at checkout
          </p>

          <label className="cart-agreement" htmlFor={termsId}>
            <input
              ref={termsRef}
              id={termsId}
              type="checkbox"
              className="cart-agreement-input"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <span className="cart-agreement-text">
              By checking this box, I acknowledge that I have read and agree to
              the{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                Terms &amp; Conditions
              </Link>{" "}
              and understand the shipping timelines , presale policies, and
              refund policy.
            </span>
          </label>

          {checkoutUrl ? (
            <button
              type="button"
              className="cta-button cart-checkout-btn"
              disabled={loading}
              onClick={handleCheckout}
            >
              Check out
            </button>
          ) : (
            <button
              type="button"
              className="cta-button cart-checkout-btn"
              disabled
            >
              Checkout unavailable
            </button>
          )}

          <Link href="/products" className="soft-button cart-continue-btn">
            Continue shopping
          </Link>

          <p className="cart-summary-note">
            Secure payment and order fulfillment are handled on Shopify
            checkout.
          </p>
        </aside>
      </div>
    </section>
  );
}
