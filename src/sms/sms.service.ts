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
      host: 'smtp.yandex.ru', // или smtp.yandex.com
      port: 465,
      secure: true, // true для 465, false для 587
      auth: {
        user: this.configService.get<string>('SMTP_EMAIL'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      // Дополнительные параметры для стабильности
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  async sendResetCode(to: string, code: string): Promise<boolean> {
    const html = `
      <h2>Сброс пароля</h2>
      <p>Ваш код для сброса пароля: <strong>${code}</strong></p>
      <p>Код действует 15 минут.</p>
      <p>Если вы не запрашивали сброс — проигнорируйте это письмо.</p>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"Ваш Магазин" <${this.configService.get<string>('SMTP_EMAIL')}>`,
        to,
        subject: 'Код для сброса пароля',
        html,
      });

      this.logger.log(
        `✅ Письмо отправлено на ${to} | MessageId: ${info.messageId}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error('❌ Ошибка отправки email:', error.message);
      if (error.code) this.logger.error('Код ошибки:', error.code);
      return false;
    }
  }
}
