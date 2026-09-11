"use client";

import { ProductImage } from "@/components/product-image";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import gsap from "gsap";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

export type WelcomePin = {
  id: string;
  image: string;
  href: string;
};

type WheelSlide = WelcomePin & { key: string };

const SECONDS_PER_SLIDE = 1.25;
const ORIGIN = "50% 180%";

function padSlides(pins: WelcomePin[]): WheelSlide[] {
  if (!pins.length) return [];
  const copies = pins.length >= 10 ? 1 : Math.ceil(10 / pins.length);
  return Array.from({ length: copies }, (_, copy) =>
    pins.map((pin) => ({ ...pin, key: `${pin.id}-${copy}` })),
  ).flat();
}

function wrapAngle(value: number) {
  let angle = value % 360;
  if (angle > 180) angle -= 360;
  if (angle < -180) angle += 360;
  return angle;
}

export function AccountWelcomeSlider({ pins }: { pins: WelcomePin[] }) {
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);

  const slides = useMemo(() => padSlides(pins), [pins]);
  const count = slides.length;
  const step = count ? 360 / count : 0;

  useLayoutEffect(() => {
    if (count < 2) return;

    const { gsap: g } = registerGsap();
    const reduced = prefersReducedMotion();
    const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slots.length !== count) return;

    g.set(slots, { transformOrigin: ORIGIN, force3D: true });
    slots.forEach((slot, index) => {
      g.set(slot, { rotation: index * step });
    });

    const syncActive = () => {
      let nearest = 0;
      let nearestAbs = 180;

      slots.forEach((slot, index) => {
        const angle = wrapAngle(Number(g.getProperty(slot, "rotation")) || 0);
        const abs = Math.abs(angle);
        slot.style.opacity = String(abs > 115 ? 0 : Math.max(0.38, 1 - abs / 140));
        slot.classList.toggle("is-active", abs < step / 2);
        if (abs < nearestAbs) {
          nearestAbs = abs;
          nearest = index;
        }
      });

      setActive((current) => (current === nearest ? current : nearest));
    };

    syncActive();

    if (!reduced) {
      tweenRef.current = g.to(slots, {
        rotation: "-=360",
        duration: count * SECONDS_PER_SLIDE,
        ease: "none",
        repeat: -1,
        transformOrigin: ORIGIN,
        onUpdate: syncActive,
      });
    }

    const onEnter = () => {
      tweenRef.current?.pause();
    };
    const onLeave = (event: PointerEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && slots.some((slot) => slot.contains(next))) return;
      tweenRef.current?.resume();
    };

    slots.forEach((slot) => {
      slot.addEventListener("pointerenter", onEnter);
      slot.addEventListener("pointerleave", onLeave);
    });

    return () => {
      slots.forEach((slot) => {
        slot.removeEventListener("pointerenter", onEnter);
        slot.removeEventListener("pointerleave", onLeave);
      });
      tweenRef.current?.kill();
      tweenRef.current = null;
      g.killTweensOf(slots);
    };
  }, [count, step]);

  if (!count) return null;

  return (
    <div
      className="account-curve"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pins"
    >
      <div className="account-curve-wheel">
        {slides.map((slide, index) => (
          <div
            key={slide.key}
            className="account-curve-slot"
            ref={(node) => {
              slotRefs.current[index] = node;
            }}
          >
            <Link
              href={slide.href}
              className="account-curve-card rounded-[100px]"
              draggable={false}
              aria-current={active === index ? "true" : undefined}
              tabIndex={active === index ? 0 : -1}
            >
              <span className="account-curve-card-frame rounded-[100px]">
                <ProductImage
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 110px, 140px"
                  style={{ objectFit: "cover" }}
                  draggable={false}
                />
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
