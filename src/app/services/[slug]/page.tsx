import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { SectionMarker } from "@/components/ui/section-marker";
import { getPublicServiceBySlug } from "@/features/service/application/get-public-service";
import { listPublicRooms } from "@/features/studio-room/application/list-public-rooms";

export const dynamic = "force-dynamic";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

type ServicePageProps = Readonly<{ params: Promise<{ slug: string }> }>;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await getPublicServiceBySlug((await params).slug);
  return { title: service ? `${service.name} | MowStudio` : "Không tìm thấy dịch vụ | MowStudio" };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, rooms] = await Promise.all([getPublicServiceBySlug(slug), listPublicRooms()]);
  if (!service) notFound();

  const room = rooms.find((room) => room.id === service.roomId);
  const bookingTypeLabel = service.bookingType === "ASSISTED" ? "Có hỗ trợ" : "Chỉ thuê phòng";
  const bookingTypeDescription = service.bookingType === "ASSISTED"
    ? "Dịch vụ này thuộc hình thức có hỗ trợ."
    : "Dịch vụ này thuộc hình thức chỉ thuê phòng.";

  return (
    <section aria-labelledby="service-heading" className="service-sheet page-grain">
      <div className="service-sheet-heading">
        <SectionMarker index={1} label="Dịch vụ" />
        <h1 className="display-lg" id="service-heading">
          {service.name}
        </h1>
      </div>

      <aside aria-labelledby="rate-heading" className="service-sheet-rate-card ui-surface">
        <p className="page-eyebrow">Đặt lịch</p>
        <h2 id="rate-heading">Chi tiết buổi làm việc</h2>
        <dl>
          <div>
            <dt>Giá trọn gói</dt>
            <dd className="type-mono service-sheet-price">
              {vndFormatter.format(service.priceAmount)}
            </dd>
          </div>
          <div>
            <dt>Thời lượng</dt>
            <dd className="type-mono">{service.durationMinutes} phút</dd>
          </div>
          <div>
            <dt>Thời gian đệm</dt>
            <dd className="type-mono">{service.bufferMinutes} phút</dd>
          </div>
        </dl>
        <p className="service-sheet-deposit">Cọc 30% khi giữ lịch</p>
        <Link className={actionClassName("primary")} href={`/booking/${service.id}`}>
          Đặt lịch dịch vụ này
        </Link>
      </aside>

      <div className="service-sheet-body">
        <p className="page-description">
          {service.description ?? "Dịch vụ studio được chuẩn bị cho buổi sáng tạo tập trung và hiệu quả."}
        </p>
        {room ? (
          <Link className="service-sheet-room-link" href={`/studios/${room.slug}`}>
            Xem không gian {room.name}
          </Link>
        ) : null}

        <div className="service-sheet-explainer">
          <SectionMarker index={2} label="Hình thức" />
          <h2>{bookingTypeLabel}</h2>
          <p>{bookingTypeDescription}</p>
        </div>

        <div className="service-sheet-explainer">
          <SectionMarker index={3} label="Thời gian đệm" />
          <h2>Chuẩn bị giữa các buổi</h2>
          <p>
            {service.bufferMinutes} phút thời gian đệm được giữ giữa các buổi để chuẩn bị lại
            không gian.
          </p>
        </div>
      </div>
    </section>
  );
}
