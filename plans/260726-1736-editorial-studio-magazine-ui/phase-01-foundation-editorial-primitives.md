# Phase 1 — Foundation: Fonts, Tokens, Editorial CSS, Motion Primitives

**Context:** `plan.md` (Global Constraints, Stable Interfaces), spec §3.
**Priority:** Highest — every later phase consumes these primitives.
**Status:** Complete (commits 66529c2..7405913 per `.superpowers/sdd/progress.md`, tasks P1.1–P1.6 all reviewed clean; two phase-gate manual checks below were never explicitly re-run and are left open)

## Task 1: Register Fraunces and extend tokens

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Produces: CSS vars `--font-display`, `--text-display-xl`, `--text-display-lg`, `--text-display-md`, `--motion-marquee`, `--grain-opacity`.

- [x] **Step 1: Add Fraunces to layout.tsx**

In `src/app/layout.tsx`, extend the `next/font/google` import and add the font (keep existing fonts unchanged):

```tsx
import { Fraunces, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

const display = Fraunces({
  axes: ["opsz"],
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
});
```

Add `${display.variable}` to the `<body>` className template string.

- [x] **Step 2: Extend tokens.css**

Append inside `:root` in `src/styles/tokens.css`:

```css
  --text-display-xl: clamp(2.75rem, 8vw, 7.5rem);
  --text-display-lg: clamp(2.25rem, 5.5vw, 4.5rem);
  --text-display-md: clamp(1.75rem, 3.5vw, 2.75rem);
  --motion-marquee: 28s;
  --grain-opacity: 0.035;
```

- [x] **Step 3: Verify compile**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

Run: `pnpm vitest run src/app/layout.test.tsx`
Expected: PASS (if the test asserts body class names, add `--font-display` expectation in the same change).

- [x] **Step 4: Commit**

`feat: register fraunces display font and editorial tokens`

## Task 2: Create editorial.css and wire into globals

**Files:**
- Create: `src/styles/editorial.css`
- Modify: `src/app/globals.css` (add `@import "../styles/editorial.css";` after utilities import)

- [x] **Step 1: Write `src/styles/editorial.css`** (complete file):

```css
/* Editorial Studio Magazine layer: display type, grain, markers, motion. */

.display-xl,
.display-lg,
.display-md {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 560;
  letter-spacing: -0.015em;
  line-height: 1.02;
  text-wrap: balance;
}

.display-xl { font-size: var(--text-display-xl); }
.display-lg { font-size: var(--text-display-lg); }
.display-md { font-size: var(--text-display-md); line-height: 1.1; }

/* Paper grain: fixed-position overlay, pointer-transparent, ultra-low opacity. */
.page-grain::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  content: "";
  inset: 0;
  opacity: var(--grain-opacity);
  pointer-events: none;
  position: fixed;
  z-index: 1;
}

/* Section marker: "01 ——— LABEL" */
.section-marker {
  align-items: center;
  color: var(--color-text-muted);
  display: flex;
  font-family: var(--font-mono), monospace;
  font-size: 0.8125rem;
  gap: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-marker-index { color: var(--color-accent); }

.section-marker-rule {
  background: var(--color-border);
  block-size: 1px;
  inline-size: 3rem;
}

/* Marquee */
.marquee {
  border-block: 1px solid var(--color-border);
  overflow: hidden;
  padding-block: 0.875rem;
  white-space: nowrap;
}

.marquee-track {
  animation: marquee-scroll var(--motion-marquee) linear infinite;
  display: inline-flex;
  gap: 2.5rem;
  will-change: transform;
}

.marquee-track > span {
  color: var(--color-text-subtle);
  font-family: var(--font-mono), monospace;
  font-size: 0.875rem;
  letter-spacing: 0.22em;
  padding-inline-end: 2.5rem;
  text-transform: uppercase;
}

@keyframes marquee-scroll {
  to { transform: translateX(-50%); }
}

/* Scroll reveal: visible by default; hidden only while data-state="pending". */
.scroll-reveal {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.scroll-reveal[data-state="pending"] {
  opacity: 0;
  transform: translateY(24px);
}

/* Parallax frame */
.parallax-frame { will-change: transform; }

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }

  .scroll-reveal,
  .scroll-reveal[data-state="pending"] {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .parallax-frame { transform: none !important; }
}
```

