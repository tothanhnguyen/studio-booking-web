import { z } from "zod";

export const serviceInputSchema = z.object({
  id: z.uuid().optional(), roomId: z.uuid(),
  name: z.string().trim().min(2, "Tên dịch vụ phải có ít nhất 2 ký tự."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  description: z.string().trim().nullable().default(null),
  bookingType: z.enum(["ROOM_ONLY", "ASSISTED"]),
  durationMinutes: z.number().int().positive("Thời lượng phải lớn hơn 0."),
  bufferMinutes: z.number().int().nonnegative("Thời gian đệm không được âm."),
  priceAmount: z.number().int().positive("Giá phải là số nguyên dương."),
  currency: z.literal("VND").default("VND"), displayOrder: z.number().int().nonnegative(), isActive: z.boolean(),
});

export type ServiceInput = z.input<typeof serviceInputSchema>;
