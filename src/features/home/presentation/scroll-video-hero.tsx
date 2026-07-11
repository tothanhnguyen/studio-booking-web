import { HeroBrandState } from "./hero-brand-state";
import { HeroCanvasSequence } from "./hero-canvas-sequence";
import { HeroMainState } from "./hero-main-state";
import { HeroRoomSelector } from "./hero-room-selector";
import { HeroTextMotion } from "./hero-text-motion";

const HERO_SECTION_ID = "home-hero";

export function ScrollVideoHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative min-h-[100svh] w-full overflow-clip bg-[#070807] font-sans md:min-h-[300vh] motion-reduce:min-h-[100svh]"
      data-scroll-canvas-section
      id={HERO_SECTION_ID}
    >
      <div className="relative min-h-[100svh] overflow-hidden md:sticky md:top-0 motion-reduce:relative">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-stage relative mx-auto min-h-[100svh] max-w-[92rem] px-6 pb-16 pt-24 sm:px-10 md:px-12 md:py-0 lg:px-16">
          <HeroBrandState />
          <HeroMainState />

          <div className="hero-visual-blend hero-visual relative z-10 aspect-[4/3] w-full" data-hero-visual>
            <HeroCanvasSequence />
            {(["photo", "podcast", "music"] as const).map((room) => (
              <span aria-hidden="true" className="hero-room-highlight" data-room-highlight={room} key={room} />
            ))}
          </div>

          <HeroRoomSelector />
        </div>
        <HeroTextMotion sectionId={HERO_SECTION_ID} />
      </div>
    </section>
  );
}
