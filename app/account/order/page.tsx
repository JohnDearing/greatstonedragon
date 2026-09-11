import { AccountOrderCard, buyAgainFromLines } from "@/components/account-order-card";
import { AccountWelcomeSlider } from "@/components/account-welcome-slider";
import { getCatalogProducts } from "@/lib/catalog";
import {
  fetchCustomerAccount,
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
        <div className="account-order-stack">
          {orders.map((order) => (
            <AccountOrderCard
              key={order.id}
              order={order}
              buyAgain={buyAgainFromLines(order.lineItems, catalog)}
            />
          ))}
        </div>
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
