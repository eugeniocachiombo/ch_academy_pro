/**
 * general_service.ts
 * Estado e métodos partilhados entre vários componentes .vue.
 * Tudo aqui é um singleton: qualquer componente que importe vê o mesmo estado.
 */
import { computed, reactive, ref } from 'vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth.store'

/* ------------------------------------------------------------------ */
/* Tipos                                                              */
/* ------------------------------------------------------------------ */
export type TabId =
  | 'dashboard'
  | 'academic'
  | 'financial'
  | 'students'
  | 'teachers'
  | 'communications'
  | 'reports'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type ModalId = 'modal-quick-action' | 'modal-notice'

export type Badge = 'Ouro' | 'Prata' | 'Bronze'

export interface Student {
  id: number
  name: string
  photo: string
  className: string
  enrollment: string
  average: number
  badge?: Badge
  status: string
}

export interface Communication {
  id: number
  title: string
  audience: string
  body: string
  meta: string
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                         */
/* ------------------------------------------------------------------ */
/** Formata número com vírgula decimal (pt-BR), ex.: 9.8 -> "9,8" */
export function formatDecimal(value: number, digits = 1): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/* ------------------------------------------------------------------ */
/* Busca global (campo do cabeçalho)                                  */
/* ------------------------------------------------------------------ */
export const searchQuery = ref('')

/** true se a busca estiver vazia ou se algum dos valores contiver o termo (sem acento / maiúsculas). */
export function matchesSearch(...values: string[]): boolean {
  const q = normalize(searchQuery.value)
  if (!q) return true
  return values.some((v) => normalize(v).includes(q))
}

/* ------------------------------------------------------------------ */
/* Dados partilhados (Dashboard + Alunos)                             */
/* ------------------------------------------------------------------ */
export const students = reactive<Student[]>([
  {
    id: 1,
    name: 'Lucas Mendes',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    className: '9º Ano A',
    enrollment: '#9218',
    average: 9.8,
    badge: 'Ouro',
    status: 'Regular',
  },
  {
    id: 2,
    name: 'Beatriz Costa',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    className: '1º Ano EM',
    enrollment: '#8412',
    average: 9.6,
    badge: 'Prata',
    status: 'Regular',
  },
  {
    id: 3,
    name: 'Gabriel Santos',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100',
    className: '8º Ano B',
    enrollment: '#9510',
    average: 9.5,
    badge: 'Bronze',
    status: 'Regular',
  },
])

/** Matricula um novo aluno (em memória; sem backend). */
export function addStudent(name: string): Student {
  const nextId = Math.max(0, ...students.map((s) => s.id)) + 1
  const nextEnrollment = Math.max(0, ...students.map((s) => parseInt(s.enrollment.slice(1), 10) || 0)) + 1
  const student: Student = {
    id: nextId,
    name,
    photo: '',
    className: 'Turma a definir',
    enrollment: `#${nextEnrollment}`,
    average: 0,
    status: 'Matrícula recente',
  }
  students.push(student)
  return student
}

/* ------------------------------------------------------------------ */
/* Comunicados                                                        */
/* ------------------------------------------------------------------ */
export const communications = reactive<Communication[]>([
  {
    id: 1,
    title: 'Aviso: Reunião Bimestral de Pais e Mestres',
    audience: 'Todos',
    body: 'Prezados pais, lembramos que a reunião ocorrerá no próximo dia 22/11 às 19h no auditório principal.',
    meta: 'Disparado via Push e E-mail em 01/10/2026',
  },
])

export function addCommunication(title: string, audience: string, body: string): Communication {
  const item: Communication = {
    id: Math.max(0, ...communications.map((c) => c.id)) + 1,
    title,
    audience,
    body,
    meta: `Disparado via Push e E-mail em ${new Date().toLocaleDateString('pt-BR')}`,
  }
  communications.unshift(item)
  return item
}

/* ------------------------------------------------------------------ */
/* Tema (claro / escuro)                                              */
/* ------------------------------------------------------------------ */
const THEME_KEY = 'ch-academic-theme'

function readSavedTheme(): 'dark' | 'light' | null {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')

export const isDark = ref((readSavedTheme() ?? (systemQuery.matches ? 'dark' : 'light')) === 'dark')

function applyTheme(): void {
  document.documentElement.classList.toggle('dark', isDark.value)
}
applyTheme()

/** Alterna o tema e guarda a escolha do utilizador. */
export function toggleTheme(): void {
  isDark.value = !isDark.value
  applyTheme()
  try {
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  } catch {
    /* sem armazenamento: o tema vale só para esta sessão */
  }
}

// Sem escolha guardada, acompanha o tema do sistema operativo
systemQuery.addEventListener('change', (e) => {
  if (readSavedTheme()) return
  isDark.value = e.matches
  applyTheme()
})

/* ------------------------------------------------------------------ */
/* Sidebar                                                            */
/* ------------------------------------------------------------------ */
export const sidebarExpanded = ref(false)

export function toggleSidebar(): void {
  sidebarExpanded.value = !sidebarExpanded.value
}

/* ------------------------------------------------------------------ */
/* Navegação / abas                                                   */
/* ------------------------------------------------------------------ */
export const tabTitles: Record<TabId, string> = {
  dashboard: 'Dashboard Geral',
  academic: 'Gestão Acadêmica',
  financial: 'Controle Financeiro',
  students: 'Diretório de Alunos',
  teachers: 'Corpo Docente',
  communications: 'Central de Comunicações',
  reports: 'Relatórios Analíticos',
}

/** A aba ativa vem da rota atual (o name de cada rota é um TabId). */
export const activeTab = computed<TabId>(() => (router.currentRoute.value.name as TabId | undefined) ?? 'dashboard')

/** Navega para a tela correspondente através do router. */
export function switchTab(tabId: TabId): void {
  sidebarExpanded.value = false // fecha o menu sobreposto no mobile
  if (activeTab.value !== tabId) router.push({ name: tabId })
}

/* ------------------------------------------------------------------ */
/* Toast (showNotification)                                           */
/* ------------------------------------------------------------------ */
export const toast = reactive({
  visible: false,
  type: 'success' as NotificationType,
  title: 'Sucesso',
  description: '',
})

let toastTimer: ReturnType<typeof setTimeout> | undefined

export function showNotification(text: string, type: NotificationType = 'success'): void {
  toast.description = text
  toast.type = type

  // Mapeia os títulos corretamente para cada tipo de notificação
  const titles: Record<string, string> = {
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    info: 'Informação',
  }
  
  toast.title = titles[type] || 'Informação'
  toast.visible = true

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.visible = false
  }, 3500)
}

