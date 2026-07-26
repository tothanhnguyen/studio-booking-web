import Link from "next/link";

import { actionClassName } from "@/components/ui/action";
import type { PublicRoom } from "@/features/studio-room/application/list-public-rooms";

import { RoomVisual } from "./room-visual";

type RoomCardProps = Readonly<{
  room: PublicRoom;
  visualPriority?: boolean;
}>;

export function RoomCard({ room, visualPriority = false }: RoomCardProps) {
  return (
    <article className="room-atlas-row" data-room-slug={room.slug}>
      <RoomVisual
        alt={`${room.name} tại MowStudio`}
        priority={visualPriority}
        slug={room.slug}
      />
      <div className="room-atlas-row__copy">
        <p className="room-atlas-row__meta">{room.services.length} dịch vụ</p>
        <h2>{room.name}</h2>
        <p className="room-atlas-row__description">
          {room.description ?? "Không gian sáng tạo tại MowStudio."}
        </p>
        <Link
          aria-label={`Khám phá ${room.name}`}
          className={actionClassName("secondary")}
          href={`/studios/${room.slug}`}
        >
          Khám phá phòng
        </Link>
      </div>
    </article>
  );
}
