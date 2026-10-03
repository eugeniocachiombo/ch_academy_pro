<script setup lang="ts">
import { ref, watch } from 'vue'
import { type RegisterPayload } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { api } from '@/services/api'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string | string[]>
  [key: string]: any
}

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (RegisterPayload & { id?: number; email?: string }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const form = ref<RegisterPayload & { id?: number; email?: string }>({
  name: '',
  username: '',
  email: '',
  password: '',
})

const formErrors = ref<ApiErrorResponse | null>(null)
const internalLoading = ref(false)

const generateUsername = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._]/g, '')
}

const getFieldError = (field: string) => {
  if (!formErrors.value) return ''
  
  const errorObj = formErrors.value.errors || formErrors.value
  const fieldError = errorObj[field]

  if (!fieldError) return ''
  return Array.isArray(fieldError) ? fieldError[0] : fieldError
}

const hasError = (field: string) => {
  return !!getFieldError(field)
}

const getGeneralMessage = () => {
  if (!formErrors.value) return ''
  
  if (formErrors.value.errors) {
    return ''
  }

  if (formErrors.value.message) {
    return formErrors.value.message
  }

  return ''
}

watch(
  () => form.value.name,
  (newName) => {
    if (!props.isEditing && newName) {
      form.value.username = generateUsername(newName)
    }
  }
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
    } else {
      form.value = { name: '', username: '', email: '', password: '' }
    }
    formErrors.value = null
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  formErrors.value = null
  internalLoading.value = true

  try {
    const payload = { ...form.value }
    if (props.isEditing) {
      delete payload.password
    }

    if (props.isEditing && form.value.id) {
      await api.put(`/users/${form.value.id}`, payload)
    } else {
      await api.post('/users', payload)
    }
    emit('saved')
    emit('close')
    showNotification('Utilizador guardado com sucesso.', 'success')
  } catch (err: any) {
    if (err.response?.data) {
      formErrors.value = err.response.data
    } else {
      formErrors.value = { 
        message: err.message || 'Ocorreu um erro ao salvar o registo.' 
      }
    }
    showNotification('Erro ao guardar utilizador.', 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <!-- Cabeçalho do Modal -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i :class="isEditing ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus'"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Utilizador' : 'Novo Utilizador' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados cadastrais do sistema.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="getGeneralMessage()" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ getGeneralMessage() }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ex: João Silva"
            :class="[
              'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all',
              hasError('name') ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="hasError('name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('name') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Ex: joao.silva"
            :class="[
              'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all font-mono',
              hasError('username') ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="hasError('username')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('username') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Ex: joao.silva@empresa.com"
            :class="[
              'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all',
              hasError('email') ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="hasError('email')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('email') }}</span>
        </div>

        <!-- Ocultado dinamicamente quando estiver no modo de edição -->
        <div v-if="!isEditing">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Palavra-passe</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            :class="[
              'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all',
              hasError('password') ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="hasError('password')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('password') }}</span>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>