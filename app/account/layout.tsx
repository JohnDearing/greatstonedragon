import { AccountSidebar } from "@/components/account-sidebar";
import { requireLoggedIn } from "@/lib/customer-account";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireLoggedIn();

  return (
    <main className="page-block account-page">
      <section className="container">
        <div className="account-shell">
          <AccountSidebar />
          <div className="account-main">{children}</div>
        </div>
      </section>
    </main>
  );
}
