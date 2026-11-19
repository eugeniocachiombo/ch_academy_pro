<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useGroupconfigStore, type GroupconfigPayload } from '@/stores/groupconfig.store'
import { useGroupStore } from '@/stores/group.store'
import { useYearStore } from '@/stores/year.store'
import { useCourseStore } from '@/stores/course.store'
import { useClassStore } from '@/stores/class.store'
import { useClasscourseStore } from '@/stores/classcourse.store'
import { usePeriodStore } from '@/stores/period.store'
import { useRoomStore } from '@/stores/room.store'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

interface DynamicRow {
  name: string
  class_id: number | null
  group_id: number | null
  period_id: number | null
  room_id: number | null
  total_slots: number | null
  total_enrolled?: number
}

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
const groupStore = useGroupStore()
const yearStore = useYearStore()
const courseStore = useCourseStore()
const classStore = useClassStore()
const classcourseStore = useClasscourseStore()
const periodStore = usePeriodStore()
const roomStore = useRoomStore()

const SHARED_FIELDS = ['course_id', 'year_id', 'school_id']

const fixedCourseId = ref<number | null>(null)
const fixedYearId = ref<number | null>(null)
const fixedSchoolId = ref<number | null>(null)
const editingId = ref<number | null>(null)

const createEmptyRow = (): DynamicRow => ({
  name: '',
  class_id: null,
  group_id: null,
  period_id: null,
  room_id: null,
  total_slots: null,
  total_enrolled: 0,
})

const rows = ref<DynamicRow[]>([createEmptyRow()])
const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

onMounted(async () => {
  try {
    await Promise.all([
      groupStore.list?.(),
      yearStore.list?.(),
      courseStore.list?.(),
      classStore.list?.(),
      classcourseStore.list?.(),
      periodStore.list?.(),
      roomStore.list?.(),
    ])
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares', e)
  }
})

const getFieldError = (field: string): string => {
  const errs = fieldErrors.value || {}
  const direct = errs[field]
  if (Array.isArray(direct) && direct.length > 0) return direct[0]
  const key = Object.keys(errs).find((k) => k.endsWith(`.${field}`))
  if (!key) return ''
  const msgs = errs[key]
  return Array.isArray(msgs) && msgs.length > 0 ? msgs[0] : ''
}

const hasError = (field: string): boolean => !!getFieldError(field)

const getRowError = (rowIndex: number, field: string): string => {
  const msgs = (fieldErrors.value || {})[`rows.${rowIndex}.${field}`]
  return Array.isArray(msgs) && msgs.length > 0 ? msgs[0] : ''
}

const hasRowError = (rowIndex: number, field: string): boolean => !!getRowError(rowIndex, field)

const clearFieldError = (...keys: string[]) => {
  if (!fieldErrors.value) return
  const next = { ...fieldErrors.value }
  for (const key of keys) {
    delete next[key]
  }
  fieldErrors.value = next
}

const clearSharedError = (field: string) => {
  const next: Record<string, string[]> = {}
  for (const [key, msgs] of Object.entries(fieldErrors.value || {})) {
    if (key === field || key.endsWith(`.${field}`)) continue
    next[key] = msgs
  }
  fieldErrors.value = next
}

const clearRowFieldError = (rowIndex: number, field: string) => {
  clearFieldError(`rows.${rowIndex}.${field}`)
}

const clearRowConflictErrors = (rowIndex: number) => {
  clearFieldError(`rows.${rowIndex}.group_id`, `rows.${rowIndex}.room_id`)
}

const clearAllConflictErrors = () => {
  rows.value.forEach((_, index) => clearRowConflictErrors(index))
}

const sortAscById = <T extends { id?: number | string }>(list: T[]): T[] => {
  return [...list].sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0))
}

const groups = computed(() => sortAscById(groupStore.groups || []))
const years = computed(() => sortAscById(yearStore.years || []))
const courses = computed(() => sortAscById(courseStore.courses || []))
const periods = computed(() => sortAscById(periodStore.periods || []))
const rooms = computed(() => sortAscById(roomStore.rooms || []))

const classes = computed(() => {
  const allClasses = classStore.classes || []
  if (!fixedCourseId.value) {
    return []
  }

  const allowedClassIds = new Set(
    (classcourseStore.classcourses || [])
      .filter((cc) => Number(cc.course_id) === Number(fixedCourseId.value))
      .map((cc) => Number(cc.class_id))
  )

  return sortAscById(allClasses.filter((cl: any) => allowedClassIds.has(Number(cl.id))))
})

