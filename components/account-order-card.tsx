import { BuyAgainButton, type BuyAgainItem } from "@/components/buy-again-button";
import { ProductImage } from "@/components/product-image";
import {
  encodeOrderParam,
  type CustomerOrderLine,
  type CustomerOrderSummary,
} from "@/lib/customer-account";
import type { Product } from "@/lib/store-data";
import Link from "next/link";

export function buyAgainFromLines(
  lineItems: CustomerOrderLine[],
  catalog: Product[],
): BuyAgainItem[] {
  return lineItems.flatMap((item) => {
    if (!item.variantId) return [];
    const product = catalog.find((entry) => entry.id === item.productId);
    return [
      {
        variantId: item.variantId,
        name: item.name,
        price: item.amount / Math.max(1, item.quantity),
        slug: product?.slug || "",
        href: product ? `/products/${product.slug}` : "/products",
      },
    ];
  });
}

export function AccountOrderCard({
  order,
  buyAgain,
}: {
  order: CustomerOrderSummary;
  buyAgain: BuyAgainItem[];
}) {
  const href = `/account/order/${encodeOrderParam(order.id)}`;

  return (
    <article
      className={
        order.isComplete ? "account-order-card is-complete" : "account-order-card"
      }
    >
      <Link href={href} className="account-order-card-link">
        {order.image ? (
          <ProductImage
            src={order.image}
            alt=""
            width={order.isComplete ? 120 : 220}
            height={order.isComplete ? 120 : 220}
            className="account-order-card-image"
          />
        ) : (
          <span className="account-order-card-image is-empty" />
        )}
        <div className="account-order-card-copy">
          <h2>{order.headline}</h2>
          <p>
            {order.number} · {order.total}
          </p>
        </div>
      </Link>
      <BuyAgainButton items={buyAgain} className="account-buy-again" />
    </article>
  );
}
