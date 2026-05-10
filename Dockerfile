FROM oven/bun:1.3.13

WORKDIR /app

# 1. Install dependencies
COPY package.json bun.lock ./
RUN bun install

# 2. Copy source
COPY . .

# 3. Generate Prisma Client
RUN bunx prisma generate

# 4. Expose port
EXPOSE 3000

# 5. Run app (langsung src, no build dulu)
CMD ["bun", "run", "src/index.ts"]