/* ------------------------------------------------------------------ */
/* Modais                                                             */
/* ------------------------------------------------------------------ */
export const quickActionTypes = [
  'Matrícula de Novo Aluno',
  'Lançamento de Nota / Frequência',
  'Emissão de Boleto / Cobrança',
  'Cadastro de Novo Professor',
  'Criação de Nova Turma',
] as const

export type QuickActionType = (typeof quickActionTypes)[number]

/** Tipo pré-selecionado quando o modal de ação rápida abre. */
export const quickActionPreset = ref<QuickActionType>(quickActionTypes[0])

export const openModals = reactive<Record<ModalId, boolean>>({
  'modal-quick-action': false,
  'modal-notice': false,
})

export function openModal(id: ModalId, preset?: QuickActionType): void {
  if (id === 'modal-quick-action') quickActionPreset.value = preset ?? quickActionTypes[0]
  openModals[id] = true
}

export function closeModal(id: ModalId): void {
  openModals[id] = false
}

/** Usado pela tecla Esc: fecha modais e o menu lateral sobreposto. */
export function closeOverlays(): void {
  openModals['modal-quick-action'] = false
  openModals['modal-notice'] = false
  sidebarExpanded.value = false
}

/* ------------------------------------------------------------------ */
/* Sessão                                                             */
/* ------------------------------------------------------------------ */
export function logout(): void {
  useAuthStore().clearSession()
  searchQuery.value = ''
  sidebarExpanded.value = false
  closeOverlays()
  router.push({ name: 'login' })
  showNotification('Sessão encerrada com segurança.', 'info')
}
