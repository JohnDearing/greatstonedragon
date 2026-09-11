import { ProductImage } from "@/components/product-image";
import { getCatalogProducts } from "@/lib/catalog";
import {
  encodeOrderParam,
  fetchCustomerAccount,
  formatOrderDate,
  prettyStatus,
  requireAccountSession,
} from "@/lib/customer-account";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountOrderPage() {
  await requireAccountSession("/account/order");

  let account: Awaited<ReturnType<typeof fetchCustomerAccount>> = null;
  try {
    account = await fetchCustomerAccount();
  } catch {
    account = null;
  }

  if (!account) {
    redirect("/api/auth/login");
  }

  const { profile, orders } = account;
  const welcomeName = profile.firstName || profile.displayName;
  const catalog = await getCatalogProducts();
  const previewPins = catalog.filter((item) => item.image).slice(0, 5);
  const tilts = [-14, -8, 2, 8, 12];

  return (
    <>
      {orders.length ? (
        <article className="account-panel account-orders">
          <h1 className="account-panel-title">Orders</h1>
          <ul className="account-order-list">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/order/${encodeOrderParam(order.id)}`}
                  className="account-order-row"
                >
                  <span className="account-order-name">{order.name}</span>
                  <span>{formatOrderDate(order.processedAt)}</span>
                  <span>{order.total}</span>
                  <span>
                    {prettyStatus(order.fulfillmentStatus) ||
                      prettyStatus(order.financialStatus) ||
                      "View"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ) : (
        <section className="account-welcome">
          <div className="account-welcome-top">
            <div>
              <h1>Welcome, {welcomeName}</h1>
              <p>Ready to shop?</p>
            </div>
            <Link href="/products" className="account-shop-now">
              Shop now
            </Link>
          </div>
          {previewPins.length ? (
            <div className="account-welcome-fan" aria-hidden="true">
              {previewPins.map((item, index) => (
                <div
                  key={item.id}
                  className="account-welcome-pin"
                  style={{ transform: `rotate(${tilts[index] ?? 0}deg)` }}
                >
                  <ProductImage
                    src={item.image!}
                    alt=""
                    width={220}
                    height={220}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}
