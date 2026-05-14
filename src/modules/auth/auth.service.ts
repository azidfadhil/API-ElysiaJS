import bcrypt from "bcryptjs"
import { authRepository } from "./auth.repository"
import { UnauthorizedError } from "../../utils/errors"

export async function login(email: string, password: string) {
  // 1. Cek user exist
  const user = await authRepository.findUserByEmail(email)
  if (!user) throw new UnauthorizedError("Invalid email or password")

  // 2. Cek user aktif
  if (!user.is_active) throw new UnauthorizedError("Account is inactive")

  // 3. Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) throw new UnauthorizedError("Invalid email or password")

  // 4. Ambil menus dan roles secara paralel
  const [menus, userRoles] = await Promise.all([
    authRepository.findMenus(user.id),
    authRepository.findUserRoles(user.id)
  ])

  // 5. Build permissions object
  const permissions: Record<string, Record<string, boolean>> = {}

  for (const userRole of userRoles) {
    for (const rolePermission of userRole.mst_roles.trx_role_permissions) {
      const moduleCode = rolePermission.mst_permissions.mst_modules.module_code
      const permissionCode = rolePermission.mst_permissions.permission_code

      if (!permissions[moduleCode]) {
        permissions[moduleCode] = {
          READ: false,
          CREATE: false,
          UPDATE: false,
          DELETE: false
        }
      }

      permissions[moduleCode][permissionCode] = true
    }
  }

  // 6. Build accessible menus
  const accessibleMenus = menus
    .map(menu => {
      const children = menu.other_mst_menus
        .filter(child => {
          if (!child.mst_modules) return true
          return permissions[child.mst_modules.module_code]?.READ === true
        })
        .map(child => ({
          label: child.label,
          url: child.url,
          icon: child.icon,
          sort_order: child.sort_order
        }))

      return {
        label: menu.label,
        url: menu.url,
        icon: menu.icon,
        sort_order: menu.sort_order,
        children
      }
    })
    .filter(menu => menu.children.length > 0 || menu.url !== null)

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email
    },
    permissions,
    menus: accessibleMenus
  }
}

export async function getMe(userId: bigint) {

  // 1. Cek user masih exist dan aktif
  const user = await authRepository.findUserById(userId)
  if (!user) throw new UnauthorizedError("Account not found or inactive")

  // 2. Ambil menus dan roles secara paralel
  const [menus, userRoles] = await Promise.all([
    authRepository.findMenus(userId),
    authRepository.findUserRoles(userId)
  ])

  // 3. Build permissions object (sama seperti login)
  const permissions: Record<string, Record<string, boolean>> = {}

  for (const userRole of userRoles) {
    for (const rolePermission of userRole.mst_roles.trx_role_permissions) {
      const moduleCode = rolePermission.mst_permissions.mst_modules.module_code
      const permissionCode = rolePermission.mst_permissions.permission_code

      if (!permissions[moduleCode]) {
        permissions[moduleCode] = {
          READ: false,
          CREATE: false,
          UPDATE: false,
          DELETE: false
        }
      }

      permissions[moduleCode][permissionCode] = true
    }
  }

  // 4. Build accessible menus (sama seperti login)
  const accessibleMenus = menus
    .map(menu => {
      const children = menu.other_mst_menus
        .filter(child => {
          if (!child.mst_modules) return true
          return permissions[child.mst_modules.module_code]?.READ === true
        })
        .map(child => ({
          label: child.label,
          url: child.url,
          icon: child.icon,
          sort_order: child.sort_order
        }))

      return {
        label: menu.label,
        url: menu.url,
        icon: menu.icon,
        sort_order: menu.sort_order,
        children
      }
    })
    .filter(menu => menu.children.length > 0 || menu.url !== null)

  return { user, permissions, menus: accessibleMenus }
}