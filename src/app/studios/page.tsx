import type { Metadata } from "next";

import { FilmStrip } from "@/components/ui/film-strip";
import { FolioLabel } from "@/components/ui/folio-label";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { listPublicRooms } from "@/features/studio-room/application/list-public-rooms";
import { RoomCard } from "@/features/studio-room/presentation/room-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Không gian studio | MowStudio",
  description: "Khám phá các phòng chụp ảnh, podcast và thu âm tại MowStudio.",
};

const filmStripItems = [
  { alt: "Chi tiết ánh sáng — Photo Studio", src: "/media/rooms/photo-studio-detail-1.webp" },
  { alt: "Chi tiết phông nền — Photo Studio", src: "/media/rooms/photo-studio-detail-2.webp" },
  { alt: "Chi tiết bàn mix — Music Studio", src: "/media/rooms/music-studio-detail-1.webp" },
  { alt: "Chi tiết vocal booth — Music Studio", src: "/media/rooms/music-studio-detail-2.webp" },
  {
    alt: "Chi tiết ghế thu — Voice & Podcast Booth",
    src: "/media/rooms/voice-podcast-booth-detail-1.webp",
  },
  {
    alt: "Chi tiết bảng điều khiển — Voice & Podcast Booth",
    src: "/media/rooms/voice-podcast-booth-detail-2.webp",
  },
] as const;

export default async function StudiosPage() {
  const rooms = await listPublicRooms();

  return (
    <section aria-labelledby="studios-heading" className="proof-studios-page page-grain">
      <FolioLabel text="MOW · PROOF 01/03" />
      <ScrollReveal>
        <header className="proof-studios-header">
          <p className="page-eyebrow">Không gian</p>
          <h1 className="display-xl" id="studios-heading">
            Studios
          </h1>
          <p className="page-description">
            Ba không gian được ghi hình, đo đạc và lưu trữ như tư liệu phòng tối — chọn khung hình
            phù hợp với buổi ghi của bạn.
          </p>
        </header>
      </ScrollReveal>
      {rooms.length > 0 ? (
        <div className="proof-contact-sheet">
          {rooms.map((room, index) => (
            <RoomCard index={index + 1} key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="studio-index-empty">
          Hiện chưa có phòng studio đang hoạt động. Vui lòng quay lại sau.
        </p>
      )}
      {rooms.length > 0 ? (
        <section aria-label="Chi tiết bổ sung" className="proof-filmstrip-section">
          <p className="proof-annotation">
            <span>GÓC CẬN CẢNH</span>
            <span>{String(filmStripItems.length).padStart(2, "0")} KHUNG</span>
          </p>
          <FilmStrip items={filmStripItems} />
        </section>
      ) : null}
    </section>
  );
}
