# ---------- base ----------
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

# ---------- build ----------
FROM base AS build

COPY . .

RUN npx prisma generate
RUN npm run build

# ---------- production ----------
FROM node:20-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

# 👇 ВАЖНО: Prisma + build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma

CMD ["node", "dist/main.js"]