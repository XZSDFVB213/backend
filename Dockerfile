# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# зависимости
COPY package*.json ./
RUN npm install

# копируем проект
COPY . .

# генерим prisma client
RUN npx prisma generate

# билдим nest
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# ставим только prod зависимости
COPY package*.json ./
RUN npm install --omit=dev

# копируем build + prisma runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# порт
EXPOSE 3000

# запуск
CMD ["node", "dist/main.js"]
