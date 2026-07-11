"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getHeroState, HERO_SNAP_POINTS } from "./hero-scroll-state";
import { useHeroMediaPreferences } from "./use-hero-media-preferences";

export function HeroTextMotion({ sectionId }: Readonly<{ sectionId: string }>) {
  const preferences = useHeroMediaPreferences();

  useEffect(() => {
    if (!preferences.isReady || !preferences.isDesktop || preferences.prefersReducedMotion) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const brand = section.querySelector("[data-hero-state='brand']");
      const main = section.querySelector("[data-hero-state='main']");
      const rooms = section.querySelector("[data-hero-state='rooms']");
      const roomItems = section.querySelectorAll("[data-hero-room-item]");
      const visual = section.querySelector("[data-hero-visual]");
      if (!brand || !main || !rooms || !visual) return;

      gsap.set(brand, { autoAlpha: 1, pointerEvents: "none" });
      gsap.set(main, { autoAlpha: 0, y: 24, filter: "blur(7px)", pointerEvents: "none" });
      gsap.set(rooms, { autoAlpha: 0, y: 24, filter: "blur(7px)", pointerEvents: "none" });
      gsap.set(roomItems, { autoAlpha: 0, y: 14 });
      gsap.set(visual, { scale: 0.94, transformOrigin: "55% 50%" });

      const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      timeline
        .to({}, { duration: 0.16 })
        .to(brand, { autoAlpha: 0, y: -20, filter: "blur(7px)", duration: 0.08 }, 0.16)
        .to(main, { autoAlpha: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto", duration: 0.1 }, 0.22)
        .to(visual, { scale: 1, duration: 0.18 }, 0.18)
        .to({}, { duration: 0.32 })
        .to(main, { autoAlpha: 0, y: -18, filter: "blur(6px)", pointerEvents: "none", duration: 0.08 }, 0.64)
        .to(rooms, { autoAlpha: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto", duration: 0.09 }, 0.71)
        .to(roomItems, { autoAlpha: 1, y: 0, duration: 0.07, stagger: 0.018 }, 0.74)
        .to(visual, { scale: 1.035, duration: 0.2 }, 0.7)
        .to({}, { duration: 0.12 });

      ScrollTrigger.create({
        animation: timeline,
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
        snap: {
          snapTo: (value) => gsap.utils.snap([...HERO_SNAP_POINTS], value),
          delay: 0.12,
          duration: { min: 0.2, max: 0.5 },
          ease: "power2.out",
          inertia: false,
        },
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          section.dataset.activeHeroState = getHeroState(progress);
        },
      });
      section.dataset.activeHeroState = "brand";
    }, section);

    return () => context.revert();
  }, [preferences.isDesktop, preferences.isReady, preferences.prefersReducedMotion, sectionId]);

  return null;
}