const buildRowName = (row: DynamicRow): string => {
  const selectedCourse = courses.value.find((c: any) => Number(c.id) === Number(fixedCourseId.value))?.name || ''
  const selectedClass = classes.value.find((cl: any) => Number(cl.id) === Number(row.class_id))?.name || ''
  const selectedGroup = groups.value.find((g: any) => Number(g.id) === Number(row.group_id))?.name || ''
  const selectedPeriod = periods.value.find((p: any) => Number(p.id) === Number(row.period_id))?.name || ''
  const selectedRoom = rooms.value.find((r: any) => Number(r.id) === Number(row.room_id))?.name || ''
  const selectedYear = years.value.find((y: any) => Number(y.id) === Number(fixedYearId.value))?.name || ''

  return [selectedCourse, selectedClass, selectedGroup, selectedPeriod, selectedRoom, selectedYear]
    .filter(Boolean)
    .join(' - ')
}

const refreshRowName = (index: number) => {
  const row = rows.value[index]
  if (!row) return
  row.name = buildRowName(row)
}

const onSlotsInput = (rowIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const raw = target.value.trim()
  if (raw === '') {
    rows.value[rowIndex].total_slots = null
  } else {
    const parsed = Number(raw)
    rows.value[rowIndex].total_slots = Number.isNaN(parsed) ? null : parsed
  }
  clearRowFieldError(rowIndex, 'total_slots')
}

watch(
  () => [fixedCourseId.value, fixedYearId.value],
  () => {
    const validClassIds = new Set(classes.value.map((cl: any) => Number(cl.id)))
    rows.value.forEach((row, idx) => {
      if (row.class_id !== null && !validClassIds.has(Number(row.class_id))) {
        row.class_id = null
      }
      refreshRowName(idx)
    })
  }
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && !props.isEditing && !fixedYearId.value) {
      const activeYear = years.value.find((y: any) => y.isCurrent) || years.value[0]
      if (activeYear) {
        fixedYearId.value = Number(activeYear.id)
      }
    }
  }
)

watch(
  () => props.initialData,
  (newData) => {
    fieldErrors.value = {}
    generalMessage.value = ''

    if (newData && props.isEditing) {
      editingId.value = newData.id ?? null
      fixedCourseId.value = newData.course_id ?? null
      fixedYearId.value = newData.year_id ?? null
      fixedSchoolId.value = newData.school_id ?? null
      rows.value = [
        {
          name: newData.name || '',
          class_id: newData.class_id ?? null,
          group_id: newData.group_id ?? null,
          period_id: newData.period_id ?? null,
          room_id: newData.room_id ?? null,
          total_slots: newData.total_slots ?? null,
          total_enrolled: newData.total_enrolled ?? 0,
        },
      ]
      refreshRowName(0)
    } else {
      editingId.value = null
      fixedCourseId.value = newData?.course_id ?? null
      fixedYearId.value =
        newData?.year_id ?? (years.value.find((y: any) => y.isCurrent)?.id || years.value[0]?.id || null)
      fixedSchoolId.value = newData?.school_id ?? null
      rows.value = [createEmptyRow()]
    }
  },
  { immediate: true, deep: true }
)

const addRow = () => {
  rows.value.push(createEmptyRow())
}

const removeRow = (index: number) => {
  if (rows.value.length <= 1) return

  const shifted: Record<string, string[]> = {}
  for (const [key, msgs] of Object.entries(fieldErrors.value || {})) {
    const match = key.match(/^rows\.(\d+)\.(.+)$/)
    if (!match) {
      shifted[key] = msgs
      continue
    }
    const errorIndex = Number(match[1])
    if (errorIndex === index) continue
    shifted[`rows.${errorIndex > index ? errorIndex - 1 : errorIndex}.${match[2]}`] = msgs
  }

  rows.value.splice(index, 1)
  fieldErrors.value = shifted
}

const availableSlotsForRow = (row: DynamicRow) => {
  const total = Number(row.total_slots) || 0
  const enrolled = Number(row.total_enrolled) || 0
  return Math.max(0, total - enrolled)
}

