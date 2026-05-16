import type { AdminRole } from '@prisma/client'

export type AdminPermission =
  | 'dashboard.read'
  | 'content.write'
  | 'support.manage'
  | 'payments.read'
  | 'payments.manage'
  | 'media.manage'
  | 'settings.manage'
  | 'security.manage'

const ROLE_PERMISSIONS: Record<AdminRole, Set<AdminPermission>> = {
  SUPER_ADMIN: new Set<AdminPermission>([
    'dashboard.read',
    'content.write',
    'support.manage',
    'payments.read',
    'payments.manage',
    'media.manage',
    'settings.manage',
    'security.manage',
  ]),
  ADMIN: new Set<AdminPermission>([
    'dashboard.read',
    'content.write',
    'support.manage',
    'payments.read',
    'payments.manage',
    'media.manage',
    'settings.manage',
    'security.manage',
  ]),
  EDITOR: new Set<AdminPermission>([
    'dashboard.read',
    'content.write',
    'media.manage',
  ]),
  SUPPORT: new Set<AdminPermission>([
    'dashboard.read',
    'support.manage',
    'payments.read',
  ]),
  VIEWER: new Set<AdminPermission>(['dashboard.read']),
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false
}
