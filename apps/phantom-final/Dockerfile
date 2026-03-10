FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build phantom-final

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist/apps/phantom-final ./dist/apps/phantom-final
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

CMD ["node", "dist/apps/phantom-final/main"]
