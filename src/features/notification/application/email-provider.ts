export type SendEmailInput = Readonly<{
  to: string;
  subject: string;
  html: string;
}>;

export interface EmailProvider {
  send(input: SendEmailInput): Promise<{ providerReference: string }>;
}
