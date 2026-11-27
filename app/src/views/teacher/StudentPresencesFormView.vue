<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Select from 'primevue/select'
import {
  useStudentPresenceStore,
  type StudentPresence,
  type StudentPresencePayload,
} from '@/stores/student-presence.store'
import {
  useStudentPresenceListStore,
  type PresenceStatus,
} from '@/stores/student-presence-list.store'
import { useClassSubjectStore } from '@/stores/class-subject.store'
import { useTeacherocupationStore } from '@/stores/teacherocupation.store'
import { api } from '@/services/api'
import { showNotification } from '@/services/general_service'

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
interface StudentRow { list_id?: number; student_id: number; name: string; processnum?: string; status: PresenceStatus }
interface SelectOption { label: string; value: number }

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Segunda', TUESDAY: 'Terça', WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta', FRIDAY: 'Sexta', SATURDAY: 'Sábado',
}
const WEEK_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (StudentPresencePayload & { id?: number }) | null
  existingPresence?: StudentPresence | null
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const presenceStore = useStudentPresenceStore()
const presenceListStore = useStudentPresenceListStore()
const classSubjectStore = useClassSubjectStore()
const teacherocupationStore = useTeacherocupationStore()

const emptyForm = (): StudentPresencePayload & { id?: number } => ({
  date: new Date().toISOString().slice(0, 10),
  groupconfig_id: null,
  teacher_id: null,
  subject_id: null,
  schedule_id: null,
  school_id: null,
})

const form = ref(emptyForm())
const groupconfigs = ref<any[]>([])
const teachers = ref<any[]>([])
const subjects = ref<any[]>([])
const schedules = ref<any[]>([])
const studentRows = ref<StudentRow[]>([])
const studentSearchQuery = ref('')
const loadingStudents = ref(false)
const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

const normalizeDayOfWeek = (raw: unknown): DayOfWeek | null => {
  if (raw == null || raw === '') return null

  const str = String(raw)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-FEIRA$/, '')

  if (WEEK_DAYS.includes(str as DayOfWeek)) return str as DayOfWeek

  const map: Record<string, DayOfWeek> = {
    // Inglês / abreviações
    MON: 'MONDAY',
    MONDAY: 'MONDAY',
    TUE: 'TUESDAY',
    TUES: 'TUESDAY',
    TUESDAY: 'TUESDAY',
    WED: 'WEDNESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THU: 'THURSDAY',
    THUR: 'THURSDAY',
    THURS: 'THURSDAY',
    THURSDAY: 'THURSDAY',
    FRI: 'FRIDAY',
    FRIDAY: 'FRIDAY',
    SAT: 'SATURDAY',
    SATURDAY: 'SATURDAY',
    // Português / abreviações
    SEG: 'MONDAY',
    SEGUNDA: 'MONDAY',
    TER: 'TUESDAY',
    TERCA: 'TUESDAY',
    QUA: 'WEDNESDAY',
    QUARTA: 'WEDNESDAY',
    QUI: 'THURSDAY',
    QUINTA: 'THURSDAY',
    SEX: 'FRIDAY',
    SEXTA: 'FRIDAY',
    SAB: 'SATURDAY',
    SABADO: 'SATURDAY',
    // Numéricos comuns (1 = Segunda .. 6 = Sábado)
    '1': 'MONDAY',
    '2': 'TUESDAY',
    '3': 'WEDNESDAY',
    '4': 'THURSDAY',
    '5': 'FRIDAY',
    '6': 'SATURDAY',
  }

  return map[str] ?? null
}

const getDayFromDate = (dateStr?: string | null): DayOfWeek | null => {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return utcDay === 0 ? null : WEEK_DAYS[utcDay - 1]
}

const activeDayOfWeek = computed(() => getDayFromDate(form.value.date))
const activeDayLabel = computed(() => (activeDayOfWeek.value ? DAY_LABELS[activeDayOfWeek.value] : ''))

const selectedGroupconfig = computed(
  () => groupconfigs.value.find((gc) => Number(gc.id) === Number(form.value.groupconfig_id)) ?? null
)

const selectedClassId = computed<number | null>(() => {
  const id = selectedGroupconfig.value?.class_id ?? selectedGroupconfig.value?.class?.id
  return id != null ? Number(id) : null
})

const selectedYearId = computed<number | null>(() => {
  const id = selectedGroupconfig.value?.year_id ?? selectedGroupconfig.value?.year?.id
  return id != null ? Number(id) : null
})

