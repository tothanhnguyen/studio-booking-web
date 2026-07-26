import { heroCopy } from "./hero-copy";

export function HeroBrandState() {
  return (
    <div className="hero-state hero-state-brand" data-hero-state="brand">
      <div className="relative z-20 max-w-[44rem]" data-hero-state-content>
        <p className="hero-eyebrow mb-5 text-sm font-medium tracking-[0.08em]">
          Creative space / Sài Gòn
        </p>
        <h2 aria-label="MOW STUDIO" className="hero-wordmark-lockup" data-hero-wordmark>
          <span className="hero-wordmark-letter" data-hero-wordmark-letter>M</span>
          <span className="hero-wordmark-letter hero-wordmark-letter-outline" data-hero-wordmark-letter>O</span>
          <span className="hero-wordmark-letter" data-hero-wordmark-letter>W</span>
          <span className="hero-wordmark-studio" aria-hidden="true">STUDIO</span>
        </h2>
      </div>
      <p className="hero-scroll-hint absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-xs tracking-[0.16em]">
        {heroCopy.scrollHint}
      </p>
    </div>
  );
}
