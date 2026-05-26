/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/frontol/frontol.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { VerifyCodeDto } from '../notification/dto/veryfy.dto';

@Injectable()
export class FrontolService {
  private readonly logger = new Logger(FrontolService.name);

  constructor(private notificationService: NotificationService) {}

  validateAccessKey(key: string): boolean {
    return key === process.env.FRONTOL_ACCESS_KEY;
  }

  async handleRequest(body: any) {
    const { method } = body;
    this.logger.log(`Frontol → method: ${method}`);

    switch (method) {
      case 'searchClient':
        return this.searchClient(body);

      case 'calculate':
        return this.calculate(body);

      case 'processDocument':
        return { success: true };

      default:
        return { success: false, error: `Неизвестный метод: ${method}` };
    }
  }

  // 1. Кассир ввёл номер телефона → отправляем код
  private async searchClient(body: any) {
    const phone = body.phone || body.params?.phone;

    if (!phone) throw new BadRequestException('Телефон обязателен');

    try {
      await this.notificationService.sendDiscountCode(phone);

      return {
        success: true,
        client: {
          id: phone,
          cardNumber: phone,
          phone: phone,
          name: 'Клиент',
        },
        message: 'Код отправлен в приложение',
      };
    } catch (error: any) {
      this.logger.error(error.message);

      return {
        success: true,
        client: null,
        message: error.message,
      };
    }
  }

  // 2. Кассир ввёл код → проверяем и даём скидку
  private async calculate(body: any) {
    const phone = body.client?.phone || body.client?.cardNumber || body.phone;
    const code = body.code || body.params?.code;

    if (!phone || !code) {
      return { success: true, discounts: [] };
    }

    try {
      const result = await this.notificationService.verifyDiscountCode({
        phone,
        code,
      } as VerifyCodeDto);

      if (result.success) {
        return {
          success: true,
          discounts: [
            {
              type: 'percent',
              value: 30,
              comment: 'Скидка по подписке',
              applyToAll: true,
            },
          ],
        };
      } else {
        return {
          success: true,
          discounts: [],
          message: result.message || 'Код неверный',
        };
      }
    } catch (error) {
      this.logger.error(error);
      return { success: true, discounts: [], message: 'Ошибка проверки кода' };
    }
  }
}
