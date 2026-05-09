/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/sms/sms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = 'https://api.socialniy.ru/';

  constructor(private configService: ConfigService) {}
  private normalizePhone(phone: string): string {
    // Убираем все нецифровые символы
    let cleaned = phone.replace(/\D/g, '');

    // Если начинается с 8, меняем на 7
    if (cleaned.startsWith('8') && cleaned.length === 11) {
      cleaned = '7' + cleaned.slice(1);
    }

    // Если номер без кода страны и 10 цифр — добавляем 7
    if (cleaned.length === 10) {
      cleaned = '7' + cleaned;
    }

    return cleaned;
  }
  async sendResetCode(phone: string, code: string): Promise<boolean> {
    const text = `Ваш код для сброса пароля: ${code}. Действует 15 минут. Не передавайте его третьим лицам.`;

    try {
      const params = {
        method: 'push_msg',
        email: this.configService.get<string>('SMS_EMAIL'),
        password: this.configService.get<string>('SMS_PASSWORD'),
        text: text,
        phone: this.normalizePhone(phone), // ← рекомендуется добавить
        sender_name: this.configService.get<string>('SMS_SENDER_NAME'),
      };

      const response = await axios.get(this.apiUrl, { params });

      this.logger.log(`SMS sent successfully to ${phone}`);

      // Проверка ответа API
      if (response.data?.response?.msg?.err_code === 0) {
        return true;
      } else {
        this.logger.warn('SMS API returned error:', response.data);
        return false;
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error?.message || String(error);

      this.logger.error(`Failed to send SMS to ${phone}`, errorMsg);
      return false;
    }
  }
}
