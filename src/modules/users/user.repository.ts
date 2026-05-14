import { prisma } from "../../database/prisma"

const userSelect = {
  id: true,
  full_name: true,
  username: true,
  email: true,
  created_at: true,
  updated_at: true
}

export const userRepository = {
  async findAll(skip: number, take: number) {
    return await prisma.mst_users.findMany({
      where: { deleted_at: null },
      select: userSelect,
      skip,
      take
    })
  },

  async countAll() {
    return await prisma.mst_users.count({
      where: { deleted_at: null }
    })
  },

  async findById(id: bigint) {
    return await prisma.mst_users.findFirst({
      where: { id, deleted_at: null },
      select: userSelect
    })
  },

  async findByEmail(email: string) {
    return await prisma.mst_users.findFirst({
      where: { email, deleted_at: null }
    })
  },

  async findByUsername(username: string) {
    return await prisma.mst_users.findFirst({
      where: { username, deleted_at: null }
    })
  },

  async create(data: {
    full_name: string
    username: string
    email: string
    password_hash: string
  }) {
    return await prisma.mst_users.create({
      data,
      select: userSelect
    })
  },

  async update(id: bigint, data: {
    full_name?: string
    username?: string
    email?: string
    password_hash?: string
  }) {
    return await prisma.mst_users.update({
      where: { id },
      data,
      select: userSelect
    })
  },

  async softDelete(id: bigint) {
    return await prisma.mst_users.update({
      where: { id },
      data: { deleted_at: new Date() }
    })
  }
}