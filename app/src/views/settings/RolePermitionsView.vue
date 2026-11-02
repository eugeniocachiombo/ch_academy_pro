<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role.store'
import { usePermitionStore } from '@/stores/permition.store'
import { useRolePermitionStore } from '@/stores/rolePermition.store'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'

type Id = number | string

const roleStore = useRoleStore()
const permitionStore = usePermitionStore()
const rolePermitionStore = useRolePermitionStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)
const canEdit = () => p('role_permition.edit') || p('role_permition.manage')

// Compara IDs independentemente de serem number ou string
const same = (a: Id, b: Id) => String(a) === String(b)

const selectedRoleId = ref<Id | null>(null)
const rolePermitionMap = ref<Record<string, Id[]>>({}) // role_id -> permition_ids
const originalRolePermitionMap = ref<Record<string, Id[]>>({})
const searchQuery = ref('')
const internalLoading = ref(false)
const globalError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const buildMapping = () => {
  const mapping: Record<string, Id[]> = {}
  rolePermitionStore.rolePermitions.forEach((rp: any) => {
    const rId = String(rp.role_id)
    const pId = rp.permition_id ?? rp.permission_id
    if (pId == null) return
    if (!mapping[rId]) mapping[rId] = []
    mapping[rId].push(pId)
  })
  rolePermitionMap.value = JSON.parse(JSON.stringify(mapping))
  originalRolePermitionMap.value = JSON.parse(JSON.stringify(mapping))
}

onMounted(async () => {
  try {
    await Promise.all([
      roleStore.list(),
      permitionStore.list(),
      rolePermitionStore.list()
    ])

    if (roleStore.roles.length > 0) {
      selectedRoleId.value = roleStore.roles[0].id
    }

    buildMapping()
  } catch {}
})

const totalRolesCount = computed(() => roleStore.roles.filter((r: any) => r != null).length)
const totalPermitionsCount = computed(() => permitionStore.permitions.filter((p: any) => p != null).length)

const currentRole = computed(() => {
  if (selectedRoleId.value == null) return null
  return roleStore.roles.find((r: any) => same(r.id, selectedRoleId.value!)) || null
})

const filteredPermitions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return permitionStore.permitions.filter((perm: any) => {
    if (!perm) return false
    return !q ||
      perm.name?.toLowerCase().includes(q) ||
      perm.description?.toLowerCase().includes(q)
  })
})

const isPermitionAssigned = (permitionId: Id) => {
  if (selectedRoleId.value == null) return false
  const assigned = rolePermitionMap.value[String(selectedRoleId.value)] || []
  return assigned.some(id => same(id, permitionId))
}

const togglePermition = (permitionId: Id) => {
  if (selectedRoleId.value == null) return
  if (!canEdit()) return

  globalError.value = null
  successMessage.value = null

  const key = String(selectedRoleId.value)
  const currentAssigned = rolePermitionMap.value[key] || []
  if (currentAssigned.some(id => same(id, permitionId))) {
    rolePermitionMap.value[key] = currentAssigned.filter(id => !same(id, permitionId))
  } else {
    rolePermitionMap.value[key] = [...currentAssigned, permitionId]
  }
}

const saveChanges = async () => {
  if (selectedRoleId.value == null) return
  if (!canEdit()) return

  internalLoading.value = true
  globalError.value = null
  successMessage.value = null

  try {
    const roleId = selectedRoleId.value
    const key = String(roleId)
    const currentSelected = rolePermitionMap.value[key] || []
    const originalSelected = originalRolePermitionMap.value[key] || []

    const toAdd = currentSelected.filter(pId => !originalSelected.some(o => same(o, pId)))
    const toRemove = originalSelected.filter(pId => !currentSelected.some(c => same(c, pId)))

    // Remover associações desmarcadas
    for (const pId of toRemove) {
      const found = rolePermitionStore.rolePermitions.find(
        (rp: any) =>
          same(rp.role_id, roleId) &&
          same(rp.permition_id ?? rp.permission_id, pId)
      )
      if (found && found.id) {
        await rolePermitionStore.remove(found.id)
      }
    }

    // Criar novas associações (nomes de campos exatamente como o backend valida)
    for (const pId of toAdd) {
      await rolePermitionStore.create({
        role_id: roleId,
        permition_id: pId
      })
    }

    await rolePermitionStore.list()
    buildMapping()

    successMessage.value = 'Permissões da função actualizadas com sucesso!'
    setTimeout(() => {
      successMessage.value = null
    }, 4000)
  } catch (err: any) {
    globalError.value = err.response?.data?.message || 'Erro ao sincronizar as permissões da função.'
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
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Atribuição de Permissões a Funções</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure o acesso associando permissões específicas a cada função do sistema.</p>
      </div>
      <button
        v-if="selectedRoleId && (p('role_permition.edit') || p('role_permition.manage'))"
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
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Funções</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-shield text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalRolesCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Permissões Disponíveis</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-key text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalPermitionsCount }}</div>
      </div>
    </div>

    <!-- Feedback Global -->
    <div v-if="globalError || roleStore.error || permitionStore.error || rolePermitionStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ globalError || roleStore.error || permitionStore.error || rolePermitionStore.error }}</span>
    </div>

    <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-check text-lg"></i>
      <span>{{ successMessage }}</span>
    </div>

    <!-- Conteúdo Principal em Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Coluna Esquerda: Lista de Funções -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-2 lg:col-span-1 h-fit">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 py-2">Selecionar Função</h2>
        
        <div v-if="roleStore.isLoading && !roleStore.roles.length" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <div v-else-if="roleStore.roles.length === 0" class="py-8 text-center text-slate-400 text-xs">
          Nenhuma função encontrada.
        </div>
        <div v-else class="space-y-1">
          <button
            v-for="role in (roleStore.roles as any)"
            :key="role.id"
            @click="selectedRoleId = role.id"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left',
              selectedRoleId === role.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <i class="fa-solid fa-shield text-sm opacity-80"></i>
              <span class="truncate">{{ role.name }}</span>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
          </button>
        </div>
      </div>

      <!-- Coluna Direita: Permissões Associadas -->
      <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <!-- Cabeçalho do Painel -->
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">
              Permissões para: <span class="text-indigo-600 dark:text-indigo-400">{{ currentRole?.name || 'Selecione uma função' }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marque as caixas de seleção correspondentes aos acessos permitidos.</p>
          </div>
        </div>

        <!-- Filtros e Pesquisa de Permissões -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar por nome ou descrição da permissão..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <!-- Lista de Permissões (Checkboxes) -->
        <div class="p-6 overflow-y-auto max-h-[480px]">
          <div v-if="permitionStore.isLoading || rolePermitionStore.isLoading" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar permissões...</p>
          </div>
          <div v-else-if="filteredPermitions.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma permissão encontrada.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="perm in (filteredPermitions as any)"
              :key="perm.id"
              @click="togglePermition(perm.id)"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                isPermitionAssigned(perm.id)
                  ? 'bg-indigo-600/5 border-indigo-500/40 dark:bg-indigo-600/10 dark:border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :checked="isPermitionAssigned(perm.id)"
                @click.stop="togglePermition(perm.id)"
                class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div class="flex-1 truncate">
                <div class="font-mono text-xs font-bold text-slate-900 dark:text-white">{{ perm.name }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ perm.description || 'Sem descrição' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>