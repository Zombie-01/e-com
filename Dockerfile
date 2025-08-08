# 1. Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; \
    fi

# 2. Build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma client before building
RUN npx prisma generate
RUN npm run build

# 3. Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy files from the builder stage
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Create uploads folder and set ownership (mounted by volume)
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

# Switch to the non-root user
USER node

EXPOSE 3000
CMD ["npm", "start"]
