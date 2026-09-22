FROM node:22-bookworm-slim AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

ENV NODE_ENV=development
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev -- --hostname 0.0.0.0"]
