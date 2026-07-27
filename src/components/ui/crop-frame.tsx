import type { ReactNode } from "react";

export type CropFrameProps = Readonly<{
  children: ReactNode;
  annotation?: string;
  className?: string;
}>;

export function CropFrame({ annotation, children, className }: CropFrameProps) {
  const classes = ["crop-frame", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      {annotation ? <p className="proof-annotation">{annotation}</p> : null}
      <div className="crop-frame__body">
        {children}
        <span aria-hidden="true" className="crop-frame__marks">
          <span className="crop-frame__mark crop-frame__mark--tl" />
          <span className="crop-frame__mark crop-frame__mark--tr" />
          <span className="crop-frame__mark crop-frame__mark--bl" />
          <span className="crop-frame__mark crop-frame__mark--br" />
        </span>
      </div>
    </div>
  );
}
