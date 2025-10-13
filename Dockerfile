# syntax=docker/dockerfile:1.6

ARG NODE_VERSION=20.12.2

FROM node:${NODE_VERSION}-bullseye AS base
ENV NODE_ENV=production
WORKDIR /app

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM base AS release
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/server.js"]
