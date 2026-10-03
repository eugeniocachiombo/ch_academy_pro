<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoleStore, type Role, type CreateRolePayload } from '@/stores/role.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { api } from '@/services/api'
import cryptoService from '@/services/crypto.service'
import RoleFormView from './RolesFormView.vue'

const roleStore = useRoleStore()
const userStore = useUserStore()

// Função auxiliar para verificar permissões baseada no seu padrão
const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedRole = ref<Role | null>(null)
const formData = ref<(CreateRolePayload & { id?: number }) | null>(null)

const activeDropdownId = ref<number | null>(null)

onMounted(async () => {
  try {
    await roleStore.list()
  } catch {}
})

const totalCount = computed(() => roleStore.roles.filter((r: any) => r != null).length)

const filteredRoles = computed(() => {
  return roleStore.roles.filter((r: any) => {
    if (!r) return false
    return !searchQuery.value || r.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  if (!p('role.create')) return
  isEditing.value = false
  selectedRole.value = null
  formData.value = { name: '' }
  isModalOpen.value = true
}

const openEditModal = (role: Role) => {
  if (!p('role.edit')) return
  isEditing.value = true
  selectedRole.value = role
  formData.value = {
    id: role.id,
    name: role.name || '',
  }
  isModalOpen.value = true
  activeDropdownId.value = null
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRole.value = null
  formData.value = null
  roleStore.clearError()
}

const handleSaved = async () => {
  await roleStore.list()
  closeModal()
  showNotification('Função guardada com sucesso.', 'success')
}

const deleteRole = async (id: number) => {
  if (!p('role.delete')) return
  activeDropdownId.value = null
  if (!confirm('Tem certeza de que deseja eliminar permanentemente esta função?')) return
  try {
    const encryptedId = cryptoService.encryptId(String(id))
    await api.delete(`/roles/${encryptedId}`)
    await roleStore.list()
    showNotification('Função eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Erro ao eliminar função.'
    showNotification(errorMsg, 'error')
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestão de Funções</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure e gira as funções de acesso ao sistema.</p>
      </div>
      <!-- Botão de Criar (protegido por 'role.create') -->
      <button
        v-if="p('role.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-shield-plus text-sm"></i>
        <span>Nova Função</span>
      </button>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Funções</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-shield-halved text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <!-- Filtros e Pesquisa -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome da função..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <!-- Erro global -->
    <div v-if="roleStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ roleStore.error }}</span>
    </div>

    <!-- Tabela -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="py-4 px-6">ID</th>
              <th class="py-4 px-6">Nome da Função</th>
              <th class="py-4 px-6">Criado em</th>
              <th class="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            <template v-if="roleStore.isLoading && !filteredRoles.length">
              <tr>
                <td colspan="4" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
                  <p class="text-xs">A carregar funções...</p>
                </td>
              </tr>
            </template>
            <template v-else-if="filteredRoles.length === 0">
              <tr>
                <td colspan="4" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
                  <p class="text-xs">Nenhuma função encontrada.</p>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="role in (filteredRoles as any)" :key="role.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <td class="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">#{{ role.id }}</td>
                <td class="py-4 px-6 font-semibold text-slate-900 dark:text-white">{{ role.name }}</td>
                <td class="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                  {{ role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-' }}
                </td>
                <td class="py-4 px-6 text-right relative">
                  <!-- Só mostra o botão de ações se tiver pelo menos uma permissão de edição ou eliminação -->
                  <div v-if="p('role.edit') || p('role.delete')" class="inline-block text-left">
                    <button
                      @click="activeDropdownId = activeDropdownId === role.id ? null : role.id"
                      class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
                    </button>

                    <div v-if="activeDropdownId === role.id" class="absolute right-6 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-20 text-left">
                      <!-- Opção de Editar (protegida por 'role.edit') -->
                      <button
                        v-if="p('role.edit')"
                        @click="openEditModal(role)"
                        class="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <i class="fa-solid fa-pen-to-square text-indigo-500 dark:text-indigo-400"></i>
                        <span>Editar Função</span>
                      </button>

                      <div v-if="p('role.edit') && p('role.delete')" class="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

                      <!-- Opção de Eliminar (protegida por 'role.delete') -->
                      <button
                        v-if="p('role.delete')"
                        @click="deleteRole(role.id)"
                        class="w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                      >
                        <i class="fa-solid fa-trash"></i>
                        <span>Eliminar Função</span>
                      </button>
                    </div>
                  </div>
                  <span v-else class="text-xs text-slate-400 italic">Sem ações</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Formulário (RoleFormView) -->
    <RoleFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="roleStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>