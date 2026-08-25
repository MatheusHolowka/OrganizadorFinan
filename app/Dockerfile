# Multi-stage Dockerfile para Angular com Server-Side Rendering (SSR)
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia código-fonte e compila para SSR/Browser
COPY . .
RUN npm run build

# Produção
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia saída de compilação do Angular (browser e server)
COPY --from=builder /app/dist ./dist

EXPOSE 4200

CMD ["node", "dist/app/server/server.mjs"]
