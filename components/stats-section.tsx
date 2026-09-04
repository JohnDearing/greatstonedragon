"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import { useLayoutEffect, useRef } from "react";

const stats = [
  { end: 3000, suffix: "+", label: "Collectors" },
  { end: 150, suffix: "+", label: "Pin Designs" },
  { end: 48, suffix: "hr", label: "Ship Time" },
];

function formatStat(value: number, suffix: string) {
  if (suffix === "+") {
    return `${Math.round(value).toLocaleString("en-US")}+`;
  }
  return `${Math.round(value)}${suffix}`;
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".stats-bar article"),
      );

      gsap.from(items, {
        y: 28,
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      items.forEach((item, index) => {
        const strong = item.querySelector("strong");
        const config = stats[index];
        if (!strong || !config) return;

        const counter = { value: 0 };
        let activeTween: gsap.core.Tween | null = null;

        const render = () => {
          strong.textContent = formatStat(counter.value, config.suffix);
        };

        const playCount = () => {
          activeTween?.kill();
          counter.value = 0;
          render();
          activeTween = gsap.to(counter, {
            value: config.end,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: render,
          });
        };

        const reverseCount = () => {
          activeTween?.kill();
          activeTween = gsap.to(counter, {
            value: 0,
            duration: 0.55,
            ease: "power2.in",
            onUpdate: render,
          });
        };

        ScrollTrigger.create({
          trigger: section,
          start: "top 88%",
          onEnter: playCount,
          onEnterBack: playCount,
          onLeaveBack: reverseCount,
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="stats-section"
      aria-label="Shop highlights"
    >
      <div className="container">
        <div className="stats-bar">
          {stats.map((stat) => (
            <article key={stat.label}>
              <strong>{formatStat(stat.end, stat.suffix)}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
