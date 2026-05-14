import bcrypt from "bcryptjs"
import { userRepository } from "./user.repository"
import { NotFoundError, ConflictError } from "../../utils/errors"

export async function getUsers(page: number, perPage: number) {
  const skip = (page - 1) * perPage

  const [totalData, users] = await Promise.all([
    userRepository.countAll(),
    userRepository.findAll(skip, perPage)
  ])

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
  const user = await userRepository.findById(id)
  if (!user) throw new NotFoundError("User not found")
  return user
}

export async function createUser(body: {
  full_name: string
  username: string
  email: string
  password: string
}) {
  // Cek duplikasi email
  const existingEmail = await userRepository.findByEmail(body.email)
  if (existingEmail) throw new ConflictError("Email already exists")

  // Cek duplikasi username
  const existingUsername = await userRepository.findByUsername(body.username)
  if (existingUsername) throw new ConflictError("Username already exists")

  const password_hash = await bcrypt.hash(body.password, 10)
  
  return await userRepository.create({
    full_name: body.full_name,
    username: body.username,
    email: body.email,
    password_hash
  })
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
  // Cek user exist
  await getUserById(id)

  // Cek duplikasi email (kalau email diubah)
  if (body.email) {
    const existingEmail = await userRepository.findByEmail(body.email)
    if (existingEmail && existingEmail.id !== id) {
      throw new ConflictError("Email already exists")
    }
  }

  // Cek duplikasi username (kalau username diubah)
  if (body.username) {
    const existingUsername = await userRepository.findByUsername(body.username)
    if (existingUsername && existingUsername.id !== id) {
      throw new ConflictError("Username already exists")
    }
  }

  const data: {
    full_name?: string
    username?: string
    email?: string
    password_hash?: string
  } = {}

  if (body.full_name) data.full_name      = body.full_name
  if (body.username)  data.username       = body.username
  if (body.email)     data.email          = body.email
  if (body.password)  data.password_hash  = await bcrypt.hash(body.password, 10)

  return await userRepository.update(id, data)
}

export async function deleteUser(id: bigint) {
  await getUserById(id)
  return await userRepository.softDelete(id)
}