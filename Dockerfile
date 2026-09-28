FROM node:22-bookworm-slim
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json .npmrc ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts
COPY replit.md ./.

RUN pnpm install --frozen-lockfile
RUN pnpm run build:production

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["sh", "-c", "pnpm --filter @workspace/db push && if [ \"${SEED_DEMO:-false}\" = \"true\" ]; then pnpm --filter @workspace/api-server seed; fi && pnpm --filter @workspace/api-server start"]
