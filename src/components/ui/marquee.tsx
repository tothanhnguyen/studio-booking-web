export type MarqueeProps = Readonly<{
  items: readonly string[];
  className?: string;
}>;

export function Marquee({ items, className }: MarqueeProps) {
  const classes = ["marquee", className].filter(Boolean).join(" ");
  const strip = items.join(" · ");
  return (
    <div aria-hidden="true" className={classes}>
      <div className="marquee-track">
        <span>{strip}</span>
        <span>{strip}</span>
      </div>
    </div>
  );
}
