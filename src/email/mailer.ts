import nodemailer from 'nodemailer';

import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.email.smtpHost,
  port: env.email.smtpPort,
  auth: {
    user: env.email.smtpUser,
    pass: env.email.smtpPassword,
  },
});

export interface PasswordResetEmailPayload {
  email: string;
  resetToken: string;
  resetUrl: string;
}

export const sendPasswordResetEmail = async ({ email, resetToken, resetUrl }: PasswordResetEmailPayload) => {
  const message = {
    to: email,
    from: env.email.from,
    subject: 'Reset your EduHub Academy password',
    text: `We received a request to reset your password. Use this token: ${resetToken}. Or visit ${resetUrl}. If you didn't request this, you can ignore the email.`,
    html: `
      <p>We received a request to reset your password.</p>
      <p>Your reset token is <strong>${resetToken}</strong>.</p>
      <p>You can also <a href="${resetUrl}">reset your password by clicking here</a>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(message);
};
