/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL!,
      pass: process.env.SMTP_PASSWORD!,
    },
  });

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    const mail = await this.transporter.sendMail({
      from: `"Социальный" <${process.env.SMTP_EMAIL!}>`,
      to,
      subject,
      html,
    });

    return !!mail.messageId;
  }

  async sendResetCode(email: string, code: string): Promise<boolean> {
    return this.sendMail(
      email,
      'Сброс пароля',
      `
      <div style="font-family:sans-serif">
        <h2>Код восстановления</h2>
        <h1>${code}</h1>
        <p>Код действует 5 минут</p>
      </div>
      `,
    );
  }
}
