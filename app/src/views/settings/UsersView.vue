<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore, type User, type RegisterPayload } from '@/stores/user.store'
import { api } from '@/services/api'
import UsersFormView from './UsersFormView.vue'

const userStore = useUserStore()

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'blocked'>('all')
const roleFilter = ref('all')

const isModalOpen = ref(false)
const isPasswordModalOpen = ref(false)
const isEditing = ref(false)
const selectedUser = ref<User | null>(null)
const formData = ref<RegisterPayload & { id?: number; email?: string } | null>(null)
const formErrors = ref<Record<string, string> | null>(null)

// Campos para o modal de alteração de senha (agora com 3 campos)
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

const totalCount = computed(() => userStore.users.length)
const activeCount = computed(() => userStore.users.filter((u: any) => !u.isBlocked).length)
const blockedCount = computed(() => userStore.users.filter((u: any) => u.isBlocked).length)

const filteredUsers = computed(() => {
  return userStore.users.filter((u: any) => {
    const matchesSearch =
      !searchQuery.value ||
      u.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && !u.isBlocked) ||
      (statusFilter.value === 'blocked' && u.isBlocked)

    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value

    return matchesSearch && matchesStatus && matchesRole
  })
})

const openCreateModal = () => {
  isEditing.value = false
  selectedUser.value = null
  formData.value = { name: '', username: '', email: '', password: '' }
  formErrors.value = null
  isModalOpen.value = true
}

const openEditModal = (user: User) => {
  isEditing.value = true
  selectedUser.value = user
  formData.value = {
    id: user.id,
    name: user.name || '',
    username: user.username,
    email: user.email || '',
    password: '',
  }
  formErrors.value = null
  isModalOpen.value = true
  activeDropdownId.value = null
}

const openPasswordModal = (user: User) => {
  selectedUser.value = user
  passwordForm.value = {
    current_password: '',
    password: '',
    password_confirmation: '',
  }
  formErrors.value = null
  isPasswordModalOpen.value = true
  activeDropdownId.value = null
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
  formData.value = null
  formErrors.value = null
  userStore.clearError()
}

const handleSave = async (payload: RegisterPayload & { id?: number; email?: string }) => {
  formErrors.value = null
  try {
    if (isEditing.value && selectedUser.value) {
      await api.put(`/users/${selectedUser.value.id}`, payload)
    } else {
      await userStore.register(payload)
    }
    await userStore.list()
    closeModal()
  } catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      formErrors.value = err.response.data.errors
    } else {
      // Mensagem customizada e informativa em vez de texto genérico
      formErrors.value = { general: err.response?.data?.message || 'Ocorreu um erro ao salvar o registo. Por favor, reveja os dados informados.' }
    }
  }
}

const handleUpdatePassword = async () => {
  if (!selectedUser.value) return
  formErrors.value = null
  try {
    await api.patch(`/users/${selectedUser.value.id}/password`, passwordForm.value)
    isPasswordModalOpen.value = false
    selectedUser.value = null
    alert('Palavra-passe actualizada com sucesso!')
  } catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      formErrors.value = err.response.data.errors
    } else {
      formErrors.value = { general: err.response?.data?.message || 'Erro ao alterar palavra-passe. Verifique os dados introduzidos.' }
    }
  }
}

const toggleBlockUser = async (user: any) => {
  activeDropdownId.value = null
  const actionName = user.isBlocked ? 'desbloquear' : 'bloquear'
  if (!confirm(`Tem certeza de que deseja ${actionName} o utilizador @${user.username}?`)) return
  try {
    user.isBlocked = !user.isBlocked
  } catch (err) {
    alert('Erro ao alterar status do utilizador.')
  }
}

