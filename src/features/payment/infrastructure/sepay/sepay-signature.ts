import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySepaySignature(input: {
  rawBody: string;
  signatureHeader: string | null;
  webhookSecret?: string;
}) {
  if (!input.webhookSecret) {
    return true;
  }

  if (!input.signatureHeader) {
    return false;
  }

  const expected = createHmac("sha256", input.webhookSecret)
    .update(input.rawBody, "utf8")
    .digest("hex");
  const actualBuffer = Buffer.from(input.signatureHeader, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
