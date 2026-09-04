"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") {
    return { gsap, ScrollTrigger, SplitText };
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
  return { gsap, ScrollTrigger, SplitText };
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
