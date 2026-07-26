import Link from "next/link";

import { heroCopy } from "./hero-copy";
import { RoomIcon } from "./room-icon";

export function HeroMainState() {
  return (
    <div className="hero-state hero-state-main" data-hero-state="main">
      <div className="hero-copy-panel relative z-20 max-w-2xl" data-hero-state-content>
        <p className="hero-eyebrow mb-5 text-sm font-medium sm:text-base">{heroCopy.eyebrow}</p>
        <h1
          className="hero-heading max-w-[11ch] text-5xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-7xl md:text-[clamp(3.5rem,7.4vh,5rem)]"
          id="home-hero-title"
        >
          {heroCopy.headline}
        </h1>
        <p className="hero-body-copy mt-6 max-w-xl text-lg leading-8 sm:text-xl sm:leading-9">
          {heroCopy.subcopy}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link className="hero-primary-action" href={heroCopy.primaryCta.href}>
            {heroCopy.primaryCta.label}<span className="ml-8 text-2xl" aria-hidden="true">→</span>
          </Link>
          <Link className="hero-secondary-action" href={heroCopy.secondaryCta.href}>
            {heroCopy.secondaryCta.label}
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap gap-3" aria-label="Không gian nổi bật">
          {heroCopy.highlights.map((highlight) => (
            <li className="hero-chip" key={highlight}>
              <span className="h-5 w-5"><RoomIcon room={highlight} /></span>{highlight}
            </li>
          ))}
        </ul>
        <ul className="hero-proof mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base" aria-label="Điểm nổi bật">
          {heroCopy.proof.map((item) => (
            <li className="flex items-center gap-3" key={item}>
              <span className="hero-proof-dot h-1 w-1 rounded-full" aria-hidden="true" />{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
