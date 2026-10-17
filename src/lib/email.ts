import { Resend } from "resend";
import { env } from "@/lib/env";

type EmailInput = { to: string; subject: string; text: string; html: string };

export async function sendTransactionalEmail(input: EmailInput): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.");
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM, to: input.to, subject: input.subject, text: input.text, html: input.html,
  });
  if (error) throw new Error("Resend could not send the email: " + error.message);
}
