import { t } from "elysia"

export const loginSchema = t.Object({
  email: t.String({
    format: "email"
  }),
  password: t.String({
    minLength: 8
  })
})