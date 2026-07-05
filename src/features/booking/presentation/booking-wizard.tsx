"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createBookingAction } from "@/features/booking/application/booking-actions";
import type { AvailableSlot } from "@/features/availability/application/availability-types";

const steps = ["Liên hệ", "Ngày", "Khung giờ", "Xác nhận", "Giữ chỗ"];
const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
const contactSchema = z.object({
  customerName: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  customerEmail: z.email("Email không hợp lệ."),
  customerPhone: z.string().trim().min(8, "Số điện thoại không hợp lệ.").or(z.literal("")),
  note: z.string().max(1000),
});
type ContactInput = z.infer<typeof contactSchema>;

export function BookingWizard({ serviceId, serviceName }: Readonly<{ serviceId: string; serviceName: string }>) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { customerName: "", customerEmail: "", customerPhone: "", note: "" },
  });
  const [date, setDate] = useState(""); const [slots, setSlots] = useState<AvailableSlot[]>([]); const [startTime, setStartTime] = useState("");
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);

  async function loadSlots() {
    setLoading(true); setMessage("");
    const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${date}`, { cache: "no-store" });
    const body = await response.json(); setLoading(false);
    if (!response.ok) { setMessage(body.message ?? "Không thể tải lịch trống."); return; }
    setSlots(body.data); setStep(2);
  }

  async function submit() {
    setLoading(true); setMessage(""); setStep(4);
    const values = getValues();
    const result = await createBookingAction({
      serviceId, startTime, ...values,
      customerPhone: values.customerPhone || undefined,
      note: values.note || undefined,
    });
    if (!result.ok) { setLoading(false); setMessage(result.message); setStep(2); return; }
    router.push(`/booking/${result.data.bookingId}/payment`);
  }

  return <div className="mt-8">
    <ol aria-label="Các bước đặt lịch" className="grid grid-cols-5 gap-2 text-center text-xs sm:text-sm">{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index === step ? "rounded-full bg-amber-300 px-2 py-2 text-stone-950" : "rounded-full bg-white/5 px-2 py-2 text-stone-400"}>{index + 1}. {label}</li>)}</ol>
    <div className="mt-8 rounded-3xl border border-white/10 p-6">
      {step === 0 && <form className="grid gap-4" onSubmit={handleSubmit(() => setStep(1))}><h2 className="text-2xl font-semibold">Thông tin liên hệ</h2>
        <label className="grid gap-1">Họ tên<input className="rounded-lg bg-stone-900 p-3" {...register("customerName")} /></label>{errors.customerName && <p role="alert" className="text-red-300">{errors.customerName.message}</p>}
        <label className="grid gap-1">Email<input type="email" className="rounded-lg bg-stone-900 p-3" {...register("customerEmail")} /></label>{errors.customerEmail && <p role="alert" className="text-red-300">{errors.customerEmail.message}</p>}
        <label className="grid gap-1">Số điện thoại<input className="rounded-lg bg-stone-900 p-3" {...register("customerPhone")} /></label>{errors.customerPhone && <p role="alert" className="text-red-300">{errors.customerPhone.message}</p>}
        <label className="grid gap-1">Ghi chú<textarea className="rounded-lg bg-stone-900 p-3" {...register("note")} /></label>
        <button type="submit" className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950">Tiếp tục</button></form>}
      {step === 1 && <div className="grid gap-4"><h2 className="text-2xl font-semibold">Chọn ngày</h2><input aria-label="Ngày đặt studio" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg bg-stone-900 p-3" /><div className="flex gap-3"><button onClick={() => setStep(0)}>Quay lại</button><button disabled={!date || loading} onClick={loadSlots} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950 disabled:opacity-50">Xem giờ trống</button></div></div>}
      {step === 2 && <div><h2 className="text-2xl font-semibold">Chọn khung giờ</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{slots.map((slot) => <button key={slot.startTime} aria-pressed={startTime === slot.startTime} onClick={() => setStartTime(slot.startTime)} className={startTime === slot.startTime ? "rounded-xl bg-amber-300 p-3 text-stone-950" : "rounded-xl border border-white/10 p-3"}>{time.format(new Date(slot.startTime))}</button>)}</div>{slots.length === 0 && <p className="mt-4 text-stone-300">Ngày này chưa có giờ phù hợp.</p>}<div className="mt-5 flex gap-3"><button onClick={() => setStep(1)}>Quay lại</button><button disabled={!startTime} onClick={() => setStep(3)} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950 disabled:opacity-50">Tiếp tục</button></div></div>}
      {step === 3 && <div className="grid gap-4"><h2 className="text-2xl font-semibold">Xác nhận giữ chỗ</h2><p><strong>{serviceName}</strong></p><p>{getValues("customerName")} · {getValues("customerEmail")}</p><p>{date} · {time.format(new Date(startTime))}</p><div className="flex gap-3"><button onClick={() => setStep(2)}>Quay lại</button><button disabled={loading} onClick={submit} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950">Giữ chỗ 10 phút</button></div></div>}
      {step === 4 && <div><h2 className="text-2xl font-semibold">Đang tạo giữ chỗ</h2><p className="mt-3 text-stone-300">Vui lòng chờ trong giây lát…</p></div>}
      {message && <p role="alert" className="mt-4 text-red-300">{message}</p>}
    </div>
  </div>;
}
