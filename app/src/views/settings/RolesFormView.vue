<script setup lang="ts">
import { ref, watch } from 'vue'
import { type CreateRolePayload } from '@/stores/role.store'
import { api } from '@/services/api'
import cryptoService from '@/services/crypto.service'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string | string[]>
  [key: string]: any
}

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (CreateRolePayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const form = ref<CreateRolePayload & { id?: number }>({
  name: '',
})

const formErrors = ref<ApiErrorResponse | null>(null)
const internalLoading = ref(false)

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
  if (formErrors.value.errors) return ''
  return formErrors.value.message || ''
}

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
    } else {
      form.value = { name: '' }
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

    if (props.isEditing && form.value.id) {
      const encryptedId = cryptoService.encryptId(String(form.value.id))
      await api.put(`/roles/${encryptedId}`, payload)
    } else {
      await api.post('/roles', payload)
    }
    emit('saved')
    emit('close')
  } catch (err: any) {
    if (err.response?.data) {
      formErrors.value = err.response.data
    } else {
      formErrors.value = { 
        message: err.message || 'Ocorreu um erro ao salvar o registo.' 
      }
    }
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <!-- Cabeçalho do Modal -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i :class="isEditing ? 'fa-solid fa-shield-pen' : 'fa-solid fa-shield-plus'"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Função' : 'Nova Função' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados da função do sistema.</p>
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
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome da Função</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ex: Administrador"
            :class="[
              'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all',
              hasError('name') ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="hasError('name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('name') }}</span>
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