<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore, type User, type RegisterPayload } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import { showNotification } from '@/services/general_service'
import { api } from '@/services/api'
import UsersFormView from './UsersFormView.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const userStore = useUserStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'blocked'>('all')
const roleFilter = ref('all')

const isModalOpen = ref(false)
const isPasswordModalOpen = ref(false)
const isEditing = ref(false)
const selectedUser = ref<User | null>(null)
const formData = ref<(RegisterPayload & { id?: number; email?: string }) | null>(null)
const passwordFormErrors = ref<any>(null)

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const activeDropdownId = ref<number | null>(null)

onMounted(async () => {
  try {
    await userStore.list()
  } catch {}
})

const totalCount = computed(() => userStore.users.filter((u: any) => u != null).length)

const activeCount = computed(() => 
  userStore.users.filter((u: any) => u && u.status === 'ACTIVE').length
)

const blockedCount = computed(() => 
  userStore.users.filter((u: any) => u && u.status === 'BLOCKED').length
)

const filteredUsers = computed(() => {
  return userStore.users.filter((u: any) => {
    if (!u) return false

    const matchesSearch =
      !searchQuery.value ||
      u.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && u.status === 'ACTIVE') ||
      (statusFilter.value === 'blocked' && u.status === 'BLOCKED')

    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value

    return matchesSearch && matchesStatus && matchesRole
  })
})

const openCreateModal = () => {
  if (!p('user.create')) return
  isEditing.value = false
  selectedUser.value = null
  formData.value = { name: '', username: '', email: '', password: '' }
  isModalOpen.value = true
}

const openEditModal = (user: User) => {
  if (!p('user.edit')) return
  isEditing.value = true
  selectedUser.value = user
  formData.value = {
    id: user.id,
    name: user.name || '',
    username: user.username,
    email: user.email || '',
    password: '',
  }
  isModalOpen.value = true
  activeDropdownId.value = null
}

const openPasswordModal = (user: User) => {
  if (!p('user.edit')) return
  selectedUser.value = user
  passwordForm.value = {
    current_password: '',
    password: '',
    password_confirmation: '',
  }
  passwordFormErrors.value = null
  isPasswordModalOpen.value = true
  activeDropdownId.value = null
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
  formData.value = null
  userStore.clearError()
}

const handleSaved = async () => {
  await userStore.list()
  closeModal()
  showNotification('Utilizador guardado com sucesso.', 'success')
}

const getPasswordFieldError = (field: string) => {
  if (!passwordFormErrors.value) return ''
  const errorObj = passwordFormErrors.value.errors || passwordFormErrors.value
  const fieldError = errorObj[field]
  if (!fieldError) return ''
  return Array.isArray(fieldError) ? fieldError[0] : fieldError
}

const getPasswordGeneralMessage = () => {
  if (!passwordFormErrors.value) return ''
  if (passwordFormErrors.value.message && !passwordFormErrors.value.errors) {
    return passwordFormErrors.value.message
  }
  return passwordFormErrors.value.general || ''
}

const handleUpdatePassword = async () => {
  if (!selectedUser.value) return
  passwordFormErrors.value = null

  try {
    await api.patch(`/users/${selectedUser.value.id}/password`, passwordForm.value)
    isPasswordModalOpen.value = false
    selectedUser.value = null
    showNotification('Palavra-passe actualizada com sucesso.', 'success')
  } catch (err: any) {
    if (err.response?.data) {
      passwordFormErrors.value = err.response.data
    } else {
      passwordFormErrors.value = { 
        general: err.message || 'Erro ao alterar palavra-passe. Verifique os dados introduzidos.' 
      }
    }
    showNotification('Erro ao alterar palavra-passe.', 'error')
  }
}

const toggleBlockUser = async (user: any) => {
  if (!p('user.edit')) return
  activeDropdownId.value = null
  const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
  const actionName = newStatus === 'BLOCKED' ? 'bloquear' : 'desbloquear'
  
  if (!confirm(`Tem certeza de que deseja ${actionName} o utilizador @${user.username}?`)) return
  
  try {
    await api.put(`/users/${user.id}`, { status: newStatus })
    await userStore.list()
    showNotification(`Utilizador ${actionName === 'bloquear' ? 'bloqueado' : 'desbloqueado'} com sucesso.`, 'success')
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Erro ao alterar status do utilizador.'
    showNotification(errorMsg, 'error')
  }
}

