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
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // для 587
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
      // Увеличенные таймауты специально для Docker
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: true, // ← включил debug
      logger: true, // ← логи nodemailer
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
