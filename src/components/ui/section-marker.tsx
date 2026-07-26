export type SectionMarkerProps = Readonly<{
  index: number;
  label: string;
}>;

export function SectionMarker({ index, label }: SectionMarkerProps) {
  const formatted = String(index).padStart(2, "0");
  return (
    <p className="section-marker">
      <span className="section-marker-index">{formatted}</span>
      <span aria-hidden="true" className="section-marker-rule" />
      <span className="section-marker-label">{label}</span>
    </p>
  );
}
