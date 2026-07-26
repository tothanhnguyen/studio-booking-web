export type BookingProgressProps = Readonly<{
  currentStep: number;
  steps: readonly string[];
}>;

export function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  return (
    <ol aria-label="Các bước đặt lịch" className="booking-rail">
      {steps.map((step, index) => {
        const state = index < currentStep ? "completed" : index === currentStep ? "active" : "future";

        return (
          <li
            aria-current={state === "active" ? "step" : undefined}
            className="booking-rail__step"
            data-step-state={state}
            key={`${index}-${step}`}
          >
            <span className="booking-rail__position type-mono">{index + 1}</span>
            <span className="booking-rail__label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
