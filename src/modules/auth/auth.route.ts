import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"

import { login, getMe } from "./auth.service"
import { loginSchema } from "./auth.schema"
import { response } from "../../utils/response"
import { env } from "../../config/env"
import { UnauthorizedError } from "../../utils/errors"

export const authModule = new Elysia({ prefix: "/auth" })

  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET!,
      exp: "7d"
    })
  )

  .post("/login", async ({ body, jwt }) => {
    const data = await login(body.email, body.password)

    const token = await jwt.sign({
      id: data.user.id.toString(),
      email: data.user.email
    })

    return response({
      message: "Login successful",
      data: {
        access_token: token,
        user: data.user,
        menus: data.menus,
        permissions: data.permissions
      }
    })
  }, { body: loginSchema })

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
    (app) => app
      .get("/me", async ({ jwt, headers }) => {
        const token = headers["authorization"]!.split(" ")[1]
        const payload = await jwt.verify(token)

        if (!payload) {
          throw new UnauthorizedError("Invalid or expired token")
        }

        const data = await getMe(BigInt(payload!.id as string))

        return response({
          message: "Success get current user",
          data: {
            user: data.user,
            menus: data.menus,
            permissions: data.permissions
          }
        })
      })
  )