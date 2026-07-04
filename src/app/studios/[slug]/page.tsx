import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceCard } from "@/features/service/presentation/service-card";
import { listPublicRooms } from "@/features/studio-room/application/list-public-rooms";

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
    <section aria-labelledby="room-heading">
      <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Studio</p>
      <h1 id="room-heading" className="mt-3 text-4xl font-semibold sm:text-5xl">{room.name}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-300">
        {room.description ?? "Không gian sáng tạo tại MowStudio."}
      </p>
      <h2 className="mt-12 text-2xl font-semibold">Dịch vụ tại phòng này</h2>
      {room.services.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {room.services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      ) : (
        <p className="mt-5 text-stone-300">Phòng này chưa có dịch vụ đang mở.</p>
      )}
    </section>
  );
}
