"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { saveServiceAction } from "@/app/admin/services/actions";
import type { AdminActionResult } from "@/app/admin/rooms/actions";
import { serviceInputSchema, type ServiceInput } from "@/features/service/application/service-input";

type RoomOption = Readonly<{ id: string; name: string }>;

export function ServiceForm({ rooms, initialValue }: Readonly<{ rooms: RoomOption[]; initialValue?: ServiceInput }>) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const defaults: ServiceInput = initialValue ?? { roomId: rooms[0]?.id ?? "", name: "", slug: "", description: "", bookingType: "ROOM_ONLY", durationMinutes: 60, bufferMinutes: 15, priceAmount: 100_000, currency: "VND", displayOrder: 0, isActive: true };
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ServiceInput>({ resolver: zodResolver(serviceInputSchema), defaultValues: defaults });

  return (
    <form data-service-slug={initialValue?.slug} className="grid gap-3 rounded-2xl border border-white/10 p-5" onSubmit={handleSubmit(async (value) => setResult(await saveServiceAction(value)))}>
      <input type="hidden" defaultValue={initialValue?.id} {...register("id")} /><input type="hidden" value="VND" {...register("currency")} />
      <label className="grid gap-1 text-sm">Phòng<select defaultValue={defaults.roomId} className="rounded-lg bg-stone-900 p-2" {...register("roomId")}>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Tên dịch vụ<input defaultValue={defaults.name} className="rounded-lg bg-stone-900 p-2" {...register("name")} /></label>
      <label className="grid gap-1 text-sm">Slug<input defaultValue={defaults.slug} className="rounded-lg bg-stone-900 p-2" {...register("slug")} /></label>
      <label className="grid gap-1 text-sm">Mô tả<textarea defaultValue={defaults.description ?? ""} className="rounded-lg bg-stone-900 p-2" {...register("description")} /></label>
      <label className="grid gap-1 text-sm">Loại booking<select defaultValue={defaults.bookingType} className="rounded-lg bg-stone-900 p-2" {...register("bookingType")}><option value="ROOM_ONLY">Chỉ thuê phòng</option><option value="ASSISTED">Có hỗ trợ</option></select></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">Thời lượng (phút)<input type="number" defaultValue={defaults.durationMinutes} className="rounded-lg bg-stone-900 p-2" {...register("durationMinutes", { valueAsNumber: true })} /></label>
        <label className="grid gap-1 text-sm">Đệm (phút)<input type="number" defaultValue={defaults.bufferMinutes} className="rounded-lg bg-stone-900 p-2" {...register("bufferMinutes", { valueAsNumber: true })} /></label>
        <label className="grid gap-1 text-sm">Giá (VND)<input type="number" defaultValue={defaults.priceAmount} className="rounded-lg bg-stone-900 p-2" {...register("priceAmount", { valueAsNumber: true })} /></label>
        <label className="grid gap-1 text-sm">Thứ tự<input type="number" defaultValue={defaults.displayOrder} className="rounded-lg bg-stone-900 p-2" {...register("displayOrder", { valueAsNumber: true })} /></label>
      </div>
      <label className="flex gap-2 text-sm"><input type="checkbox" defaultChecked={defaults.isActive} {...register("isActive")} /> Đang hoạt động</label>
      {Object.values(errors)[0]?.message && <p role="alert" className="text-sm text-red-300">{String(Object.values(errors)[0]?.message)}</p>}
      {result && <p role="status" className={result.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{result.message}</p>}
      <button disabled={isSubmitting || rooms.length === 0} className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-950 disabled:opacity-50">{isSubmitting ? "Đang lưu…" : "Lưu dịch vụ"}</button>
    </form>
  );
}
