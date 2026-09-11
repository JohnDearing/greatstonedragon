import { AccountWelcomeSlider } from "@/components/account-welcome-slider";
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
  const previewPins = catalog
    .filter((item) => item.image)
    .slice(0, 16)
    .map((item) => ({
      id: item.id,
      image: item.image as string,
      href: `/products/${item.slug}`,
    }));

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
          <AccountWelcomeSlider pins={previewPins} />
        </section>
      )}
    </>
  );
}
