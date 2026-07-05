"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBookingAction } from "@/features/booking/application/booking-actions";
import type { AvailableSlot } from "@/features/availability/application/availability-types";

const steps = ["Liên hệ", "Ngày", "Khung giờ", "Xác nhận", "Giữ chỗ"];
const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });

export function BookingWizard({ serviceId, serviceName }: Readonly<{ serviceId: string; serviceName: string }>) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ customerName: "", customerEmail: "", customerPhone: "", note: "" });
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
    const result = await createBookingAction({ serviceId, startTime, ...contact });
    if (!result.ok) { setLoading(false); setMessage(result.message); setStep(2); return; }
    router.push(`/booking/${result.data.bookingId}/payment`);
  }

  return <div className="mt-8">
    <ol aria-label="Các bước đặt lịch" className="grid grid-cols-5 gap-2 text-center text-xs sm:text-sm">{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index === step ? "rounded-full bg-amber-300 px-2 py-2 text-stone-950" : "rounded-full bg-white/5 px-2 py-2 text-stone-400"}>{index + 1}. {label}</li>)}</ol>
    <div className="mt-8 rounded-3xl border border-white/10 p-6">
      {step === 0 && <div className="grid gap-4"><h2 className="text-2xl font-semibold">Thông tin liên hệ</h2>
        <label className="grid gap-1">Họ tên<input required className="rounded-lg bg-stone-900 p-3" value={contact.customerName} onChange={(e) => setContact({ ...contact, customerName: e.target.value })} /></label>
        <label className="grid gap-1">Email<input required type="email" className="rounded-lg bg-stone-900 p-3" value={contact.customerEmail} onChange={(e) => setContact({ ...contact, customerEmail: e.target.value })} /></label>
        <label className="grid gap-1">Số điện thoại<input className="rounded-lg bg-stone-900 p-3" value={contact.customerPhone} onChange={(e) => setContact({ ...contact, customerPhone: e.target.value })} /></label>
        <button disabled={!contact.customerName || !contact.customerEmail} onClick={() => setStep(1)} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950 disabled:opacity-50">Tiếp tục</button></div>}
      {step === 1 && <div className="grid gap-4"><h2 className="text-2xl font-semibold">Chọn ngày</h2><input aria-label="Ngày đặt studio" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg bg-stone-900 p-3" /><div className="flex gap-3"><button onClick={() => setStep(0)}>Quay lại</button><button disabled={!date || loading} onClick={loadSlots} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950 disabled:opacity-50">Xem giờ trống</button></div></div>}
      {step === 2 && <div><h2 className="text-2xl font-semibold">Chọn khung giờ</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{slots.map((slot) => <button key={slot.startTime} aria-pressed={startTime === slot.startTime} onClick={() => setStartTime(slot.startTime)} className={startTime === slot.startTime ? "rounded-xl bg-amber-300 p-3 text-stone-950" : "rounded-xl border border-white/10 p-3"}>{time.format(new Date(slot.startTime))}</button>)}</div>{slots.length === 0 && <p className="mt-4 text-stone-300">Ngày này chưa có giờ phù hợp.</p>}<div className="mt-5 flex gap-3"><button onClick={() => setStep(1)}>Quay lại</button><button disabled={!startTime} onClick={() => setStep(3)} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950 disabled:opacity-50">Tiếp tục</button></div></div>}
      {step === 3 && <div className="grid gap-4"><h2 className="text-2xl font-semibold">Xác nhận giữ chỗ</h2><p><strong>{serviceName}</strong></p><p>{contact.customerName} · {contact.customerEmail}</p><p>{date} · {time.format(new Date(startTime))}</p><div className="flex gap-3"><button onClick={() => setStep(2)}>Quay lại</button><button disabled={loading} onClick={submit} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950">Giữ chỗ 10 phút</button></div></div>}
      {step === 4 && <div><h2 className="text-2xl font-semibold">Đang tạo giữ chỗ</h2><p className="mt-3 text-stone-300">Vui lòng chờ trong giây lát…</p></div>}
      {message && <p role="alert" className="mt-4 text-red-300">{message}</p>}
    </div>
  </div>;
}