const deleteUser = async (id: number) => {
  activeDropdownId.value = null
  if (!confirm('Tem certeza de que deseja eliminar permanentemente este utilizador?')) return
  try {
    // await api.delete(`/users/${id}`)
    // await userStore.list()
  } catch {}
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Gestão de Utilizadores</h1>
        <p class="text-sm text-slate-400 mt-1">Administre permissões, contas, segurança e acessos ao sistema.</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-user-plus text-sm"></i>
        <span>Novo Utilizador</span>
      </button>
    </div>

    <!-- Cards de Estatísticas / Filtros Rápidos -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div 
        @click="statusFilter = 'all'"
        :class="['p-5 rounded-2xl border cursor-pointer transition-all', statusFilter === 'all' ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'bg-slate-900 border-slate-800 hover:border-slate-700']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Utilizadores</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-users text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-white mt-3">{{ totalCount }}</div>
      </div>

      <div 
        @click="statusFilter = 'active'"
        :class="['p-5 rounded-2xl border cursor-pointer transition-all', statusFilter === 'active' ? 'bg-emerald-600/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'bg-slate-900 border-slate-800 hover:border-slate-700']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Utilizadores Ativos</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <i class="fa-solid fa-user-check text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-emerald-400 mt-3">{{ activeCount }}</div>
      </div>

      <div 
        @click="statusFilter = 'blocked'"
        :class="['p-5 rounded-2xl border cursor-pointer transition-all', statusFilter === 'blocked' ? 'bg-red-600/10 border-red-500/50 shadow-lg shadow-red-500/5' : 'bg-slate-900 border-slate-800 hover:border-slate-700']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Contas Bloqueadas</span>
          <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <i class="fa-solid fa-user-lock text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-red-400 mt-3">{{ blockedCount }}</div>
      </div>
    </div>

    <!-- Barra de Pesquisa e Filtros -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome, username ou email..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <select
          v-model="statusFilter"
          class="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-44"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>
    </div>

    <!-- Alerta Global -->
    <div v-if="userStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ userStore.error }}</span>
    </div>

    <!-- Tabela -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-4 px-6">Utilizador</th>
              <th class="py-4 px-6">Username</th>
              <th class="py-4 px-6">Email</th>
              <th class="py-4 px-6">Status</th>
              <th class="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-sm">
            <template v-if="userStore.isLoading && !filteredUsers.length">
              <tr>
                <td colspan="5" class="py-12 text-center text-slate-500">
                  <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
                  <p class="text-xs">A carregar utilizadores...</p>
                </td>
              </tr>
            </template>
            <template v-else-if="filteredUsers.length === 0">
              <tr>
                <td colspan="5" class="py-12 text-center text-slate-500">
                  <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
                  <p class="text-xs">Nenhum utilizador encontrado.</p>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="user in (filteredUsers as any)" :key="user.id" class="hover:bg-slate-800/30 transition-colors group">
                <td class="py-4 px-6 font-medium text-white flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-indigo-500/20 shadow-inner">
                    <img v-if="user.photo" :src="user.photo" class="w-full h-full rounded-xl object-cover" />
                    <span v-else>{{ (user.name || user.username).substring(0, 2).toUpperCase() }}</span>
                  </div>
                  <div>
                    <div class="font-semibold text-slate-200">{{ user.name || 'Sem nome' }}</div>
                    <div class="text-xs text-slate-500">ID: #{{ user.id }}</div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-300 font-mono text-xs">@{{ user.username }}</td>
                <td class="py-4 px-6 text-slate-400 text-xs">{{ user.email || '-' }}</td>
                <td class="py-4 px-6">
                  <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', user.isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20']">
                    <span :class="['w-1.5 h-1.5 rounded-full', user.isBlocked ? 'bg-red-400' : 'bg-emerald-400']"></span>
                    {{ user.isBlocked ? 'Bloqueado' : 'Ativo' }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right relative">
                  <div class="inline-block text-left">
                    <button
                      @click="activeDropdownId = activeDropdownId === user.id ? null : user.id"
                      class="w-8 h-8 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
                    </button>

                    <div v-if="activeDropdownId === user.id" class="absolute right-6 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-20 text-left">
                      <button
                        @click="openEditModal(user)"
                        class="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <i class="fa-solid fa-pen-to-square text-indigo-400"></i>
                        <span>Editar Dados</span>
                      </button>

                      <button
                        @click="openPasswordModal(user)"
                        class="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <i class="fa-solid fa-key text-amber-400"></i>
                        <span>Alterar Password</span>
                      </button>

                      <button
                        @click="toggleBlockUser(user)"
                        class="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <i :class="user.isBlocked ? 'fa-solid fa-user-check text-emerald-400' : 'fa-solid fa-user-lock text-orange-400'"></i>
                        <span>{{ user.isBlocked ? 'Desbloquear' : 'Bloquear Acesso' }}</span>
                      </button>

                      <div class="h-px bg-slate-800 my-1"></div>

                      <button
                        @click="deleteUser(user.id)"
                        class="w-full px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                      >
                        <i class="fa-solid fa-trash"></i>
                        <span>Eliminar Conta</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Criar / Editar -->
    <UsersFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="userStore.isLoading"
      :errors="formErrors"
      :initial-data="formData"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Modal Dedicado para Alterar Palavra-passe (Com 3 Campos) -->
    <div v-if="isPasswordModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <i class="fa-solid fa-key text-xs"></i>
            </div>
            <h3 class="font-bold text-white text-sm">Mudar Palavra-passe</h3>
          </div>
          <button @click="isPasswordModalOpen = false" class="text-slate-400 hover:text-white">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p class="text-xs text-slate-400">
          Actualize as credenciais de acesso para o utilizador <span class="text-white font-mono">@{{ selectedUser?.username }}</span>.
        </p>

        <!-- Mensagem de erro global do modal de senha se houver -->
        <div v-if="formErrors?.general || formErrors?.password" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {{ formErrors?.general || formErrors?.password }}
        </div>

        <!-- Campo 1: Palavra-passe Atual -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Palavra-passe Atual</label>
          <input
            v-model="passwordForm.current_password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span v-if="formErrors?.current_password" class="text-[11px] text-red-400 mt-1 block">{{ formErrors.current_password }}</span>
        </div>

        <!-- Campo 2: Nova Palavra-passe -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nova Palavra-passe</label>
          <input
            v-model="passwordForm.password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span v-if="formErrors?.password && typeof formErrors.password === 'string' && formErrors.password !== (formErrors?.general || '')" class="text-[11px] text-red-400 mt-1 block">{{ formErrors.password }}</span>
        </div>

        <!-- Campo 3: Confirmar Nova Palavra-passe -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Confirmar Nova Palavra-passe</label>
          <input
            v-model="passwordForm.password_confirmation"
            type="password"
            placeholder="••••••••"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span v-if="formErrors?.password_confirmation" class="text-[11px] text-red-400 mt-1 block">{{ formErrors.password_confirmation }}</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            @click="isPasswordModalOpen = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/40"
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