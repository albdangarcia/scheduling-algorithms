FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma's migration engine needs OpenSSL in the Debian slim image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# postinstall generates the client with its schema and configuration available.
RUN npm ci --no-audit --no-fund

# Run this target once at deployment time with the database environment supplied.
FROM dependencies AS migrations
ENV NODE_ENV=production
USER node
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]

FROM dependencies AS builder
ENV NODE_ENV=production \
    NEXT_OUTPUT=standalone
COPY . .
# Build the image without running migrations or requiring database credentials.
RUN ./node_modules/.bin/next build

FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
