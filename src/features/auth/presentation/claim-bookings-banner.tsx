"use client";

import { useState } from "react";

import { claimGuestBookingsAction } from "@/features/auth/application/claim-actions";

export function ClaimBookingsBanner() {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  return <aside className="rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
    <h2 className="font-semibold">Bạn đã từng đặt lịch với email này?</h2>
    <p className="mt-1 text-sm text-stone-300">Nhận các booking guest chưa thuộc tài khoản nào.</p>
    <button disabled={loading} onClick={async () => { setLoading(true); const result = await claimGuestBookingsAction(); setMessage(result.message); setLoading(false); }} className="mt-3 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 disabled:opacity-50">Nhận booking cũ</button>
    {message && <p role="status" className="mt-2 text-sm text-amber-200">{message}</p>}
  </aside>;
}
