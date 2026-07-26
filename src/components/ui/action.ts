type ActionVariant = "primary" | "secondary" | "tertiary" | "danger";

export function actionClassName(
  variant: ActionVariant = "primary",
  isCompact = false,
) {
  return [
    "ui-action",
    `ui-action--${variant}`,
    isCompact ? "ui-action--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
