import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "no-reply@sharetune.local";

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn("SMTP is not configured. Email sending will fail.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Verify your Sharetune account",
    text: `Verify your email address by clicking this link: ${verifyUrl}`,
    html: `
      <p>Verify your email address by clicking this link:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
    `,
  });
}
