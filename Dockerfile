FROM node:22-bookworm-slim AS development

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --global npm@11.6.0

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

ENV NODE_ENV=development
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev -- --hostname 0.0.0.0"]
