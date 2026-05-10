/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });
  }

  async sendResetCode(to: string, code: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Socialniy Store" <${this.configService.get<string>('SMTP_EMAIL')}>`,
        to,
        subject: 'Код для сброса пароля',
        html: `
          <h2>Восстановление пароля</h2>
          <p>Ваш код: <b>${code}</b></p>
          <p>Код действителен 15 минут.</p>
          <p>Если вы не запрашивали сброс пароля — проигнорируйте это письмо.</p>
        `,
      });

      this.logger.log(`✅ Письмо успешно отправлено на ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error('❌ Ошибка отправки email:', error.message);
      this.logger.error('Код ошибки:', error.code);
      return false;
    }
  }
}