const deleteUser = async (id: number) => {
  if (!p('user.delete')) return
  activeDropdownId.value = null
  if (!confirm('Tem certeza de que deseja eliminar permanentemente este utilizador?')) return
  
  try {
    await api.delete(`/users/${id}`)
    await userStore.list()
    showNotification('Utilizador eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Erro ao eliminar utilizador.'
    showNotification(errorMsg, 'error')
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Utilizadores</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Administre permissões, contas, segurança e acessos ao sistema.</p>
      </div>
      <button
        v-if="p('user.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-user-plus text-sm"></i>
        <span>Novo Utilizador</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div 
        @click="statusFilter = 'all'"
        :class="['p-5 rounded-2xl border cursor-pointer transition-all', statusFilter === 'all' ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Utilizadores</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-users text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>

      <div 
        @click="statusFilter = 'active'"
        :class="['p-5 rounded-2xl border cursor-pointer transition-all', statusFilter === 'active' ? 'bg-emerald-600/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Utilizadores Activos</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <i class="fa-solid fa-user-check text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">{{ activeCount }}</div>
      </div>

      <div 
        @click="statusFilter = 'blocked'"
        :class="['p-5 rounded-2xl border cursor-pointer transition-all', statusFilter === 'blocked' ? 'bg-red-600/10 border-red-500/50 shadow-lg shadow-red-500/5' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contas Bloqueadas</span>
          <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <i class="fa-solid fa-user-lock text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 mt-3">{{ blockedCount }}</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome, username ou email..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <select
          v-model="statusFilter"
          class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-44"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Activos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>
    </div>

    <div v-if="userStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ userStore.error }}</span>
    </div>

    <div class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        :value="filteredUsers"
        :loading="userStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhum utilizador encontrado.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar utilizadores...</p>
          </div>
        </template>

        <Column field="name" header="Utilizador" sortable style="width: 30%">
          <template #body="slotProps">
            <div class="font-medium text-slate-900 dark:text-white flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-indigo-500/20 shadow-inner">
                <img v-if="slotProps.data.photo" :src="slotProps.data.photo" class="w-full h-full rounded-xl object-cover" />
                <span v-else>{{ (slotProps.data.name || slotProps.data.username || 'U').substring(0, 2).toUpperCase() }}</span>
              </div>
              <div>
                <div class="font-semibold text-slate-800 dark:text-slate-200">{{ slotProps.data.name || 'Sem nome' }}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500">ID: #{{ slotProps.data.id }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="username" header="Username" sortable style="width: 20%">
          <template #body="slotProps">
            <span class="text-slate-600 dark:text-slate-300 font-mono text-xs">@{{ slotProps.data.username }}</span>
          </template>
        </Column>

        <Column field="email" header="Email" sortable style="width: 25%">
          <template #body="slotProps">
            <span class="text-slate-500 dark:text-slate-400 text-xs">{{ slotProps.data.email || '-' }}</span>
          </template>
        </Column>

        <Column field="status" header="Status" sortable style="width: 15%">
          <template #body="slotProps">
            <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', slotProps.data.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20']">
              <span :class="['w-1.5 h-1.5 rounded-full', slotProps.data.status === 'BLOCKED' ? 'bg-red-500 dark:bg-red-400' : 'bg-emerald-500 dark:bg-emerald-400']"></span>
              {{ slotProps.data.status === 'BLOCKED' ? 'Bloqueado' : 'Activo' }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 15%" :exportable="false">
          <template #body="slotProps">
            <div class="flex items-center justify-end gap-1.5" v-if="p('user.edit') || p('user.delete')">
              <!-- Editar Dados -->
              <button
                v-if="p('user.edit')"
                @click="openEditModal(slotProps.data)"
                title="Editar Dados"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>

              <!-- Alterar Password -->
              <button
                v-if="p('user.edit')"
                @click="openPasswordModal(slotProps.data)"
                title="Alterar Password"
                class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors"
              >
                <i class="fa-solid fa-key text-xs"></i>
              </button>

              <!-- Bloquear / Desbloquear -->
              <button
                v-if="p('user.edit')"
                @click="toggleBlockUser(slotProps.data)"
                :title="slotProps.data.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear Acesso'"
                :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  slotProps.data.status === 'BLOCKED' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 text-orange-600 dark:text-orange-400'
                ]"
              >
                <i :class="slotProps.data.status === 'BLOCKED' ? 'fa-solid fa-user-check text-xs' : 'fa-solid fa-user-lock text-xs'"></i>
              </button>

              <!-- Eliminar Conta -->
              <button
                v-if="p('user.delete')"
                @click="deleteUser(slotProps.data.id)"
                title="Eliminar Conta"
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

    <UsersFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="userStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <div v-if="isPasswordModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <i class="fa-solid fa-key text-xs"></i>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm">Mudar Palavra-passe</h3>
          </div>
          <button @click="isPasswordModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-400">
          Actualize as credenciais de acesso para o utilizador <span class="text-slate-900 dark:text-white font-mono">@{{ selectedUser?.username }}</span>.
        </p>

        <div v-if="getPasswordGeneralMessage()" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs">
          {{ getPasswordGeneralMessage() }}
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Palavra-passe Actual</label>
          <input
            v-model="passwordForm.current_password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span v-if="getPasswordFieldError('current_password')" class="text-[11px] text-red-500 dark:text-red-400 mt-1 block">{{ getPasswordFieldError('current_password') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nova Palavra-passe</label>
          <input
            v-model="passwordForm.password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span v-if="getPasswordFieldError('password')" class="text-[11px] text-red-500 dark:text-red-400 mt-1 block">{{ getPasswordFieldError('password') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirmar Nova Palavra-passe</label>
          <input
            v-model="passwordForm.password_confirmation"
            type="password"
            placeholder="••••••••"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span v-if="getPasswordFieldError('password_confirmation')" class="text-[11px] text-red-500 dark:text-red-400 mt-1 block">{{ getPasswordFieldError('password_confirmation') }}</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            @click="isPasswordModalOpen = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/40"
          >
            Cancelar
          </button>
          <button
            @click="handleUpdatePassword"
            class="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
          >
            Actualizar Password
          </button>
        </div>
      </div>
    </div>
  </div>
</template>