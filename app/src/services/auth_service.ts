import { computed, ref } from 'vue'

export interface AuthUser {
  name: string
  email: string
  role: string
  photo: string
}

const STORAGE_KEY = 'edusmart-auth'

/** Conta de demonstração (remover quando ligar à API). */
const DEMO_ACCOUNT = {
  username: 'admin',
  password: 'secret',
  user: {
    name: 'Dra. Carla Souza',
    email: 'admin@edusmart.com',
    role: 'admin',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  } satisfies AuthUser,
}

function isAuthUser(value: unknown): value is AuthUser {
  const v = value as Partial<AuthUser> | null
  return !!v && typeof v.name === 'string' && typeof v.email === 'string' && typeof v.role === 'string'
}

/** Lê a sessão guardada (localStorage = "manter sessão"; sessionStorage = só esta aba). */
function readSession(): AuthUser | null {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (isAuthUser(parsed)) return parsed
    } catch {
      /* ignora JSON inválido ou storage indisponível */
    }
  }
  return null
}

export const currentUser = ref<AuthUser | null>(readSession())
export const isAuthenticated = computed(() => currentUser.value !== null)

export async function login(username: string, password: string, remember: boolean): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 700)) // simula a latência da API

  if (username.trim().toLowerCase() !== DEMO_ACCOUNT.username || password !== DEMO_ACCOUNT.password) {
    throw new Error('Nome de usuário ou senha incorretos.')
  }

  const user = { ...DEMO_ACCOUNT.user }
  currentUser.value = user
  try {
    const target = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    other.removeItem(STORAGE_KEY)
    target.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    /* sem storage: a sessão vale só até recarregar a página */
  }
  return user
}

export function clearSession(): void {
  currentUser.value = null
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nada a fazer */
  }
}