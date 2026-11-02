<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useRoleStore } from '@/stores/role.store'
import { useUserRoleStore } from '@/stores/userRole.store'
import { useAuthStore } from '@/stores/auth.store'

type Id = number | string

const userStore = useUserStore()
const roleStore = useRoleStore()
const userRoleStore = useUserRoleStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)
const canEdit = () => p('user_role.edit') || p('user_role.manage')

// Compara IDs independentemente de serem number ou string
const same = (a: Id, b: Id) => String(a) === String(b)

const selectedUserId = ref<Id | null>(null)
const userRoleMap = ref<Record<string, Id[]>>({}) // user_id -> role_ids
const originalUserRoleMap = ref<Record<string, Id[]>>({})
const userSearch = ref('')
const roleSearch = ref('')
const internalLoading = ref(false)
const globalError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const buildMapping = () => {
  const mapping: Record<string, Id[]> = {}
  userRoleStore.userRoles.forEach((ur: any) => {
    if (!ur || ur.user_id == null || ur.role_id == null) return
    const uId = String(ur.user_id)
    if (!mapping[uId]) mapping[uId] = []
    mapping[uId].push(ur.role_id)
  })
  userRoleMap.value = JSON.parse(JSON.stringify(mapping))
  originalUserRoleMap.value = JSON.parse(JSON.stringify(mapping))
}

onMounted(async () => {
  try {
    await Promise.all([
      userStore.list(),
      roleStore.list(),
      userRoleStore.list()
    ])

    if (userStore.users.length > 0) {
      selectedUserId.value = userStore.users[0].id
    }

    buildMapping()
  } catch {}
})

const userLabel = (u: any) => u?.name || u?.username || u?.email || `Utilizador #${u?.id}`

const totalUsersCount = computed(() => userStore.users.filter((u: any) => u != null).length)
const totalRolesCount = computed(() => roleStore.roles.filter((r: any) => r != null).length)

const currentUser = computed(() => {
  if (selectedUserId.value == null) return null
  return userStore.users.find((u: any) => same(u.id, selectedUserId.value!)) || null
})

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  return userStore.users.filter((u: any) => {
    if (!u) return false
    return !q ||
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
  })
})

const filteredRoles = computed(() => {
  const q = roleSearch.value.toLowerCase()
  return roleStore.roles.filter((r: any) => {
    if (!r) return false
    return !q ||
      r.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
  })
})

const assignedCount = (userId: Id) => (userRoleMap.value[String(userId)] || []).length

const isRoleAssigned = (roleId: Id) => {
  if (selectedUserId.value == null) return false
  const assigned = userRoleMap.value[String(selectedUserId.value)] || []
  return assigned.some(id => same(id, roleId))
}

const toggleRole = (roleId: Id) => {
  if (selectedUserId.value == null) return
  if (!canEdit()) return

  globalError.value = null
  successMessage.value = null

  const key = String(selectedUserId.value)
  const currentAssigned = userRoleMap.value[key] || []
  if (currentAssigned.some(id => same(id, roleId))) {
    userRoleMap.value[key] = currentAssigned.filter(id => !same(id, roleId))
  } else {
    userRoleMap.value[key] = [...currentAssigned, roleId]
  }
}

