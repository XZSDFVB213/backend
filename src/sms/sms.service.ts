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
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      logger: true,
      debug: true,
      auth: {
        user: process.env.MAIL_ADRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendResetCode(to: string, code: string): Promise<boolean> {
    try {
      this.logger.log(`📧 Пытаемся отправить письмо на ${to}`);

      const info = await this.transporter.sendMail({
        from: `"Socialniy Store" <${this.configService.get<string>('SMTP_EMAIL')}>`,
        to,
        subject: 'Код для сброса пароля',
        html: `
          <h2>Восстановление пароля</h2>
          <p>Ваш код: <strong>${code}</strong></p>
          <p>Код действует 15 минут.</p>
          <p style="color: #666;">Если вы не запрашивали сброс — проигнорируйте письмо.</p>
        `,
      });

      this.logger.log(`✅ Письмо отправлено! MessageId: ${info.messageId}`);
      return true;
    } catch (error: any) {
      this.logger.error('❌ Ошибка отправки email:');
      this.logger.error('Сообщение:', error.message);
      this.logger.error('Код:', error.code);
      this.logger.error('Команда:', error.command);
      return false;
    }
  }
}
