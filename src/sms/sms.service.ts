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

  async sendResetCode(phone: string, code: string): Promise<boolean> {
    // Убираем возможный '+' в начале
    let cleanPhone = phone.replace('+', '');

    // Если начинается с 8 → меняем на 7
    if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
      cleanPhone = '7' + cleanPhone.slice(1);
    }

    const text = `Ваш код для сброса пароля: ${code}. Действует 15 минут.`;

    try {
      const params = {
        method: 'push_msg',
        email: this.configService.get<string>('SMS_EMAIL'),
        password: this.configService.get<string>('SMS_PASSWORD'),
        text: text,
        phone: cleanPhone,
        sender_name: this.configService.get<string>('SMS_SENDER_NAME'),
      };

      console.log(`📤 Отправка SMS на номер: ${cleanPhone}`); // ← для отладки

      const response = await axios.get(this.apiUrl, { params });

      console.log('📥 Ответ от SMS API:', response.data);

      if (response.data?.response?.msg?.err_code === 0) {
        console.log(`✅ SMS успешно отправлен на ${cleanPhone}`);
        return true;
      } else {
        console.warn('❌ SMS API вернул ошибку:', response.data);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Ошибка при отправке SMS:');
      console.error(error?.response?.data || error.message);
      return false;
    }
  }
}
