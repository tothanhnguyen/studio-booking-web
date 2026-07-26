import { notFound } from "next/navigation";

import { BookingWizard } from "@/features/booking/presentation/booking-wizard";
import { PrismaServiceRepository } from "@/features/service/infrastructure/prisma-service-repository";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const service = await new PrismaServiceRepository(prisma).findActiveById((await params).id);
  if (!service) notFound();

  return (
    <section aria-labelledby="booking-heading" className="booking-page">
      <p className="page-eyebrow">Đặt lịch</p>
      <h1 id="booking-heading">{service.name}</h1>
      <BookingWizard
        durationMinutes={service.durationMinutes}
        priceAmount={service.priceAmount}
        serviceId={service.id}
        serviceName={service.name}
      />
    </section>
  );
}
