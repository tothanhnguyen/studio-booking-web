import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { ScheduleEditor } from "@/features/availability/presentation/schedule-editor";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSchedulePage() {
  const rooms = (await new PrismaRoomRepository(prisma).listAll()).map(({ id, name }) => ({ id, name }));
  return (
    <div className="console-view">
      <PageHeading description="Thiết lập giờ mở cửa và các khoảng tạm ngưng theo giờ Việt Nam." eyebrow="Vận hành" title="Lịch studio" />
      <section aria-labelledby="admin-schedule-heading" className="console-section">
        <SectionMarker index={1} label="Cấu hình lịch trình" />
        <h2 className="sr-only" id="admin-schedule-heading">Cấu hình lịch trình</h2>
        <ScheduleEditor rooms={rooms} />
      </section>
    </div>
  );
}
