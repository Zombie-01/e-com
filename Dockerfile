# 1️⃣ Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc compatibility (important for some packages)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci


# 2️⃣ Build the app
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma client before building
RUN npx prisma generate

RUN npm run build


# 3️⃣ Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# Copy built files
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Create uploads folder
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

USER node

EXPOSE 3000

CMD ["npm", "start"]
