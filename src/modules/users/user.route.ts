import { Elysia, t } from "elysia"
import { response } from "../../utils/response"
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "./user.service"
import { createUserSchema, updateUserSchema } from "./user.schema"

export const userModule = new Elysia({ prefix: "/users" })

  .get("/", async ({ query }) => {
    const page = Number(query.page || 1)
    const perPage = Number(query.per_page || 10)
    const result = await getUsers(page, perPage)

    return response({
      message: result.users.length > 0 ? "Success get users" : "Users not found",
      pagination: result.pagination,
      data: result.users
    })
  })

  .get("/:id", async ({ params }) => {
    const user = await getUserById(BigInt(params.id))

    return response({
      message: "Success get user",
      data: user
    })
  })

  .post("/", async ({ body, set }) => {
      const user = await createUser(body)
      set.status = 201

      return response({
        message: "User created successfully",
        data: user
      })
    }, 
    { body: createUserSchema }
  )

  .put("/:id", async ({ params, body }) => {
      const user = await updateUser(BigInt(params.id), body)

      return response({
        message: "User updated successfully",
        data: user
      })
    },
    { body: updateUserSchema }
  )

  .delete("/:id", async ({ params }) => {
    await deleteUser(BigInt(params.id))

    return response({
      message: "User deleted successfully"
    })
  })