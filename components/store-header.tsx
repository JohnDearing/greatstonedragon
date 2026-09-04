"use client";

import { Product, getVisibleShopNav, pinStoreMega } from "@/lib/store-data";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useCart } from "./cart-provider";

function isNavActive(href: string, pathname: string, search: string) {
  if (href === "/") return pathname === "/";
  const [path, query] = href.split("?");
  if (pathname !== path) return false;
  if (!query) {
    return !search || search === "";
  }
  return search.replace(/^\?/, "") === query;
}

function isPinStoreActive(pathname: string, search: string) {
  if (pathname !== "/products") return false;
  const collection = new URLSearchParams(search).get("collection");
  if (!collection) return true;
  return collection === "fantasy" || collection === "international-preorder";
}

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pinMegaOpen, setPinMegaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const pinMegaRef = useRef<HTMLDivElement>(null);
  const navPillRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const search = searchParams.toString();
  const navItems = getVisibleShopNav();

  const openSearch = () => {
    setSearchOpen((open) => !open);
    setMenuOpen(false);
    setPinMegaOpen(false);
    if (catalog.length) return;
    fetch("/api/products")
      .then((response) => response.json())
      .then((data: Product[]) => setCatalog(data))
      .catch(() => setCatalog([]));
  };

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.shortDescription.toLowerCase().includes(term),
    );
  }, [catalog, query]);

  const closeOverlays = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setPinMegaOpen(false);
  };

  const openPinMega = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setPinMegaOpen(true);
  };

  const scheduleClosePinMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setPinMegaOpen(false);
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    closeOverlays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    if (!menuOpen && !pinMegaOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navPillRef.current?.contains(target)) return;
      closeOverlays();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeOverlays();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, pinMegaOpen]);

  const onPinKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") setPinMegaOpen(false);
  };

  // --- Pin Store Mega menu image overrides ---
  // List according to pinStoreMega mapping order; fallback to old behavior if out of index/unknown.
  const pinMegaImages = [
    "/images/all_products.png",
    "/images/international_pins.png",
    "/images/fantasy_pins.png",
  ];

  return (
    <header className="site-header">
      <div className="top-strip">
        Welcome to Great Stone Dragon&apos;s website!
      </div>
      <div className="container header-bar">
        <Link
          href="/"
          className="brand-logo"
          aria-label="Great Stone Dragon home"
          onClick={closeOverlays}
        >
          <Image
            src="/images/logo.png"
            alt="Great Stone Dragon logo"
            width={112}
            height={112}
            priority
          />
        </Link>

        <div
          ref={navPillRef}
          className={`nav-pill ${menuOpen ? "is-open" : ""}`}
        >
          <nav className="main-nav" aria-label="Primary">
            {navItems.map((item) => {
              if (item.mega === "pin-store") {
                const active = isPinStoreActive(pathname, search);
                return (
                  <div
                    key={item.href}
                    className={`nav-item has-mega ${pinMegaOpen ? "is-open" : ""} ${active ? "is-active" : ""}`}
                    ref={pinMegaRef}
                    onMouseEnter={openPinMega}
                    onMouseLeave={scheduleClosePinMega}
                    onFocus={openPinMega}
                    onKeyDown={onPinKeyDown}
                  >
                    <button
                      type="button"
                      className={`nav-trigger ${active ? "active" : ""}`}
                      aria-expanded={pinMegaOpen}
                      aria-haspopup="true"
                      onClick={() => setPinMegaOpen((open) => !open)}
                    >
                      <span>{item.label}</span>
                      <ChevronIcon />
                    </button>

                    <div
                      className="pin-mega"
                      role="region"
                      aria-label="Pin Store collections"
                      onMouseEnter={openPinMega}
                      onMouseLeave={scheduleClosePinMega}
                    >
                      <div className="pin-mega-inner">
                        <div className="pin-mega-copy">
                          <strong>Browse by collection</strong>
                          <p>Browse pins by collection for easy navigation.</p>
                        </div>
                        <div className="pin-mega-grid">
                          {pinStoreMega.map((card, i) => (
                            <Link
                              key={card.href}
                              href={card.href}
                              className="pin-mega-card"
                              onClick={closeOverlays}
                            >
                              <span className="pin-mega-art">
                                <Image
                                  src={pinMegaImages[i] || card.image}
                                  alt=""
                                  fill
                                  sizes="(max-width: 760px) 42vw, 180px"
                                />
                                {/* <em>{card.eyebrow}</em> */}
                              </span>
                              <span className="pin-mega-label">
                                {card.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isNavActive(item.href, pathname, search) ? "active" : ""
                  }
                  onClick={closeOverlays}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="nav-utils">
            <button
              type="button"
              className="icon-btn"
              aria-label={searchOpen ? "Close search" : "Search"}
              onClick={openSearch}
            >
              <SearchIcon />
            </button>
            <Link
              href="/cart"
              className="icon-btn cart-icon"
              aria-label="Open shopping cart"
              onClick={closeOverlays}
            >
              <BagIcon />
              {count > 0 ? <span>{count}</span> : null}
            </Link>
            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((open) => !open);
                setSearchOpen(false);
                setPinMegaOpen(false);
              }}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {searchOpen ? (
        <div className="container search-panel">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pins, stickers, and accessories"
            aria-label="Search products"
          />
          {query.trim() ? (
            <div className="search-results">
              {results.length ? (
                results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={closeOverlays}
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                <p>No matching products yet.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

export function StoreHeader() {
  return (
    <Suspense
      fallback={
        <header className="site-header">
          <div className="top-strip">
            Welcome to Great Stone Dragon&apos;s website!
          </div>
        </header>
      }
    >
      <HeaderInner />
    </Suspense>
  );
}

function ChevronIcon() {
  return (
    <svg className="nav-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 9.5 12 15l5.5-5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}