const teacherOccupations = computed(() =>
  (teacherocupationStore.teacherocupations || []).filter(
    (to: any) =>
      to &&
      Number(to.teacher_id) === Number(form.value.teacher_id) &&
      (selectedYearId.value == null || to.year_id == null || Number(to.year_id) === selectedYearId.value)
  )
)

const teacherOptions = computed<SelectOption[]>(() =>
  teachers.value.map((t) => {
    const name = t.user?.name || `Professor #${t.id}`
    const code = t.codenumber != null && String(t.codenumber).trim() !== '' ? ` (${t.codenumber})` : ''
    return { label: `${name}${code}`, value: Number(t.id) }
  })
)

const groupconfigOptions = computed<SelectOption[]>(() => {
  if (!form.value.teacher_id) return []
  const ids = new Set(
    (teacherocupationStore.teacherocupations || [])
      .filter((to: any) => to && Number(to.teacher_id) === Number(form.value.teacher_id) && to.groupconfig_id != null)
      .map((to: any) => Number(to.groupconfig_id))
  )
  return groupconfigs.value.filter((gc) => ids.has(Number(gc.id))).map((gc) => ({ label: gc.name, value: Number(gc.id) }))
})

const formatScheduleOption = (sch: any): SelectOption => {
  const normalizedDay = normalizeDayOfWeek(sch.day_of_week)
  const dayLabel = normalizedDay ? DAY_LABELS[normalizedDay] : String(sch.day_of_week || '')
  const time = [sch.start_time, sch.end_time].filter(Boolean).join(' - ')
  const subj = sch.subject?.name || subjects.value.find((s) => Number(s.id) === Number(sch.subject_id))?.name || ''
  return {
    label: [dayLabel, time, subj].filter(Boolean).join(' · '),
    value: Number(sch.id),
  }
}

const scheduleOptions = computed<SelectOption[]>(() => {
  if (!form.value.teacher_id || !form.value.groupconfig_id || !activeDayOfWeek.value) return []

  const list = schedules.value.filter(
    (sch: any) =>
      sch &&
      Number(sch.teacher_id) === Number(form.value.teacher_id) &&
      Number(sch.groupconfig_id) === Number(form.value.groupconfig_id) &&
      normalizeDayOfWeek(sch.day_of_week) === activeDayOfWeek.value &&
      (selectedYearId.value == null || sch.year_id == null || Number(sch.year_id) === selectedYearId.value)
  )

  const options = list.map(formatScheduleOption)

  if (props.isEditing && form.value.schedule_id != null) {
    const currentId = Number(form.value.schedule_id)
    if (!options.some((o) => Number(o.value) === currentId)) {
      const currentSch = schedules.value.find((s: any) => Number(s.id) === currentId)
      if (currentSch) options.unshift(formatScheduleOption(currentSch))
    }
  }

  return options
})

const subjectOptions = computed<SelectOption[]>(() => {
  if (!form.value.teacher_id || !form.value.groupconfig_id || !selectedClassId.value) return []
  const classSubIds = new Set(
    classSubjectStore.classSubjects
      .filter((cs) => Number(cs.class_id) === selectedClassId.value)
      .map((cs) => Number(cs.subject_id))
  )
  const groupMatches = teacherOccupations.value.filter(
    (to: any) => to.subject_id != null && Number(to.groupconfig_id) === Number(form.value.groupconfig_id)
  )
  const source = groupMatches.length
    ? groupMatches
    : teacherOccupations.value.filter((to: any) => to.subject_id != null && to.groupconfig_id == null)

  const allowedIds = new Set(
    source.map((to: any) => Number(to.subject_id)).filter((id: number) => classSubIds.has(id))
  )
  return subjects.value.filter((sub) => allowedIds.has(Number(sub.id))).map((sub) => ({ label: sub.name, value: Number(sub.id) }))
})

const filteredStudentRows = computed(() => {
  const q = studentSearchQuery.value.trim().toLowerCase()
  if (!q) return studentRows.value
  return studentRows.value.filter(
    (r) => r.name.toLowerCase().includes(q) || r.processnum?.toLowerCase().includes(q)
  )
})

const liveCounts = computed(() => ({
  present: studentRows.value.filter((r) => r.status === 'PRESENT').length,
  absent: studentRows.value.filter((r) => r.status === 'ABSENT').length,
  justified: studentRows.value.filter((r) => r.status === 'JUSTIFICATED').length,
}))

const getFieldError = (field: string) => fieldErrors.value[field]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)
const clearFieldError = (...fields: string[]) => {
  const next = { ...fieldErrors.value }
  fields.forEach((f) => delete next[f])
  fieldErrors.value = next
}

