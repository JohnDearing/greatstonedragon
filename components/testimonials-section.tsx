"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

interface Review {
  rating: number;
  title: string;
  body: string;
  name: string;
  product: string;
}

const dummyReviews: Review[] = [
  {
    rating: 5,
    title: "",
    body: "\"The Quality Exceeded My Expectations And The Packaging Was Absolutely Beautiful. I Felt Like I Was Unwrapping A Gift From My Favorite Store.\"",
    name: "Sarah K.",
    product: "Fantasy Collector Pin",
  },
  {
    rating: 5,
    title: "",
    body: "\"One Of My Absolute Favorite Shops For Fantasy Pins. Every Single Order Feels Special, From The Moment It Arrives To When I Add It To My Board.\"",
    name: "Jamie T.",
    product: "Baymax Hopes & Dreams",
  },
  {
    rating: 5,
    title: "",
    body: "\"The Attention To Detail Is Incredible. I Can Tell Every Design Is Made With Love By Someone Who Truly Understands Collectors. I'll Definitely Be Back.\"",
    name: "Priya M.",
    product: "Fantasy Preorder Pin",
  },
  {
    rating: 5,
    title: "",
    body: "\"Great Stone Dragon is my go-to for pins. The designs are unique, the quality is top-notch, and shipping is always fast. Highly recommend!\"",
    name: "Alex R.",
    product: "Stitch Pocket Parks",
  },
  {
    rating: 5,
    title: "",
    body: "\"I've ordered from many pin shops and this one stands out. Beautiful artwork, perfect packaging, and the mystery boxes are so fun!\"",
    name: "Morgan L.",
    product: "Mystery Box Collection",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="testi-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.3l2.4 5.1 5.6.7-4.1 3.8 1.1 5.5L10 13.5l-4.9 2.9 1.1-5.5L2 7.1l5.6-.7L10 1.3z"
            fill={i < count ? "#c9ab63" : "#d4c9b8"}
          />
        </svg>
      ))}
    </span>
  );
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>(dummyReviews);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data: { reviews?: Review[]; totalReviews?: number }) => {
        const count =
          (typeof data.totalReviews === "number" && data.totalReviews > 0
            ? data.totalReviews
            : data.reviews?.length) ?? 0;
        if (count > 0) {
          setReviewCount(count);
        }

        if (data.reviews?.length && data.reviews.length >= 3) {
          setReviews(
            data.reviews.map((r: Review) => ({
              ...r,
              body: r.body.startsWith('"') ? r.body : `"${r.body}"`,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const formattedCount =
    reviewCount > 0 ? reviewCount.toLocaleString() : "1,200+";

  return (
    <section className="testi-section" aria-label="Customer testimonials">
      <div className="container testi-head">
        <p>Social Proof</p>
        <h2>Loved By Collectors</h2>
        <span>
          From Thoughtful Packaging To Stunning Artwork, Collectors Around The
          World Continue To Make Great Stone Dragon Part Of Their Growing
          Collections.
        </span>
      </div>

      <TestiSlider reviews={reviews} />

      <div className="container testi-summary">
        <Stars count={5} />
        <span>
          4.9 Out Of 5 Across {formattedCount} Verified Reviews
        </span>
      </div>
    </section>
  );
}

function TestiSlider({ reviews }: { reviews: Review[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const reduceMotionRef = useRef(false);

  const slides = [...reviews, ...reviews];
  const total = reviews.length;

  const stepWidth = () => {
    const track = trackRef.current;
    const card = track?.querySelector(".testi-card");
    if (!track || !(card instanceof HTMLElement)) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
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
    if (busyRef.current) return;
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
      indexRef.current = ((indexRef.current % total) + total) % total;
      gsap.set(track, { x: -indexRef.current * stepWidth() });
    };

    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(viewport);

    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchStartX = event.touches[0]?.clientX ?? 0;
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      step(deltaX < 0 ? 1 : -1);
    };

    let timer = 0;
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (reduceMotionRef.current) return;
      timer = window.setInterval(() => step(1), 5500);
    };

    const pause = () => stop();
    const resume = () => start();

    viewport.addEventListener("mouseenter", pause);
    viewport.addEventListener("mouseleave", resume);
    viewport.addEventListener("focusin", pause);
    viewport.addEventListener("focusout", resume);
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });
    start();

    return () => {
      stop();
      ro.disconnect();
      gsap.killTweensOf(track);
      viewport.removeEventListener("mouseenter", pause);
      viewport.removeEventListener("mouseleave", resume);
      viewport.removeEventListener("focusin", pause);
      viewport.removeEventListener("focusout", resume);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchend", onTouchEnd);
    };
  }, [reviews, total]);

  return (
    <div className="testi-slider" ref={viewportRef}>
      <button
        type="button"
        className="testi-nav is-prev"
        aria-label="Previous review"
        onClick={() => step(-1)}
      >
        <Chevron dir="prev" />
      </button>

      <div className="testi-marquee">
        <div className="testi-track" ref={trackRef}>
          {slides.map((review, index) => (
            <article key={`${review.name}-${index}`} className="testi-card">
              <span className="testi-quote">&ldquo;</span>
              <Stars count={review.rating} />
              <p className="testi-body">{review.body}</p>
              <footer className="testi-footer">
                <span className="testi-avatar">
                  {review.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <strong>{review.name}</strong>
                  {review.product ? <small>{review.product}</small> : null}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="testi-nav is-next"
        aria-label="Next review"
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
