"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { actionClassName } from "@/components/ui/action";
import { FormField } from "@/components/ui/form-field";
import { saveRoomAction, type AdminActionResult } from "@/app/admin/rooms/actions";
import { roomInputSchema, type RoomInput } from "@/features/studio-room/application/room-input";

const emptyRoom: RoomInput = { name: "", slug: "", description: "", timezone: "Asia/Ho_Chi_Minh", displayOrder: 0, isActive: true };

export function RoomForm({ initialValue = emptyRoom }: Readonly<{ initialValue?: RoomInput }>) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const fieldId = initialValue.id ?? "new";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomInput>({ resolver: zodResolver(roomInputSchema), defaultValues: initialValue });

  return (
    <form
      className="admin-catalog-form"
      onSubmit={handleSubmit(async (value) => setResult(await saveRoomAction(value)))}
    >
      <input defaultValue={initialValue.id} type="hidden" {...register("id")} />

      <FormField error={errors.name?.message} htmlFor={`room-name-${fieldId}`} label="Tên phòng">
        <input
          aria-invalid={Boolean(errors.name)}
          defaultValue={initialValue.name}
          id={`room-name-${fieldId}`}
          {...register("name")}
        />
      </FormField>

      <FormField error={errors.slug?.message} htmlFor={`room-slug-${fieldId}`} label="Slug">
        <input
          aria-invalid={Boolean(errors.slug)}
          defaultValue={initialValue.slug}
          id={`room-slug-${fieldId}`}
          {...register("slug")}
        />
      </FormField>

      <FormField error={errors.description?.message} htmlFor={`room-description-${fieldId}`} label="Mô tả">
        <textarea
          aria-invalid={Boolean(errors.description)}
          defaultValue={initialValue.description ?? ""}
          id={`room-description-${fieldId}`}
          {...register("description")}
        />
      </FormField>

      <FormField error={errors.displayOrder?.message} htmlFor={`room-order-${fieldId}`} label="Thứ tự">
        <input
          aria-invalid={Boolean(errors.displayOrder)}
          defaultValue={initialValue.displayOrder}
          id={`room-order-${fieldId}`}
          type="number"
          {...register("displayOrder", { valueAsNumber: true })}
        />
      </FormField>

      <label className="admin-catalog-checkbox" htmlFor={`room-active-${fieldId}`}>
        <input
          defaultChecked={initialValue.isActive}
          id={`room-active-${fieldId}`}
          type="checkbox"
          {...register("isActive")}
        />
        Đang hoạt động
      </label>

      <input type="hidden" value="Asia/Ho_Chi_Minh" {...register("timezone")} />

      {(errors.id ?? errors.timezone) && (
        <p className="ui-field__error" role="alert">{String((errors.id ?? errors.timezone)?.message)}</p>
      )}

      {result && (
        <p className={result.ok ? "ui-field__hint" : "ui-field__error"} role="status">
          {result.message}
        </p>
      )}

      <button className={actionClassName("primary")} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Đang lưu…" : "Lưu phòng"}
      </button>
    </form>
  );
}
