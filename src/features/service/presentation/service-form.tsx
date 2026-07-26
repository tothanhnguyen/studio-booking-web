"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { actionClassName } from "@/components/ui/action";
import { FormField } from "@/components/ui/form-field";
import { saveServiceAction } from "@/app/admin/services/actions";
import type { AdminActionResult } from "@/app/admin/rooms/actions";
import { serviceInputSchema, type ServiceInput } from "@/features/service/application/service-input";

type RoomOption = Readonly<{ id: string; name: string }>;

export function ServiceForm({ rooms, initialValue }: Readonly<{ rooms: RoomOption[]; initialValue?: ServiceInput }>) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const defaults: ServiceInput = initialValue ?? {
    roomId: rooms[0]?.id ?? "",
    name: "",
    slug: "",
    description: "",
    bookingType: "ROOM_ONLY",
    durationMinutes: 60,
    bufferMinutes: 15,
    priceAmount: 100_000,
    currency: "VND",
    displayOrder: 0,
    isActive: true,
  };
  const fieldId = initialValue?.id ?? "new";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({ resolver: zodResolver(serviceInputSchema), defaultValues: defaults });

  return (
    <form
      className="admin-catalog-form"
      data-service-slug={initialValue?.slug}
      onSubmit={handleSubmit(async (value) => setResult(await saveServiceAction(value)))}
    >
      <input defaultValue={initialValue?.id} type="hidden" {...register("id")} />
      <input type="hidden" value="VND" {...register("currency")} />

      <FormField error={errors.roomId?.message} htmlFor={`service-room-${fieldId}`} label="Phòng">
        <select aria-invalid={Boolean(errors.roomId)} defaultValue={defaults.roomId} id={`service-room-${fieldId}`} {...register("roomId")}>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField error={errors.name?.message} htmlFor={`service-name-${fieldId}`} label="Tên dịch vụ">
        <input aria-invalid={Boolean(errors.name)} defaultValue={defaults.name} id={`service-name-${fieldId}`} {...register("name")} />
      </FormField>

      <FormField error={errors.slug?.message} htmlFor={`service-slug-${fieldId}`} label="Slug">
        <input aria-invalid={Boolean(errors.slug)} defaultValue={defaults.slug} id={`service-slug-${fieldId}`} {...register("slug")} />
      </FormField>

      <FormField error={errors.description?.message} htmlFor={`service-description-${fieldId}`} label="Mô tả">
        <textarea
          aria-invalid={Boolean(errors.description)}
          defaultValue={defaults.description ?? ""}
          id={`service-description-${fieldId}`}
          {...register("description")}
        />
      </FormField>

      <FormField error={errors.bookingType?.message} htmlFor={`service-booking-type-${fieldId}`} label="Loại booking">
        <select
          aria-invalid={Boolean(errors.bookingType)}
          defaultValue={defaults.bookingType}
          id={`service-booking-type-${fieldId}`}
          {...register("bookingType")}
        >
          <option value="ROOM_ONLY">Chỉ thuê phòng</option>
          <option value="ASSISTED">Có hỗ trợ</option>
        </select>
      </FormField>

      <div className="admin-catalog-form-split">
        <FormField error={errors.durationMinutes?.message} htmlFor={`service-duration-${fieldId}`} label="Thời lượng (phút)">
          <input
            aria-invalid={Boolean(errors.durationMinutes)}
            defaultValue={defaults.durationMinutes}
            id={`service-duration-${fieldId}`}
            type="number"
            {...register("durationMinutes", { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.bufferMinutes?.message} htmlFor={`service-buffer-${fieldId}`} label="Đệm (phút)">
          <input
            aria-invalid={Boolean(errors.bufferMinutes)}
            defaultValue={defaults.bufferMinutes}
            id={`service-buffer-${fieldId}`}
            type="number"
            {...register("bufferMinutes", { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.priceAmount?.message} htmlFor={`service-price-${fieldId}`} label="Giá (VND)">
          <input
            aria-invalid={Boolean(errors.priceAmount)}
            defaultValue={defaults.priceAmount}
            id={`service-price-${fieldId}`}
            type="number"
            {...register("priceAmount", { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.displayOrder?.message} htmlFor={`service-order-${fieldId}`} label="Thứ tự">
          <input
            aria-invalid={Boolean(errors.displayOrder)}
            defaultValue={defaults.displayOrder}
            id={`service-order-${fieldId}`}
            type="number"
            {...register("displayOrder", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <label className="admin-catalog-checkbox" htmlFor={`service-active-${fieldId}`}>
        <input defaultChecked={defaults.isActive} id={`service-active-${fieldId}`} type="checkbox" {...register("isActive")} />
        Đang hoạt động
      </label>

      {result && (
        <p className={result.ok ? "ui-field__hint" : "ui-field__error"} role="status">
          {result.message}
        </p>
      )}

      <button className={actionClassName("primary")} disabled={isSubmitting || rooms.length === 0} type="submit">
        {isSubmitting ? "Đang lưu…" : "Lưu dịch vụ"}
      </button>
    </form>
  );
}
