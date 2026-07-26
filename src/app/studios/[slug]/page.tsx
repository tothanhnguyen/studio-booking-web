import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { ServiceCard } from "@/features/service/presentation/service-card";
import { listPublicRooms } from "@/features/studio-room/application/list-public-rooms";
import { RoomVisual } from "@/features/studio-room/presentation/room-visual";

export const dynamic = "force-dynamic";

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

  return (
    <section aria-labelledby="room-heading" className="room-portal">
      <div className="room-portal__opening">
        <PageHeading
          description={room.description ?? "Không gian sáng tạo tại MowStudio."}
          eyebrow="Studio"
          headingId="room-heading"
          size="large"
          title={room.name}
        />
        <RoomVisual
          alt={`${room.name} tại MowStudio`}
          className="room-portal__visual"
          priority
          slug={room.slug}
        />
      </div>
      <div aria-label="Thông tin phòng" className="facts-rail room-portal__facts">
        <div>
          <span className="page-eyebrow">Dịch vụ</span>
          <strong className="type-mono">
            {room.services.length} dịch vụ đang mở
          </strong>
        </div>
      </div>
      <section aria-labelledby="room-services-heading" className="room-portal__services">
        <h2 id="room-services-heading">Dịch vụ tại phòng này</h2>
        {room.services.length > 0 ? (
          <div className="service-list">
            {room.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="Phòng này chưa có dịch vụ đang mở."
            title="Chưa có dịch vụ đang mở"
          />
        )}
      </section>
    </section>
  );
}
