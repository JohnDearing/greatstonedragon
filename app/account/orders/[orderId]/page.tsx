import { ProductImage } from "@/components/product-image";
import {
  decodeOrderParam,
  fetchCustomerOrder,
  formatOrderDate,
  prettyStatus,
  readSessionCookies,
  sessionNeedsRefresh,
} from "@/lib/customer-account";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await readSessionCookies();
  if (!session.accessToken && !session.refreshToken) {
    redirect("/api/auth/login");
  }

  const { orderId } = await params;
  const id = decodeOrderParam(orderId);
  if (!id) notFound();

  if (sessionNeedsRefresh(session)) {
    redirect(`/api/auth/refresh?next=/account/orders/${orderId}`);
  }

  let order: Awaited<ReturnType<typeof fetchCustomerOrder>> = null;
  try {
    order = await fetchCustomerOrder(id);
  } catch {
    order = null;
  }

  if (!order) notFound();

  return (
    <main className="page-block account-page">
      <section className="container">
        <p className="cart-page-kicker">Order</p>
        <div className="account-head">
          <div>
            <h1>{order.name}</h1>
            <p className="muted">{formatOrderDate(order.processedAt)}</p>
          </div>
          <Link href="/account" className="soft-button">
            Back to account
          </Link>
        </div>

        <div className="account-grid">
          <article className="account-panel">
            <h2>Status</h2>
            <p>
              Payment: {prettyStatus(order.financialStatus) || "Unknown"}
            </p>
            <p>
              Fulfillment: {prettyStatus(order.fulfillmentStatus) || "Unknown"}
            </p>
            <p>
              <strong>Total: {order.total}</strong>
            </p>
            {order.statusPageUrl ? (
              <a href={order.statusPageUrl} className="account-status-link">
                View Shopify order status
              </a>
            ) : null}
          </article>

          <article className="account-panel">
            <h2>Shipping</h2>
            {order.shippingLines.length ? (
              <address className="account-address">
                {order.shippingLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : (
              <p className="muted">No shipping address on this order.</p>
            )}
          </article>
        </div>

        <article className="account-panel account-lines">
          <h2>Items</h2>
          <ul className="account-line-list">
            {order.lineItems.map((item, index) => (
              <li key={`${item.name}-${index}`} className="account-line">
                {item.image ? (
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    className="account-line-img"
                  />
                ) : (
                  <span className="account-line-fallback" />
                )}
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">Qty {item.quantity}</p>
                </div>
                <span>{item.total}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
