import type { EmailProvider, SendEmailInput } from "@/features/notification/application/email-provider";

type ResendResponse = Readonly<{
  id?: string;
  error?: { message?: string };
}>;

export class ResendEmailProvider implements EmailProvider {
  constructor(private readonly config: { apiKey?: string; fromEmail?: string }) {}

  async send(input: SendEmailInput): Promise<{ providerReference: string }> {
    if (!this.config.apiKey || !this.config.fromEmail) {
      throw new Error("Thiếu cấu hình RESEND_API_KEY hoặc NOTIFICATION_FROM_EMAIL.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.fromEmail,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
    const body = (await response.json()) as ResendResponse;
    if (!response.ok || !body.id) {
      throw new Error(body.error?.message ?? "Resend từ chối gửi email.");
    }

    return { providerReference: body.id };
  }
}
