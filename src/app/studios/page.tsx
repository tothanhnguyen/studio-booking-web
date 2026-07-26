import type { Metadata } from "next";

import { PageHeading } from "@/components/ui/page-heading";
import { listPublicRooms } from "@/features/studio-room/application/list-public-rooms";
import { RoomCard } from "@/features/studio-room/presentation/room-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Không gian studio | MowStudio",
  description: "Khám phá các phòng chụp ảnh, podcast và thu âm tại MowStudio.",
};

export default async function StudiosPage() {
  const rooms = await listPublicRooms();

  return (
    <section aria-labelledby="studios-heading" className="studios-atlas">
      <PageHeading
        description="Ba không gian chuyên biệt, lịch làm việc rõ ràng và dịch vụ được thiết kế cho từng nhu cầu."
        eyebrow="Không gian"
        headingId="studios-heading"
        title="Chọn studio phù hợp với ý tưởng của bạn"
      />
      {rooms.length > 0 ? (
        <div className="room-atlas">
          {rooms.map((room, index) => (
            <RoomCard
              key={room.id}
              room={room}
              visualPriority={index === 0}
            />
          ))}
        </div>
      ) : (
        <p className="room-atlas__empty">
          Hiện chưa có phòng studio đang hoạt động. Vui lòng quay lại sau.
        </p>
      )}
    </section>
  );
}
