export type GhostIndexProps = Readonly<{ index: number }>;

export function GhostIndex({ index }: GhostIndexProps) {
  const formatted = String(index).padStart(2, "0");
  return (
    <span aria-hidden="true" className="ghost-index">
      {formatted}
    </span>
  );
}
