<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useScheduleStore, type SchedulePayload } from '@/stores/schedule.store'
import { useSubjectStore } from '@/stores/subject.store'
import { useTeacherocupationStore } from '@/stores/teacherocupation.store'
import { useYearStore } from '@/stores/year.store'
import { useAuthStore } from '@/stores/auth.store'
import { useClassSubjectStore } from '@/stores/class-subject.store'
import { useClasscourseStore } from '@/stores/classcourse.store'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (SchedulePayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const scheduleStore = useScheduleStore()
const subjectStore = useSubjectStore()
const teacherocupationStore = useTeacherocupationStore()
const yearStore = useYearStore()
const authStore = useAuthStore()
const classSubjectStore = useClassSubjectStore()
const classcourseStore = useClasscourseStore()

const emptyForm = (): SchedulePayload & { id?: number } => ({
  groupconfig_id: null,
  subject_id: null,
  teacher_id: null,
  year_id: null,
  day_of_week: 'MONDAY',
  start_time: '',
  end_time: '',
  school_id: authStore?.currentUser?.school_id ? Number(authStore.currentUser.school_id) : null
})

const form = ref<SchedulePayload & { id?: number }>(emptyForm())

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)
const notifiedMissingActiveYear = ref(false)
const formRef = ref<HTMLFormElement | null>(null)

const daysOfWeek = [
  { label: 'Segunda-feira', value: 'MONDAY' },
  { label: 'Terça-feira', value: 'TUESDAY' },
  { label: 'Quarta-feira', value: 'WEDNESDAY' },
  { label: 'Quinta-feira', value: 'THURSDAY' },
  { label: 'Sexta-feira', value: 'FRIDAY' },
  { label: 'Sábado', value: 'SATURDAY' }
]

const normalizeErrors = (err: any): Record<string, string[]> => {
  const raw = err?.errors ?? err?.fieldErrors ?? err?.response?.data?.errors ?? err?.data?.errors ?? {}
  const result: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(raw)) {
    result[key] = Array.isArray(value) ? (value as string[]) : [String(value)]
  }
  return result
}

const getFieldError = (field: string): string => fieldErrors.value[field]?.[0] ?? ''

function hasError(field: string): boolean {
  return !!getFieldError(field)
}

