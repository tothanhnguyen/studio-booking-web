import { setServiceActiveAction } from "@/app/admin/services/actions";
import { ServiceForm } from "@/features/service/presentation/service-form";
import { PrismaServiceRepository } from "@/features/service/infrastructure/prisma-service-repository";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

export default async function AdminServicesPage() {
  const [rooms, services] = await Promise.all([new PrismaRoomRepository(prisma).listAll(), new PrismaServiceRepository(prisma).listAll()]);
  const roomOptions = rooms.map(({ id, name }) => ({ id, name }));
  return <section><h1 className="text-3xl font-semibold">Dịch vụ</h1><h2 className="mt-7 text-xl font-semibold">Thêm dịch vụ</h2><div className="mt-3"><ServiceForm rooms={roomOptions} /></div><h2 className="mt-10 text-xl font-semibold">Danh sách dịch vụ</h2><div className="mt-4 grid gap-5">{services.map((service) => <div key={service.id}><ServiceForm rooms={roomOptions} initialValue={{ ...service, currency: "VND" }} /><form action={setServiceActiveAction.bind(null, service.id, !service.isActive)} className="mt-2"><button className="text-sm text-amber-300">{service.isActive ? "Tạm ẩn dịch vụ" : "Mở lại dịch vụ"}</button></form></div>)}</div></section>;
}
