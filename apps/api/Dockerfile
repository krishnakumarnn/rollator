FROM node:20-bullseye

# Prisma needs OpenSSL on Debian-based images
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm","run","start:dev"]
