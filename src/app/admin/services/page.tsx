import { setServiceActiveAction } from "@/app/admin/services/actions";
import { actionClassName } from "@/components/ui/action";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { ServiceForm } from "@/features/service/presentation/service-form";
import { PrismaServiceRepository } from "@/features/service/infrastructure/prisma-service-repository";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { prisma } from "@/lib/db/prisma";

export default async function AdminServicesPage() {
  const [rooms, services] = await Promise.all([
    new PrismaRoomRepository(prisma).listAll(),
    new PrismaServiceRepository(prisma).listAll(),
  ]);
  const roomOptions = rooms.map(({ id, name }) => ({ id, name }));

  return (
    <div className="console-view">
      <PageHeading description="Tạo dịch vụ mới hoặc cập nhật dịch vụ hiện có." eyebrow="Vận hành" title="Dịch vụ" />

      <section aria-labelledby="admin-services-new-heading" className="console-section">
        <SectionMarker index={1} label="Thêm dịch vụ" />
        <h2 className="sr-only" id="admin-services-new-heading">
          Thêm dịch vụ
        </h2>
        <div className="ui-surface">
          <ServiceForm rooms={roomOptions} />
        </div>
      </section>

      <section aria-labelledby="admin-services-list-heading" className="console-section">
        <SectionMarker index={2} label="Danh sách dịch vụ" />
        <h2 className="sr-only" id="admin-services-list-heading">
          Danh sách dịch vụ
        </h2>

        {services.length === 0 ? (
          <p className="console-empty-state">Chưa có dịch vụ nào.</p>
        ) : (
          <ul className="console-row-list">
            {services.map((service) => (
              <li className="console-row" key={service.id}>
                <details>
                  <summary className="console-catalog-summary">
                    <span className="console-row-primary">{service.name}</span>
                    <span className="type-mono console-row-secondary">{service.isActive ? "Đang hoạt động" : "Đang ẩn"}</span>
                  </summary>
                  <div className="console-catalog-edit">
                    <div className="console-actions-group">
                      <ServiceForm initialValue={{ ...service, currency: "VND" }} rooms={roomOptions} />
                    </div>
                    <div className="console-actions-group">
                      <form action={setServiceActiveAction.bind(null, service.id, !service.isActive)}>
                        <button className={actionClassName("secondary")} type="submit">
                          {service.isActive ? "Tạm ẩn dịch vụ" : "Mở lại dịch vụ"}
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
