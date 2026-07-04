import type { Metadata } from "next";

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
    <section aria-labelledby="studios-heading">
      <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Không gian</p>
      <h1 id="studios-heading" className="mt-3 text-4xl font-semibold sm:text-5xl">
        Chọn studio phù hợp với ý tưởng của bạn
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-300">
        Ba không gian chuyên biệt, lịch làm việc rõ ràng và dịch vụ được thiết kế cho từng nhu cầu.
      </p>
      {rooms.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-white/10 p-6 text-stone-300">
          Hiện chưa có phòng studio đang hoạt động. Vui lòng quay lại sau.
        </p>
      )}
    </section>
  );
}
