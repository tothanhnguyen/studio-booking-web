import { ScheduleEditor } from "@/features/availability/presentation/schedule-editor";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSchedulePage() {
  const rooms = (await new PrismaRoomRepository(prisma).listAll()).map(({ id, name }) => ({ id, name }));
  return <section><h1 className="text-3xl font-semibold">Lịch studio</h1><p className="mt-3 mb-7 text-stone-300">Thiết lập giờ mở cửa và các khoảng tạm ngưng theo giờ Việt Nam.</p><ScheduleEditor rooms={rooms} /></section>;
}
