import Link from "next/link";

import type { ServiceRecord } from "@/features/service/application/service-repository";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function ServiceCard({ service }: Readonly<{ service: ServiceRecord }>) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
        {service.bookingType === "ASSISTED" ? "Có hỗ trợ" : "Chỉ thuê phòng"}
      </p>
      <h3 className="mt-2 text-xl font-semibold">{service.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-stone-300">
        {service.description ?? `${service.durationMinutes} phút sử dụng studio.`}
      </p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-400">{service.durationMinutes} phút</p>
          <p className="font-semibold text-stone-100">{vndFormatter.format(service.priceAmount)}</p>
        </div>
        <Link
          className="rounded-full border border-amber-300/60 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-300 hover:text-stone-950"
          href={`/services/${service.slug}`}
        >
          Xem dịch vụ
        </Link>
      </div>
    </article>
  );
}
