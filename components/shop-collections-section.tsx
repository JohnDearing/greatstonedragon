"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

const collections = [
  {
    title: "Fantasy",
    heading: "Fantasy",
    image: "/images/home/collectionCard1.png",
    href: "/products?collection=fantasy",
    variant: "fantasy",
  },
  {
    title: "New Releases",
    heading: (
      <>
        New
        <br />
        Releases
      </>
    ),
    image: "/images/home/collectionCard2.png",
    href: "/products?collection=new-releases",
    variant: "releases",
  },
  {
    title: "Inter Preorder",
    heading: (
      <>
        Inter
        <br />
        Preorder
      </>
    ),
    image: "/images/home/collectionCard3.png",
    href: "/products?collection=international-preorder",
    variant: "preorder",
  },
  {
    title: "Sticker And Accessories",
    heading: (
      <>
        Stickers &
        <br />
        Accessories
      </>
    ),
    image: "/images/home/collectionCard4.png",
    href: "/products?category=stickers",
    variant: "stickers",
  },
];

export function ShopCollectionsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      const copyParts = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(
          ".shopcol-copy p, .shopcol-copy h2, .shopcol-copy span",
        ),
      );
      // Animate the card shells only — never .shopcol-art (CSS hover owns that transform)
      const cards = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".shopcol-card"),
      );
      const grid = section.querySelector(".shopcol-grid");

      gsap.set(copyParts, { autoAlpha: 0, x: -32, force3D: true });
      gsap.set(cards, { autoAlpha: 0, y: 44, force3D: true });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "top 50%",
            scrub: 1.15,
          },
        })
        .to(copyParts, {
          autoAlpha: 1,
          x: 0,
          duration: 1,
          stagger: 0.18,
          ease: "none",
        });

      if (grid) {
        const cardsTl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            end: "top 35%",
            scrub: 1.25,
          },
        });

        cards.forEach((card, index) => {
          cardsTl.to(
            card,
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "none",
            },
            index * 0.35,
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="shopcol-section"
      aria-label="Shop by collection"
    >
      <div className="shopcol-shell">
        <div className="shopcol-copy">
          <p>Shop By Collection</p>
          <h2>Explore The Collection</h2>
          <span>
            Browse By Theme And Discover The Pieces That Speak To Your Favorite
            Stories.
          </span>
        </div>

        <div className="shopcol-grid">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className={`shopcol-card is-${collection.variant}`}
            >
              <span className="shopcol-text">
                <h3>{collection.heading}</h3>
                <em>Shop Now</em>
              </span>
              <span className="shopcol-art">
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 42vw, 220px"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
