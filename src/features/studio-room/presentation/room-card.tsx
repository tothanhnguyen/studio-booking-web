import Link from "next/link";

import { CropFrame } from "@/components/ui/crop-frame";
import { LedStatus } from "@/components/ui/led-status";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { PublicRoom } from "@/features/studio-room/application/list-public-rooms";

import { RoomVisual } from "./room-visual";

type RoomCardProps = Readonly<{
  room: PublicRoom;
  index: number;
}>;

type RoomFrameMeta = Readonly<{
  material: string;
  spec: string;
}>;

const roomFrameMeta: Record<string, RoomFrameMeta> = {
  "photo-studio": {
    material: "Phòng chụp ảnh",
    spec: "Cyclorama trắng · 3 hệ đèn",
  },
  "voice-podcast-booth": {
    material: "Phòng thu podcast",
    spec: "Cách âm hoàn toàn · 4 mic thu",
  },
  "music-studio": {
    material: "Phòng thu âm nhạc",
    spec: "Bàn mix SSL · Cách âm -20dB",
  },
};

const fallbackFrameMeta: RoomFrameMeta = {
  material: "Không gian studio",
  spec: "Studio đa năng",
};

const STAGGER_STEP_MS = 80;
const STAGGER_CAP_MS = 240;

export function RoomCard({ room, index }: RoomCardProps) {
  const meta = roomFrameMeta[room.slug] ?? fallbackFrameMeta;
  const frameNumber = String(index).padStart(2, "0");

  return (
    <ScrollReveal delayMs={Math.min((index - 1) * STAGGER_STEP_MS, STAGGER_CAP_MS)}>
      <article className="proof-room-frame" data-room-slug={room.slug}>
        <p className="proof-annotation">
          <span>
            KHUNG {frameNumber} — {room.name.toUpperCase()}
          </span>
          <span>{meta.spec}</span>
        </p>
        <div className="proof-room-frame__media">
          <CropFrame>
            <RoomVisual
              alt={`${room.name} tại MowStudio`}
              priority={index === 1}
              slug={room.slug}
              variant="hero"
            />
          </CropFrame>
        </div>
        <p className="proof-annotation">
          <span>{meta.material}</span>
          {/* Static label until real availability data is wired in — never
              imply a live "recording" state we can't back with data. */}
          <LedStatus label="SẴN SÀNG" tone="success" />
        </p>
        <h2 className="proof-room-frame__title">{room.name}</h2>
        <p className="proof-room-frame__meta">{room.services.length} dịch vụ</p>
        <p className="proof-room-frame__description">
          {room.description ?? "Không gian sáng tạo tại MowStudio."}
        </p>
        <Link
          aria-label={`Khám phá ${room.name}`}
          className="proof-room-frame__cta"
          href={`/studios/${room.slug}`}
        >
          Xem chi tiết <span aria-hidden="true">→</span>
        </Link>
      </article>
    </ScrollReveal>
  );
}
