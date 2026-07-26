import Link from "next/link";

import { actionClassName } from "@/components/ui/action";
import { ParallaxFrame } from "@/components/ui/parallax-frame";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionMarker } from "@/components/ui/section-marker";
import type { PublicRoom } from "@/features/studio-room/application/list-public-rooms";

import { RoomVisual } from "./room-visual";

type RoomCardProps = Readonly<{
  room: PublicRoom;
  index: number;
}>;

export function RoomCard({ room, index }: RoomCardProps) {
  return (
    <article
      className="studio-index-row"
      data-align={index % 2 === 0 ? "right" : "left"}
      data-room-slug={room.slug}
    >
      <ParallaxFrame className="studio-index-row__visual">
        <RoomVisual
          alt={`${room.name} tại MowStudio`}
          priority={index === 1}
          slug={room.slug}
          variant="hero"
        />
      </ParallaxFrame>
      <ScrollReveal className="studio-index-row__copy">
        <SectionMarker index={index} label="Phòng" />
        <h2 className="display-lg">{room.name}</h2>
        <p className="studio-index-row__description">
          {room.description ?? "Không gian sáng tạo tại MowStudio."}
        </p>
        <p className="studio-index-row__meta">{room.services.length} dịch vụ</p>
        <Link
          aria-label={`Khám phá ${room.name}`}
          className={actionClassName("secondary")}
          href={`/studios/${room.slug}`}
        >
          Khám phá phòng
        </Link>
      </ScrollReveal>
    </article>
  );
}
