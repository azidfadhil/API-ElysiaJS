import "dotenv/config"

import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { swagger } from "@elysiajs/swagger"

import { prisma } from "./database/prisma"
import { AppError } from "./utils/errors"
import { UnauthorizedError } from "./utils/errors"

import { authModule } from "./modules/auth/auth.route"
import { userModule } from "./modules/users/user.route"

async function bootstrap() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")

    const app = new Elysia()

      .onError(({ code, error, set }) => {
        if (error instanceof AppError) {
          set.status = error.statusCode
          return {
            error: error.statusCode,
            message: error.message,
            pagination: null,
            data: null
          }
        }

        if (code === "VALIDATION") {
          set.status = 422
          return {
            error: 422,
            message: "Validation failed",
            pagination: null,
            data: null
          }
        }

        console.error(`[ERROR] ${error}`)
        set.status = 500
        return {
          error: 500,
          message: "Internal server error",
          pagination: null,
          data: null
        }
      })

      .use(
        jwt({
          name: "jwt",
          secret: Bun.env.JWT_SECRET!
        })
      )

      .group("/api/v1", (app) =>
        app
          .get("/", () => ({ message: "API ElysiaJS! 🚀" }))
          .use(authModule)
          .guard(
            {
              beforeHandle: async ({ jwt, headers }) => {

                const authorization = headers["authorization"]

                if (!authorization || !authorization.startsWith("Bearer ")) {
                  throw new UnauthorizedError("Missing or invalid authorization header")
                }

                const token = authorization.split(" ")[1]
                const payload = await jwt.verify(token)

                if (!payload) {
                  throw new UnauthorizedError("Invalid or expired token")
                }
              }
            },
            (app) => app.use(userModule)
          )
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