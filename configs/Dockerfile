FROM node:20-alpine AS builder

WORKDIR /app

COPY configs/package*.json ./configs/
COPY configs/tsconfig.json ./configs/

WORKDIR /app/configs
RUN npm install

WORKDIR /app
COPY src ./src

WORKDIR /app/configs
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app/configs

ENV NODE_ENV=production
ENV PORT=8787
ENV AFEN_PORT=8787
ENV AFEN_RUNTIME_HOST=0.0.0.0

COPY configs/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/configs/dist ./dist

EXPOSE 8787

CMD ["node", "-r", "module-alias/register", "dist/index.js"]