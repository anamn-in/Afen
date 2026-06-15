# Multi‑stage build for Afen
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY configs/package*.json ./
COPY configs/tsconfig.json ./configs/
COPY ui/package*.json ./ui/

# Install all dependencies (including dev)
RUN npm install && cd ui && npm install

# Copy source code
COPY src ./src
COPY packages ./packages
COPY ui ./ui

# Build backend (tsc && tsc-alias)
RUN npx tsc -p configs/tsconfig.json --outDir /app/dist && npx tsc-alias -p configs/tsconfig.json --outDir /app/dist

# Build UI
WORKDIR /app/ui
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ui/dist ./ui/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]