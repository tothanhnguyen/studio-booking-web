import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { EmptyState } from "@/components/ui/empty-state";
import { ParallaxFrame } from "@/components/ui/parallax-frame";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionMarker } from "@/components/ui/section-marker";
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
  const room = (await listPublicRooms()).find((item) => item.slug === slug);
  if (!room) notFound();

  const materialLabel = roomMaterialLabels[room.slug] ?? "Không gian studio";
  const firstService = room.services[0];

  return (
    <section aria-labelledby="room-heading" className="room-story page-grain">
      <div className="room-story-hero">
        <ParallaxFrame amplitude={12} className="room-story-hero-frame">
          <RoomVisual
            alt={`${room.name} tại MowStudio`}
            className="room-story-hero-visual"
            priority
            slug={room.slug}
            variant="hero"
          />
        </ParallaxFrame>
        <h1 className="display-xl room-story-title" id="room-heading">
          {room.name}
        </h1>
      </div>
      <p className="page-description room-story-description">
        {room.description ?? "Không gian sáng tạo tại MowStudio."}
      </p>
      <div aria-label="Thông tin phòng" className="facts-rail room-story-facts">
        <div>
          <span className="page-eyebrow">Dịch vụ</span>
          <strong className="type-mono">{room.services.length} dịch vụ đang mở</strong>
        </div>
        <div>
          <span className="page-eyebrow">Chất liệu</span>
          <strong className="type-mono">{materialLabel}</strong>
        </div>
      </div>
      <section aria-labelledby="room-services-heading" className="room-story-services">
        <h2 className="display-md" id="room-services-heading">
          Dịch vụ tại phòng này
        </h2>
        {room.services.length > 0 ? (
          <div className="room-story-service-list">
            {room.services.map((service, index) => (
              <ScrollReveal
                className="room-story-service-row"
                delayMs={Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS)}
                key={service.id}
              >
                <div
                  className="room-story-service"
                  data-align={index % 2 === 0 ? "left" : "right"}
                >
                  <RoomVisual
                    alt={`${service.name} tại ${room.name}`}
                    className="room-story-service-visual"
                    slug={room.slug}
                    variant={index % 2 === 0 ? "detail-1" : "detail-2"}
                  />
                  <ServiceCard service={service} />
                </div>
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
      {firstService ? (
        <ScrollReveal className="room-story-cta">
          <SectionMarker index={room.services.length + 1} label="Đặt lịch" />
          <Link className={actionClassName("primary")} href={`/booking/${firstService.id}`}>
            Đặt lịch {firstService.name}
          </Link>
        </ScrollReveal>
      ) : null}
    </section>
  );
}
