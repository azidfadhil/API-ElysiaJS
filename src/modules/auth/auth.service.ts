import bcrypt from "bcryptjs"
import { prisma } from "../../database/prisma"
import { UnauthorizedError } from "../../utils/errors"

export async function login(email: string, password: string) {
  const user = await prisma.mst_users.findFirst({
    where: {
      email,
      deleted_at: null
    }
  })

  if (!user) throw new UnauthorizedError("Invalid email or password")

  if (!user.is_active) throw new UnauthorizedError("Account is inactive")

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) throw new UnauthorizedError("Invalid email or password")

  const menus = await prisma.mst_menus.findMany({
    where: {
      is_active: true,
      parent_id: null,
      module_id: null
    },
    orderBy: { sort_order: "asc" },
    include: {
      other_mst_menus: {
        where: { is_active: true },
        orderBy: { sort_order: "asc" },
        include: {
          mst_modules: {
            include: {
              mst_permissions: {
                include: {
                  trx_role_permissions: {
                    include: {
                      mst_roles: {
                        include: {
                          trx_user_roles: {
                            where: { user_id: user.id }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const userRoles = await prisma.trx_user_roles.findMany({
    where: { user_id: user.id },
    include: {
      mst_roles: {
        include: {
          trx_role_permissions: {
            include: {
              mst_permissions: {
                include: {
                  mst_modules: true
                }
              }
            }
          }
        }
      }
    }
  })

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

  const accessibleMenus = menus
    .map(menu => {
      const children = menu.other_mst_menus.filter(child => {
        if (!child.mst_modules) return true
        return permissions[child.mst_modules.module_code]?.READ === true
      }).map(child => ({
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