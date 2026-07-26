import type { Metadata } from "next";

import { Marquee } from "@/components/ui/marquee";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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
    <section
      aria-labelledby="studios-heading"
      className="studios-atlas page-grain"
    >
      <ScrollReveal>
        <header className="studio-index-intro">
          <p className="page-eyebrow">Không gian</p>
          <h1 className="display-xl" id="studios-heading">
            Chọn studio phù hợp với ý tưởng của bạn
          </h1>
          <p className="page-description">
            Ba không gian chuyên biệt, lịch làm việc rõ ràng và dịch vụ được
            thiết kế cho từng nhu cầu.
          </p>
        </header>
      </ScrollReveal>
      <Marquee
        items={["Photo Studio", "Podcast Booth", "Music Studio", "Đặt lịch", "MowStudio"]}
      />
      {rooms.length > 0 ? (
        <div className="studio-index-list">
          {rooms.map((room, index) => (
            <RoomCard index={index + 1} key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="studio-index-empty">
          Hiện chưa có phòng studio đang hoạt động. Vui lòng quay lại sau.
        </p>
      )}
    </section>
  );
}
