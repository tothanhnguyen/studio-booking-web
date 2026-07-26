export type BookingProgressProps = Readonly<{
  currentStep: number;
  steps: readonly string[];
}>;

export function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  return (
    <ol aria-label="Các bước đặt lịch" className="booking-progress">
      {steps.map((step, index) => {
        const state = index < currentStep ? "complete" : index === currentStep ? "active" : "upcoming";

        return (
          <li
            aria-current={state === "active" ? "step" : undefined}
            className="booking-progress__step"
            data-step-state={state}
            key={`${index}-${step}`}
          >
            <span className="booking-progress__position type-mono">{index + 1}</span>
            <span className="booking-progress__label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
