import { sendEmail } from "./email";

export async function sendResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  const subject = "Reset your password";
  const html = `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;
  await sendEmail({ to, subject, html });
}
