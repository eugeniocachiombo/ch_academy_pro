import { shallowRef } from 'vue'
import { api } from '@/services/api'

const userRoles = shallowRef<any[]>([])
const rolePermitions = shallowRef<any[]>([])

let loadPromise: Promise<void> | null = null

/**
 * Carrega (uma única vez) as roles dos utilizadores e as permissões de cada role.
 * Pode ser aguardada em qualquer lugar (router guard, login, etc.).
 * Use force = true para recarregar.
 */
export function loadPermitions(force = false): Promise<void> {
  if (force) loadPromise = null

  if (!loadPromise) {
    loadPromise = Promise.all([
      api.get<unknown, any[]>('/user-roles'),
      api.get<unknown, any[]>('/role-permitions'),
    ])
      .then(([roles, perms]) => {
        userRoles.value = roles
        rolePermitions.value = perms
      })
      .catch((err) => {
        loadPromise = null // permite tentar de novo
        throw err
      })
  }
  return loadPromise
}

/** Chamar no logout */
export function resetPermitions(): void {
  loadPromise = null
  userRoles.value = []
  rolePermitions.value = []
}

export function getUserRoles(user_id: number | string) {
  return userRoles.value.filter((e) => e.user_id == user_id)
}

export function isAdmin(user_id: number | string): boolean {
  return getUserRoles(user_id).some((e) => e.role_id == 1)
}

/** Síncrono: lista plana (sem duplicados) com os nomes das permissões do utilizador */
export function can(user_id: number | string): string[] {
  const names = getUserRoles(user_id).flatMap((r) =>
    rolePermitions.value
      .filter((p) => p.role_id == r.role_id)
      .map((p) => p?.permition?.name as string | undefined)
  )
  return [...new Set(names.filter((n): n is string => !!n))]
}