const clearFieldError = (field: string) => {
  if (fieldErrors.value[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

const activeYear = computed(() => (yearStore.years || []).find((y: any) => y.isCurrent) || null)
const isMissingActiveYear = computed(() => !props.isEditing && !activeYear.value)

const availableGroupConfigs = computed(() => {
  const list = scheduleStore.groupConfigs || []
  if (props.isEditing) return list

  const currentYearId = activeYear.value?.id
  if (!currentYearId) return []

  return list.filter((gc: any) => {
    const gcYearId = gc?.year_id ?? gc?.year?.id
    return Number(gcYearId) === Number(currentYearId)
  })
})

const triggerMissingActiveYearNotice = () => {
  if (notifiedMissingActiveYear.value) return
  const msg = 'Não existe um ano lectivo activo. Active um ano lectivo antes de registar horários.'
  fieldErrors.value = { year_id: [msg] }
  generalMessage.value = msg
  showNotification(msg, 'error')
  notifiedMissingActiveYear.value = true
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen && !internalLoading.value) emit('close')
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  try {
    await Promise.all([
      scheduleStore.fetchGroupConfigs(),
      subjectStore.list(),
      teacherocupationStore.list(),
      yearStore.list?.(),
      classSubjectStore.list(),
      classcourseStore.list()
    ])
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares', e)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

const selectedGroupConfig = computed(() => {
  return (scheduleStore.groupConfigs || []).find((gc: any) => gc.id === Number(form.value.groupconfig_id))
})

watch(() => form.value.groupconfig_id, (newId) => {
  if (newId) {
    const gc = (scheduleStore.groupConfigs || []).find((item: any) => item.id === Number(newId))
    if (gc) {
      form.value.school_id = gc.school_id || null
      form.value.year_id = gc.year_id ?? gc.year?.id ?? null
    }
  }
  if (!props.isEditing) {
    form.value.subject_id = null
    form.value.teacher_id = null
    form.value.start_time = ''
    form.value.end_time = ''
  }
  clearFieldError('groupconfig_id')
})

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) {
      notifiedMissingActiveYear.value = false
      return
    }

    notifiedMissingActiveYear.value = false

    await Promise.all([
      !yearStore.years?.length && yearStore.list ? yearStore.list().catch(() => {}) : Promise.resolve(),
      !classSubjectStore.classSubjects?.length ? classSubjectStore.list().catch(() => {}) : Promise.resolve(),
      !classcourseStore.classcourses?.length ? classcourseStore.list().catch(() => {}) : Promise.resolve(),
      !teacherocupationStore.teacherocupations?.length ? teacherocupationStore.list().catch(() => {}) : Promise.resolve()
    ])

    if (!props.isEditing && isMissingActiveYear.value) {
      triggerMissingActiveYearNotice()
    }
  }
)

watch(isMissingActiveYear, (missing) => {
  if (props.isOpen && missing) {
    triggerMissingActiveYearNotice()
  }
})

const availableSubjects = computed(() => {
  const subjects = subjectStore.subjects || []
  const gc = selectedGroupConfig.value
  if (!gc) return []

  const classId = gc.class_id ?? gc.class?.id
  const courseId = gc.course_id ?? gc.course?.id

  if (!classId) return []

  const classSubjectIds = new Set(
    (classSubjectStore.classSubjects || [])
      .filter((cs: any) => Number(cs.class_id) === Number(classId))
      .map((cs: any) => Number(cs.subject_id))
  )

  if (!courseId) {
    return subjects.filter((s: any) => classSubjectIds.has(Number(s.id)))
  }

  const hasClassCourseLink = (classcourseStore.classcourses || []).some(
    (cc: any) => Number(cc.class_id) === Number(classId) && Number(cc.course_id) === Number(courseId)
  )

  if (!hasClassCourseLink) {
    return []
  }

  return subjects.filter((s: any) => {
    if (!classSubjectIds.has(Number(s.id))) return false
    const subjectCourseId = s.course_id ?? s.course?.id
    if (subjectCourseId !== undefined && subjectCourseId !== null) {
      return Number(subjectCourseId) === Number(courseId)
    }
    return true
  })
})

const availableTeachers = computed(() => {
  if (!form.value.subject_id) return []

  const gc = selectedGroupConfig.value
  const targetYearId =
    form.value.year_id ??
    gc?.year_id ??
    gc?.year?.id ??
    activeYear.value?.id

  const bySubject = (teacherocupationStore.teacherocupations || []).filter((o: any) => {
    const occSubjectId = o.subject_id ?? o.subject?.id
    return Number(occSubjectId) === Number(form.value.subject_id)
  })

  const byYear = targetYearId
    ? bySubject.filter((o: any) => {
        const occYearId = o.year_id ?? o.year?.id
        return occYearId !== undefined && occYearId !== null && Number(occYearId) === Number(targetYearId)
      })
    : bySubject

  const occupations = byYear.length > 0 ? byYear : bySubject

  const map = new Map()
  occupations.forEach((o: any) => {
    const teacherId = o.teacher?.id ?? o.teacher_id
    if (!teacherId) return

    const teacherName =
      o.teacher?.user?.person?.name ||
      o.teacher?.user?.name ||
      o.teacher?.name ||
      `Professor #${teacherId}`

    map.set(Number(teacherId), { id: Number(teacherId), name: teacherName })
  })

  return Array.from(map.values())
})

const periodLimits = computed(() => {
  const period = selectedGroupConfig.value?.period
  if (!period) return { min: '07:00', max: '19:00' }
  return {
    min: period.starthour || '07:00',
    max: period.endhour || '19:00'
  }
})

watch(() => form.value.subject_id, () => {
  if (!props.isEditing) {
    form.value.teacher_id = null
  }
  clearFieldError('subject_id')
  clearFieldError('teacher_id')
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    const base = emptyForm()
    form.value = {
      ...base,
      ...newData,
      groupconfig_id: newData.groupconfig_id ? Number(newData.groupconfig_id) : null,
      subject_id: newData.subject_id ? Number(newData.subject_id) : null,
      teacher_id: newData.teacher_id ? Number(newData.teacher_id) : null,
      year_id: newData.year_id ? Number(newData.year_id) : null,
      school_id: newData.school_id ? Number(newData.school_id) : (authStore.currentUser?.school_id ? Number(authStore.currentUser.school_id) : null)
    }
  } else {
    form.value = emptyForm()
  }
  fieldErrors.value = {}
  generalMessage.value = ''
}, { immediate: true, deep: true })

