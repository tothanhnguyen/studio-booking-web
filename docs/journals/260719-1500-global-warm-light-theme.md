---
date: 2026-07-19
session: global-warm-light-theme
---

# Journal: 2026-07-19 — Global Warm-Light Theme

## Context

Chuyển toàn bộ route ngoài home từ dark theme sang nền trắng ấm đồng bộ với hero. Phạm vi chỉ gồm token và UI surface; ảnh được cố ý giữ nguyên vì chủ dự án sẽ thay ở lượt riêng.

## What Happened

- Thay palette cũ bằng semantic tokens cho canvas, surface, text, border, action và trạng thái; giữ alias legacy để tránh phá hàng loạt component trong một lần.
- Gỡ hardcode dark trên auth, account, booking và admin. Contrast review phát hiện viền control quá nhạt trên nền sáng, nên tách `--color-control-border: #83796e` khỏi border trang trí.
- Lint, typecheck, 147 tests và production build đều pass.
- Visual QA đã kiểm tra home, studios, login, mobile, admin và booking. Hero vẫn giữ đúng diện mạo; các route còn lại dùng cùng họ màu trắng ấm.

## Reflection

Root cause của sự lệch theme là code dùng tên màu vật liệu như `void`, `ink`, `bone` lẫn hardcode Tailwind, thay vì semantic role. Đổi mỗi background sẽ tạo ra một giao diện nhợt nhạt, form mất biên và trạng thái khó đọc. Phần khó chịu nhất là migration nhìn có vẻ cơ học nhưng thực tế chỉ một alias sai cũng có thể biến text thành nền hoặc làm QR frame tối lại. Contrast review đã bắt đúng lỗi viền control trước khi nó thành món nợ accessibility.

Worktree đang dirty với nhiều thay đổi không thuộc migration này. Kết quả kỹ thuật đã sạch, nhưng staging vẫn là điểm nguy hiểm nhất: `git add .` có thể kéo cả asset hoặc công việc dang dở của người khác vào commit.

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Dùng trắng ấm, không dùng trắng tinh | Khớp hero và giữ cảm giác editorial hiện đại | Các trang đồng bộ mà không bị lạnh hoặc chói |
| Tách token semantic, giữ alias legacy | Giảm phạm vi regression trong dirty worktree | Có thể migrate component dần mà UI vẫn nhất quán |
| Không chỉnh ảnh trong lượt này | Ảnh sẽ được thay riêng bởi chủ dự án | Tránh trộn media work với theme work |
| Tăng riêng contrast viền control | Border trang trí và form có nhu cầu khác nhau | Input/selector rõ hơn mà card không bị nặng |

## Next Steps

- Chủ dự án thay bộ ảnh khi sẵn sàng; kiểm tra lại độ hòa nền ngay sau đó.
- Người tạo commit phải stage theo danh sách file theme cụ thể, tuyệt đối không dùng `git add .` trong worktree hiện tại.
- Trước khi merge, owner chạy lại visual smoke test cho booking và admin sau mọi thay đổi asset.
