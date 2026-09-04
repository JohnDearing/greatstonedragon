"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

const items = [
  {
    icon: "/images/shop_icon1.png",
    title: "Carefully Packaged",
    copy: "Every order is packed with care to ensure your collectibles arrive safely and beautifully.",
  },
  {
    icon: "/images/shop_icon2.png",
    title: "Fast Shipping",
    copy: "In-stock orders are processed and shipped within 48 hours, so you get your pins quickly.",
  },
  {
    icon: "/images/shop_icon3.png",
    title: "Preorder Protection",
    copy: "Transparent preorder updates and guaranteed fulfillment, no surprises, no worries.",
  },
  {
    icon: "/images/shop_icon4.png",
    title: "Friendly Support",
    copy: "Questions? We're always happy to help. Real responses, real people.",
  },
];

export function ConfidenceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap, SplitText } = registerGsap();
    const splits: InstanceType<typeof SplitText>[] = [];

    const ctx = gsap.context(() => {
      const kicker = section.querySelector(".confidence-head p");
      const heading = section.querySelector(".confidence-head h2");
      const cards = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".confidence-item"),
      );

      if (!heading) return;

      const headingSplit = SplitText.create(heading, {
        type: "words,lines",
        linesClass: "confidence-split-line",
        wordsClass: "confidence-split-word",
      });
      splits.push(headingSplit);

      gsap.set(headingSplit.lines, { overflow: "hidden", display: "block" });
      gsap.set(headingSplit.words, {
        display: "inline-block",
        yPercent: 115,
        autoAlpha: 0,
        rotate: 3,
        transformOrigin: "50% 100%",
      });

      gsap.set(kicker, { autoAlpha: 0, y: 18 });
      gsap.set(cards, { autoAlpha: 0, y: 40, force3D: true });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "top 22%",
          scrub: 1.2,
        },
      });

      tl.to(kicker, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "none",
      }).to(
        headingSplit.words,
        {
          yPercent: 0,
          autoAlpha: 1,
          rotate: 0,
          duration: 1.05,
          stagger: 0.08,
          ease: "none",
        },
        0.15,
      );

      cards.forEach((card, index) => {
        tl.to(
          card,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "none",
          },
          0.55 + index * 0.28,
        );
      });
    }, section);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="confidence-section">
      <div className="container confidence-inner">
        <div className="confidence-head">
          <p>Why Collectors Choose Us</p>
          <h2>Shop With Confidence</h2>
        </div>
        <div className="confidence-grid">
          {items.map((item) => (
            <div className="confidence-item" key={item.title}>
              <span className="confidence-icon">
                <Image src={item.icon} alt="" width={46} height={46} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
