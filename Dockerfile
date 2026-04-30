FROM node:20-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Копируем package.json и устанавливаем все зависимости (для сборки)
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Генерируем Prisma Client и собираем приложение
RUN npx prisma generate
RUN npm run build

# Переключаемся в production
ENV NODE_ENV=production

# Устанавливаем только production зависимости
RUN npm ci --omit=dev --ignore-scripts

# Запуск
CMD ["node", "dist/main.js"]
