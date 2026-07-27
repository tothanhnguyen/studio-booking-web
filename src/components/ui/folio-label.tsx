export type FolioLabelProps = Readonly<{ text: string }>;

export function FolioLabel({ text }: FolioLabelProps) {
  return <p className="folio-label">{text}</p>;
}
