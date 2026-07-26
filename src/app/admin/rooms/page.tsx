import { setRoomActiveAction } from "@/app/admin/rooms/actions";
import { actionClassName } from "@/components/ui/action";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { RoomForm } from "@/features/studio-room/presentation/room-form";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

export default async function AdminRoomsPage() {
  const rooms = await new PrismaRoomRepository(prisma).listAll();

  return (
    <div className="admin-view">
      <PageHeading description="Tạo phòng mới hoặc cập nhật phòng hiện có." eyebrow="Vận hành" title="Phòng studio" />

      <section aria-labelledby="admin-rooms-new-heading" className="admin-section">
        <SectionMarker index={1} label="Thêm phòng" />
        <h2 className="sr-only" id="admin-rooms-new-heading">
          Thêm phòng
        </h2>
        <div className="ui-surface">
          <RoomForm />
        </div>
      </section>

      <section aria-labelledby="admin-rooms-list-heading" className="admin-section">
        <SectionMarker index={2} label="Danh sách phòng" />
        <h2 className="sr-only" id="admin-rooms-list-heading">
          Danh sách phòng
        </h2>

        {rooms.length === 0 ? (
          <p className="admin-empty-state">Chưa có phòng nào.</p>
        ) : (
          <ul className="admin-row-list">
            {rooms.map((room) => (
              <li className="admin-row" key={room.id}>
                <details open>
                  <summary className="admin-catalog-summary">
                    <span className="admin-row-primary">{room.name}</span>
                    <span className="type-mono admin-row-secondary">{room.isActive ? "Đang hoạt động" : "Đang ẩn"}</span>
                  </summary>
                  <div className="admin-catalog-edit">
                    <div className="admin-actions-group">
                      <RoomForm initialValue={{ ...room, timezone: "Asia/Ho_Chi_Minh" }} />
                    </div>
                    <div className="admin-actions-group">
                      <form action={setRoomActiveAction.bind(null, room.id, !room.isActive)}>
                        <button className={actionClassName("secondary")} type="submit">
                          {room.isActive ? "Tạm ẩn phòng" : "Mở lại phòng"}
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