- [x] **Step 2: Import in globals.css**

Add `@import "../styles/editorial.css";` as the last style import in `src/app/globals.css`.

- [x] **Step 3: Verify**

Run: `pnpm lint && pnpm build`
Expected: PASS, no CSS syntax errors.

- [x] **Step 4: Commit**

`feat: add editorial css layer with grain, marquee, reveal, display type`

## Task 3: SectionMarker component (TDD)

**Files:**
- Create: `src/components/ui/section-marker.tsx`
- Test: `src/components/ui/section-marker.test.tsx`

**Interfaces:**
- Produces: `SectionMarker({ index, label })` — see plan.md Stable Interfaces.

- [x] **Step 1: Write failing test** `src/components/ui/section-marker.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionMarker } from "./section-marker";

describe("SectionMarker", () => {
  it("renders a zero-padded index and label", () => {
    render(<SectionMarker index={1} label="Photo Studio" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Photo Studio")).toBeInTheDocument();
  });

  it("pads two-digit indexes without truncation", () => {
    render(<SectionMarker index={12} label="Dịch vụ" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run to verify failure**

Run: `pnpm vitest run src/components/ui/section-marker.test.tsx`
Expected: FAIL — module not found.

- [x] **Step 3: Implement** `src/components/ui/section-marker.tsx` (complete file):

```tsx
export type SectionMarkerProps = Readonly<{
  index: number;
  label: string;
}>;

export function SectionMarker({ index, label }: SectionMarkerProps) {
  const formatted = String(index).padStart(2, "0");
  return (
    <p className="section-marker">
      <span className="section-marker-index">{formatted}</span>
      <span aria-hidden="true" className="section-marker-rule" />
      <span className="section-marker-label">{label}</span>
    </p>
  );
}
```

- [x] **Step 4: Run test — PASS.** Then commit: `feat: add section marker primitive`

## Task 4: Marquee component (TDD)

**Files:**
- Create: `src/components/ui/marquee.tsx`
- Test: `src/components/ui/marquee.test.tsx`

- [x] **Step 1: Write failing test** `src/components/ui/marquee.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Marquee } from "./marquee";

describe("Marquee", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Marquee items={["Studio", "Âm nhạc"]} />);
    expect(container.querySelector(".marquee")).toHaveAttribute("aria-hidden", "true");
  });

  it("duplicates the strip for seamless looping", () => {
    const { container } = render(<Marquee items={["Studio", "Podcast"]} />);
    const spans = container.querySelectorAll(".marquee-track > span");
    expect(spans).toHaveLength(2);
    expect(spans[0]?.textContent).toBe(spans[1]?.textContent);
    expect(spans[0]?.textContent).toContain("Studio · Podcast");
  });
});
```

- [x] **Step 2: Run — FAIL (module not found).**

- [x] **Step 3: Implement** `src/components/ui/marquee.tsx` (complete file, server component):

```tsx
export type MarqueeProps = Readonly<{
  items: readonly string[];
  className?: string;
}>;

