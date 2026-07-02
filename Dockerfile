# # syntax=docker/dockerfile:1.6

# ARG NODE_VERSION=20.12.2

# FROM node:${NODE_VERSION}-bullseye AS base
# ENV NODE_ENV=production
# WORKDIR /app

# FROM base AS deps
# ENV NODE_ENV=development
# COPY package.json package-lock.json* ./
# RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# FROM deps AS build
# COPY tsconfig.json ./
# COPY src ./src
# RUN npm run build
# RUN npm prune --omit=dev

# FROM base AS release
# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app/dist ./dist
# COPY package.json ./
# EXPOSE 4000
# CMD ["node", "dist/server.js"]


# syntax=docker/dockerfile:1.6

ARG NODE_VERSION=20.19.6 

FROM node:${NODE_VERSION}-bookworm AS base
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

FROM node:${NODE_VERSION}-bookworm-slim AS release
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