const ensureStoresLoaded = async () => {
  const tasks: Promise<any>[] = []
  if (!classSubjectStore.classSubjects.length) tasks.push(classSubjectStore.list().catch(() => []))
  if (!teacherocupationStore.teacherocupations.length) tasks.push(teacherocupationStore.list().catch(() => []))
  if (!schedules.value.length) tasks.push(api.get<any[]>('/schedules').then((r) => (schedules.value = r || [])).catch(() => []))
  if (tasks.length) await Promise.all(tasks)
}

const loadInitialData = async () => {
  const [gcRes, tRes, sRes, schRes] = await Promise.all([
    api.get<any[]>('/groupconfigs').catch(() => []),
    api.get<any[]>('/teachers').catch(() => []),
    api.get<any[]>('/subjects').catch(() => []),
    api.get<any[]>('/schedules').catch(() => []),
    classSubjectStore.list().catch(() => []),
    teacherocupationStore.list().catch(() => []),
  ])
  groupconfigs.value = gcRes || []
  teachers.value = tRes || []
  subjects.value = sRes || []
  schedules.value = schRes || []
}

onMounted(loadInitialData)

const buildStudentRows = async (groupconfigId: number | null) => {
  if (!groupconfigId) {
    studentRows.value = []
    return
  }
  loadingStudents.value = true
  try {
    const existingList = props.existingPresence?.student_presence_lists || []
    let registers = groupconfigs.value.find((g) => Number(g.id) === Number(groupconfigId))?.registers || []
    if (!registers.length) {
      const allRegs = await api.get<any[]>('/registers').catch(() => [])
      registers = (allRegs || []).filter((r: any) => Number(r.groupconfig_id) === Number(groupconfigId))
    }

    const source = registers.length
      ? registers.map((r: any) => ({ student_id: r.student_id, student: r.student, status: undefined }))
      : existingList.map((i: any) => ({ student_id: i.student_id, student: i.student, status: i.status }))

    studentRows.value = source.map((entry: any) => {
      const saved = existingList.find((item) => item.student_id === entry.student_id)
      const st = entry.student || {}
      return {
        list_id: saved?.id,
        student_id: entry.student_id,
        name: st.user?.name || st.name || `Aluno #${entry.student_id}`,
        processnum: String(st.processnum ?? st.codenumber ?? ''),
        status: saved?.status || entry.status || 'PRESENT',
      }
    })
  } finally {
    loadingStudents.value = false
  }
}

const applyScheduleSubject = (scheduleId: number | null) => {
  if (!scheduleId) return
  const sch = schedules.value.find((s: any) => Number(s.id) === Number(scheduleId))
  if (sch?.subject_id != null) {
    clearFieldError('subject_id')
    form.value.subject_id = Number(sch.subject_id)
  }
}

const syncSelections = (autoPickSingleSchedule = false) => {
  const opts = scheduleOptions.value
  const validSchedules = new Set(opts.map((o) => Number(o.value)))

  if (form.value.schedule_id && !validSchedules.has(Number(form.value.schedule_id))) {
    form.value.schedule_id = null
  }

  if (autoPickSingleSchedule && !form.value.schedule_id && opts.length === 1) {
    form.value.schedule_id = opts[0].value
    applyScheduleSubject(opts[0].value)
  }

  const validSubjects = new Set(subjectOptions.value.map((o) => Number(o.value)))
  if (form.value.subject_id && !validSubjects.has(Number(form.value.subject_id))) {
    form.value.subject_id = null
  }
}

watch(
  () => props.initialData,
  async (newData) => {
    form.value = newData ? { ...emptyForm(), ...newData } : emptyForm()
    studentSearchQuery.value = ''
    fieldErrors.value = {}
    generalMessage.value = ''
    await ensureStoresLoaded()
    syncSelections(!props.isEditing)
    await buildStudentRows(form.value.groupconfig_id)
  },
  { immediate: true, deep: true }
)

const onTeacherChange = async () => {
  clearFieldError('teacher_id', 'groupconfig_id', 'schedule_id', 'subject_id')
  await ensureStoresLoaded()
  const validGroups = new Set(groupconfigOptions.value.map((o) => Number(o.value)))
  if (form.value.groupconfig_id && !validGroups.has(Number(form.value.groupconfig_id))) {
    form.value.groupconfig_id = null
    studentSearchQuery.value = ''
    await buildStudentRows(null)
  }
  syncSelections(true)
}

