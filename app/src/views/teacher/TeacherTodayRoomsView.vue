<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Select from 'primevue/select'
import { api } from '@/services/api'
import { showNotification } from '@/services/general_service'
import {
  useStudentPresenceStore,
  type StudentPresence,
  type StudentPresencePayload,
} from '@/stores/student-presence.store'
import { useAuthStore } from '@/stores/auth.store'
import StudentPresencesFormView from './StudentPresencesFormView.vue'

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
}

const WEEK_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

const presenceStore = useStudentPresenceStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const selectedTeacherId = ref<number | null>(null)
const roomSearchQuery = ref('')

const schedules = ref<any[]>([])
const groupconfigs = ref<any[]>([])
const teachers = ref<any[]>([])
const subjects = ref<any[]>([])
const isLoadingData = ref(false)

const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedPresence = ref<StudentPresence | null>(null)
const formData = ref<(StudentPresencePayload & { id?: number }) | null>(null)

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
    MON: 'MONDAY', MONDAY: 'MONDAY',
    TUE: 'TUESDAY', TUES: 'TUESDAY', TUESDAY: 'TUESDAY',
    WED: 'WEDNESDAY', WEDNESDAY: 'WEDNESDAY',
    THU: 'THURSDAY', THUR: 'THURSDAY', THURS: 'THURSDAY', THURSDAY: 'THURSDAY',
    FRI: 'FRIDAY', FRIDAY: 'FRIDAY',
    SAT: 'SATURDAY', SATURDAY: 'SATURDAY',
    SEG: 'MONDAY', SEGUNDA: 'MONDAY',
    TER: 'TUESDAY', TERCA: 'TUESDAY',
    QUA: 'WEDNESDAY', QUARTA: 'WEDNESDAY',
    QUI: 'THURSDAY', QUINTA: 'THURSDAY',
    SEX: 'FRIDAY', SEXTA: 'FRIDAY',
    SAB: 'SATURDAY', SABADO: 'SATURDAY',
    '1': 'MONDAY', '2': 'TUESDAY', '3': 'WEDNESDAY',
    '4': 'THURSDAY', '5': 'FRIDAY', '6': 'SATURDAY',
  }

  return map[str] ?? null
}

const getDayFromDateStr = (dateStr?: string | null): DayOfWeek | null => {
  if (!dateStr) return null
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (!y || !m || !d) return null
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return utcDay === 0 ? null : WEEK_DAYS[utcDay - 1]
}

const normalizeDateKey = (raw?: string | Date | null): string => {
  if (!raw) return ''
  const str = String(raw)
  return str.length >= 10 ? str.slice(0, 10) : new Date(str).toISOString().slice(0, 10)
}

const activeDayOfWeek = computed(() => getDayFromDateStr(selectedDate.value))
const activeDayLabel = computed(() => (activeDayOfWeek.value ? DAY_LABELS[activeDayOfWeek.value] : 'Domingo'))

const currentTeacher = computed(() => {
  const user: any = authStore.user
  if (!user) return null
  return (
    teachers.value.find(
      (t: any) =>
        Number(t.user_id) === Number(user.id) ||
        Number(t.user?.id) === Number(user.id)
    ) ?? null
  )
})

const teacherOptions = computed(() =>
  teachers.value.map((t: any) => {
    const name = t.user?.name || t.name || `Professor #${t.id}`
    const code = t.codenumber != null && String(t.codenumber).trim() !== '' ? ` (${t.codenumber})` : ''
    return { label: `${name}${code}`, value: Number(t.id) }
  })
)

const effectiveTeacherId = computed<number | null>(() => {
  if (selectedTeacherId.value != null) return Number(selectedTeacherId.value)
  return currentTeacher.value ? Number(currentTeacher.value.id) : null
})

const loadAll = async () => {
  isLoadingData.value = true
  try {
    const [schRes, gcRes, tRes, subRes] = await Promise.all([
      api.get<any[]>('/schedules').catch(() => []),
      api.get<any[]>('/groupconfigs').catch(() => []),
      api.get<any[]>('/teachers').catch(() => []),
      api.get<any[]>('/subjects').catch(() => []),
      presenceStore.list().catch(() => []),
    ])
    schedules.value = schRes || []
    groupconfigs.value = gcRes || []
    teachers.value = tRes || []
    subjects.value = subRes || []

    if (selectedTeacherId.value == null && currentTeacher.value) {
      selectedTeacherId.value = Number(currentTeacher.value.id)
    }
  } finally {
    isLoadingData.value = false
  }
}

