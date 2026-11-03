<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCourseStore, type CoursePayload } from '@/stores/course.store'
import { showNotification } from '@/services/general_service'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (CoursePayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const courseStore = useCourseStore()
const form = ref<CoursePayload & { id?: number }>({
  name: '',
  code: '',
  description: '',
  school_id: null,
})

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

const getFieldError = (field: string) => fieldErrors.value[field]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)

const clearFieldError = (field: string) => {
  if (fieldErrors.value[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData
      ? { ...newData }
      : { name: '', code: '', description: '', school_id: null }
    fieldErrors.value = {}
    generalMessage.value = ''
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  fieldErrors.value = {}
  generalMessage.value = ''
  internalLoading.value = true
  
  try {
    const payload: CoursePayload = {
      name: form.value.name,
      code: form.value.code,
      description: form.value.description,
      school_id: form.value.school_id,
    }

    if (props.isEditing && form.value.id) {
      await courseStore.update(form.value.id, payload)
    } else {
      await courseStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar o curso.'

    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Curso' : 'Novo Curso' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados do curso.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="generalMessage && !Object.keys(fieldErrors).length" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Código do Curso</label>
          <input
            v-model="form.code"
            @input="clearFieldError('code')"
            type="text"
            placeholder="Ex: INFO"
            :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('code') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
          />
          <span v-if="hasError('code')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('code') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Curso</label>
          <input
            v-model="form.name"
            @input="clearFieldError('name')"
            type="text"
            placeholder="Ex: Informática de Gestão"
            :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('name') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
          />
          <span v-if="hasError('name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('name') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
          <textarea
            v-model="form.description"
            @input="clearFieldError('description')"
            rows="3"
            placeholder="Descrição opcional do curso"
            :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('description') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
          ></textarea>
          <span v-if="hasError('description')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('description') }}</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="internalLoading" class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>