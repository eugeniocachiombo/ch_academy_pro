export function hideAdminRoles(roles: any[]) {
  return roles.filter((r: any) => r.id != 1)
}