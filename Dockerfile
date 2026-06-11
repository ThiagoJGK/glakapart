# syntax=docker/dockerfile:1

# Stage 1: Base image with dependencies
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./

# Stage 2: Install dependencies
FROM base AS deps
RUN npm ci

# Stage 3: Development Environment
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 4: Production Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 5: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets (standalone does not bundle these by design)
COPY --from=builder /app/public ./public

# Setup cache permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output and apply non-root permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