const buildPayloadFromRow = (row: DynamicRow): GroupconfigPayload => ({
  name: buildRowName(row) || row.name.trim(),
  total_slots: row.total_slots !== null && row.total_slots !== undefined ? Number(row.total_slots) : null,
  group_id: row.group_id !== null && row.group_id !== undefined ? Number(row.group_id) : null,
  year_id: fixedYearId.value !== null && fixedYearId.value !== undefined ? Number(fixedYearId.value) : null,
  course_id: fixedCourseId.value !== null && fixedCourseId.value !== undefined ? Number(fixedCourseId.value) : null,
  class_id: row.class_id !== null && row.class_id !== undefined ? Number(row.class_id) : null,
  period_id: row.period_id !== null && row.period_id !== undefined ? Number(row.period_id) : null,
  room_id: row.room_id !== null && row.room_id !== undefined ? Number(row.room_id) : null,
  ...(fixedSchoolId.value !== null && fixedSchoolId.value !== undefined
    ? { school_id: Number(fixedSchoolId.value) }
    : {}),
})

const normalizeBackendFieldErrors = (rawErrors: Record<string, any>): Record<string, string[]> => {
  const normalized: Record<string, string[]> = {}
  if (!rawErrors || typeof rawErrors !== 'object') return normalized

  for (const [key, value] of Object.entries(rawErrors)) {
    const messages = Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string'
        ? [value]
        : []

    if (messages.length === 0) continue

    const batchMatch = key.match(/^(?:rows)?[.\[]?(\d+)\]?\.(.+)$/)

    if (batchMatch) {
      normalized[`rows.${batchMatch[1]}.${batchMatch[2]}`] = messages
    } else if (SHARED_FIELDS.includes(key)) {
      normalized[key] = messages
    } else if (rows.value.length === 1) {
      normalized[`rows.0.${key}`] = messages
    } else {
      normalized[key] = messages
    }
  }

  return normalized
}

const validateRows = (): boolean => {
  const errors: Record<string, string[]> = {}

  if (!fixedYearId.value) {
    errors['year_id'] = ['O ano letivo é obrigatório.']
  }

  if (!fixedCourseId.value) {
    errors['course_id'] = ['O curso é obrigatório.']
  }

  rows.value.forEach((row, i) => {
    const add = (field: string, message: string) => {
      errors[`rows.${i}.${field}`] = [message]
    }

    if (!row.class_id) add('class_id', 'A classe é obrigatória.')
    if (!row.period_id) add('period_id', 'O turno é obrigatório.')
    if (!row.room_id) add('room_id', 'A sala é obrigatória.')
    if (!row.group_id) add('group_id', 'A turma é obrigatória.')

    const slots = row.total_slots
    if (slots === null || slots === undefined) {
      add('total_slots', 'O total de vagas é obrigatório.')
    } else if (!Number.isInteger(slots) || slots < 1) {
      add('total_slots', 'A turma deve ter pelo menos 1 vaga.')
    }
  })

  fieldErrors.value = errors

  if (Object.keys(errors).length > 0) {
    generalMessage.value = 'Verifique os campos do formulário.'
    showNotification(generalMessage.value, 'error')
    return false
  }

  return true
}

