"use client";

import { useEffect, useState } from "react";

export function HoldCountdown({ expiresAt }: Readonly<{ expiresAt: string }>) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Date.parse(expiresAt) - Date.now()));
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, Date.parse(expiresAt) - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  const totalSeconds = Math.ceil(remaining / 1000);
  return <p role="timer" className="text-lg font-semibold text-amber-300">Giữ chỗ còn {String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:{String(totalSeconds % 60).padStart(2, "0")}</p>;
}
