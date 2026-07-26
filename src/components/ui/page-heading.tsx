export type PageHeadingProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  headingId?: string;
  size?: "default" | "large";
}>;

export function PageHeading({
  eyebrow,
  title,
  description,
  headingId,
  size = "default",
}: PageHeadingProps) {
  return (
    <header className={`page-heading page-heading--${size}`}>
      {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
      <h1 id={headingId}>{title}</h1>
      {description ? <p className="page-description">{description}</p> : null}
    </header>
  );
}
