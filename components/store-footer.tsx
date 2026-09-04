import Image from "next/image";
import Link from "next/link";
import { getVisibleShopNav, pinStoreMega } from "@/lib/store-data";
import { socialLinks } from "@/lib/social-links";

const shopNavItems = getVisibleShopNav().filter(
  (item) =>
    item.href !== "/" &&
    !["/faqs", "/reviews", "/about", "/contact"].includes(item.href),
);

const careLinks = [
  { label: "FAQs", href: "/faqs" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Contact Us", href: "/contact" },
];

const aboutLinks = [
  { label: "About Me", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socialItems = [
  { label: "Facebook", href: socialLinks.facebook, Icon: FacebookIcon },
  { label: "Discord", href: socialLinks.discord, Icon: DiscordIcon },
  { label: "TikTok", href: socialLinks.tiktok, Icon: TikTokIcon },
  { label: "Instagram", href: socialLinks.instagram, Icon: InstagramIcon },
] as const;

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="footer-logo" aria-label="Great Stone Dragon home">
            <Image
              src="/images/logo.png"
              alt="Great Stone Dragon logo"
              width={92}
              height={92}
            />
          </Link>
          <p>
            Collectible fantasy pins designed by a collector, for collectors.
            Every piece tells a story worth wearing.
          </p>
          <div className="footer-socials">
            {socialItems.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Shop">
          <h3 className="footer-heading">Shop</h3>
          {shopNavItems.map((item) => {
            if (item.mega === "pin-store") {
              return (
                <div key={item.href} className="footer-nav-group">
                  <span className="footer-nav-group-label">{item.label}</span>
                  {pinStoreMega.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="footer-nav-sub"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav aria-label="Customer Care">
          <h3 className="footer-heading">Customer Care</h3>
          {careLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="About">
          <h3 className="footer-heading">About</h3>
          {aboutLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 Great Stone Dragon. All rights reserved.</p>
          <div className="footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 10.4c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3zm7 0c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3z" />
      <path d="M19.7 5.3A16.4 16.4 0 0 0 15.6 4l-.4.8a14.7 14.7 0 0 1 3.4 1.3 13.8 13.8 0 0 0-12.2 0A14.7 14.7 0 0 1 8.8 4.8L8.4 4A16.4 16.4 0 0 0 4.3 5.3C1.8 9.1 1.2 12.8 1.4 16.4A16.5 16.5 0 0 0 6.5 19l.8-1.1a10.8 10.8 0 0 1-1.6-.8l.4-.3c3.2 1.5 6.7 1.5 9.8 0l.4.3c-.5.3-1 .6-1.6.8l.8 1.1a16.5 16.5 0 0 0 5.1-2.6c.4-4.1-.5-7.7-2.3-11.1z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.6 8.3a6.4 6.4 0 0 1-3.7-1.2v6.5a5.6 5.6 0 1 1-4.8-5.5v2.5a3.1 3.1 0 1 0 2.3 3v-9.9h2.5a3.9 3.9 0 0 0 3.7 3.7v2.4z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" data-stroke="true" />
      <circle cx="12" cy="12" r="3.5" data-stroke="true" />
      <circle cx="16.5" cy="7.5" r="0.8" />
    </svg>
  );
}
