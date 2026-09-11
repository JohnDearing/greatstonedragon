import {
  encodeOrderParam,
  fetchCustomerAccount,
  formatOrderDate,
  prettyStatus,
  readSessionCookies,
  sessionNeedsRefresh,
} from "@/lib/customer-account";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await readSessionCookies();
  if (!session.accessToken && !session.refreshToken) {
    redirect("/api/auth/login");
  }
  if (sessionNeedsRefresh(session)) {
    redirect("/api/auth/refresh?next=/account");
  }

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

  return (
    <main className="page-block account-page">
      <section className="container">
        <div className="account-head">
          <div>
            <p className="cart-page-kicker">My account</p>
            <h1>Welcome{profile.firstName ? `, ${profile.firstName}` : ""}</h1>
            {profile.email ? <p className="muted">{profile.email}</p> : null}
          </div>
          <a href="/api/auth/logout" className="soft-button">
            Log out
          </a>
        </div>

        <div className="account-grid">
          <article className="account-panel">
            <h2>Profile</h2>
            <p>
              <strong>{profile.displayName}</strong>
            </p>
            {profile.email ? <p>{profile.email}</p> : null}
            {profile.addressLines.length ? (
              <address className="account-address">
                {profile.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : (
              <p className="muted">No default address on file yet.</p>
            )}
          </article>

          <article className="account-panel account-orders">
            <h2>Orders</h2>
            {orders.length ? (
              <ul className="account-order-list">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/account/orders/${encodeOrderParam(order.id)}`}
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
            ) : (
              <p className="muted">
                No orders yet.{" "}
                <Link href="/products">Browse the shop</Link>
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
