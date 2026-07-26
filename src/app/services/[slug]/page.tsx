import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { PageHeading } from "@/components/ui/page-heading";
import { getPublicServiceBySlug } from "@/features/service/application/get-public-service";

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
  const service = await getPublicServiceBySlug((await params).slug);
  if (!service) notFound();
  const bookingTypeLabel = service.bookingType === "ASSISTED" ? "Có hỗ trợ" : "Chỉ thuê phòng";
  const bookingTypeDescription = service.bookingType === "ASSISTED"
    ? "Dịch vụ này thuộc hình thức có hỗ trợ."
    : "Dịch vụ này thuộc hình thức chỉ thuê phòng.";

  return (
    <section aria-labelledby="service-heading" className="service-sheet">
      <div className="service-sheet__narrative">
        <PageHeading
          description={service.description ?? "Dịch vụ studio được chuẩn bị cho buổi sáng tạo tập trung và hiệu quả."}
          eyebrow={service.bookingType === "ASSISTED" ? "Dịch vụ có hỗ trợ" : "Thuê phòng"}
          headingId="service-heading"
          size="large"
          title={service.name}
        />
        <section aria-labelledby="booking-type-heading" className="service-sheet__context">
          <p className="page-eyebrow">Hình thức</p>
          <h2 id="booking-type-heading">{bookingTypeLabel}</h2>
          <p>{bookingTypeDescription}</p>
        </section>
      </div>
      <aside aria-labelledby="booking-heading" className="service-sheet__booking">
        <p className="page-eyebrow">Đặt lịch</p>
        <h2 id="booking-heading">Chi tiết buổi làm việc</h2>
        <dl>
          <div>
            <dt>Thời lượng</dt>
            <dd className="type-mono">{service.durationMinutes} phút</dd>
          </div>
          <div>
            <dt>Thời gian đệm</dt>
            <dd className="type-mono">{service.bufferMinutes} phút</dd>
          </div>
          <div>
            <dt>Hình thức</dt>
            <dd>{bookingTypeLabel}</dd>
          </div>
          <div>
            <dt>Giá trọn gói</dt>
            <dd className="type-mono service-sheet__price">
              {vndFormatter.format(service.priceAmount)}
            </dd>
          </div>
        </dl>
        <p className="service-sheet__deposit">Cọc 30% khi giữ lịch</p>
        <Link
          className={actionClassName("primary")}
          href={`/booking/${service.id}`}
        >
          Đặt lịch dịch vụ này
        </Link>
      </aside>
    </section>
  );
}
