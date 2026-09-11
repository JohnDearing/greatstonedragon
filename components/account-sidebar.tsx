"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/account/order",
    label: "Orders",
    isActive: (pathname: string) =>
      pathname === "/account/order" || pathname.startsWith("/account/order/"),
  },
  {
    href: "/account/profile",
    label: "Profile",
    isActive: (pathname: string) => pathname.startsWith("/account/profile"),
  },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="account-side" aria-label="Account">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            link.isActive(pathname)
              ? "account-side-link is-active"
              : "account-side-link"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
