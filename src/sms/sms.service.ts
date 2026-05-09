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

  constructor(private configService: ConfigService) {}
  private readonly apiUrl = 'https://ssl.bs00.ru/';
  async sendResetCode(phone: string, code: string): Promise<boolean> {
    // Нормализация номера
    let cleanPhone = phone.replace('+', '').replace(/\D/g, '');
    if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
      cleanPhone = '7' + cleanPhone.slice(1);
    }
    if (cleanPhone.length === 10) {
      cleanPhone = '7' + cleanPhone;
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
        priority: 1, // важно для кодов!
        format: 'json', // удобнее работать
      };

      console.log(`📤 Отправка SMS → ${cleanPhone} | Код: ${code}`);

      const response = await axios.get(this.apiUrl, { params });

      console.log('📥 Ответ API:', JSON.stringify(response.data, null, 2));

      const errCode = response.data?.response?.msg?.err_code;

      if (errCode === 0 || errCode === '0') {
        console.log(`✅ SMS УСПЕШНО ОТПРАВЛЕН на ${cleanPhone}`);
        return true;
      } else {
        console.error('❌ Ошибка API:', response.data?.response?.msg);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Ошибка соединения с SMS API:');
      console.error(error?.response?.data || error.message);
      return false;
    }
  }
}
