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
  const slotWidthRef = useRef(180);
  const radiusRef = useRef({ x: 340, z: 260 });
  const hoveringRef = useRef(false);
  const autoAtRef = useRef(performance.now());
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
      const angle = offset * 0.58;
      const x = Math.sin(angle) * radiusRef.current.x;
      const z = (Math.cos(angle) - 1) * radiusRef.current.z;
      const y = (1 - Math.cos(angle)) * 70 + Math.abs(offset) * 8;
      const rotateY = Math.max(-36, Math.min(36, offset * 22));
      const rotateZ = Math.max(-10, Math.min(10, offset * -4.5));
      const scale = Math.max(0.72, 1 - Math.abs(offset) * 0.09);
      const opacity = Math.abs(offset) > 3.35 ? 0 : Math.max(0.42, 1 - Math.abs(offset) * 0.14);
      const visible = Math.abs(offset) <= 3.4;

      slot.style.opacity = String(opacity);
      slot.style.visibility = visible ? "visible" : "hidden";
      slot.style.pointerEvents = Math.abs(offset) < 0.55 ? "auto" : "none";
      slot.style.zIndex = String(40 - Math.round(Math.abs(offset) * 8));
      slot.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
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
      slotWidthRef.current = compact ? 120 : width < 900 ? 150 : 176;
      radiusRef.current = {
        x: Math.min(420, Math.max(220, width * 0.42)),
        z: Math.min(340, Math.max(180, width * 0.34)),
      };
      layout();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);

    const reduced = prefersReducedMotion();
    let frame = 0;

    const tick = (now: number) => {
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
            if (
              !hoveringRef.current &&
              now - autoAtRef.current > 2600 &&
              Math.abs(targetRef.current - positionRef.current) < 0.01
            ) {
              targetRef.current += 1;
              autoAtRef.current = now;
            }
            const next = targetRef.current;
            positionRef.current += (next - positionRef.current) * 0.16;
            if (Math.abs(next - positionRef.current) < 0.0015) {
              positionRef.current = next;
            }
          } else {
            positionRef.current += velocityRef.current;
            targetRef.current = Math.round(positionRef.current);
            autoAtRef.current = now;
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
    autoAtRef.current = performance.now();
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
    autoAtRef.current = performance.now();
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
      onPointerEnter={() => {
        hoveringRef.current = true;
      }}
      onPointerLeave={() => {
        hoveringRef.current = false;
        autoAtRef.current = performance.now();
      }}
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
            <span className="account-curve-card-frame">
              <ProductImage
                src={pin.image}
                alt=""
                fill
                sizes="(max-width: 640px) 110px, 160px"
                style={{ objectFit: "contain" }}
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
