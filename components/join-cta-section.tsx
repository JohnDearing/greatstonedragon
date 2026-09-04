"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import { socialLinks } from "@/lib/social-links";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

export function JoinCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap, SplitText } = registerGsap();
    const splits: InstanceType<typeof SplitText>[] = [];

    const ctx = gsap.context(() => {
      const heading = section.querySelector(".joincta-left h2");
      const copy = section.querySelector(".joincta-right p");
      const button = section.querySelector(".joincta-btn");

      if (!heading) return;

      const headingSplit = SplitText.create(heading, {
        type: "words,lines",
        linesClass: "joincta-split-line",
        wordsClass: "joincta-split-word",
      });
      splits.push(headingSplit);

      let copySplit: InstanceType<typeof SplitText> | null = null;
      if (copy) {
        copySplit = SplitText.create(copy, {
          type: "words,lines",
          linesClass: "joincta-split-line",
          wordsClass: "joincta-split-word",
        });
        splits.push(copySplit);
      }

      gsap.set(headingSplit.lines, { overflow: "hidden", display: "block" });
      gsap.set(headingSplit.words, {
        display: "inline-block",
        yPercent: 115,
        autoAlpha: 0,
        rotate: 3.5,
        transformOrigin: "50% 100%",
      });

      if (copySplit) {
        gsap.set(copySplit.lines, { overflow: "hidden", display: "block" });
        gsap.set(copySplit.words, {
          display: "inline-block",
          yPercent: 100,
          autoAlpha: 0,
        });
      }

      gsap.set(button, { autoAlpha: 0, y: 22, scale: 0.94 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "top 28%",
          scrub: 1.2,
        },
      });

      tl.to(headingSplit.words, {
        yPercent: 0,
        autoAlpha: 1,
        rotate: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "none",
      });

      if (copySplit) {
        tl.to(
          copySplit.words,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.03,
            ease: "none",
          },
          0.35,
        );
      }

      tl.to(
        button,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "none",
        },
        0.75,
      );
    }, section);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="joincta-section">
      <div className="container joincta-inner">
        <div className="joincta-left">
          <h2>
            Join Our Collector
            <br />
            Community
          </h2>
        </div>
        <div className="joincta-right">
          <p>
            Connect with fellow collectors, share your latest finds, get sneak
            peeks of upcoming releases, and stay up to date on all things Great
            Stone Dragon through our Discord community.
          </p>
          <Link
            href={socialLinks.discord}
            className="joincta-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Our Discord
          </Link>
        </div>
      </div>
    </section>
  );
}
