"use client";

import { ProductImage } from "@/components/product-image";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import { Product } from "@/lib/store-data";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";

const fallbackCards = [
  {
    src: "/images/home/collectorCard1.png",
    title: "Baymax And Mochi-D'Orables Fantasy Pin",
    href: "/products",
  },
  {
    src: "/images/home/collectorCard2.png",
    title: "Collector Trading Accessories",
    href: "/products?collection=accessories",
  },
  {
    src: "/images/home/collectorCard3.png",
    title: "Preorder August 15 OE Paris Release",
    subtitle: "Frozen Polaroid / Gus & Jaq Polaroid",
    href: "/products?collection=international-preorder",
  },
];

type FavoriteCard = {
  src: string;
  title: string;
  href: string;
  subtitle?: string;
  badge?: string;
  price?: string;
};

export function CollectorFavoritesSection({
  products = [],
}: {
  products?: Product[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

  const cards: FavoriteCard[] =
    products.length > 0
      ? products.map((product) => ({
          src: product.image || "/images/home/collectorCard1.png",
          title: product.name,
          href: `/products/${product.slug}`,
          subtitle: product.shortDescription,
          badge: product.badge || "Bestseller",
          price: product.price,
        }))
      : fallbackCards;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap: g } = registerGsap();
    const ctx = g.context(() => {
      const copyParts = g.utils.toArray<HTMLElement>(
        section.querySelectorAll(
          ".favorites-copy p, .favorites-copy h2, .favorites-copy span, .favorites-copy .cta-button",
        ),
      );
      const sliderCards = g.utils.toArray<HTMLElement>(
        section.querySelectorAll(".favorite-card"),
      );
      const navs = g.utils.toArray<HTMLElement>(
        section.querySelectorAll(".favorites-nav"),
      );
      const slider = section.querySelector(".favorites-slider");

      g.set(copyParts, { autoAlpha: 0, x: -36, force3D: true });
      g.set(sliderCards, { autoAlpha: 0, y: 48, scale: 0.94, force3D: true });
      g.set(navs, { autoAlpha: 0, scale: 0.75 });

      g.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "top 48%",
          scrub: 1.15,
        },
      }).to(copyParts, {
        autoAlpha: 1,
        x: 0,
        duration: 1,
        stagger: 0.2,
        ease: "none",
      });

      if (slider) {
        const cardsTl = g.timeline({
          scrollTrigger: {
            trigger: slider,
            start: "top 85%",
            end: "top 32%",
            scrub: 1.3,
          },
        });

        const visibleCount = Math.min(cards.length, 3);
        sliderCards.forEach((card, index) => {
          const slot = index % cards.length;
          cardsTl.to(
            card,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "none",
            },
            slot < visibleCount ? slot * 0.4 : visibleCount * 0.4,
          );
        });

        cardsTl.to(
          navs,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "none",
          },
          visibleCount * 0.35,
        );
      }
    }, section);

    return () => ctx.revert();
  }, [cards.length]);

  return (
    <section
      ref={sectionRef}
      className="favorites-section"
      aria-label="Collector favorites"
    >
      <div className="favorites-shell">
        <div className="favorites-copy">
          <p>Customer Favorites</p>
          <h2>Collector Favorites</h2>
          <span>
            These Beloved Designs Have Earned A Permanent Place In Collections
            Around The World And Continue To Be Fan Favorites.
          </span>
          <Link href="/products" className="cta-button">
            Shop Best Sellers
          </Link>
        </div>

        <FavoritesSlider cards={cards} />
      </div>
    </section>
  );
}

function FavoritesSlider({ cards }: { cards: FavoriteCard[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const reduceMotionRef = useRef(false);

  const slides = [...cards, ...cards];
  const total = cards.length;

  const stepWidth = () => {
    const track = trackRef.current;
    const card = track?.querySelector(".favorite-card");
    if (!track || !(card instanceof HTMLElement)) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 14;
    return card.offsetWidth + gap;
  };

  const goTo = (index: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const x = -index * stepWidth();
    if (!animate || reduceMotionRef.current) {
      gsap.set(track, { x });
      return;
    }
    gsap.to(track, { x, duration: 0.55, ease: "power3.inOut" });
  };

  const step = (dir: 1 | -1) => {
    if (busyRef.current || total === 0) return;
    const track = trackRef.current;
    if (!track) return;

    if (dir < 0 && indexRef.current === 0) {
      indexRef.current = total;
      goTo(indexRef.current, false);
    }

    busyRef.current = true;
    indexRef.current += dir;
    goTo(indexRef.current, true);

    window.setTimeout(
      () => {
        if (indexRef.current >= total) {
          indexRef.current -= total;
          goTo(indexRef.current, false);
        }
        busyRef.current = false;
      },
      reduceMotionRef.current ? 0 : 560,
    );
  };

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const snap = () => {
      gsap.set(track, { x: -indexRef.current * stepWidth() });
    };

    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(viewport);

    let timer = 0;
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (reduceMotionRef.current) return;
      timer = window.setInterval(() => step(1), 4200);
    };

    const pause = () => stop();
    const resume = () => start();

    viewport.addEventListener("mouseenter", pause);
    viewport.addEventListener("mouseleave", resume);
    viewport.addEventListener("focusin", pause);
    viewport.addEventListener("focusout", resume);
    start();

    return () => {
      stop();
      ro.disconnect();
      gsap.killTweensOf(track);
      viewport.removeEventListener("mouseenter", pause);
      viewport.removeEventListener("mouseleave", resume);
      viewport.removeEventListener("focusin", pause);
      viewport.removeEventListener("focusout", resume);
    };
  }, [cards]);

  return (
    <div className="favorites-slider" ref={viewportRef}>
      <button
        type="button"
        className="favorites-nav is-prev"
        aria-label="Previous favorites"
        onClick={() => step(-1)}
      >
        <Chevron dir="prev" />
      </button>

      <div className="favorites-marquee">
        <div className="favorites-track" ref={trackRef}>
          {slides.map((card, index) => (
            <Link
              key={`${card.href}-${index}`}
              href={card.href}
              className="favorite-card"
            >
              <ProductImage
                src={card.src}
                alt={card.title}
                fill
                sizes="(max-width: 760px) 50vw, 220px"
              />
              <em>{card.badge || "Bestseller"}</em>
              <div className="favorite-card-meta">
                <strong>{card.title}</strong>
                {card.price ? <span>Price: ${card.price}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="favorites-nav is-next"
        aria-label="Next favorites"
        onClick={() => step(1)}
      >
        <Chevron dir="next" />
      </button>
    </div>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {dir === "prev" ? (
        <path
          d="M14.5 6.5 9 12l5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 6.5 15 12l-5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
