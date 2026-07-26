"use client";

import { type ReactNode, useEffect, useRef } from "react";

export type ParallaxFrameProps = Readonly<{
  children: ReactNode;
  amplitude?: number;
  className?: string;
}>;

export function ParallaxFrame({ amplitude = 16, children, className }: ParallaxFrameProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (reduced || small) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const ratio = (viewportCenter - elementCenter) / window.innerHeight;
      const offset = Math.max(-1, Math.min(1, ratio)) * amplitude;
      node.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [amplitude]);

  const classes = ["parallax-frame", className].filter(Boolean).join(" ");
  return (
    <div className={classes} ref={ref}>
      {children}
    </div>
  );
}
