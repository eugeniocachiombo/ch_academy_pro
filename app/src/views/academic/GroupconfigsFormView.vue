<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useGroupconfigStore, type GroupconfigPayload } from '@/stores/groupconfig.store'
import { useYearStore } from '@/stores/year.store'
import { useCourseStore } from '@/stores/course.store'
import { useClassStore } from '@/stores/class.store'
import { usePeriodStore } from '@/stores/period.store'
import { useRoomStore } from '@/stores/room.store'
import { showNotification } from '@/services/general_service'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (GroupconfigPayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const groupconfigStore = useGroupconfigStore()
const yearStore = useYearStore()
const courseStore = useCourseStore()
const classStore = useClassStore()
const periodStore = usePeriodStore()
const roomStore = useRoomStore()

const form = ref<GroupconfigPayload & { id?: number }>({
  name: '',
  year_id: null,
  course_id: null,
  class_id: null,
  period_id: null,
  room_id: null,
  school_id: null,
})

const fieldErrors = ref<Record<string, string[]>>()
const generalMessage = ref('')
const internalLoading = ref(false)

// Carregar dados auxiliares ao abrir ou montar
onMounted(async () => {
  try {
    await Promise.all([
      yearStore.list?.(),
      courseStore.list?.(),
      classStore.list?.(),
      periodStore.list?.(),
      roomStore.list?.(),
    ])
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares', e)
  }
})

const getFieldError = (field: string) => fieldErrors.value?.[field]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)

const clearFieldError = (field: string) => {
  if (fieldErrors.value?.[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

// Computados para buscar os selects nas stores
const years = computed(() => yearStore.years || [])
const courses = computed(() => courseStore.courses || [])
const classes = computed(() => classStore.classes || [])
const periods = computed(() => periodStore.periods || [])
const rooms = computed(() => roomStore.rooms || [])

// Gerar nome automaticamente com base nas seleções
const generateConfigName = () => {
  if (props.isEditing) return // Não sobrescrever o nome automaticamente se estiver a editar

  const selectedYear = years.value.find((y: any) => y.id === form.value.year_id)?.name || ''
  const selectedCourse = courses.value.find((c: any) => c.id === form.value.course_id)?.name || ''
  const selectedClass = classes.value.find((cl: any) => cl.id === form.value.class_id)?.name || ''
  const selectedPeriod = periods.value.find((p: any) => p.id === form.value.period_id)?.name || ''

  const parts = [selectedCourse, selectedClass, selectedPeriod, selectedYear].filter(Boolean)
  if (parts.length > 0) {
    form.value.name = parts.join(' - ')
  }
}

watch(
  () => [form.value.year_id, form.value.course_id, form.value.class_id, form.value.period_id],
  () => {
    generateConfigName()
  }
)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && !props.isEditing) {
      // Definir o ano activo por defeito ao abrir para criação
      const activeYear = years.value.find((y: any) => y.isCurrent) || years.value[0]
      if (activeYear) {
        form.value.year_id = activeYear.id
      }
    }
  }
)

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData
      ? { ...newData }
      : {
          name: '',
          year_id: years.value.find((y: any) => y.isCurrent)?.id || null,
          course_id: null,
          class_id: null,
          period_id: null,
          room_id: null,
          school_id: null,
        }
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
    const payload: GroupconfigPayload = {
      name: form.value.name,
      year_id: form.value.year_id ? Number(form.value.year_id) : null,
      course_id: form.value.course_id ? Number(form.value.course_id) : null,
      class_id: form.value.class_id ? Number(form.value.class_id) : null,
      period_id: form.value.period_id ? Number(form.value.period_id) : null,
      room_id: form.value.room_id ? Number(form.value.room_id) : null,
      school_id: form.value.school_id,
    }

    if (props.isEditing && form.value.id) {
      await groupconfigStore.update(form.value.id, payload)
    } else {
      await groupconfigStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar a configuração de turma.'

    showNotification(generalMessage.value, 'error')
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
            <i class="fa-solid fa-sliders"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Configuração' : 'Nova Configuração' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados da parametrização.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <div v-if="generalMessage && !Object.keys(fieldErrors || {}).length" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome da Configuração</label>
          <input
            v-model="form.name"
            filter
            @input="clearFieldError('name')"
            type="text"
            placeholder="Ex: Engenharia Informática - 1º Ano - Manhã"
            :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('name') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
          />
          <span v-if="hasError('name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('name') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ano Lectivo</label>
            <select
              filter
              v-model.number="form.year_id"
              @change="clearFieldError('year_id')"
              :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('year_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
            >
              <option :value="null">Selecione o ano...</option>
              <option v-for="y in years" :key="y.id" :value="y.id">
                {{ y.name }} {{ y.isCurrent ? '(Ativo)' : '' }}
              </option>
            </select>
            <span v-if="hasError('year_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('year_id') }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Curso</label>
            <select
              filter
              v-model.number="form.course_id"
              @change="clearFieldError('course_id')"
              :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('course_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
            >
              <option :value="null">Selecione o curso...</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <span v-if="hasError('course_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('course_id') }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Classe</label>
            <select
            filter
              v-model.number="form.class_id"
              @change="clearFieldError('class_id')"
              :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('class_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
            >
              <option :value="null">Selecione a classe...</option>
              <option v-for="cl in classes" :key="cl.id" :value="cl.id">{{ cl.name }}</option>
            </select>
            <span v-if="hasError('class_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('class_id') }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Turno (Período)</label>
            <select
            filter
              v-model.number="form.period_id"
              @change="clearFieldError('period_id')"
              :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('period_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
            >
              <option :value="null">Selecione o turno...</option>
              <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <span v-if="hasError('period_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('period_id') }}</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sala</label>
          <select
          filter
            v-model.number="form.room_id"
            @change="clearFieldError('room_id')"
            :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('room_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
          >
            <option :value="null">Selecione a sala...</option>
            <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
          <span v-if="hasError('room_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('room_id') }}</span>
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