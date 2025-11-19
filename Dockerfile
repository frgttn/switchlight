# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS deps
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json tsconfig.json
COPY drizzle.config.ts drizzle.config.ts
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /usr/src/app/dist ./dist
COPY src/database/migrations ./src/database/migrations
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]
