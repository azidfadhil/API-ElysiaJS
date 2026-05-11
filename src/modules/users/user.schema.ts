import { t } from "elysia"

const baseUserSchema = {
  full_name: t.String({ minLength: 3 }),
  username:  t.String({ minLength: 3 }),
  email:     t.String({ format: "email" }),
  password:  t.String({ minLength: 8 })
}

export const createUserSchema = t.Object(baseUserSchema)

export const updateUserSchema = t.Object({
  full_name: t.Optional(baseUserSchema.full_name),
  username:  t.Optional(baseUserSchema.username),
  email:     t.Optional(baseUserSchema.email),
  password:  t.Optional(baseUserSchema.password)
})