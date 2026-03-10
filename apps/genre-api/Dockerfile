FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build genre-api

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist/apps/genre-api ./dist/apps/genre-api
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

CMD ["node", "dist/apps/genre-api/main"]