const handleSubmit = async () => {
  fieldErrors.value = {}
  generalMessage.value = ''

  if (!validateRows()) return

  internalLoading.value = true

  try {
    if (props.isEditing && editingId.value) {
      const payload = buildPayloadFromRow(rows.value[0])
      await groupconfigStore.update(editingId.value, payload)
    } else {
      const payloads = rows.value.map(buildPayloadFromRow)
      await groupconfigStore.create(payloads)
    }

    emit('saved')
  } catch (err: any) {
    const rawErrors =
      err?.fieldErrors ||
      err?.errors ||
      err?.response?.data?.fieldErrors ||
      err?.response?.data?.errors ||
      {}

    fieldErrors.value = normalizeBackendFieldErrors(rawErrors)
    generalMessage.value =
      err?.message ||
      err?.response?.data?.message ||
      'Ocorreu um erro ao guardar a configuração de turma.'
    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-sliders"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Configuração' : 'Nova Configuração' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Defina o curso e ano lectivo, e adicione as turmas dinamicamente.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Curso</label>
            <Select
              v-model="fixedCourseId"
              :options="courses"
              optionLabel="name"
              optionValue="id"
              filter
              placeholder="Selecione o curso..."
              @change="clearSharedError('course_id')"
              class="w-full"
              :class="{ 'p-invalid': hasError('course_id') }"
            />
            <span v-if="hasError('course_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
              {{ getFieldError('course_id') }}
            </span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ano Lectivo</label>
            <Select
              v-model="fixedYearId"
              :options="years"
              optionLabel="name"
              optionValue="id"
              filter
              placeholder="Selecione o ano..."
              @change="clearSharedError('year_id'); clearAllConflictErrors()"
              class="w-full"
              :class="{ 'p-invalid': hasError('year_id') }"
            >
              <template #option="slotProps">
                {{ slotProps.option.name }} {{ slotProps.option.isCurrent ? '(Ativo)' : '' }}
              </template>
            </Select>
            <span v-if="hasError('year_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
              {{ getFieldError('year_id') }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Parametrizações ({{ rows.length }})
            </span>
            <button
              v-if="!isEditing"
              type="button"
              @click="addRow"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 transition-colors"
            >
              <i class="fa-solid fa-plus"></i>
              <span>Adicionar Linha</span>
            </button>
          </div>

          <div
            v-for="(row, index) in rows"
            :key="index"
            class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-4 shadow-sm"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                #{{ index + 1 }}
              </span>
              <button
                v-if="!isEditing && rows.length > 1"
                type="button"
                @click="removeRow(index)"
                class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Classe</label>
                <Select
                  v-model="row.class_id"
                  :options="classes"
                  optionLabel="name"
                  optionValue="id"
                  filter
                  :disabled="!fixedCourseId"
                  :placeholder="fixedCourseId ? 'Selecione a classe...' : 'Selecione um curso primeiro'"
                  @change="clearRowFieldError(index, 'class_id'); refreshRowName(index)"
                  class="w-full"
                  :class="{ 'p-invalid': hasRowError(index, 'class_id') }"
                />
                <span v-if="hasRowError(index, 'class_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
                  {{ getRowError(index, 'class_id') }}
                </span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Turno (Período)</label>
                <Select
                  v-model="row.period_id"
                  :options="periods"
                  optionLabel="name"
                  optionValue="id"
                  filter
                  placeholder="Selecione o turno..."
                  @change="clearRowFieldError(index, 'period_id'); clearRowConflictErrors(index); refreshRowName(index)"
                  class="w-full"
                  :class="{ 'p-invalid': hasRowError(index, 'period_id') }"
                />
                <span v-if="hasRowError(index, 'period_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
                  {{ getRowError(index, 'period_id') }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sala</label>
                <Select
                  v-model="row.room_id"
                  :options="rooms"
                  optionLabel="name"
                  optionValue="id"
                  filter
                  placeholder="Selecione a sala..."
                  @change="clearRowFieldError(index, 'room_id'); refreshRowName(index)"
                  class="w-full"
                  :class="{ 'p-invalid': hasRowError(index, 'room_id') }"
                />
                <span v-if="hasRowError(index, 'room_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
                  {{ getRowError(index, 'room_id') }}
                </span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Turma</label>
                <Select
                  v-model="row.group_id"
                  :options="groups"
                  optionLabel="name"
                  optionValue="id"
                  filter
                  placeholder="Selecione a turma..."
                  @change="clearRowFieldError(index, 'group_id'); refreshRowName(index)"
                  class="w-full"
                  :class="{ 'p-invalid': hasRowError(index, 'group_id') }"
                />
                <span v-if="hasRowError(index, 'group_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
                  {{ getRowError(index, 'group_id') }}
                </span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Total de Vagas</label>
                <input
                  :value="row.total_slots ?? ''"
                  type="number"
                  min="1"
                  placeholder="Ex: 35"
                  @input="onSlotsInput(index, $event)"
                  class="w-full bg-white dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  :class="hasRowError(index, 'total_slots') ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'"
                />
                <span v-if="hasRowError(index, 'total_slots')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
                  {{ getRowError(index, 'total_slots') }}
                </span>
              </div>
            </div>

            <div v-if="isEditing" class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div class="flex flex-col">
                <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Matriculado</span>
                <span class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ row.total_enrolled ?? 0 }} alunos</span>
              </div>
              <div class="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-3">
                <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vagas Disponíveis</span>
                <span
                  class="text-sm font-bold mt-0.5"
                  :class="availableSlotsForRow(row) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ availableSlotsForRow(row) }} vagas
                </span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome da Configuração</label>
              <input
                v-model="row.name"
                disabled
                readonly
                type="text"
                placeholder="Ex: Engenharia Informática - 1º Ano - Manhã"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
              />
              <span v-if="hasRowError(index, 'name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">
                {{ getRowError(index, 'name') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="internalLoading || isLoading" class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            <i v-if="internalLoading || isLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading || isLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>