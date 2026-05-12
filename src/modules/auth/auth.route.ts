import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"

import { login } from "./auth.service"
import { loginSchema } from "./auth.schema"
import { response } from "../../utils/response"

export const authModule = new Elysia({ prefix: "/auth" })

  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
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