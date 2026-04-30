FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

# Оставляем только нужное для продакшена
RUN npm ci --omit=dev --ignore-scripts

CMD ["npm", "run", "start:prod"]