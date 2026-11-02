<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoleStore, type Role, type CreateRolePayload } from '@/stores/role.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { api } from '@/services/api'
import cryptoService from '@/services/crypto.service'
import RoleFormView from './RolesFormView.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const roleStore = useRoleStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

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
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Funções</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure e gira as funções de acesso ao sistema.</p>
      </div>
      <!-- Botão de Criar (protegido por 'role.create') -->
      <button
        v-if="p('role.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
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

    <!-- Tabela com PrimeVue DataTable -->
    <div class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        :value="filteredRoles"
        :loading="roleStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma função encontrada.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar funções...</p>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">#{{ slotProps.data.id }}</span>
          </template>
        </Column>

        <Column field="name" header="Nome da Função" sortable style="width: 40%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">{{ slotProps.data.name }}</span>
          </template>
        </Column>

        <Column field="createdAt" header="Criado em" sortable style="width: 25%">
          <template #body="slotProps">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString() : '-' }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 20%" :exportable="false">
          <template #body="slotProps">
            <div class="flex items-center justify-start gap-1.5" v-if="p('role.edit') || p('role.delete')">
              <!-- Editar Função -->
              <button
                v-if="p('role.edit')"
                @click="openEditModal(slotProps.data)"
                title="Editar Função"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>

              <!-- Eliminar Função -->
              <button
                v-if="p('role.delete')"
                @click="deleteRole(slotProps.data.id)"
                title="Eliminar Função"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
            <span v-else class="text-xs text-slate-400 italic">Sem acções</span>
          </template>
        </Column>
      </DataTable>
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