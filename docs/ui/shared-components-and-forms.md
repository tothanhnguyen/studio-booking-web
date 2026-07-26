# Component và form dùng chung

## Phạm vi

Hướng dẫn sửa nút, tiêu đề, card/surface, empty state, field và style form tái sử dụng.

## Bản đồ code

| Thành phần | File |
|---|---|
| Biến thể nút | `src/components/ui/action.ts`, `src/styles/utilities.css` |
| Tiêu đề trang | `src/components/ui/page-heading.tsx`, `src/styles/utilities.css` |
| Field/hint/error | `src/components/ui/form-field.tsx`, `src/styles/forms.css` |
| Empty state | `src/components/ui/empty-state.tsx`, `src/styles/utilities.css` |
| Surface và layout public/booking | `src/styles/utilities.css` |

## Ranh giới thay đổi

- **UI-only:** class `.ui-action*`, `.ui-surface`, `.page-*`, `.ui-field*`, copy của label.
- **Có hành vi:** đổi `type="submit"`, `name`, `id`, `htmlFor`, `aria-*`, `disabled` hoặc field value sẽ tác động submit/validation/accessibility.

## Cách sửa an toàn

1. Sửa primitive dùng chung nếu thay đổi phải xuất hiện ở nhiều trang.
2. Thêm action variant trong cả `ActionVariant`, `actionClassName()` và CSS tương ứng.
3. Với field, giữ liên kết `label htmlFor` ↔ `input id` và `role="alert"` cho lỗi.
4. Với style riêng một trang, thêm class theo block hiện có thay vì sửa toàn bộ `.ui-surface`.

## Lưu ý

- Một số admin/auth form dùng Tailwind trực tiếp, không dùng `FormField`.
- `utilities.css` chứa nhiều block theo trang; tìm selector trước bằng `rg -n`.
- Không dùng màu làm dấu hiệu trạng thái duy nhất; giữ label chữ trong badge/message.

## Xác minh

```bash
npm run lint && npm run typecheck
npm run test -- src/components/ui src/features/booking/presentation
npm run build
```

Mở `/studios`, `/booking/<service-id>`, `/login` và `/admin` để kiểm tra focus, mobile và disabled state.
