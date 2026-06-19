FROM node:20-bookworm-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