export function Marquee({ items, className }: MarqueeProps) {
  const classes = ["marquee", className].filter(Boolean).join(" ");
  const strip = items.join(" · ");
  return (
    <div aria-hidden="true" className={classes}>
      <div className="marquee-track">
        <span>{strip}</span>
        <span>{strip}</span>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Run test — PASS.** Commit: `feat: add marquee primitive`

## Task 5: ScrollReveal component (TDD)

**Files:**
- Create: `src/components/ui/scroll-reveal.tsx`
- Test: `src/components/ui/scroll-reveal.test.tsx`

Behavior contract: children render immediately (no hidden-by-default without JS); after mount, if motion is allowed and IntersectionObserver exists, the wrapper enters `data-state="pending"` until it intersects, then `data-state="revealed"`. Reduced motion or missing IO ⇒ stays `revealed`.

- [x] **Step 1: Write failing test** `src/components/ui/scroll-reveal.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollReveal } from "./scroll-reveal";

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let intersect: IntersectionCallback = () => {};

class MockObserver {
  constructor(callback: IntersectionCallback) {
    intersect = callback;
  }
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches,
      removeEventListener: vi.fn(),
    }),
  );
}

describe("ScrollReveal", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("always renders its children", () => {
    mockReducedMotion(false);
    render(<ScrollReveal>Nội dung</ScrollReveal>);
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
  });

  it("reveals after intersection", async () => {
    mockReducedMotion(false);
    const { container } = render(<ScrollReveal>Nội dung</ScrollReveal>);
    const node = container.querySelector(".scroll-reveal");
    await waitFor(() => expect(node).toHaveAttribute("data-state", "pending"));
    intersect([{ isIntersecting: true }]);
    await waitFor(() => expect(node).toHaveAttribute("data-state", "revealed"));
  });

  it("stays revealed under reduced motion", async () => {
    mockReducedMotion(true);
    const { container } = render(<ScrollReveal>Nội dung</ScrollReveal>);
    const node = container.querySelector(".scroll-reveal");
    await waitFor(() => expect(node).toHaveAttribute("data-state", "revealed"));
  });
});
```

- [x] **Step 2: Run — FAIL (module not found).**

- [x] **Step 3: Implement** `src/components/ui/scroll-reveal.tsx` (complete file):

```tsx
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
```

- [x] **Step 4: Run test — PASS.** Commit: `feat: add scroll reveal primitive`

## Task 6: ParallaxFrame component (TDD)

**Files:**
- Create: `src/components/ui/parallax-frame.tsx`
- Test: `src/components/ui/parallax-frame.test.tsx`

Behavior contract: wraps children in `.parallax-frame`; on scroll (rAF-throttled) applies `translate3d(0, offset, 0)` where offset = element-center distance from viewport center, normalized to `[-amplitude, amplitude]`. No listener under reduced motion or viewport < 768px.

- [x] **Step 1: Write failing test** `src/components/ui/parallax-frame.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ParallaxFrame } from "./parallax-frame";

function mockMatchMedia(map: Record<string, boolean>) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      matches: map[query] ?? false,
      removeEventListener: vi.fn(),
    })),
  );
}

describe("ParallaxFrame", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders children inside the frame", () => {
    mockMatchMedia({});
    render(
      <ParallaxFrame>
        <img alt="Phòng chụp" src="/media/rooms/photo-studio.webp" />
      </ParallaxFrame>,
    );
    expect(screen.getByAltText("Phòng chụp")).toBeInTheDocument();
  });

  it("does not attach scroll listeners under reduced motion", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<ParallaxFrame>ảnh</ParallaxFrame>);
    expect(addSpy).not.toHaveBeenCalledWith("scroll", expect.any(Function), expect.anything());
  });
});
```

- [x] **Step 2: Run — FAIL (module not found).**

- [x] **Step 3: Implement** `src/components/ui/parallax-frame.tsx` (complete file):

```tsx
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
```

- [x] **Step 4: Run test — PASS.** Commit: `feat: add parallax frame primitive`

## Task 7: Phase gate

- [x] Run `pnpm ci:verify` — PASS.
- [x] Run `pnpm build` — PASS.
- [ ] Manually check `/` (hero unchanged) and any internal page at 1440px + 375px: grain invisible-but-present, no layout shift, no horizontal overflow. (No dedicated manual pass recorded in the ledger; folded into the still-open Phase 7 visual sweep.)
- [ ] Verify Fraunces renders Vietnamese diacritics at `--text-display-xl` without clipping. (Ledger: "deferred to first display-type usage in P3.1" — P3 shipped Fraunces headings across several review rounds with no clipping reported, but no dedicated diacritic check was ever run and recorded.)

## Success Criteria

All primitives exist with passing tests; editorial.css loaded; fonts registered; no visual change yet on any page except the imperceptible grain layer (applied in later phases via `.page-grain`).
