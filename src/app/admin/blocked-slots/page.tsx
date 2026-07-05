import { deleteBlockedSlotAction } from "@/app/admin/blocked-slots/actions";
import { PrismaScheduleRepository } from "@/features/availability/infrastructure/prisma-schedule-repository";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function BlockedSlotsPage() {
  const [slots, rooms] = await Promise.all([new PrismaScheduleRepository(prisma).listBlockedSlots(), new PrismaRoomRepository(prisma).listAll()]);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  return <section><h1 className="text-3xl font-semibold">Khung giờ bị chặn</h1><p className="mt-3 text-stone-300">Tạo block mới tại trang Lịch studio.</p><div className="mt-7 grid gap-3">{slots.length ? slots.map((slot) => <article key={slot.id} className="rounded-2xl border border-white/10 p-4"><h2 className="font-semibold">{roomNames.get(slot.roomId)}</h2><p className="text-sm text-stone-300">{formatter.format(new Date(slot.startTime))} – {formatter.format(new Date(slot.endTime))}</p><p>{slot.reason}</p><form className="mt-2" action={deleteBlockedSlotAction.bind(null, slot.id)}><button className="text-sm text-red-300">Xóa block</button></form></article>) : <p>Chưa có khung giờ bị chặn.</p>}</div></section>;
}
