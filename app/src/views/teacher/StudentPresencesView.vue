<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Select from 'primevue/select'
import {
  useStudentPresenceStore,
  type StudentPresence,
  type StudentPresencePayload,
} from '@/stores/student-presence.store'
import { showNotification } from '@/services/general_service'
import StudentPresencesFormView from './StudentPresencesFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

const presenceStore = useStudentPresenceStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const selectedGroupconfigFilter = ref<number | null>(null)
const selectedSubjectFilter = ref<number | null>(null)
const selectedDateFilter = ref('')
const expandedCards = ref<Record<number, boolean>>({})

const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedPresence = ref<StudentPresence | null>(null)
const formData = ref<(StudentPresencePayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const presenceToDeleteId = ref<number | null>(null)
const presenceToDeleteLabel = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await presenceStore.list()
  } catch {}
})

const formatPeriodLabel = (period: any) => {
  if (!period) return ''
  const name = period.name || ''
  const start = period.starthour || ''
  const end = period.endhour || ''
  return `${name}`.trim()
}

const getGroupconfigDetails = (item: any) => {
  const gc = item?.groupconfig || {}
  const gcName = gc.name || ''
  const groupName = gc.group?.name || gc.group_name || ''
  const courseName = gc.course?.name || gc.course_name || ''
  const className = gc.class?.name || gc.class_name || ''
  const periodText = formatPeriodLabel(gc.period)
  const roomName = gc.room?.name || gc.room_name || ''
  const yearName = gc.year?.name || gc.year_name || ''

  const searchBlob = [gcName, groupName, courseName, className, periodText, roomName, yearName]
    .filter(Boolean)
    .join(' ')

  return {
    gcName,
    groupName,
    courseName,
    className,
    periodText,
    roomName,
    yearName,
    searchBlob,
  }
}

const groupconfigFilterOptions = computed(() => {
  const map = new Map<number, string>()
  for (const item of presenceStore.presences) {
    if (item?.groupconfig_id && item.groupconfig) {
      const label =
        item.groupconfig.name ||
        getGroupconfigDetails(item).groupName ||
        `#${item.groupconfig_id}`
      map.set(Number(item.groupconfig_id), label)
    }
  }
  return Array.from(map, ([value, label]) => ({ value, label }))
})

const subjectFilterOptions = computed(() => {
  const map = new Map<number, string>()
  for (const item of presenceStore.presences) {
    if (item?.subject_id && item.subject?.name) {
      map.set(Number(item.subject_id), item.subject.name)
    }
  }
  return Array.from(map, ([value, label]) => ({ value, label }))
})

const hasActiveFilters = computed(
  () =>
    !!searchQuery.value.trim() ||
    selectedGroupconfigFilter.value !== null ||
    selectedSubjectFilter.value !== null ||
    !!selectedDateFilter.value
)

const clearFilters = () => {
  searchQuery.value = ''
  selectedGroupconfigFilter.value = null
  selectedSubjectFilter.value = null
  selectedDateFilter.value = ''
}

