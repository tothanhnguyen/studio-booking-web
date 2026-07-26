"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { actionClassName } from "@/components/ui/action";
import { CropFrame } from "@/components/ui/crop-frame";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { createBookingAction } from "@/features/booking/application/booking-actions";
import type { AvailableSlot } from "@/features/availability/application/availability-types";

import { BookingProgress } from "./booking-progress";

type StepDirection = "forward" | "back";

const steps = ["Liên hệ", "Ngày", "Khung giờ", "Xác nhận", "Giữ chỗ"];
const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
const price = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const contactSchema = z.object({
  customerName: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  customerEmail: z.email("Email không hợp lệ."),
  customerPhone: z.string().trim().min(8, "Số điện thoại không hợp lệ.").or(z.literal("")),
  note: z.string().max(1000),
});
type ContactInput = z.infer<typeof contactSchema>;

type BookingWizardProps = Readonly<{
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  priceAmount: number;
}>;

export function BookingWizard({ serviceId, serviceName, durationMinutes, priceAmount }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { customerName: "", customerEmail: "", customerPhone: "", note: "" },
  });
  const [date, setDate] = useState(""); const [slots, setSlots] = useState<AvailableSlot[]>([]); const [startTime, setStartTime] = useState("");
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);

  function goToStep(next: number) {
    setDirection(next >= step ? "forward" : "back");
    setStep(next);
  }

  async function loadSlots() {
    setLoading(true); setMessage("");
    const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${date}`, { cache: "no-store" });
    const body = await response.json(); setLoading(false);
    if (!response.ok) { setMessage(body.message ?? "Không thể tải lịch trống."); return; }
    setSlots(body.data); goToStep(2);
  }

  async function submit() {
    setLoading(true); setMessage(""); goToStep(4);
    const values = getValues();
    const result = await createBookingAction({
      serviceId, startTime, ...values,
      customerPhone: values.customerPhone || undefined,
      note: values.note || undefined,
    });
    if (!result.ok) { setLoading(false); setMessage(result.message); goToStep(2); return; }
    router.push(`/booking/${result.data.bookingId}/payment`);
  }

  return <div className="booking-wizard">
    <BookingProgress currentStep={step} steps={steps} />
    <div className="booking-composition">
      <aside className="booking-context ui-surface" aria-label="Thông tin dịch vụ">
        <p className="page-eyebrow">Đang đặt</p>
        <h2>{serviceName}</h2>
        <dl>
          <div><dt>Thời lượng</dt><dd className="type-mono">{durationMinutes} phút</dd></div>
          <div><dt>Giá dịch vụ</dt><dd className="type-mono">{price.format(priceAmount)}</dd></div>
        </dl>
        <p className="booking-context__deposit">Cọc 30% ở bước thanh toán</p>
      </aside>

      <section
        aria-busy={loading}
        className="booking-window log-frame ui-surface"
        data-direction={direction}
        key={step}
      >
        <CropFrame annotation={date ? `${serviceName} · ${date}` : serviceName}>
        {step === 0 && <form className="booking-form" onSubmit={handleSubmit(() => goToStep(1))}>
          <h2 className="booking-step-title">Thông tin liên hệ</h2>
          <FormField label="Họ tên" htmlFor="customer-name" error={errors.customerName?.message}>
            <input id="customer-name" aria-invalid={Boolean(errors.customerName)} {...register("customerName")} />
          </FormField>
          <FormField label="Email" htmlFor="customer-email" error={errors.customerEmail?.message}>
            <input id="customer-email" type="email" aria-invalid={Boolean(errors.customerEmail)} {...register("customerEmail")} />
          </FormField>
          <FormField label="Số điện thoại" htmlFor="customer-phone" error={errors.customerPhone?.message}>
            <input id="customer-phone" aria-invalid={Boolean(errors.customerPhone)} {...register("customerPhone")} />
          </FormField>
          <FormField label="Ghi chú" htmlFor="booking-note" error={errors.note?.message}>
            <textarea id="booking-note" aria-invalid={Boolean(errors.note)} {...register("note")} />
          </FormField>
          <button type="submit" className={actionClassName("primary")}>Tiếp tục</button>
        </form>}

        {step === 1 && <div className="booking-step">
          <h2 className="booking-step-title">Chọn ngày</h2>
          <FormField label="Ngày đặt studio" htmlFor="booking-date">
            <input id="booking-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </FormField>
          <div className="booking-actions">
            <button type="button" className={actionClassName("tertiary")} onClick={() => goToStep(0)}>Quay lại</button>
            <button type="button" disabled={!date || loading} onClick={loadSlots} className={actionClassName("primary")}>Xem giờ trống</button>
          </div>
        </div>}

        {step === 2 && <div className="booking-step">
          <h2 className="booking-step-title">Chọn khung giờ</h2>
          <div className="booking-slots">{slots.map((slot) => <button type="button" key={slot.startTime} aria-pressed={startTime === slot.startTime} onClick={() => setStartTime(slot.startTime)} className="booking-slot type-mono">{time.format(new Date(slot.startTime))}</button>)}</div>
          {slots.length === 0 && (
            <EmptyState
              action={
                <button
                  className={actionClassName("secondary")}
                  disabled={loading}
                  onClick={loadSlots}
                  type="button"
                >
                  Tải lại giờ trống
                </button>
              }
              description="Ngày này chưa có giờ phù hợp."
              title="Chưa có khung giờ trống"
            />
          )}
          <div className="booking-actions">
            <button type="button" className={actionClassName("tertiary")} onClick={() => goToStep(1)}>Quay lại</button>
            <button type="button" disabled={!startTime} onClick={() => goToStep(3)} className={actionClassName("primary")}>Tiếp tục</button>
          </div>
        </div>}

        {step === 3 && <div className="booking-step">
          <h2 className="booking-step-title">Xác nhận giữ chỗ</h2>
          <div className="booking-confirmation"><p><strong>{serviceName}</strong></p><p>{getValues("customerName")} · {getValues("customerEmail")}</p><p className="type-mono">{date} · {time.format(new Date(startTime))}</p></div>
          <div className="booking-actions">
            <button type="button" className={actionClassName("tertiary")} onClick={() => goToStep(2)}>Quay lại</button>
            <button type="button" disabled={loading} onClick={submit} className={actionClassName("primary")}>Giữ chỗ 10 phút</button>
          </div>
        </div>}

        {step === 4 && <div className="booking-step"><h2 className="booking-step-title">Đang tạo giữ chỗ</h2><p className="booking-loading">Vui lòng chờ trong giây lát…</p></div>}
        {message && <p role="alert" className="booking-message">{message}</p>}
        </CropFrame>
      </section>
    </div>
  </div>;
}
