"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export type ScrollRevealProps = Readonly<{
  children: ReactNode;
  delayMs?: number;
  className?: string;
}>;

export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"revealed" | "pending">("revealed");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // Behavior contract: wrapper must flip to "pending" on mount (when motion allowed & IO exists)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("pending");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("revealed");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
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
