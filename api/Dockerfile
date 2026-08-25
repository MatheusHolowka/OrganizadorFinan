# Multi-stage Dockerfile para NestJS com Prisma ORM
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copia código-fonte e compila
COPY . .
RUN npx prisma generate
RUN npm run build

# Produção
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instala dependências de runtime e OpenSSL para o Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

# Copia build e Prisma gerado
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main"]
