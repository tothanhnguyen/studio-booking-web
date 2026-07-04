import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <section aria-labelledby="service-heading" className="mx-auto max-w-3xl">
      <p className="text-sm uppercase tracking-[0.24em] text-amber-300">
        {service.bookingType === "ASSISTED" ? "Dịch vụ có hỗ trợ" : "Thuê phòng"}
      </p>
      <h1 id="service-heading" className="mt-3 text-4xl font-semibold sm:text-5xl">{service.name}</h1>
      <p className="mt-5 text-lg leading-8 text-stone-300">
        {service.description ?? "Dịch vụ studio được chuẩn bị cho buổi sáng tạo tập trung và hiệu quả."}
      </p>
      <dl className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-3">
        <div><dt className="text-sm text-stone-400">Thời lượng</dt><dd className="mt-1 font-semibold">{service.durationMinutes} phút</dd></div>
        <div><dt className="text-sm text-stone-400">Thời gian đệm</dt><dd className="mt-1 font-semibold">{service.bufferMinutes} phút</dd></div>
        <div><dt className="text-sm text-stone-400">Giá</dt><dd className="mt-1 font-semibold">{vndFormatter.format(service.priceAmount)}</dd></div>
      </dl>
      <Link
        className="mt-8 inline-flex rounded-full bg-amber-300 px-6 py-3 font-semibold text-stone-950 hover:bg-amber-200"
        href={`/booking/${service.id}`}
      >
        Đặt lịch dịch vụ này
      </Link>
    </section>
  );
}
