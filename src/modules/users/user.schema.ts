import { t } from "elysia"

export const createUserSchema = t.Object({
  full_name: t.String({
    minLength: 3
  }),

  username: t.String({
    minLength: 3
  }),

  email: t.String({
    format: "email"
  }),

  password: t.String({
    minLength: 8
  })
})

export const updateUserSchema = t.Object({
  full_name: t.String({
    minLength: 3
  }),

  username: t.String({
    minLength: 3
  }),

  email: t.String({
    format: "email"
  }),

  password: t.String({
    minLength: 8
  })
})