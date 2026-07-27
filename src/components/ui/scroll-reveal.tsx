"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export type ScrollRevealProps = Readonly<{
  children: ReactNode;
  delayMs?: number;
  className?: string;
}>;

// Failsafe: if the IntersectionObserver hasn't fired within this window (fast/instant
// scroll, scroll-restoration, anchor jumps), force-reveal so content never gets stuck
// near-invisible.
const FAILSAFE_MS = 1500;

export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"revealed" | "pending">("revealed");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // Already scrolled past the fold on mount (e.g. anchor jump, back-forward restore) —
    // reveal immediately instead of waiting on the observer.
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    // Behavior contract: wrapper must flip to "pending" on mount (when motion allowed & IO exists)
    setState("pending");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("revealed");
          clearTimeout(failsafe);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    const failsafe = setTimeout(() => {
      setState("revealed");
      observer.disconnect();
    }, FAILSAFE_MS);
    observer.observe(node);
    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  const classes = ["scroll-reveal", className].filter(Boolean).join(" ");
  return (
    <div
      className={classes}
      data-state={state}
      ref={ref}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
