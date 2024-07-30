FROM oven/bun:1 AS base

WORKDIR /app

COPY bun.lockb package.json /app/

RUN bun install --frozen-lockfile --production

COPY . .

RUN bun build --compile src/index.ts --outfile ./server

FROM scratch

COPY  dest