"use client";

import { useEffect, useState } from "react";

type HeroMediaPreferences = Readonly<{
  isDesktop: boolean;
  isReady: boolean;
  prefersReducedMotion: boolean;
}>;

export function useHeroMediaPreferences(): HeroMediaPreferences {
  const [preferences, setPreferences] = useState<HeroMediaPreferences>({
    isDesktop: false,
    isReady: false,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPreferences({
        isDesktop: desktopQuery.matches,
        isReady: true,
        prefersReducedMotion: motionQuery.matches,
      });
    };

    update();
    desktopQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      desktopQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  return preferences;
}
