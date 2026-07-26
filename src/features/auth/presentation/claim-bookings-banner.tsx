"use client";

import { useState } from "react";

import { actionClassName } from "@/components/ui/action";
import { claimGuestBookingsAction } from "@/features/auth/application/claim-actions";

export function ClaimBookingsBanner() {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  return <aside aria-label="Nhận booking cũ" className="account-claim-strip">
    <p className="type-mono account-claim-strip-label">Đã từng đặt lịch bằng email này? Nhận booking guest chưa thuộc tài khoản nào.</p>
    <div className="account-claim-strip-action">
      <button className={actionClassName("secondary", true)} disabled={loading} onClick={async () => { setLoading(true); const result = await claimGuestBookingsAction(); setMessage(result.message); setLoading(false); }}>Nhận booking cũ</button>
      {message && <p className="account-claim-strip-message" role="status">{message}</p>}
    </div>
  </aside>;
}
