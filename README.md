## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.
Resources
Check out a few resources that may come in handy when working with NestJS:

Visit the NestJS Documentation to learn more about the framework.
For questions and support, please visit our Discord channel.
To dive deeper and get more hands-on experience, check out our official video courses.
Deploy your application to AWS with the help of NestJS Mau in just a few clicks.
Visualize your application graph and interact with the NestJS application in real-time using NestJS Devtools.
Need help with your project (part-time to full-time)? Check out our official enterprise support.
To stay in the loop and get updates, follow us on X and LinkedIn.
Looking for a job, or have a job to offer? Check out our official Jobs board.

Support
Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please read more here.
Stay in touch

Author - Kamil Myśliwiec
Website - https://nestjs.com
Twitter - @nestframework

License
Nest is MIT licensed.

Интеграция Frontol с системой подписок
Базовый URL
texthttps://api.socialniy.ru

1. Проверка подписки
Отправить код подтверждения
POST /notifications/verification/send
JSON{
  "phone": "+79991234567"
}
После запроса пользователю в мобильное приложение приходит push-уведомление с 4-значным кодом.

Проверить код и получить статус подписки
POST /notifications/verification/verify
JSON{
  "phone": "+79991234567",
  "code": "1234"
}
Успешный ответ:
JSON{
  "verified": true,
  "subscription": {
    "active": true,
    "expiresAt": "2026-12-31T00:00:00.000Z"
  }
}

2. Применение скидки (для кассы)
Отправить код на использование скидки
POST /notifications/discount/send
JSON{
  "phone": "+79991234567"
}
Условия использования:

Подписка должна быть активна
Скидку можно использовать не чаще одного раза в 12 часов


Проверить код скидки
POST /notifications/discount/verify
JSON{
  "phone": "+79991234567",
  "code": "1234"
}
Успешный ответ:
JSON{
  "success": true,
  "discount": 30
}
Возможные ошибки:
JSON{
  "success": false,
  "message": "Скидка уже использована"
}
JSON{
  "success": false,
  "message": "Подписка не активна"
}
JSON{
  "success": false,
  "message": "Неверный код"
}

3. Получение и активация дисконтных карт
Получить все доступные скидки
GET /discount/all
Ответ:
JSON{
  "discounts": [
    {
      "id": 1,
      "name": "Стандартная карта",
      "discountPercent": 30,
      "description": "Скидка 30% на весь ассортимент"
    }
  ]
}
Получить мою дисконтную карту
GET /discount/me
Headers:
httpAuthorization: Bearer <jwt-token>
Активировать / продлить подписку на карту
POST /discount/activate
JSON{
  "phone": "+79991234567",
  "days": 365
}

Сценарий работы кассира

Кассир вводит номер телефона клиента
Frontol отправляет запрос POST /notifications/discount/send
Клиент получает код в приложении
Кассир вводит полученный код
Frontol отправляет запрос POST /notifications/discount/verify
При success: true — применяется скидка 30%
При ошибке — скидка не применяется