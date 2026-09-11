import { AccountProfileView } from "@/components/account-profile";
import {
  fetchCustomerAccount,
  requireAccountSession,
} from "@/lib/customer-account";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  await requireAccountSession("/account/profile");

  let account: Awaited<ReturnType<typeof fetchCustomerAccount>> = null;
  try {
    account = await fetchCustomerAccount();
  } catch {
    account = null;
  }

  if (!account) {
    redirect("/api/auth/login");
  }

  return <AccountProfileView profile={account.profile} />;
}