const scrollToFirstError = async () => {
  await nextTick()
  const target = formRef.value?.querySelector('[aria-invalid="true"]') as HTMLElement | null
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.focus?.()
  } else {
    formRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSubmit = async () => {
  if (internalLoading.value) return
  fieldErrors.value = {}
  generalMessage.value = ''

  if (isMissingActiveYear.value) {
    triggerMissingActiveYearNotice()
    await scrollToFirstError()
    return
  }

  internalLoading.value = true

  try {
    const payload: SchedulePayload = {
      groupconfig_id: form.value.groupconfig_id ? Number(form.value.groupconfig_id) : null,
      subject_id: form.value.subject_id ? Number(form.value.subject_id) : null,
      teacher_id: form.value.teacher_id ? Number(form.value.teacher_id) : null,
      year_id: form.value.year_id ? Number(form.value.year_id) : null,
      day_of_week: form.value.day_of_week,
      start_time: form.value.start_time,
      end_time: form.value.end_time,
      school_id: form.value.school_id ? Number(form.value.school_id) : (authStore.currentUser?.school_id ? Number(authStore.currentUser?.school_id) : null)
    }

    if (props.isEditing && form.value.id) {
      await scheduleStore.update(form.value.id, payload)
    } else {
      await scheduleStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = normalizeErrors(err)
    generalMessage.value = err?.message || 'Ocorreu um erro ao guardar o horário.'
    showNotification(generalMessage.value, 'error')
    await scrollToFirstError()
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Horário' : 'Novo Horário' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Os campos marcados com <span class="text-red-500 font-bold">*</span> são obrigatórios.
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          title="Fechar (Esc)"
          aria-label="Fechar"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form ref="formRef" @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1" novalidate>
        <div
          v-if="isMissingActiveYear"
          class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5"
        >
          <i class="fa-solid fa-calendar-xmark mt-0.5 flex-shrink-0"></i>
          <div>
            <p class="font-semibold">Sem ano lectivo activo</p>
            <p class="mt-0.5">Active um ano lectivo antes de registar novos horários.</p>
          </div>
        </div>

        <div v-if="generalMessage && !Object.keys(fieldErrors || {}).length" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Turma Config <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.groupconfig_id"
            :options="availableGroupConfigs"
            optionLabel="name"
            optionValue="id"
            filter
            :disabled="isMissingActiveYear"
            placeholder="Seleccione a turma config..."
            @change="clearFieldError('groupconfig_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('groupconfig_id') }"
          />
          <span v-if="hasError('groupconfig_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('groupconfig_id') }}</span>
        </div>

        <div v-if="selectedGroupConfig" class="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span class="text-slate-400 block">Ano Lectivo:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedGroupConfig.year?.name || 'Automático' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block">Sala Atribuída:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedGroupConfig.room?.name || 'Não definida' }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-400 block">Turno:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">
              {{ selectedGroupConfig.period?.name || 'Não definido' }}
              <span v-if="selectedGroupConfig.period?.starthour && selectedGroupConfig.period?.endhour" class="text-[10px] text-slate-500">
                ({{ selectedGroupConfig.period.starthour }} - {{ selectedGroupConfig.period.endhour }})
              </span>
            </span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Disciplina <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.subject_id"
            :options="availableSubjects"
            optionLabel="name"
            optionValue="id"
            filter
            :disabled="!form.groupconfig_id || isMissingActiveYear"
            placeholder="Seleccione a disciplina..."
            @change="clearFieldError('subject_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('subject_id') }"
          />
          <span v-if="hasError('subject_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('subject_id') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Professor <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.teacher_id"
            :options="availableTeachers"
            optionLabel="name"
            optionValue="id"
            filter
            :disabled="!form.subject_id || isMissingActiveYear"
            placeholder="Seleccione o professor..."
            @change="clearFieldError('teacher_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('teacher_id') }"
          />
          <span v-if="hasError('teacher_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('teacher_id') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Dia da Semana <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.day_of_week"
            :options="daysOfWeek"
            optionLabel="label"
            optionValue="value"
            :disabled="isMissingActiveYear"
            placeholder="Seleccione o dia..."
            @change="clearFieldError('day_of_week')"
            class="w-full"
            :class="{ 'p-invalid': hasError('day_of_week') }"
          />
          <span v-if="hasError('day_of_week')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('day_of_week') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hora de Início <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.start_time"
              @input="clearFieldError('start_time')"
              type="time"
              :disabled="isMissingActiveYear"
              :min="periodLimits.min"
              :max="periodLimits.max"
              :aria-invalid="hasError('start_time')"
              :class="[
                'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all disabled:opacity-60',
                hasError('start_time') ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
              ]"
            />
            <span v-if="hasError('start_time')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('start_time') }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hora de Término <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.end_time"
              @input="clearFieldError('end_time')"
              type="time"
              :disabled="isMissingActiveYear"
              :min="form.start_time || periodLimits.min"
              :max="periodLimits.max"
              :aria-invalid="hasError('end_time')"
              :class="[
                'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all disabled:opacity-60',
                hasError('end_time') ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
              ]"
            />
            <span v-if="hasError('end_time')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('end_time') }}</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading || isMissingActiveYear"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>