import { prisma } from "../../database/prisma"

export const authRepository = {

  async findUserByEmail(email: string) {
    return await prisma.mst_users.findFirst({
      where: {
        email,
        deleted_at: null
      }
    })
  },

  async findMenus(userId: bigint) {
    return await prisma.mst_menus.findMany({
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
                              where: { user_id: userId }
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
  },

  async findUserRoles(userId: bigint) {
    return await prisma.trx_user_roles.findMany({
      where: { user_id: userId },
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
  },

  async findUserById(id: bigint) {
    return await prisma.mst_users.findFirst({
      where: {
        id,
        deleted_at: null,
        is_active: true
      },
      select: {
        id: true,
        full_name: true,
        username: true,
        email: true
      }
    })
  }

}