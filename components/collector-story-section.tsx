"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

export function CollectorStorySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap, SplitText } = registerGsap();
    const splits: InstanceType<typeof SplitText>[] = [];

    const ctx = gsap.context(() => {
      const logo = section.querySelector(".story-logo-frame");
      const kicker = section.querySelector(".story-kicker");
      const heading = section.querySelector(".story-right h2");
      const desc = section.querySelector(".story-desc");
      const cta = section.querySelector(".story-cta");

      if (!heading) return;

      const headingSplit = SplitText.create(heading, {
        type: "words,lines",
        linesClass: "story-split-line",
        wordsClass: "story-split-word",
      });
      splits.push(headingSplit);

      let descSplit: InstanceType<typeof SplitText> | null = null;
      if (desc) {
        descSplit = SplitText.create(desc, {
          type: "words,lines",
          linesClass: "story-split-line",
          wordsClass: "story-split-word",
        });
        splits.push(descSplit);
      }

      gsap.set(headingSplit.lines, { overflow: "hidden", display: "block" });
      gsap.set(headingSplit.words, {
        display: "inline-block",
        yPercent: 115,
        autoAlpha: 0,
        rotate: 3.5,
        transformOrigin: "50% 100%",
      });

      if (descSplit) {
        gsap.set(descSplit.lines, { overflow: "hidden", display: "block" });
        gsap.set(descSplit.words, {
          display: "inline-block",
          yPercent: 100,
          autoAlpha: 0,
        });
      }

      gsap.set(logo, { autoAlpha: 0, scale: 0.82, rotate: -8 });
      gsap.set(kicker, { autoAlpha: 0, y: 18 });
      gsap.set(cta, { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          end: "top 18%",
          scrub: 1.2,
        },
      });

      tl.to(logo, {
        autoAlpha: 1,
        scale: 1,
        rotate: 0,
        duration: 1.15,
        ease: "none",
      })
        .to(
          kicker,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "none",
          },
          0.2,
        )
        .to(
          headingSplit.words,
          {
            yPercent: 0,
            autoAlpha: 1,
            rotate: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: "none",
          },
          0.3,
        );

      if (descSplit) {
        tl.to(
          descSplit.words,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.03,
            ease: "none",
          },
          0.55,
        );
      }

      tl.to(
        cta,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "none",
        },
        0.95,
      );
    }, section);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="story-section"
      aria-label="About Great Stone Dragon"
    >
      <div className="container story-inner">
        <div className="story-logo-wrap">
          <div className="story-logo-frame">
            <Image
              src="/images/logo.png"
              alt="Great Stone Dragon logo"
              width={300}
              height={300}
              priority
            />
          </div>
        </div>

        <div className="story-right">
          <p className="story-kicker">ABOUT GREAT STONE DRAGON</p>
          <h2>Created By A Collector, For Collectors</h2>
          <p className="story-desc">
            What Began As A Love For Disney, Pin Trading, And Storytelling Grew
            Into Great Stone Dragon - A Place Where Collectors Can Find
            Thoughtfully Designed Fantasy Pieces That Celebrate Beloved
            Characters And Magical Moments.
          </p>

          <Link href="/about" className="cta-button story-cta">
            Read Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
