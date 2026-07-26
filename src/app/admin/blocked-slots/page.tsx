import { deleteBlockedSlotAction } from "@/app/admin/blocked-slots/actions";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { PrismaScheduleRepository } from "@/features/availability/infrastructure/prisma-schedule-repository";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function BlockedSlotsPage() {
  const [slots, rooms] = await Promise.all([new PrismaScheduleRepository(prisma).listBlockedSlots(), new PrismaRoomRepository(prisma).listAll()]);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));

  return (
    <div className="admin-view">
      <PageHeading description="Tạo block mới tại trang Lịch studio." eyebrow="Vận hành" title="Khung giờ bị chặn" />

      <section aria-labelledby="admin-blocked-slots-heading" className="admin-section">
        <SectionMarker index={1} label="Danh sách khung giờ bị chặn" />
        <h2 className="sr-only" id="admin-blocked-slots-heading">Danh sách khung giờ bị chặn</h2>

        {slots.length === 0 ? (
          <p className="admin-empty-state">Chưa có khung giờ bị chặn.</p>
        ) : (
          <ul className="admin-blocked-list">
            {slots.map((slot) => (
              <li key={slot.id}>
                <article className="admin-blocked-row">
                  <div>
                    <p className="admin-blocked-room">{roomNames.get(slot.roomId)}</p>
                    <p className="admin-blocked-reason">{slot.reason}</p>
                  </div>
                  <p className="type-mono admin-blocked-time">
                    {formatter.format(new Date(slot.startTime))} – {formatter.format(new Date(slot.endTime))}
                  </p>
                  <form action={deleteBlockedSlotAction.bind(null, slot.id)}>
                    <button className="admin-text-action admin-text-action--danger" type="submit">Xóa block</button>
                  </form>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
