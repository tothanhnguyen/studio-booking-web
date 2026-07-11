"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { HeroFrameLoader } from "./hero-frame-loader";
import {
  HERO_POSTER_SRC,
  createFrameBatches,
  getFrameIndex,
  shouldUseCanvas,
} from "./hero-frame-sequence";
import { useHeroMediaPreferences } from "./use-hero-media-preferences";

const PRELOAD_BATCH_SIZE = 12;

function drawFrame(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(Math.round(bounds.width * pixelRatio), 1);
  const height = Math.max(Math.round(bounds.height * pixelRatio), 1);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export function HeroCanvasSequence() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentFrameRef = useRef(0);
  const preferences = useHeroMediaPreferences();
  const canvasEnabled =
    preferences.isReady &&
    shouldUseCanvas({
      isDesktop: preferences.isDesktop,
      prefersReducedMotion: preferences.prefersReducedMotion,
    });

  useEffect(() => {
    if (!canvasEnabled) {
      return;
    }

    const canvas = canvasRef.current;
    const section = canvas?.closest("[data-scroll-canvas-section]");
    if (!canvas || !(section instanceof HTMLElement)) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const loader = new HeroFrameLoader();
    let disposed = false;

    const renderFrame = (index: number) => {
      currentFrameRef.current = index;
      canvas.dataset.frameIndex = String(index);
      const available = loader.get(index) ?? loader.getNearest(index);
      if (available) {
        drawFrame(canvas, available);
      }

      void loader
        .load(index, "high")
        .then((frame) => {
          if (!disposed && currentFrameRef.current === index) {
            drawFrame(canvas, frame);
            canvas.classList.remove("opacity-0");
            canvas.classList.add("opacity-100");
          }
        })
        .catch(() => undefined);
    };

    const resizeObserver = new ResizeObserver(() => {
      const frame = loader.get(currentFrameRef.current) ?? loader.getNearest(currentFrameRef.current);
      if (frame) {
        drawFrame(canvas, frame);
      }
    });
    resizeObserver.observe(canvas);

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => renderFrame(getFrameIndex(self.progress)),
      });
    }, section);

    renderFrame(0);
    void loader.preloadProgressively(createFrameBatches(PRELOAD_BATCH_SIZE));

    return () => {
      disposed = true;
      context.revert();
      resizeObserver.disconnect();
      loader.dispose();
    };
  }, [canvasEnabled]);

  return (
    <div className="relative h-full w-full" data-hero-sequence>
      <Image
        alt="Ba không gian Photo, Podcast và Music của MowStudio"
        className="object-contain"
        fill
        priority
        sizes="(min-width: 768px) 56vw, 100vw"
        src={HERO_POSTER_SRC}
      />
      {canvasEnabled ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
          data-hero-canvas
        />
      ) : null}
    </div>
  );
}