const saveChanges = async () => {
  if (selectedUserId.value == null) return
  if (!canEdit()) return

  internalLoading.value = true
  globalError.value = null
  successMessage.value = null

  try {
    const userId = selectedUserId.value
    const key = String(userId)
    const currentSelected = userRoleMap.value[key] || []
    const originalSelected = originalUserRoleMap.value[key] || []

    const toAdd = currentSelected.filter(rId => !originalSelected.some(o => same(o, rId)))
    const toRemove = originalSelected.filter(rId => !currentSelected.some(c => same(c, rId)))

    // Remover vínculos desmarcados
    for (const rId of toRemove) {
      const found = userRoleStore.userRoles.find(
        (ur: any) => same(ur.user_id, userId) && same(ur.role_id, rId)
      )
      if (found && found.id) {
        await userRoleStore.remove(found.id)
      }
    }

    // Criar novos vínculos (campos exatamente como no model: user_id e role_id)
    for (const rId of toAdd) {
      await userRoleStore.create({
        user_id: userId,
        role_id: rId
      })
    }

    await userRoleStore.list()
    buildMapping()

    successMessage.value = 'Funções do utilizador atualizadas com sucesso!'
    setTimeout(() => {
      successMessage.value = null
    }, 4000)
  } catch (err: any) {
    globalError.value = err.response?.data?.message || 'Erro ao sincronizar as funções do utilizador.'
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Vínculos de Funções a Utilizadores</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Defina que funções cada utilizador desempenha no sistema.</p>
      </div>
      <button
        v-if="selectedUserId && canEdit()"
        @click="saveChanges"
        :disabled="internalLoading"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
      >
        <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin text-sm"></i>
        <i v-else class="fa-solid fa-floppy-disk text-sm"></i>
        <span>{{ internalLoading ? 'A guardar...' : 'Guardar Alterações' }}</span>
      </button>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Utilizadores</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-users text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalUsersCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Funções Disponíveis</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-shield text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalRolesCount }}</div>
      </div>
    </div>

    <!-- Feedback Global -->
    <div v-if="globalError || userStore.error || roleStore.error || userRoleStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ globalError || userStore.error || roleStore.error || userRoleStore.error }}</span>
    </div>

    <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-check text-lg"></i>
      <span>{{ successMessage }}</span>
    </div>

    <!-- Conteúdo Principal em Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Coluna Esquerda: Lista de Utilizadores -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 lg:col-span-1 h-fit">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 pt-2">Selecionar Utilizador</h2>

        <div class="relative px-1">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
          <input
            v-model="userSearch"
            type="text"
            placeholder="Pesquisar utilizador..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div v-if="userStore.isLoading && !userStore.users.length" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <div v-else-if="filteredUsers.length === 0" class="py-8 text-center text-slate-400 text-xs">
          Nenhum utilizador encontrado.
        </div>
        <div v-else class="space-y-1 max-h-[480px] overflow-y-auto">
          <button
            v-for="user in (filteredUsers as any)"
            :key="user.id"
            @click="selectedUserId = user.id"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left',
              selectedUserId !== null && same(selectedUserId, user.id)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <i class="fa-solid fa-user text-sm opacity-80"></i>
              <span class="truncate">{{ userLabel(user) }}</span>
            </div>
            <span class="text-[10px] opacity-70 shrink-0 ml-2">{{ assignedCount(user.id) }}</span>
          </button>
        </div>
      </div>

      <!-- Coluna Direita: Funções do Utilizador -->
      <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <!-- Cabeçalho do Painel -->
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <h3 class="font-bold text-slate-900 dark:text-white text-base">
            Funções de: <span class="text-indigo-600 dark:text-indigo-400">{{ currentUser ? userLabel(currentUser) : 'Selecione um utilizador' }}</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marque as funções que este utilizador deve ter.</p>
        </div>

        <!-- Pesquisa de Funções -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
            <input
              v-model="roleSearch"
              type="text"
              placeholder="Pesquisar função por nome ou descrição..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <!-- Lista de Funções (Checkboxes) -->
        <div class="p-6 overflow-y-auto max-h-[480px]">
          <div v-if="roleStore.isLoading || userRoleStore.isLoading" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar funções...</p>
          </div>
          <div v-else-if="filteredRoles.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma função encontrada.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="role in (filteredRoles as any)"
              :key="role.id"
              @click="toggleRole(role.id)"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                isRoleAssigned(role.id)
                  ? 'bg-indigo-600/5 border-indigo-500/40 dark:bg-indigo-600/10 dark:border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :checked="isRoleAssigned(role.id)"
                @click.stop="toggleRole(role.id)"
                class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div class="flex-1 truncate">
                <div class="text-xs font-bold text-slate-900 dark:text-white">{{ role.name }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ role.description || 'Sem descrição' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>