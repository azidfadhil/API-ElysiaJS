import "dotenv/config"

import { Elysia } from "elysia"
import { swagger } from "@elysiajs/swagger"

import { prisma } from "./database/prisma"
import { userModule } from "./modules/users/user.route"

async function bootstrap() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")

    const app = new Elysia()

      .group("/api/v1", (app) =>
        app
          .get("/", () => ({
            message: "API ElysiaJS! 🚀"
          }))
          .use(userModule)
      )

      .use(
        swagger({
          documentation: {
            info: {
              title: "ElysiaJS API",
              version: "1.0.0"
            }
          }
        })
      )

      .listen(Bun.env.PORT || 3000)

    console.log(
      `🦊 Server running at http://${app.server?.hostname}:${app.server?.port}`
    )
  } catch (error) {
    console.error("❌ Failed to start application")
    console.error(error)

    process.exit(1)
  }
}

bootstrap()