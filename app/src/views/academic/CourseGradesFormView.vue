<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCourseGradeStore } from '@/stores/course_grade.store'
import { useCourseStore } from '@/stores/course.store'
import { api } from '@/services/api'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string | string[]>
  [key: string]: any
}

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const courseGradeStore = useCourseGradeStore()
const courseStore = useCourseStore()
const gradesList = ref<any[]>([])

const form = ref({
  courseId: null as number | null,
  gradeIds: [] as number[],
})

const formErrors = ref<ApiErrorResponse | null>(null)
const internalLoading = ref(false)

onMounted(async () => {
  try {
    const promises: Promise<any>[] = []
    if (gradesList.value.length === 0) {
      promises.push(api.get<unknown, any[]>('/academic-grades').then(res => { gradesList.value = res }))
    }
    if (courseStore.courses.length === 0) {
      promises.push(courseStore.list())
    }
    if (promises.length > 0) await Promise.all(promises)
  } catch {}
})

const courseOptions = computed(() => {
  return courseStore.courses.map(c => ({
    id: c.id,
    label: `${c.code} - ${c.name}`
  }))
})

const gradeOptions = computed(() => {
  return gradesList.value.map(g => ({
    id: g.id,
    label: g.name
  }))
})

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
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      if (courseStore.courses.length === 0) await courseStore.list()
      if (gradesList.value.length === 0) {
        try {
          gradesList.value = await api.get<unknown, any[]>('/academic-grades')
        } catch {}
      }
    }
  }
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { 
        courseId: newData.courseId ? Number(newData.courseId) : null,
        gradeIds: newData.gradeIds ? newData.gradeIds.map((id: any) => Number(id)) : [],
      }
    } else {
      form.value = { courseId: null, gradeIds: [] }
    }
    formErrors.value = null
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  formErrors.value = null
  internalLoading.value = true

  try {
    const payload = { 
      courseId: Number(form.value.courseId),
      gradeIds: form.value.gradeIds.map(id => Number(id))
    }

    if (props.isEditing && form.value.courseId) {
      await courseGradeStore.update(form.value.courseId, payload)
    } else {
      await courseGradeStore.create(payload)
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
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-layer-group text-sm"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Classes por Curso' : 'Atribuir Classes a Curso' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Selecione o curso e escolha todas as classes aplicáveis.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="getGeneralMessage()" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ getGeneralMessage() }}</span>
        </div>

        <!-- Seleção de Curso -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Curso</label>
          <Select
            v-model="form.courseId"
            :options="courseOptions"
            optionLabel="label"
            optionValue="id"
            filter
            :disabled="isEditing"
            placeholder="Selecione um curso..."
            class="w-full text-sm"
          />
          <span v-if="hasError('courseId')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('courseId') }}</span>
        </div>

        <!-- Seleção Múltipla de Classes -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Classes por Curso (Múltipla Seleção)</label>
          <MultiSelect
            v-model="form.gradeIds"
            :options="gradeOptions"
            optionLabel="label"
            optionValue="id"
            filter
            display="chip"
            placeholder="Selecione as classes correspondentes..."
            class="w-full text-sm"
          />
          <span v-if="hasError('gradeIds')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('gradeIds') }}</span>
        </div>

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
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar Configuração' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-select), :deep(.p-multiselect) {
  background: var(--surface-ground, #f8fafc);
  border: 1px solid var(--surface-border, #cbd5e1);
  border-radius: 0.75rem;
  padding: 0.25rem 0.5rem;
}
.dark :deep(.p-select), .dark :deep(.p-multiselect) {
  background: #020617;
  border-color: #1e293b;
  color: #f8fafc;
}
:deep(.p-multiselect-label-container) {
  padding: 0.25rem;
}
</style>