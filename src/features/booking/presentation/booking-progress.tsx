import { LedStatus } from "@/components/ui/led-status";

export type BookingProgressProps = Readonly<{
  currentStep: number;
  steps: readonly string[];
}>;

export function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  return (
    <ol aria-label="Các bước đặt lịch" className="log-rail booking-session-log">
      {steps.map((step, index) => {
        const state = index < currentStep ? "completed" : index === currentStep ? "active" : "future";
        const tone = state === "completed" ? "success" : state === "active" ? "record" : "neutral";
        const position = String(index + 1).padStart(2, "0");
        const indexLabel = state === "active" ? `${position} · ĐANG GHI` : position;

        return (
          <li
            aria-current={state === "active" ? "step" : undefined}
            className="log-row"
            data-state={state === "completed" ? "done" : state}
            data-step-state={state}
            key={`${index}-${step}`}
          >
            <p className="log-row__index">
              <LedStatus label={indexLabel} tone={tone} />
            </p>
            <p className="log-row__title">{step}</p>
          </li>
        );
      })}
    </ol>
  );
}
