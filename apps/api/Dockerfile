# ──────────────── BUILD STAGE ────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies (including dev) for build + prisma generate
COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./tsconfig.json
COPY prisma ./prisma
COPY src ./src

RUN npm run build
RUN npx prisma generate

# ──────────────── RUNTIME STAGE ────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prisma needs OpenSSL on Debian-based images
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npm prune --omit=dev

EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
