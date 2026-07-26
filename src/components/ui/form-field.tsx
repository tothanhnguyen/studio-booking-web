import { cloneElement, type ReactElement } from "react";

type DescribableControlProps = Readonly<{
  "aria-describedby"?: string;
}>;

export type FormFieldProps = Readonly<{
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactElement<DescribableControlProps>;
}>;

/**
 * Associates shared feedback with a caller-owned control. The caller still owns
 * state semantics such as `aria-invalid`, `required` and `disabled`.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: FormFieldProps) {
  const feedbackId = hint || error ? `${htmlFor}-feedback` : undefined;
  const describedBy = [children.props["aria-describedby"], feedbackId]
    .filter(Boolean)
    .join(" ") || undefined;
  const control = cloneElement(children, { "aria-describedby": describedBy });

  return (
    <div className="ui-field">
      <label htmlFor={htmlFor}>{label}</label>
      {control}
      {hint && !error ? (
        <p className="ui-field__hint" id={feedbackId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ui-field__error" id={feedbackId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
