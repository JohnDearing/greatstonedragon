"use client";

import { ProductImage } from "@/components/product-image";
import { prefersReducedMotion } from "@/lib/gsap-client";
import Link from "next/link";
import { PointerEvent, useEffect, useRef } from "react";

export type WelcomePin = {
  id: string;
  image: string;
  href: string;
};

const TILTS = [-7, 5, -4, 8, 6, -8, 4, 10];

export function AccountWelcomeSlider({ pins }: { pins: WelcomePin[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);

  const looped = pins.length ? [...pins, ...pins, ...pins] : [];

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || pins.length < 2) return;

    const segment = () => viewport.scrollWidth / 3;
    viewport.scrollLeft = segment();

    if (prefersReducedMotion()) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const width = segment();
      if (width > 0 && !pausedRef.current && !draggingRef.current) {
        viewport.scrollLeft += ((now - last) / 16) * 0.55;
        if (viewport.scrollLeft >= width * 2) {
          viewport.scrollLeft -= width;
        }
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pins.length]);

  function wrapScroll() {
    const viewport = viewportRef.current;
    if (!viewport || pins.length < 2) return;
    const width = viewport.scrollWidth / 3;
    if (width <= 0) return;
    if (viewport.scrollLeft < width * 0.5) viewport.scrollLeft += width;
    if (viewport.scrollLeft >= width * 2.5) viewport.scrollLeft -= width;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    draggingRef.current = true;
    movedRef.current = false;
    pausedRef.current = true;
    startXRef.current = event.clientX;
    startScrollRef.current = viewport.scrollLeft;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (!viewport || !draggingRef.current) return;
    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) > 6) movedRef.current = true;
    viewport.scrollLeft = startScrollRef.current - delta;
    wrapScroll();
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    draggingRef.current = false;
    viewport?.classList.remove("is-dragging");
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    wrapScroll();
    window.setTimeout(() => {
      pausedRef.current = false;
    }, 900);
  }

  if (!looped.length) return null;

  return (
    <div
      ref={viewportRef}
      className="account-welcome-slider"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => {
        if (!draggingRef.current) pausedRef.current = false;
      }}
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
    >
      <div className="account-welcome-track">
        {looped.map((pin, index) => (
          <Link
            key={`${pin.id}-${index}`}
            href={pin.href}
            className="account-welcome-pin"
            style={{ transform: `rotate(${TILTS[index % TILTS.length]}deg)` }}
            draggable={false}
            onClick={(event) => {
              if (movedRef.current) event.preventDefault();
            }}
          >
            <ProductImage
              src={pin.image}
              alt=""
              width={320}
              height={320}
              style={{ objectFit: "cover" }}
              draggable={false}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
