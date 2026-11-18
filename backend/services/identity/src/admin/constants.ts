export const ADMIN_ACCESS_COOKIE = 'dc_admin_access';
export const ADMIN_REFRESH_COOKIE = 'dc_admin_refresh';

export const PERMISSIONS = {
  AUDIT_READ: 'audit.read',
  USERS_READ: 'users.read',
  ROLES_GRANT: 'roles.grant',
  SESSIONS_READ: 'admin.sessions.read',
  SESSIONS_REVOKE: 'admin.sessions.revoke',
  OFFERS_READ: 'offers.read',
  OFFERS_WRITE: 'offers.write',
  OFFERS_PUBLISH: 'offers.publish',
  CATEGORIES_WRITE: 'categories.write',
  DEMAND_READ: 'demand.read',
  DEMAND_MODERATE: 'demand.moderate',
} as const;

export type PermissionId = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];