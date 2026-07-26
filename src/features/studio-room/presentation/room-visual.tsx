import Image from "next/image";

export type RoomMaterial = "photo" | "podcast" | "music";

export type RoomVisualProps = Readonly<{
  slug: string;
  alt: string;
  priority?: boolean;
  className?: string;
}>;

const roomVisuals = {
  "photo-studio": {
    src: "/media/rooms/photo-studio.webp",
    material: "photo",
  },
  "voice-podcast-booth": {
    src: "/media/rooms/voice-podcast-booth.webp",
    material: "podcast",
  },
  "music-studio": {
    src: "/media/rooms/music-studio.webp",
    material: "music",
  },
} as const satisfies Record<string, { src: string; material: RoomMaterial }>;

const fallbackVisual = {
  src: "/media/hero-capsules-poster.webp",
  material: "podcast",
} as const;

export function RoomVisual({
  slug,
  alt,
  priority,
  className,
}: RoomVisualProps) {
  const visual =
    roomVisuals[slug as keyof typeof roomVisuals] ?? fallbackVisual;
  const classes = ["room-visual", className].filter(Boolean).join(" ");

  return (
    <figure
      className={classes}
      data-room-material={visual.material}
      data-testid="room-visual"
    >
      <Image
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 44vw, 100vw"
        src={visual.src}
      />
    </figure>
  );
}
