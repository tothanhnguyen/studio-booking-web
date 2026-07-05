import { notFound } from "next/navigation";

import { BookingWizard } from "@/features/booking/presentation/booking-wizard";
import { PrismaServiceRepository } from "@/features/service/infrastructure/prisma-service-repository";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const service = await new PrismaServiceRepository(prisma).findActiveById((await params).id);
  if (!service) notFound();
  return <section aria-labelledby="booking-heading" className="mx-auto max-w-4xl"><p className="text-sm uppercase tracking-[0.2em] text-amber-300">Đặt lịch</p><h1 id="booking-heading" className="mt-2 text-4xl font-semibold">{service.name}</h1><BookingWizard serviceId={service.id} serviceName={service.name} /></section>;
}
