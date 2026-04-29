/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

const BASE_URL = 'https://api.socialniy.ru'; // твой домен

const data = JSON.parse(
  fs.readFileSync('./result.json', 'utf-8'), // путь к json из Telegram
);
const CATEGORY_MAP: Record<string, { category: string; subcategory: string }> =
  {
    костюм: { category: 'Одежда', subcategory: 'Костюмы' },
    кофта: { category: 'Одежда', subcategory: 'Кофты' },
    толстовка: { category: 'Одежда', subcategory: 'Толстовки' },
    футболка: { category: 'Одежда', subcategory: 'Футболки' },
    платье: { category: 'Одежда', subcategory: 'Платья/Сарафаны' },
    сарафан: { category: 'Одежда', subcategory: 'Платья/Сарафаны' },
    шорты: { category: 'Одежда', subcategory: 'Шорты' },
    брюки: { category: 'Одежда', subcategory: 'Брюки' },
    лосины: { category: 'Одежда', subcategory: 'Лосины' },
    пижама: { category: 'Одежда', subcategory: 'Пижамы' },

    тапочки: { category: 'Обувь', subcategory: 'Тапочки' },

    сумка: { category: 'Аксессуары', subcategory: 'Сумки' },
    зонт: { category: 'Аксессуары', subcategory: 'Зонты' },

    полотенце: { category: 'Домашний текстиль', subcategory: 'Полотенца' },
    плед: { category: 'Домашний текстиль', subcategory: 'Пледы' },
  };
function detectCategory(title: string) {
  const lower = title.toLowerCase();

  const match = Object.keys(CATEGORY_MAP).find((key) => lower.includes(key));

  if (match) return CATEGORY_MAP[match];

  return {
    category: 'Одежда',
    subcategory: 'Прочее',
  };
}
async function main() {
  const products: Prisma.ProductCreateManyInput[] = [];

  for (const msg of data.messages) {
    if (!msg.photo) continue;

    let text = '';

    if (typeof msg.text === 'string') {
      text = msg.text;
    } else if (Array.isArray(msg.text)) {
      text = msg.text
        .map((t: any) => (typeof t === 'string' ? t : t.text || ''))
        .join('');
    }

    if (!text.trim()) continue;

    const lines = text
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean);

    if (!lines.length) continue;

    const title = lines[0];
    const description = lines.slice(1).join('\n');

    const imageUrl = `${BASE_URL}/${msg.photo} `;
    const { category, subcategory } = detectCategory(title);

    products.push({
      title,
      description,
      image: imageUrl,
      category,
      subcategory,
      price: 0,
      stock: 10,
    });
  }

  console.log(`Найдено товаров: ${products.length}`);

  await prisma.product.createMany({
    data: products,
  });

  console.log('✅ Все товары добавлены');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
