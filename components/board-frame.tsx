"use client";

import { useCart } from "@/components/cart-provider";
import { type BoardPinCheckout } from "@/lib/board-shopify";
import { ProductImage } from "@/components/product-image";
import { Board, BoardPin, getBoardItemLabel, money } from "@/lib/boards";
import Link from "next/link";
import { useMemo, useState } from "react";

type BoardFrameProps = {
  board: Board;
  pinCheckoutMap?: Record<string, BoardPinCheckout | undefined>;
};

export function BoardFrame({ board, pinCheckoutMap = {} }: BoardFrameProps) {
  const { addItems, showCartToast } = useCart();
  const [selected, setSelected] = useState<string[]>([]);
  const [addedFlash, setAddedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const selectedPins = useMemo(
    () => board.items.filter((pin) => selected.includes(pin.id)),
    [board.items, selected],
  );

  const total = selectedPins.reduce(
    (sum, pin) => sum + (pin.price ?? board.pricePerItem),
    0,
  );

  const canCheckout = board.items.some(
    (pin) => pin.variantId || pinCheckoutMap[pin.id]?.variantId,
  );

  const togglePin = (pin: BoardPin) => {
    if (pin.status === "sold") return;
    setSelected((prev) =>
      prev.includes(pin.id)
        ? prev.filter((id) => id !== pin.id)
        : [...prev, pin.id],
    );
  };

  const addSelectedToCart = async () => {
    if (!selectedPins.length) return;

    setAdding(true);
    setError(null);

    try {
      const payload = selectedPins.map((pin) => {
        const checkout = pinCheckoutMap[pin.id];
        const variantId = pin.variantId ?? checkout?.variantId;
        if (!variantId) {
          throw new Error(
            `"${pin.pinName}" is not connected to Shopify yet. Sync products at ${money(board.pricePerItem)} in this category.`,
          );
        }

        return {
          id: pin.id,
          slug: pin.slug ?? checkout?.slug ?? board.slug,
          name: pin.pinName,
          price: pin.price ?? checkout?.price ?? board.pricePerItem,
          variantId,
          href:
            checkout?.href ??
            (pin.slug ? `/products/${pin.slug}` : boardPath),
        };
      });

      const cartCount = await addItems(payload, { silent: true });
      setSelected([]);
      setAddedFlash(true);
      window.setTimeout(() => setAddedFlash(false), 1400);
      showCartToast(
        selectedPins.length === 1
          ? "Added to cart"
          : `${selectedPins.length} items added`,
        cartCount,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add board selections",
      );
    } finally {
      setAdding(false);
    }
  };

  const itemLabel = getBoardItemLabel(board);
  const boardPath =
    board.grouping === "price"
      ? `/boards/price/${board.slug}`
      : `/boards/${board.category}/${board.slug}`;

  return (
    <div className="board-frame-wrap">
      <div className="board-frame" role="list" aria-label={`${board.title} ${itemLabel}`}>
        {board.items.map((pin) => {
          const isSelected = selected.includes(pin.id);
          const isSold = pin.status === "sold";
          const unitPrice = pin.price ?? board.pricePerItem;
          return (
            <button
              key={pin.id}
              type="button"
              role="listitem"
              className={`board-pin${isSelected ? " is-selected" : ""}${
                isSold ? " is-sold" : ""
              }`}
              onClick={() => togglePin(pin)}
              disabled={isSold}
              aria-pressed={isSelected}
              aria-label={
                isSold
                  ? `${pin.pinName} claimed`
                  : `${pin.pinName}, ${money(unitPrice)}`
              }
            >
              <span className="board-pin-media">
                <ProductImage
                  src={pin.image}
                  alt={pin.pinName}
                  width={320}
                  height={320}
                  sizes="(max-width: 760px) 30vw, 140px"
                  className="board-pin-img"
                />
              </span>
              <span className="board-pin-number">{pin.number}</span>
              <span className="board-pin-name">{pin.pinName}</span>
              <span className="board-pin-price">{money(unitPrice)}</span>
              {isSold ? <span className="board-pin-mark is-x">✕</span> : null}
              {isSelected ? (
                <span className="board-pin-mark is-check">✓</span>
              ) : null}
              {!isSold && !isSelected ? (
                <span className="board-pin-pulse" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className={`board-sticky-bar${selected.length ? " is-visible" : ""}`}>
        <div className="board-sticky-copy">
          <strong>
            {selected.length} item{selected.length === 1 ? "" : "s"} ·{" "}
            {money(total)}
          </strong>
          <span>Multi-select from this board, then add to cart</span>
          {error ? <em className="board-sticky-error">{error}</em> : null}
        </div>
        <div className="board-sticky-actions">
          <button
            type="button"
            className="soft-button"
            onClick={() => setSelected([])}
            disabled={adding}
          >
            Clear
          </button>
          <button
            type="button"
            className="cta-button"
            onClick={() => void addSelectedToCart()}
            disabled={adding || !canCheckout}
          >
            {addedFlash ? "Added to cart" : adding ? "Adding..." : "Add selected to cart"}
          </button>
          <Link href="/cart" className="board-sticky-cart">
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
}
