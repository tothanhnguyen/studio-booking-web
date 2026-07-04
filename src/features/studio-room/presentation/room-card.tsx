import Link from "next/link";

import type { PublicRoom } from "@/features/studio-room/application/list-public-rooms";

export function RoomCard({ room }: Readonly<{ room: PublicRoom }>) {
  return (
    <article className="rounded-3xl border border-white/10 bg-stone-900 p-6">
      <p className="text-sm text-amber-300">{room.services.length} dịch vụ</p>
      <h2 className="mt-2 text-2xl font-semibold">{room.name}</h2>
      <p className="mt-3 min-h-12 leading-7 text-stone-300">
        {room.description ?? "Không gian sáng tạo tại MowStudio."}
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-300"
        href={`/studios/${room.slug}`}
      >
        Khám phá phòng
      </Link>
    </article>
  );
}
