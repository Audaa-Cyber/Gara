import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail({ to, subject, text }: SendEmailInput) {
  const from = process.env.EMAIL_FROM;

  if (!resend || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[Gara email: development only]", { to, subject, text });
      return;
    }

    throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured to send email.");
  }

  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) {
    throw new Error(`Unable to send transactional email: ${error.message}`);
  }
}