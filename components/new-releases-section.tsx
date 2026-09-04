"use client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import { Product, money } from "@/lib/store-data";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

const fallbackArt = [
  "/images/home/ReleaseCard1.png",
  "/images/home/releaseCard2.png",
  "/images/home/releaseCard3.png",
  "/images/home/releaseCard4.png",
];

const placeholderReleases: Product[] = [
  {
    id: "release-1",
    slug: "june-8-open-edition-dec-release",
    name: "PREORDER: June 8 Open Edition DEC Release",
    shortDescription: "Open edition DEC drop with collector variants.",
    description: "Open edition DEC drop with collector variants.",
    price: 45,
    compareAtPrice: 65,
    badge: "New",
    category: "pins",
    collection: "new-releases",
    colors: ["#f7e4ea", "#d7a8b5"],
    image: fallbackArt[0],
    rating: 5,
    reviews: 0,
  },
  {
    id: "release-2",
    slug: "palm-muppets-show-mystery-box",
    name: "PALM Muppets Show Mystery Box",
    shortDescription: "Mystery box featuring Muppets show pins.",
    description: "Mystery box featuring Muppets show pins.",
    price: 40,
    badge: "New",
    category: "pins",
    collection: "new-releases",
    colors: ["#f7e4ea", "#d7a8b5"],
    image: fallbackArt[1],
    rating: 5,
    reviews: 0,
  },
  {
    id: "release-3",
    slug: "palm-villains-and-sidekicks-mystery-box",
    name: "PALM Villains and Sidekicks Mystery Box",
    shortDescription: "Mystery box of villain and sidekick pins.",
    description: "Mystery box of villain and sidekick pins.",
    price: 40,
    badge: "New",
    category: "pins",
    collection: "new-releases",
    colors: ["#f7e4ea", "#d7a8b5"],
    image: fallbackArt[2],
    rating: 5,
    reviews: 0,
  },
  {
    id: "release-4",
    slug: "palm-mystery-princess-pin-city-event-pin-set",
    name: "PALM Mystery Princess Pin City Event Pin Set",
    shortDescription: "Event pin set with princess mystery variants.",
    description: "Event pin set with princess mystery variants.",
    price: 40,
    compareAtPrice: 50,
    badge: "New",
    category: "pins",
    collection: "new-releases",
    colors: ["#f7e4ea", "#d7a8b5"],
    image: fallbackArt[3],
    rating: 5,
    reviews: 0,
  },
];

function releasePrice(product: Product) {
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    return `${money(product.price)} – ${money(product.compareAtPrice)}`;
  }
  return money(product.price);
}

export function NewReleasesSection({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  const items = Array.from({ length: 4 }, (_, index) => {
    const live = products[index];
    const fallback = placeholderReleases[index];
    if (!live) return fallback;
    return {
      ...live,
      image: live.image || fallbackArt[index],
      badge: live.badge ?? "New",
    };
  });

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      const headParts = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(
          ".releases-head p, .releases-head h2, .releases-head span",
        ),
      );
      const cards = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".release-card"),
      );
      const grid = section.querySelector(".releases-grid");
      const cta = section.querySelector(".releases-cta");

      gsap.set(headParts, { autoAlpha: 0, y: 24 });
      gsap.set(cards, { autoAlpha: 0, y: 52, force3D: true });
      if (cta) gsap.set(cta, { autoAlpha: 0, y: 20 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "top 55%",
            scrub: 1.15,
          },
        })
        .to(headParts, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.18,
          ease: "none",
        });

      if (grid) {
        const cardsTl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: "top 88%",
            end: "top 28%",
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
            index * 0.45,
          );
        });
      }

      if (cta) {
        gsap.to(cta, {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: cta,
            start: "top 95%",
            end: "top 70%",
            scrub: 1.1,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="releases-section" id="new-releases">
      <div className="container releases-inner">
        <div className="releases-head">
          <p>New Releases</p>
          <h2>Fresh Drops Just Arrived</h2>
          <span>
            Be The First To Discover Our Newest Fantasy Pins And Collectibles
            Before They Disappear From The Shop.
          </span>
        </div>

        <div className="releases-grid">
          {items.map((product, index) => (
            <article key={product.id} className="release-card">
              <Link href={`/products/${product.slug}`} className="release-art">
                <ProductImage
                  src={product.image || fallbackArt[index]}
                  alt={product.name}
                  width={640}
                  height={640}
                />
                {product.badge ? <em>{product.badge}</em> : null}
              </Link>
              <div className="release-body">
                <Link href={`/products/${product.slug}`}>{product.name}</Link>
                <p>{releasePrice(product)}</p>
                <AddToCartButton
                  className="release-cart"
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    variantId: product.variantId,
                  }}
                />
              </div>
            </article>
          ))}
        </div>

        <div className="releases-cta">
          <Link href="/products?collection=new-releases" className="cta-button">
            View All New Releases
          </Link>
        </div>
      </div>
    </section>
  );
}
