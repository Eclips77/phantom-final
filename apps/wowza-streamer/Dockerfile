FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build wowza-streamer

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist/apps/wowza-streamer ./dist/apps/wowza-streamer
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

CMD ["node", "dist/apps/wowza-streamer/main"]
