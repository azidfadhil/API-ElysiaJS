import bcrypt from "bcryptjs"

import { prisma } from "../../database/prisma"

export async function getUsers(
  page: number,
  perPage: number
) {

  const skip = (page - 1) * perPage

  const totalData = await prisma.mst_users.count({
    where: {
      deleted_at: null
    }
  })

  const users = await prisma.mst_users.findMany({
    where: {
      deleted_at: null
    },
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

  return await prisma.mst_users.findFirst({
    where: {
      id,
      deleted_at: null
    }
  })

}

export async function createUser(body: {
  full_name: string
  username: string
  email: string
  password: string
}) {

  const hashedPassword = await bcrypt.hash(body.password, 10)

  return await prisma.mst_users.create({
    data: {
      full_name: body.full_name,
      username: body.username,
      email: body.email,
      password_hash: hashedPassword
    }
  })

}

export async function updateUser(
  id: bigint,
  body: {
    full_name: string
    username: string
    email: string
    password: string
  }
) {

  const hashedPassword = await bcrypt.hash(body.password, 10)

  return await prisma.mst_users.update({
    where: {
      id
    },
    data: {
      full_name: body.full_name,
      username: body.username,
      email: body.email,
      password_hash: hashedPassword
    }
  })

}

export async function deleteUser(id: bigint) {

  return await prisma.mst_users.update({
    where: {
      id
    },
    data: {
      deleted_at: new Date()
    }
  })

}