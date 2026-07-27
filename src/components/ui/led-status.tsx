export type LedStatusProps = Readonly<{
  tone: "success" | "warning" | "danger" | "record" | "neutral";
  label: string;
}>;

export function LedStatus({ label, tone }: LedStatusProps) {
  return (
    <span className="led-status" data-tone={tone}>
      <span aria-hidden="true" className="led-status__dot" />
      <span className="led-status__label">{label}</span>
    </span>
  );
}
