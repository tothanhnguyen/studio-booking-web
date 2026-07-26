import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { FolioLabel } from "@/components/ui/folio-label";
import { LedStatus } from "@/components/ui/led-status";
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
    <section aria-labelledby="service-heading" className="proof-service-page page-grain">
      <FolioLabel text="MOW · PROOF 03/03 — SERVICE" />
      <div className="proof-service-heading">
        <SectionMarker index={1} label="Dịch vụ" />
        <h1 className="display-lg" id="service-heading">
          {service.name}
        </h1>
      </div>

      <aside aria-labelledby="rate-heading" className="proof-service-rate-card ui-surface">
        <p className="proof-annotation">
          <span>THÔNG SỐ KỸ THUẬT</span>
          <span>SPEC</span>
        </p>
        <h2 id="rate-heading">Chi tiết buổi làm việc</h2>
        <dl className="proof-service-rate-card__list">
          <div className="proof-service-rate-card__row">
            <dt>Giá trọn gói</dt>
            <dd className="type-mono proof-service-rate-card__price">
              {vndFormatter.format(service.priceAmount)}
            </dd>
          </div>
          <div className="proof-service-rate-card__row">
            <dt>Thời lượng</dt>
            <dd className="type-mono">{service.durationMinutes} phút</dd>
          </div>
          <div className="proof-service-rate-card__row">
            <dt>Thời gian đệm</dt>
            <dd className="type-mono">{service.bufferMinutes} phút</dd>
          </div>
        </dl>
        <p className="proof-service-rate-card__deposit">Cọc 30% khi giữ lịch</p>
        <Link className={actionClassName("primary")} href={`/booking/${service.id}`}>
          <LedStatus label="Đặt lịch dịch vụ này" tone="record" />
        </Link>
      </aside>

      <div className="proof-service-body">
        <p className="page-description">
          {service.description ??
            "Dịch vụ studio được chuẩn bị cho buổi sáng tạo tập trung và hiệu quả."}
        </p>
        {room ? (
          <Link className="proof-service-room-link" href={`/studios/${room.slug}`}>
            Xem không gian {room.name}
          </Link>
        ) : null}

        <div className="proof-service-explainer">
          <SectionMarker index={2} label="Hình thức" />
          <h2>{bookingTypeLabel}</h2>
          <p>{bookingTypeDescription}</p>
        </div>

        <div className="proof-service-explainer">
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
