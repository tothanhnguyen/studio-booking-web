"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { saveRoomAction, type AdminActionResult } from "@/app/admin/rooms/actions";
import { roomInputSchema, type RoomInput } from "@/features/studio-room/application/room-input";

const emptyRoom: RoomInput = { name: "", slug: "", description: "", timezone: "Asia/Ho_Chi_Minh", displayOrder: 0, isActive: true };

export function RoomForm({ initialValue = emptyRoom }: Readonly<{ initialValue?: RoomInput }>) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RoomInput>({
    resolver: zodResolver(roomInputSchema), defaultValues: initialValue,
  });

  return (
    <form className="grid gap-3 rounded-2xl border border-white/10 p-5" onSubmit={handleSubmit(async (value) => setResult(await saveRoomAction(value)))}>
      <input type="hidden" defaultValue={initialValue.id} {...register("id")} />
      <label className="grid gap-1 text-sm">Tên phòng<input defaultValue={initialValue.name} className="rounded-lg bg-stone-900 p-2" {...register("name")} /></label>
      <label className="grid gap-1 text-sm">Slug<input defaultValue={initialValue.slug} className="rounded-lg bg-stone-900 p-2" {...register("slug")} /></label>
      <label className="grid gap-1 text-sm">Mô tả<textarea defaultValue={initialValue.description ?? ""} className="rounded-lg bg-stone-900 p-2" {...register("description")} /></label>
      <label className="grid gap-1 text-sm">Thứ tự<input type="number" defaultValue={initialValue.displayOrder} className="rounded-lg bg-stone-900 p-2" {...register("displayOrder", { valueAsNumber: true })} /></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" defaultChecked={initialValue.isActive} {...register("isActive")} /> Đang hoạt động</label>
      <input type="hidden" value="Asia/Ho_Chi_Minh" {...register("timezone")} />
      {Object.values(errors)[0]?.message && <p role="alert" className="text-sm text-red-300">{String(Object.values(errors)[0]?.message)}</p>}
      {result && <p role="status" className={result.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{result.message}</p>}
      <button disabled={isSubmitting} className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-950 disabled:opacity-50">{isSubmitting ? "Đang lưu…" : "Lưu phòng"}</button>
    </form>
  );
}
