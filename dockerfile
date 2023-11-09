# Build container
FROM node:20-alpine as builder

# Enable Corepack
RUN corepack enable

# Cartella della webapp
RUN mkdir -p /yaci
WORKDIR /yaci

# Install Dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Build production
COPY . ./
RUN pnpm run build

# Final production container
FROM node:20-alpine as runtime

USER node

WORKDIR /yaci

COPY --link --from=builder /yaci/.output/  ./.output
COPY --link --from=builder /yaci/public ./public
COPY --link --from=builder /yaci/assets ./assets

EXPOSE 3000

ENTRYPOINT [ "node", ".output/server/index.mjs" ]