const filteredPresences = computed(() => {
  return presenceStore.presences.filter((item: any) => {
    if (!item) return false

    if (
      selectedGroupconfigFilter.value !== null &&
      Number(item.groupconfig_id) !== Number(selectedGroupconfigFilter.value)
    ) {
      return false
    }

    if (
      selectedSubjectFilter.value !== null &&
      Number(item.subject_id) !== Number(selectedSubjectFilter.value)
    ) {
      return false
    }

    if (selectedDateFilter.value) {
      const itemDate = item.date ? new Date(item.date).toISOString().slice(0, 10) : ''
      if (itemDate !== selectedDateFilter.value) return false
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return true

    const gcInfo = getGroupconfigDetails(item)

    return (
      gcInfo.searchBlob.toLowerCase().includes(q) ||
      item.subject?.name?.toLowerCase().includes(q) ||
      item.teacher?.user?.name?.toLowerCase().includes(q) ||
      item.teacher?.name?.toLowerCase().includes(q) ||
      String(item.teacher?.codenumber || '').toLowerCase().includes(q)
    )
  })
})

const stats = computed(() => {
  let present = 0
  let absent = 0
  let justified = 0

  for (const item of filteredPresences.value) {
    const list = item.student_presence_lists || []
    for (const entry of list) {
      if (entry.status === 'PRESENT') present++
      else if (entry.status === 'ABSENT') absent++
      else if (entry.status === 'JUSTIFICATED') justified++
    }
  }

  return {
    totalCalls: filteredPresences.value.length,
    present,
    absent,
    justified,
  }
})

const toggleCardStudents = (id: number) => {
  expandedCards.value[id] = !expandedCards.value[id]
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getSummary = (item: StudentPresence) => {
  const list = item.student_presence_lists || []
  const present = list.filter((l) => l.status === 'PRESENT').length
  const absent = list.filter((l) => l.status === 'ABSENT').length
  const justified = list.filter((l) => l.status === 'JUSTIFICATED').length
  const total = list.length
  const rate = total > 0 ? Math.round((present / total) * 100) : 0
  return { present, absent, justified, total, rate }
}

const formatStudentName = (entry: any) => {
  const student = entry.student || {}
  const name = student.user?.name || student.name || ''
  const processnum = student.processnum ?? student.codenumber ?? ''
  if (name && processnum) return `${name} (${processnum})`
  if (name) return name
  if (processnum) return String(processnum)
  return `Aluno #${entry.student_id}`
}

const formatTeacherName = (item: any) => {
  const teacher = item.teacher || {}
  const name = teacher.user?.name || teacher.name || ''
  const code = teacher.codenumber ?? ''
  if (name && code) return `${name} (${code})`
  if (name) return name
  if (code) return String(code)
  return 'Sem professor'
}

const openCreateModal = () => {
  if (!p('student-presences.create')) return
  isEditing.value = false
  selectedPresence.value = null
  formData.value = {
    date: new Date().toISOString().slice(0, 10),
    groupconfig_id: null,
    teacher_id: null,
    subject_id: null,
    school_id: null,
  }
  isModalOpen.value = true
}

const openEditModal = (presence: StudentPresence) => {
  if (!p('student-presences.update')) return
  isEditing.value = true
  selectedPresence.value = presence
  formData.value = {
    id: presence.id,
    date: presence.date ? new Date(presence.date).toISOString().slice(0, 10) : '',
    groupconfig_id: presence.groupconfig_id,
    teacher_id: presence.teacher_id,
    subject_id: presence.subject_id,
    school_id: presence.school_id ?? null,
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
  showNotification('Lista de presenças guardada com sucesso.', 'success')
}

const confirmDeletePresence = (presence: StudentPresence) => {
  if (!p('student-presences.delete')) return
  const gcInfo = getGroupconfigDetails(presence)
  const turmaLabel = gcInfo.groupName || gcInfo.gcName || 'Turma'
  presenceToDeleteId.value = presence.id
  presenceToDeleteLabel.value = `${turmaLabel} - ${presence.subject?.name || 'Disciplina'} (${formatDate(presence.date)})`
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  presenceToDeleteId.value = null
  presenceToDeleteLabel.value = ''
}

const handleDelete = async () => {
  if (!presenceToDeleteId.value) return
  isDeleting.value = true

  try {
    await presenceStore.remove(presenceToDeleteId.value)
    await presenceStore.list()

    isDeleteModalOpen.value = false
    presenceToDeleteId.value = null
    presenceToDeleteLabel.value = ''

    showNotification('Registo de presença eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = presenceStore.error || err.message || 'Erro ao eliminar registo de presença.'
    showNotification(errorMsg, 'error')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1
          class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Presenças de Alunos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Registe e acompanhe a assiduidade por turma, disciplina e professor.
        </p>
      </div>
      <button
        v-if="p('student-presences.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Nova Chamada</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Chamadas</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-clipboard-user text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">
          {{ stats.totalCalls }}
        </div>
      </div>

      <div class="p-5 rounded-2xl border bg-emerald-600/10 border-emerald-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Presenças</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-user-check text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
          {{ stats.present }}
        </div>
      </div>

      <div class="p-5 rounded-2xl border bg-red-600/10 border-red-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Faltas</span
          >
          <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <i class="fa-solid fa-user-xmark text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 mt-3">
          {{ stats.absent }}
        </div>
      </div>

      <div class="p-5 rounded-2xl border bg-amber-500/10 border-amber-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Justificados</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-file-medical text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-3">
          {{ stats.justified }}
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div class="relative md:col-span-4">
          <i
            class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar turma, classe, curso, disciplina ou professor..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="md:col-span-3">
          <Select
            v-model="selectedGroupconfigFilter"
            :options="groupconfigFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas as turmas"
            filter
            showClear
            class="w-full rounded-xl text-sm"
          />
        </div>

        <div class="md:col-span-3">
          <Select
            v-model="selectedSubjectFilter"
            :options="subjectFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas as disciplinas"
            filter
            showClear
            class="w-full rounded-xl text-sm"
          />
        </div>

        <div class="md:col-span-2 flex items-center gap-2">
          <input
            v-model="selectedDateFilter"
            type="date"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            v-if="hasActiveFilters"
            type="button"
            @click="clearFilters"
            title="Limpar filtros"
            class="w-10 h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors"
          >
            <i class="fa-solid fa-filter-circle-xmark text-sm"></i>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="presenceStore.isLoading"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="h-52 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4"
      >
        <div class="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 mt-6"></div>
      </div>
    </div>

    <div
      v-else-if="!filteredPresences.length"
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl"
    >
      <i class="fa-solid fa-folder-open text-3xl mb-3 text-slate-400 opacity-50"></i>
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
        Nenhum registo de presença encontrado.
      </p>
      <p class="text-xs text-slate-400 mt-1">
        Tente ajustar os filtros ou clique em "Nova Chamada" para registar.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
      <div
        v-for="item in filteredPresences"
        :key="item.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col gap-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1.5 min-w-0">
            <div class="flex items-center flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              >
                <i class="fa-regular fa-calendar text-[10px]"></i>
                {{ formatDate(item.date) }}
              </span>
              <span
                v-if="getGroupconfigDetails(item).yearName"
                class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {{ getGroupconfigDetails(item).yearName }}
              </span>
            </div>

            <h2 class="text-base font-bold text-slate-900 dark:text-white truncate pt-0.5">
              {{ item.subject?.name || 'Sem disciplina' }}
            </h2>

            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
              <i class="fa-solid fa-chalkboard-user text-[11px] text-slate-400"></i>
              <span class="truncate">{{ formatTeacherName(item) }}</span>
            </p>
          </div>

          <div
            class="flex items-center gap-1.5 shrink-0"
            v-if="p('student-presences.update') || p('student-presences.delete')"
          >
            <button
              v-if="p('student-presences.update')"
              @click="openEditModal(item)"
              title="Gerir chamada"
              class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button
              v-if="p('student-presences.delete')"
              @click="confirmDeletePresence(item)"
              title="Eliminar chamada"
              class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
            >
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Turma:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ getGroupconfigDetails(item).groupName || getGroupconfigDetails(item).gcName || '—' }}
            </span>
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Curso:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ getGroupconfigDetails(item).courseName || '—' }}
            </span>
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Classe:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ getGroupconfigDetails(item).className || '—' }}
            </span>
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Turno:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ getGroupconfigDetails(item).periodText || '—' }}
            </span>
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-slate-500 dark:text-slate-400 shrink-0">Sala:</span>
            <span class="font-semibold text-slate-900 dark:text-white text-right truncate">
              {{ getGroupconfigDetails(item).roomName || '—' }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400 font-medium">Assiduidade</span>
            <span class="font-bold text-slate-800 dark:text-slate-200"
              >{{ getSummary(item).rate }}% ({{ getSummary(item).present }}/{{
                getSummary(item).total
              }})</span
            >
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all duration-300"
              :style="{ width: `${getSummary(item).rate}%` }"
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="py-2 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span class="block text-sm font-bold text-emerald-600 dark:text-emerald-400">{{
              getSummary(item).present
            }}</span>
            <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
              >Presentes</span
            >
          </div>
          <div class="py-2 px-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <span class="block text-sm font-bold text-red-600 dark:text-red-400">{{
              getSummary(item).absent
            }}</span>
            <span class="text-[10px] font-semibold text-red-700 dark:text-red-300">Faltas</span>
          </div>
          <div class="py-2 px-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span class="block text-sm font-bold text-amber-600 dark:text-amber-400">{{
              getSummary(item).justified
            }}</span>
            <span class="text-[10px] font-semibold text-amber-700 dark:text-amber-300"
              >Justif.</span
            >
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="toggleCardStudents(item.id)"
            class="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span>Lista de Alunos ({{ item.student_presence_lists?.length || 0 }})</span>
            <i
              :class="[
                'fa-solid text-[11px] transition-transform duration-200',
                expandedCards[item.id] ? 'fa-chevron-up' : 'fa-chevron-down',
              ]"
            ></i>
          </button>

          <div
            v-if="expandedCards[item.id]"
            class="mt-3 space-y-1.5 max-h-52 overflow-y-auto pr-1"
          >
            <div
              v-if="!item.student_presence_lists?.length"
              class="text-xs text-slate-400 py-2 text-center"
            >
              Nenhum aluno registado nesta chamada.
            </div>
            <div
              v-for="entry in item.student_presence_lists"
              :key="entry.id"
              class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            >
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {{ formatStudentName(entry) }}
              </span>
              <span
                v-if="entry.status === 'PRESENT'"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"
              >
                Presente
              </span>
              <span
                v-else-if="entry.status === 'ABSENT'"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 shrink-0"
              >
                Falta
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0"
              >
                Justificado
              </span>
            </div>
          </div>
        </div>
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

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Registo de Presença"
      :message="`Tem certeza de que deseja eliminar permanentemente a chamada <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${presenceToDeleteLabel}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
@import '../../mobile.css';
</style>