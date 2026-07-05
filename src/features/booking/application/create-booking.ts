import { createBookingCommandSchema, type BookingCommandRepository, type CreatedBookingAccess } from "@/features/booking/application/booking-command";
import { createGuestToken } from "@/lib/security/guest-token";

type Dependencies = Readonly<{
  repository: BookingCommandRepository;
  tokenFactory: typeof createGuestToken;
  now: () => Date;
}>;

export function createBookingUseCase({ repository, tokenFactory, now }: Dependencies) {
  return async function createBooking(input: unknown): Promise<CreatedBookingAccess> {
    const command = createBookingCommandSchema.parse(input);
    const { rawToken, tokenHash } = tokenFactory();
    const created = await repository.createHold(command, tokenHash, now());
    return { ...created, guestToken: rawToken };
  };
}

export async function createBooking(input: unknown): Promise<CreatedBookingAccess> {
  const [{ PrismaBookingRepository }, { prisma }] = await Promise.all([
    import("@/features/booking/infrastructure/prisma-booking-repository"), import("@/lib/db/prisma"),
  ]);
  return createBookingUseCase({ repository: new PrismaBookingRepository(prisma), tokenFactory: createGuestToken, now: () => new Date() })(input);
}
