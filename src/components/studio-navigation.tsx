import Link from "next/link";

// Public room slugs must stay aligned with seed data and room image mappings.
export const studioLinks = [
  { href: "/studios/photo-studio", label: "Photo" },
  { href: "/studios/voice-podcast-booth", label: "Podcast" },
  { href: "/studios/music-studio", label: "Music" },
] as const;

export function StudioNavigationLinks() {
  return studioLinks.map((link) => (
    <Link href={link.href} key={link.href}>
      {link.label}
    </Link>
  ));
}
