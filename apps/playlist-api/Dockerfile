FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build playlist-api

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist/apps/playlist-api ./dist/apps/playlist-api
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

CMD ["node", "dist/apps/playlist-api/main"]
