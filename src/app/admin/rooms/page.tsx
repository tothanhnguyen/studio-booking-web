import { setRoomActiveAction } from "@/app/admin/rooms/actions";
import { RoomForm } from "@/features/studio-room/presentation/room-form";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

export default async function AdminRoomsPage() {
  const rooms = await new PrismaRoomRepository(prisma).listAll();
  return <section><h1 className="text-3xl font-semibold">Phòng studio</h1><h2 className="mt-7 text-xl font-semibold">Thêm phòng</h2><div className="mt-3"><RoomForm /></div><h2 className="mt-10 text-xl font-semibold">Danh sách phòng</h2><div className="mt-4 grid gap-5">{rooms.map((room) => <div key={room.id}><RoomForm initialValue={{ ...room, timezone: "Asia/Ho_Chi_Minh" }} /><form action={setRoomActiveAction.bind(null, room.id, !room.isActive)} className="mt-2"><button className="text-sm text-amber-300">{room.isActive ? "Tạm ẩn phòng" : "Mở lại phòng"}</button></form></div>)}</div></section>;
}
