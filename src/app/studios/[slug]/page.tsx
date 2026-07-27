import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { CropFrame } from "@/components/ui/crop-frame";
import { EmptyState } from "@/components/ui/empty-state";
import { FolioLabel } from "@/components/ui/folio-label";
import { GhostIndex } from "@/components/ui/ghost-index";
import { LedStatus } from "@/components/ui/led-status";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { listPublicRooms } from "@/features/studio-room/application/list-public-rooms";
import { RoomVisual } from "@/features/studio-room/presentation/room-visual";
import { ServiceCard } from "@/features/service/presentation/service-card";

export const dynamic = "force-dynamic";

const roomMaterialLabels: Record<string, string> = {
  "photo-studio": "Phòng chụp ảnh",
  "voice-podcast-booth": "Phòng thu podcast",
  "music-studio": "Phòng thu âm nhạc",
};

const STAGGER_STEP_MS = 80;
const STAGGER_CAP_MS = 240;

type RoomPageProps = Readonly<{ params: Promise<{ slug: string }> }>;

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = (await listPublicRooms()).find((item) => item.slug === slug);
  return { title: room ? `${room.name} | MowStudio` : "Không tìm thấy studio | MowStudio" };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  const rooms = await listPublicRooms();
  const room = rooms.find((item) => item.slug === slug);
  if (!room) notFound();

  const roomIndex = rooms.findIndex((item) => item.slug === slug) + 1;
  const materialLabel = roomMaterialLabels[room.slug] ?? "Không gian studio";
  const firstService = room.services[0];

  return (
    <section aria-labelledby="room-heading" className="proof-room-page page-grain">
      <div aria-hidden="true" className="proof-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <span className="proof-grid__col" key={index} />
        ))}
      </div>
      <FolioLabel text={`MOW · PROOF 02/03 — ${materialLabel.toUpperCase()}`} />

      <div className="proof-room-hero">
        <div className="proof-room-hero__frame-wrap">
          <GhostIndex index={roomIndex} />
          <CropFrame className="proof-room-hero__frame">
            <RoomVisual
              alt={`${room.name} tại MowStudio`}
              className="proof-room-hero__visual"
              priority
              slug={room.slug}
              variant="hero"
            />
            <span aria-hidden="true" className="proof-room-hero__scrim" />
            <div className="proof-room-hero__overlay">
              <p className="proof-room-hero__eyebrow type-mono">
                KHUNG {String(roomIndex).padStart(2, "0")} — {materialLabel.toUpperCase()}
              </p>
              <h1 className="display-lg" id="room-heading">
                {room.name}
              </h1>
            </div>
          </CropFrame>
        </div>
        <p className="proof-annotation">
          <span>SHOT ON MOW LAB</span>
          <LedStatus label="SẴN SÀNG NHẬN LỊCH" tone="success" />
        </p>
      </div>

      <div className="proof-room-body">
        <aside aria-label="Thông tin phòng" className="proof-room-spec">
          <p className="proof-annotation">
            <span>THÔNG SỐ</span>
            <span>SPEC</span>
          </p>
          <dl className="proof-room-spec__list">
            <div className="proof-room-spec__row">
              <dt>Không gian</dt>
              <dd>{materialLabel}</dd>
            </div>
            <div className="proof-room-spec__row">
              <dt>Múi giờ</dt>
              <dd className="type-mono">{room.timezone}</dd>
            </div>
            <div className="proof-room-spec__row">
              <dt>Dịch vụ đang mở</dt>
              <dd className="type-mono">{room.services.length} dịch vụ</dd>
            </div>
          </dl>
          <p className="proof-room-spec__description">
            {room.description ?? "Không gian sáng tạo tại MowStudio."}
          </p>
          {firstService ? (
            <Link
              className={`${actionClassName("primary")} proof-room-spec__cta`}
              href={`/booking/${firstService.id}`}
            >
              <LedStatus label={`Đặt lịch ${firstService.name}`} tone="record" />
            </Link>
          ) : null}
        </aside>

        <section aria-labelledby="room-services-heading" className="proof-room-services">
          <p className="proof-annotation">
            <span>DỊCH VỤ ĐI KÈM — SESSION LOG</span>
            <span>{String(room.services.length).padStart(2, "0")} MỤC</span>
          </p>
          <h2 className="display-md" id="room-services-heading">
            Dịch vụ tại phòng này
          </h2>
          {room.services.length > 0 ? (
            <div className="proof-room-services__list">
              {room.services.map((service, index) => (
                <ScrollReveal
                  delayMs={Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS)}
                  key={service.id}
                >
                  <ServiceCard
                    index={index + 1}
                    service={service}
                    visual={{
                      slug: room.slug,
                      variant: index % 2 === 0 ? "detail-1" : "detail-2",
                    }}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Phòng này chưa có dịch vụ đang mở."
              title="Chưa có dịch vụ đang mở"
            />
          )}
        </section>
      </div>
    </section>
  );
}