onMounted(loadAll)

const findMatchingPresence = (sch: any): StudentPresence | null => {
  const dateKey = normalizeDateKey(selectedDate.value)
  const gcId = Number(sch.groupconfig_id)
  const subjId = sch.subject_id != null ? Number(sch.subject_id) : null
  const schId = Number(sch.id)

  return (
    (presenceStore.presences || []).find((item: any) => {
      if (!item || normalizeDateKey(item.date) !== dateKey) return false
      if (Number(item.groupconfig_id) !== gcId) return false
      if (item.schedule_id != null && Number(item.schedule_id) === schId) return true
      if (subjId != null && Number(item.subject_id) === subjId) return true
      return false
    }) ?? null
  )
}

const todayRoomLessons = computed(() => {
  const day = activeDayOfWeek.value
  if (!day) return []

  const gcById = new Map<number, any>(groupconfigs.value.map((g: any) => [Number(g.id), g]))
  const subById = new Map<number, any>(subjects.value.map((s: any) => [Number(s.id), s]))
  const teacherById = new Map<number, any>(teachers.value.map((t: any) => [Number(t.id), t]))

  const list = schedules.value
    .filter((sch: any) => {
      if (!sch || normalizeDayOfWeek(sch.day_of_week) !== day) return false
      if (effectiveTeacherId.value != null && Number(sch.teacher_id) !== effectiveTeacherId.value) {
        return false
      }
      return true
    })
    .map((sch: any) => {
      const gc = sch.groupconfig || gcById.get(Number(sch.groupconfig_id)) || {}
      const room = gc.room || {}
      const subj = sch.subject || subById.get(Number(sch.subject_id)) || {}
      const teacher = sch.teacher || teacherById.get(Number(sch.teacher_id)) || {}
      const presence = findMatchingPresence(sch)

      const timeRange = [sch.start_time, sch.end_time].filter(Boolean).join(' - ')
      const roomName = room.name || gc.room_name || 'Sala não definida'
      const groupName = gc.group?.name || gc.name || `Turma #${sch.groupconfig_id}`
      const courseName = gc.course?.name || ''
      const className = gc.class?.name || ''
      const periodName = gc.period?.name || ''
      const subjectName = subj.name || 'Disciplina não definida'
      const teacherName = teacher.user?.name || teacher.name || ''

      return {
        schedule: sch,
        id: sch.id,
        roomName,
        timeRange,
        startTime: sch.start_time || '',
        groupName,
        courseName,
        className,
        periodName,
        subjectName,
        teacherName,
        presence,
      }
    })
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))

  const q = roomSearchQuery.value.trim().toLowerCase()
  if (!q) return list

  return list.filter((row) =>
    [
      row.roomName,
      row.groupName,
      row.courseName,
      row.className,
      row.subjectName,
      row.teacherName,
      row.timeRange,
    ]
      .filter(Boolean)
      .some((val) => String(val).toLowerCase().includes(q))
  )
})

const summaryStats = computed(() => {
  const total = todayRoomLessons.value.length
  const completed = todayRoomLessons.value.filter((r) => !!r.presence).length
  const pending = total - completed
  const uniqueRooms = new Set(
    todayRoomLessons.value.map((r) => r.roomName).filter((name) => name !== 'Sala não definida')
  ).size
  return { total, completed, pending, uniqueRooms }
})

