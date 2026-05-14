import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: Bun.env.DB_URL
    }
  }
})