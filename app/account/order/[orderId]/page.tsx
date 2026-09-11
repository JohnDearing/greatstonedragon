import { buyAgainFromLines } from "@/components/account-order-card";
import { BuyAgainButton } from "@/components/buy-again-button";
import { ProductImage } from "@/components/product-image";
import { getCatalogProducts } from "@/lib/catalog";
import {
  decodeOrderParam,
  fetchCustomerOrder,
  formatOrderShort,
  requireAccountSession,
} from "@/lib/customer-account";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  await requireAccountSession(`/account/order/${orderId}`);

  const id = decodeOrderParam(orderId);
  if (!id) notFound();

  let order: Awaited<ReturnType<typeof fetchCustomerOrder>> = null;
  try {
    order = await fetchCustomerOrder(id);
  } catch {
    order = null;
  }

  if (!order) notFound();

  const catalog = await getCatalogProducts();
  const buyAgain = buyAgainFromLines(order.lineItems, catalog);
  const confirmedOn = formatOrderShort(order.processedAt);
  const completedOn = formatOrderShort(order.fulfilledAt || order.processedAt);

  return (
    <div className="account-order-detail">
      <header className="account-order-detail-head">
        <div>
          <Link href="/account/order" className="account-order-back">
            <span aria-hidden="true">←</span>
            Order {order.number}
          </Link>
          <p>
            {order.headline} {confirmedOn}
          </p>
        </div>
        <BuyAgainButton items={buyAgain} className="account-buy-again" />
      </header>

      <section className="account-order-panel account-order-timeline">
        {order.isComplete ? (
          <div className="account-timeline-step is-done">
            <span className="account-timeline-rail" aria-hidden="true">
              <span className="account-timeline-mark">✓</span>
              <span className="account-timeline-line" />
            </span>
            <div>
              <strong>Complete</strong>
              <p>{completedOn}</p>
            </div>
          </div>
        ) : null}
        <div className="account-timeline-step">
          <span className="account-timeline-rail" aria-hidden="true">
            <span className="account-timeline-dot" />
          </span>
          <div>
            <strong>Confirmed</strong>
            <p>{confirmedOn}</p>
          </div>
        </div>
      </section>

      <section className="account-order-panel">
        <ul className="account-order-items">
          {order.lineItems.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <div className="account-order-item-media">
                {item.image ? (
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                  />
                ) : (
                  <span className="account-order-item-fallback" />
                )}
                {item.quantity > 0 ? (
                  <span className="account-order-qty">{item.quantity}</span>
                ) : null}
              </div>
              <p className="account-order-item-name">{item.name}</p>
              <span className="account-order-item-price">{item.total}</span>
            </li>
          ))}
        </ul>

        <dl className="account-order-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{order.subtotal}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{order.shipping}</dd>
          </div>
          <div className="is-total">
            <dt>Total</dt>
            <dd>
              <span>{order.currencyCode}</span> {order.totalAmount}
            </dd>
          </div>
        </dl>
      </section>

      {order.email || order.billingLines.length ? (
        <section className="account-order-panel account-order-meta">
          {order.email ? (
            <div>
              <h3>Contact</h3>
              <p>{order.email}</p>
            </div>
          ) : null}
          {order.billingLines.length ? (
            <div>
              <h3>Billing address</h3>
              <address>
                {order.billingLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
