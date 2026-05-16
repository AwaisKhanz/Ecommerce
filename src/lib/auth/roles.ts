export const adminRoles = ['super_admin', 'admin'] as const;
export type AdminRole = (typeof adminRoles)[number];
