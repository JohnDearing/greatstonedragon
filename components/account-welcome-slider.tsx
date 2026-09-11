"use client";

import { ProductImage } from "@/components/product-image";
import { prefersReducedMotion } from "@/lib/gsap-client";
import Link from "next/link";
import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type WelcomePin = {
  id: string;
  image: string;
  href: string;
};

function shortestOffset(index: number, position: number, count: number) {
  if (count <= 0) return 0;
  let delta = index - position;
  delta -= Math.round(delta / count) * count;
  return delta;
}

export function AccountWelcomeSlider({ pins }: { pins: WelcomePin[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const slotWidthRef = useRef(160);
  const radiusRef = useRef({ x: 260, z: 180 });
  const [active, setActive] = useState(0);

  const count = pins.length;

  const layout = useCallback(() => {
    const countNow = pins.length;
    if (!countNow) return;

    let nearest = 0;
    let nearestAbs = Number.POSITIVE_INFINITY;

    for (let index = 0; index < countNow; index += 1) {
      const slot = slotsRef.current[index];
      if (!slot) continue;

      const offset = shortestOffset(index, positionRef.current, countNow);
      const angle = offset * 0.38;
      const x = Math.sin(angle) * radiusRef.current.x;
      const z = (Math.cos(angle) - 1) * radiusRef.current.z;
      const y = Math.abs(offset) * 18;
      const rotateY = Math.max(-20, Math.min(20, offset * 12));
      const scale = Math.max(0.78, 1 - Math.abs(offset) * 0.07);
      const opacity = Math.abs(offset) > 3.15 ? 0 : Math.max(0.35, 1 - Math.abs(offset) * 0.16);
      const visible = Math.abs(offset) <= 3.2;

      slot.style.opacity = String(opacity);
      slot.style.visibility = visible ? "visible" : "hidden";
      slot.style.pointerEvents = Math.abs(offset) < 0.55 ? "auto" : "none";
      slot.style.zIndex = String(40 - Math.round(Math.abs(offset) * 8));
      slot.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
      slot.classList.toggle("is-active", Math.abs(offset) < 0.5);

      if (Math.abs(offset) < nearestAbs) {
        nearestAbs = Math.abs(offset);
        nearest = index;
      }
    }

    setActive((current) => (current === nearest ? current : nearest));
  }, [pins.length]);

  useLayoutEffect(() => {
    layout();
  }, [layout]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !count) return;

    const measure = () => {
      const width = stage.clientWidth;
      const compact = width < 640;
      slotWidthRef.current = compact ? 108 : width < 900 ? 132 : 156;
      radiusRef.current = {
        x: Math.min(320, Math.max(170, width * 0.34)),
        z: Math.min(240, Math.max(130, width * 0.26)),
      };
      layout();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);

    const reduced = prefersReducedMotion();
    let frame = 0;

    const tick = () => {
      if (!draggingRef.current) {
        if (reduced) {
          const next = targetRef.current;
          positionRef.current += (next - positionRef.current) * 0.28;
          if (Math.abs(next - positionRef.current) < 0.001) {
            positionRef.current = next;
          }
        } else {
          velocityRef.current *= 0.9;
          if (Math.abs(velocityRef.current) < 0.0018) {
            velocityRef.current = 0;
            const next = targetRef.current;
            positionRef.current += (next - positionRef.current) * 0.18;
            if (Math.abs(next - positionRef.current) < 0.0015) {
              positionRef.current = next;
            }
          } else {
            positionRef.current += velocityRef.current;
            targetRef.current = Math.round(positionRef.current);
          }
        }
        layout();
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [count, layout]);

  function snapTo(next: number) {
    targetRef.current = next;
    velocityRef.current = 0;
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      snapTo(Math.round(targetRef.current) + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      snapTo(Math.round(targetRef.current) - 1);
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    draggingRef.current = true;
    movedRef.current = false;
    velocityRef.current = 0;
    lastXRef.current = event.clientX;
    lastTRef.current = performance.now();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || count < 2) return;
    const now = performance.now();
    const dx = event.clientX - lastXRef.current;
    const dt = Math.max(8, now - lastTRef.current);
    if (Math.abs(dx) > 4) movedRef.current = true;
    const delta = dx / slotWidthRef.current;
    positionRef.current -= delta;
    velocityRef.current = -delta * (16 / dt);
    lastXRef.current = event.clientX;
    lastTRef.current = now;
    layout();
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const flick = velocityRef.current * 10;
    snapTo(Math.round(positionRef.current + flick));
  }

  if (!count) return null;

  return (
    <div
      ref={stageRef}
      className="account-curve"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pins"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="account-curve-scene">
        {pins.map((pin, index) => (
          <div
            key={pin.id}
            className="account-curve-slot"
            ref={(node) => {
              slotsRef.current[index] = node;
            }}
          >
            <Link
              href={pin.href}
              className="account-curve-card"
              draggable={false}
              aria-current={active === index ? "true" : undefined}
              onClick={(event) => {
                if (movedRef.current) event.preventDefault();
              }}
            >
              <ProductImage
                src={pin.image}
                alt=""
                fill
                sizes="(max-width: 640px) 110px, 160px"
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