const onGroupconfigChange = async () => {
  clearFieldError('groupconfig_id', 'schedule_id', 'subject_id')
  studentSearchQuery.value = ''
  await ensureStoresLoaded()
  syncSelections(true)
  await buildStudentRows(form.value.groupconfig_id)
}

const onScheduleChange = () => {
  clearFieldError('schedule_id')
  applyScheduleSubject(form.value.schedule_id ?? null)
}

const onDateChange = () => {
  clearFieldError('date', 'schedule_id')
  syncSelections(true)
}

const markAllAs = (status: PresenceStatus) => {
  const ids = new Set(filteredStudentRows.value.map((r) => r.student_id))
  studentRows.value = studentRows.value.map((row) => (ids.has(row.student_id) ? { ...row, status } : row))
}

const handleSubmit = async () => {
  fieldErrors.value = {}
  generalMessage.value = ''
  internalLoading.value = true
  try {
    const payload: StudentPresencePayload = {
      date: form.value.date || null,
      groupconfig_id: form.value.groupconfig_id,
      teacher_id: form.value.teacher_id,
      subject_id: form.value.subject_id,
      schedule_id: form.value.schedule_id ?? null,
      school_id: form.value.school_id,
    }
    const record =
      props.isEditing && form.value.id
        ? await presenceStore.update(form.value.id, payload)
        : await presenceStore.create(payload)

    for (const row of studentRows.value) {
      if (row.list_id) {
        await presenceListStore.update(row.list_id, { status: row.status })
      } else {
        await presenceListStore.create({
          student_presence_id: record.id,
          student_id: row.student_id,
          status: row.status,
          school_id: form.value.school_id ?? null,
        })
      }
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar a chamada.'
    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-clipboard-user"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">
              {{ isEditing ? 'Editar Chamada' : 'Nova Chamada de Presença' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Configure a aula à esquerda e marque a presença dos alunos à direita.
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col overflow-hidden">
        <div
          v-if="generalMessage && !Object.keys(fieldErrors).length"
          class="mx-6 mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3"
        >
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto lg:overflow-hidden">
          <div class="lg:col-span-4 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 lg:overflow-y-auto">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dados da Aula
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professor</label>
              <Select
                v-model="form.teacher_id"
                :options="teacherOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione o professor"
                filter
                :filterFields="['label']"
                showClear
                @change="onTeacherChange"
                :class="['w-full rounded-xl text-sm', hasError('teacher_id') ? 'border-red-500' : '']"
              />
              <span v-if="hasError('teacher_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">
                {{ getFieldError('teacher_id') }}
              </span>
            </div>

            <div>
              <label :class="['block text-xs font-semibold mb-1.5', !form.teacher_id ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300']">
                Turma
              </label>
              <Select
                v-model="form.groupconfig_id"
                :options="groupconfigOptions"
                optionLabel="label"
                optionValue="value"
                :disabled="!form.teacher_id"
                :placeholder="form.teacher_id ? 'Seleccione a turma' : 'Bloqueado · Seleccione primeiro o professor'"
                filter
                showClear
                @change="onGroupconfigChange"
                :class="[
                  'w-full rounded-xl text-sm transition-opacity',
                  !form.teacher_id ? 'opacity-50 bg-slate-200/70 dark:bg-slate-900/80' : '',
                  hasError('groupconfig_id') ? 'border-red-500' : '',
                ]"
              />
              <span v-if="hasError('groupconfig_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">
                {{ getFieldError('groupconfig_id') }}
              </span>
            </div>

            <div>
              <label :class="['flex items-center justify-between text-xs font-semibold mb-1.5', (!form.teacher_id || !form.groupconfig_id) ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300']">
                <span>Horário</span>
                <span v-if="activeDayLabel" class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {{ activeDayLabel }}
                </span>
              </label>
              <Select
                v-model="form.schedule_id"
                :options="scheduleOptions"
                optionLabel="label"
                optionValue="value"
                :disabled="!form.teacher_id || !form.groupconfig_id"
                :placeholder="(!form.teacher_id || !form.groupconfig_id) ? 'Bloqueado · Seleccione professor e turma' : `Opcional · Horários de ${activeDayLabel || 'hoje'}`"
                filter
                showClear
                @change="onScheduleChange"
                :class="[
                  'w-full rounded-xl text-sm transition-opacity',
                  (!form.teacher_id || !form.groupconfig_id) ? 'opacity-50 bg-slate-200/70 dark:bg-slate-900/80' : '',
                  hasError('schedule_id') ? 'border-red-500' : '',
                ]"
              />
              <span v-if="hasError('schedule_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">
                {{ getFieldError('schedule_id') }}
              </span>
            </div>

            <div>
              <label :class="['block text-xs font-semibold mb-1.5', (!form.teacher_id || !selectedClassId) ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300']">
                Disciplina
              </label>
              <Select
                v-model="form.subject_id"
                :options="subjectOptions"
                optionLabel="label"
                optionValue="value"
                :disabled="!form.teacher_id || !selectedClassId"
                :placeholder="!form.teacher_id ? 'Bloqueado · Seleccione primeiro o professor' : selectedClassId ? 'Seleccione a disciplina' : 'Bloqueado · Seleccione primeiro a turma'"
                filter
                showClear
                @change="clearFieldError('subject_id')"
                :class="[
                  'w-full rounded-xl text-sm transition-opacity',
                  (!form.teacher_id || !selectedClassId) ? 'opacity-50 bg-slate-200/70 dark:bg-slate-900/80' : '',
                  hasError('subject_id') ? 'border-red-500' : '',
                ]"
              />
              <span v-if="hasError('subject_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">
                {{ getFieldError('subject_id') }}
              </span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data</label>
              <input
                v-model="form.date"
                @input="onDateChange"
                type="date"
                :class="[
                  'w-full bg-white dark:bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all',
                  hasError('date') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500',
                ]"
              />
              <span v-if="hasError('date')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">
                {{ getFieldError('date') }}
              </span>
            </div>

            <div v-if="studentRows.length" class="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span class="block text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ liveCounts.present }}</span>
                <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Presentes</span>
              </div>
              <div class="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <span class="block text-sm font-bold text-red-600 dark:text-red-400">{{ liveCounts.absent }}</span>
                <span class="text-[10px] font-semibold text-red-700 dark:text-red-300">Faltas</span>
              </div>
              <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span class="block text-sm font-bold text-amber-600 dark:text-amber-400">{{ liveCounts.justified }}</span>
                <span class="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Justif.</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-8 p-6 flex flex-col space-y-3 lg:overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Alunos da Turma ({{ filteredStudentRows.length }} / {{ studentRows.length }})
              </span>
              <div v-if="studentRows.length" class="flex flex-wrap items-center gap-1.5">
                <button type="button" @click="markAllAs('PRESENT')" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer">
                  Todos Presentes
                </button>
                <button type="button" @click="markAllAs('ABSENT')" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 cursor-pointer">
                  Todos Faltas
                </button>
                <button type="button" @click="markAllAs('JUSTIFICATED')" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer">
                  Todos Justificados
                </button>
              </div>
            </div>

            <div v-if="studentRows.length" class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                v-model="studentSearchQuery"
                type="text"
                placeholder="Pesquisar aluno por nome ou Nº de processo..."
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                v-if="studentSearchQuery"
                type="button"
                @click="studentSearchQuery = ''"
                title="Limpar pesquisa"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <div v-if="loadingStudents" class="flex-1 flex items-center justify-center py-10 text-xs text-slate-500 dark:text-slate-400">
              <i class="fa-solid fa-spinner animate-spin mr-1.5"></i> A carregar alunos da turma...
            </div>
            <div v-else-if="!studentRows.length" class="flex-1 flex items-center justify-center py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 px-4">
              Seleccione uma turma com alunos matriculados para marcar presenças.
            </div>
            <div v-else-if="!filteredStudentRows.length" class="flex-1 flex items-center justify-center py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 px-4">
              Nenhum aluno encontrado para "{{ studentSearchQuery }}".
            </div>

            <div v-else class="space-y-2 overflow-y-auto pr-1 flex-1">
              <div
                v-for="row in filteredStudentRows"
                :key="row.student_id"
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ row.processnum ? `${row.name} (${row.processnum})` : row.name }}
                </p>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="row.status = 'PRESENT'"
                    :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer', row.status === 'PRESENT' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400']"
                  >
                    Presente
                  </button>
                  <button
                    type="button"
                    @click="row.status = 'ABSENT'"
                    :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer', row.status === 'ABSENT' ? 'bg-red-600 text-white shadow' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400']"
                  >
                    Falta
                  </button>
                  <button
                    type="button"
                    @click="row.status = 'JUSTIFICATED'"
                    :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer', row.status === 'JUSTIFICATED' ? 'bg-amber-500 text-white shadow' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400']"
                  >
                    Justificado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar Chamada' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>