const openAttendanceForLesson = (row: any) => {
  const sch = row.schedule
  if (row.presence) {
    if (!p('student-presences.update')) return
    isEditing.value = true
    selectedPresence.value = row.presence
    formData.value = {
      id: row.presence.id,
      date: selectedDate.value,
      groupconfig_id: Number(sch.groupconfig_id),
      teacher_id: Number(sch.teacher_id),
      subject_id: row.presence.subject_id ?? (sch.subject_id != null ? Number(sch.subject_id) : null),
      schedule_id: Number(sch.id),
      school_id: row.presence.school_id ?? sch.school_id ?? null,
    }
  } else {
    if (!p('student-presences.create')) return
    isEditing.value = false
    selectedPresence.value = null
    formData.value = {
      date: selectedDate.value,
      groupconfig_id: Number(sch.groupconfig_id),
      teacher_id: Number(sch.teacher_id),
      subject_id: sch.subject_id != null ? Number(sch.subject_id) : null,
      schedule_id: Number(sch.id),
      school_id: sch.school_id ?? null,
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPresence.value = null
  formData.value = null
  presenceStore.clearError()
}

const handleSaved = async () => {
  await presenceStore.list()
  closeModal()
  showNotification('Chamada de presença guardada com sucesso.', 'success')
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Salas de Aula do Dia
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Consulte as salas, horários e o estado das chamadas para <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ activeDayLabel }}</span>.
        </p>
      </div>

      <button
        type="button"
        @click="loadAll"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-rotate-right text-xs"></i>
        <span>Actualizar</span>
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/40 shadow-lg">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Aulas no Dia
        </span>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {{ summaryStats.total }}
        </div>
      </div>

      <div class="p-5 rounded-2xl border bg-sky-500/10 border-sky-500/40 shadow-lg">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Salas Atribuídas
        </span>
        <div class="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
          {{ summaryStats.uniqueRooms }}
        </div>
      </div>

      <div class="p-5 rounded-2xl border bg-emerald-600/10 border-emerald-500/40 shadow-lg">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Chamadas Feitas
        </span>
        <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
          {{ summaryStats.completed }}
        </div>
      </div>

      <div class="p-5 rounded-2xl border bg-amber-500/10 border-amber-500/40 shadow-lg">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Chamadas Pendentes
        </span>
        <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
          {{ summaryStats.pending }}
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div class="relative md:col-span-4">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            v-model="roomSearchQuery"
            type="text"
            placeholder="Filtrar por sala, turma, disciplina ou curso..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="md:col-span-5">
          <Select
            v-model="selectedTeacherId"
            :options="teacherOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos os professores"
            filter
            showClear
            class="w-full rounded-xl text-sm"
          />
        </div>

        <div class="md:col-span-3">
          <input
            v-model="selectedDate"
            type="date"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>

    <div v-if="isLoadingData" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="n in 3"
        :key="n"
        class="h-48 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4"
      >
        <div class="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </div>

    <div
      v-else-if="!todayRoomLessons.length"
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl"
    >
      <i class="fa-solid fa-door-open text-3xl mb-3 text-slate-400 opacity-50"></i>
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
        Nenhuma sala ou aula agendada para {{ activeDayLabel }}.
      </p>
      <p class="text-xs text-slate-400 mt-1">
        Altere a data, o filtro de professor ou a pesquisa para verificar outras aulas.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
      <div
        v-for="row in todayRoomLessons"
        :key="row.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col gap-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center flex-wrap gap-2">
              <span
                v-if="row.timeRange"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              >
                <i class="fa-regular fa-clock text-[10px]"></i>
                {{ row.timeRange }}
              </span>

              <span
                v-if="row.presence"
                class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                Chamada feita
              </span>
              <span
                v-else
                class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                Pendente
              </span>
            </div>

            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white truncate pt-1 flex items-center gap-2">
              <i class="fa-solid fa-location-dot text-indigo-500 text-sm shrink-0"></i>
              <span class="truncate">{{ row.roomName }}</span>
            </h2>

            <p class="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
              {{ row.subjectName }}
            </p>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Turma:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ row.groupName }}
            </span>
          </div>
          <div v-if="row.courseName" class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Curso:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ row.courseName }}
            </span>
          </div>
          <div v-if="row.className" class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Classe:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ row.className }}
            </span>
          </div>
          <div v-if="row.periodName" class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Turno:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ row.periodName }}
            </span>
          </div>
          <div v-if="row.teacherName" class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Professor:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ row.teacherName }}
            </span>
          </div>
        </div>

        <button
          v-if="(row.presence && p('student-presences.update')) || (!row.presence && p('student-presences.create'))"
          type="button"
          @click="openAttendanceForLesson(row)"
          :class="[
            'w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
            row.presence
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20',
          ]"
        >
          <i :class="['fa-solid', row.presence ? 'fa-pen-to-square' : 'fa-clipboard-user']"></i>
          <span>{{ row.presence ? 'Editar Chamada' : 'Fazer Chamada' }}</span>
        </button>
      </div>
    </div>

    <StudentPresencesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="presenceStore.isLoading"
      :initial-data="formData"
      :existing-presence="selectedPresence"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>