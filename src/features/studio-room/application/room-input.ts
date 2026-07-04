import { z } from "zod";

export const roomInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Tên phòng phải có ít nhất 2 ký tự."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  description: z.string().trim().nullable().default(null),
  timezone: z.literal("Asia/Ho_Chi_Minh").default("Asia/Ho_Chi_Minh"),
  displayOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export type RoomInput = z.input<typeof roomInputSchema>;
