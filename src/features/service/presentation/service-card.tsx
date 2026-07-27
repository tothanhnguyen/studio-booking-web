import Link from "next/link";

import { actionClassName } from "@/components/ui/action";
import type { ServiceRecord } from "@/features/service/application/service-repository";
import { RoomVisual } from "@/features/studio-room/presentation/room-visual";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export type ServiceCardProps = Readonly<{
  service: ServiceRecord;
  index: number;
  visual?: { slug: string; variant: "detail-1" | "detail-2" };
}>;

export function ServiceCard({ index, service, visual }: ServiceCardProps) {
  return (
    <article className="service-row log-row">
      <p className="log-row__index type-mono">{String(index).padStart(2, "0")}</p>
      <header className="service-row__identity">
        <p className="page-eyebrow">
          {service.bookingType === "ASSISTED" ? "Có hỗ trợ" : "Chỉ thuê phòng"}
        </p>
        <h3>{service.name}</h3>
        <p className="service-row__description">
          {service.description ?? `${service.durationMinutes} phút sử dụng studio.`}
        </p>
      </header>
      <div className="service-row__details">
        <p className="type-mono service-row__duration">{service.durationMinutes} phút</p>
        <p className="type-mono service-row__price">
          {vndFormatter.format(service.priceAmount)}
        </p>
        <Link
          className={actionClassName("secondary", true)}
          href={`/services/${service.slug}`}
        >
          Xem dịch vụ
        </Link>
      </div>
      {visual ? (
        <div className="service-row__thumb">
          <RoomVisual
            alt=""
            className="service-row__thumb-image"
            slug={visual.slug}
            variant={visual.variant}
          />
        </div>
      ) : null}
    </article>
  );
}
