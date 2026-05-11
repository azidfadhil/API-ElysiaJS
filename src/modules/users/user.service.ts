import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { prisma } from "../../database/prisma"
import { NotFoundError, ConflictError } from "../../utils/errors"

const userSelect = {
  id: true,
  full_name: true,
  username: true,
  email: true,
  created_at: true,
  updated_at: true
}

export async function getUsers(page: number, perPage: number) {
  const skip = (page - 1) * perPage

  const totalData = await prisma.mst_users.count({
    where: { deleted_at: null }
  })

  const users = await prisma.mst_users.findMany({
    where: { deleted_at: null },
    select: userSelect,
    skip,
    take: perPage
  })

  const totalPage = Math.ceil(totalData / perPage)

  return {
    pagination: {
      total_data: totalData,
      total_page: totalPage,
      per_page: perPage,
      page
    },
    users
  }

}

export async function getUserById(id: bigint) {

  const user = await prisma.mst_users.findFirst({
    where: { id, deleted_at: null },
    select: userSelect
  })

  if (!user) throw new NotFoundError("User not found")

  return user
}

export async function createUser(body: {
  full_name: string
  username: string
  email: string
  password: string
}) {
  try {
    const hashedPassword = await bcrypt.hash(body.password, 10)

    return await prisma.mst_users.create({
      data: {
        full_name: body.full_name,
        username: body.username,
        email: body.email,
        password_hash: hashedPassword
      },
      select: userSelect
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError("Email or username already exists")
      }
    }
    throw error
  }
}

export async function updateUser(
  id: bigint,
  body: {
    full_name?: string
    username?: string
    email?: string
    password?: string
  }
) {
  await getUserById(id)

  try {
    const data: Prisma.mst_usersUpdateInput = {}

    if (body.full_name) data.full_name = body.full_name
    if (body.username)  data.username  = body.username
    if (body.email)     data.email     = body.email
    if (body.password)  data.password_hash = await bcrypt.hash(body.password, 10)

    return await prisma.mst_users.update({
      where: { id },
      data,
      select: userSelect
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError("Email or username already exists")
      }
    }
    throw error
  }
}

export async function deleteUser(id: bigint) {
  await getUserById(id)

  return await prisma.mst_users.update({
    where: { id },
    data: { deleted_at: new Date() }
  })
}