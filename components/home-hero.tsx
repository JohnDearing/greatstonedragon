"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";

const heroCards = [
  {
    src: "/images/home/hero-card1.png",
    alt: "Baymax Zodiac",
    href: "/products?collection=fantasy",
  },
  {
    src: "/images/home/hero-card2.png",
    alt: "Tinies",
    href: "/products",
  },
  {
    src: "/images/home/hero-card3.png",
    alt: "Cutesy Cravings",
    href: "/products?category=stickers",
  },
  {
    src: "/images/home/hero-card4.png",
    alt: "Bubble Buddies",
    href: "/products",
  },
  {
    src: "/images/home/hero-card5.png",
    alt: "Fantasy Pins",
    href: "/products?collection=fantasy",
  },
  {
    src: "/images/home/hero-card6.png",
    alt: "Fantasy Collabs",
    href: "/products?collection=new-releases",
  },
];

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.classList.add("has-hero-stage");
    return () => document.body.classList.remove("has-hero-stage");
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap: g } = registerGsap();
    const ctx = g.context(() => {
      const chip = section.querySelector(".hero-chip");
      const lines = section.querySelectorAll(".hero-wrap h1 span");
      const copy = section.querySelector(".hero-copy");
      const ctas = section.querySelectorAll(".hero-cta a");
      const marquees = section.querySelectorAll(".hero-marquee");
      const copyBlock = section.querySelector(".hero-copy-block");
      const slider = section.querySelector(".hero-slider");

      g.set([chip, lines, copy, ctas, marquees], { opacity: 0 });

      const intro = g.timeline({ defaults: { ease: "power3.out" } });

      intro
        .fromTo(
          chip,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
        )
        .fromTo(
          lines,
          { y: 48, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.1 },
          "-=0.28",
        )
        .fromTo(
          copy,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          "-=0.4",
        )
        .fromTo(
          ctas,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
          "-=0.35",
        )
        .fromTo(
          marquees,
          { x: (i: number) => (i % 2 === 0 ? 56 : -56), opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
          "-=0.55",
        );

      g.to(copyBlock, {
        y: -28,
        opacity: 0.72,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      });

      g.to(slider, {
        y: 40,
        opacity: 0.78,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      });

      g.to(section.querySelector(".hero-bg"), {
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-wrap" ref={sectionRef}>
      <Image
        src="/images/home/hero-bg.png"
        alt=""
        fill
        priority
        className="hero-bg"
        sizes="100vw"
      />
      <div className="hero-layout">
        <div className="hero-copy-block">
          <p className="hero-chip">Welcome To My Shop</p>
          <h1>
            <span>Discover Fantasy Pins</span>
            <span>Worth Collecting</span>
          </h1>
          <p className="hero-copy">
            From limited preorder releases to fan-favorite designs, Great Stone
            Dragon creates collectible pieces inspired by the stories and
            characters collectors cherish most. Whether you&apos;re hunting for
            your next grail pin or starting your collection, there&apos;s
            something magical waiting for you.
          </p>
          <div className="hero-cta">
            <Link href="/products?collection=new-releases" className="cta-button">
              Shop New Releases
            </Link>
            <Link href="/products" className="soft-button">
              Best Sellers
            </Link>
          </div>
        </div>

        <div className="hero-slider" aria-label="Featured collections">
          <MarqueeRow cards={heroCards} duration={28} />
          <MarqueeRow cards={[...heroCards].reverse()} duration={34} offset />
        </div>
      </div>
    </section>
  );
}

function MarqueeRow({
  cards,
  duration,
  offset = false,
}: {
  cards: typeof heroCards;
  duration: number;
  offset?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      track,
      { xPercent: 0 },
      {
        xPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
      },
    );

    const pause = () => tween.pause();
    const play = () => tween.play();
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", play);

    return () => {
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", play);
      tween.kill();
    };
  }, [duration]);

  const loop = [...cards, ...cards];

  return (
    <div className={`hero-marquee ${offset ? "is-offset" : ""}`}>
      <div className="hero-marquee-track" ref={trackRef}>
        {loop.map((card, index) => (
          <Link
            key={`${card.src}-${index}`}
            href={card.href}
            className="hero-card"
          >
            <Image
              src={card.src}
              alt={card.alt}
              width={220}
              height={220}
              sizes="(max-width: 760px) 148px, 200px"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
