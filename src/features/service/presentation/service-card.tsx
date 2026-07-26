import Link from "next/link";

import { actionClassName } from "@/components/ui/action";
import type { ServiceRecord } from "@/features/service/application/service-repository";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function ServiceCard({ service }: Readonly<{ service: ServiceRecord }>) {
  return (
    <article className="service-row">
      <header className="service-row__identity">
        <p className="page-eyebrow">
          {service.bookingType === "ASSISTED" ? "Có hỗ trợ" : "Chỉ thuê phòng"}
        </p>
        <h3>{service.name}</h3>
      </header>
      <p className="service-row__description">
        {service.description ?? `${service.durationMinutes} phút sử dụng studio.`}
      </p>
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
    </article>
  );
}
