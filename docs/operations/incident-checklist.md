# Incident Checklist — MowStudio

Quy trình phản ứng nhanh khi production gặp sự cố. Mục tiêu: khôi phục dịch vụ trước, phân tích nguyên nhân sau.

## 1. Phát hiện & phân loại

- Nguồn: uptime monitor (`/api/health`, homepage), Sentry alert, báo cáo người dùng.
- Ghi lại thời điểm bắt đầu, triệu chứng, và **request ID** liên quan (có trong log/Sentry, không chứa PII).

## 2. Đánh giá nhanh (dưới 5 phút)

| Kiểm tra | Lệnh / nơi xem | Ý nghĩa |
| --- | --- | --- |
| Liveness | `GET /api/health` | App còn sống? Trả về release SHA. |
| Readiness | `GET /api/ready` | DB kết nối được? `503` = DB outage. |
| Release SHA | body của `/api/health` | Đúng bản đã deploy? |
| Error rate | Sentry dashboard | Loại lỗi, tần suất, route ảnh hưởng. |
| Log correlation | Sentry/log theo request ID | Trace một request xuyên route → service → DB. |

## 3. Hành động theo triệu chứng

- **`/api/ready` trả `503`, `/api/health` OK** → sự cố database (Supabase). Kiểm tra Supabase status, connection pool. App vẫn "sống" nhưng không phục vụ được.
- **Cả hai fail** → app down. Xem Vercel deployment log; cân nhắc rollback về SHA trước.
- **Error rate tăng sau deploy mới** → rollback app (Vercel → Promote deployment trước đó). Xem `vercel-runbook.md`.
- **Payment/webhook lỗi** → kiểm tra SePay webhook URL/secret, log `payment.webhook_*`. Webhook idempotent nên phát lại an toàn.
- **Email không gửi** → notification lỗi KHÔNG rollback booking/payment. Kiểm tra Resend + `notification` log; retry theo intent.

## 4. Rollback

Theo mục "Quyết định rollback" trong `docs/operations/vercel-runbook.md`. Ưu tiên app-only promote (nhanh, không mất dữ liệu). Migration là forward-only.

## 5. Sau sự cố

- Xác nhận health/readiness/smoke đều xanh sau khôi phục.
- Ghi timeline, nguyên nhân gốc, và hành động phòng ngừa.
- Nếu do domain invariant/product decision thay đổi: cập nhật design spec trước khi vá code.

## Nguyên tắc bảo mật khi xử lý

- KHÔNG dán log thô chứa email/điện thoại/token/webhook payload vào ticket. Redaction đã bật ở logger; giữ nguyên tắc đó khi copy thủ công.
- Tham chiếu entity qua ID an toàn, không qua dữ liệu cá nhân.
