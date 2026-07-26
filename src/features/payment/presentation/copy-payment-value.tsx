"use client";

import { useEffect, useRef, useState } from "react";

import { actionClassName } from "@/components/ui/action";

export type CopyPaymentValueProps = Readonly<{
  label: string;
  value: string;
}>;

type CopyFeedback = "Sao chép" | "Đã sao chép" | "Không thể sao chép";

export function CopyPaymentValue({ label, value }: CopyPaymentValueProps) {
  const [feedback, setFeedback] = useState<CopyFeedback>("Sao chép");
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function copyValue() {
    const request = ++requestRef.current;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let nextFeedback: CopyFeedback;
    try {
      await navigator.clipboard.writeText(value);
      nextFeedback = "Đã sao chép";
    } catch {
      nextFeedback = "Không thể sao chép";
    }

    if (!mountedRef.current || request !== requestRef.current) return;
    setFeedback(nextFeedback);
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current && request === requestRef.current) {
        setFeedback("Sao chép");
        timerRef.current = null;
      }
    }, 2_000);
  }

  return (
    <div className="copy-payment-value">
      <span className="copy-payment-value__label">{label}</span>
      <span className="copy-payment-value__value type-mono">{value}</span>
      <button
        aria-label={`Sao chép ${label}`}
        className={actionClassName("tertiary", true)}
        onClick={copyValue}
        type="button"
      >
        <span aria-atomic="true" aria-live="polite" role="status">
          {feedback}
        </span>
      </button>
    </div>
  );
}
