export type FilmStripItem = Readonly<{
  src: string;
  alt: string;
  href?: string;
}>;

export type FilmStripProps = Readonly<{
  items: readonly FilmStripItem[];
  className?: string;
}>;

export function FilmStrip({ className, items }: FilmStripProps) {
  const classes = ["film-strip", className].filter(Boolean).join(" ");
  const sprockets = (
    <span aria-hidden="true" className="film-strip__sprockets">
      {items.map((item, index) => (
        <span className="film-strip__sprocket" key={`${item.src}-${index}`} />
      ))}
    </span>
  );

  return (
    <div className={classes}>
      {sprockets}
      <ul className="film-strip__list">
        {items.map((item) => {
          const media = <img alt={item.alt} className="film-strip__media" src={item.src} />;
          return (
            <li className="film-strip__cell" key={item.src}>
              {item.href ? <a href={item.href}>{media}</a> : media}
            </li>
          );
        })}
      </ul>
      {sprockets}
    </div>
  );
}
