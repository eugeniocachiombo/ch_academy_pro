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
import { api } from '@/services/api'
import { showNotification } from '@/services/general_service'

interface StudentRow {
  list_id?: number
  student_id: number
  name: string
  processnum?: string
  status: PresenceStatus
}

interface SelectOption {
  label: string
  value: number
}

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (StudentPresencePayload & { id?: number }) | null
  existingPresence?: StudentPresence | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const presenceStore = useStudentPresenceStore()
const presenceListStore = useStudentPresenceListStore()
const classSubjectStore = useClassSubjectStore()

const form = ref<StudentPresencePayload & { id?: number }>({
  date: new Date().toISOString().slice(0, 10),
  groupconfig_id: null,
  teacher_id: null,
  subject_id: null,
  school_id: null,
})

const groupconfigs = ref<any[]>([])
const teachers = ref<any[]>([])
const subjects = ref<any[]>([])
const studentRows = ref<StudentRow[]>([])
const studentSearchQuery = ref('')
const loadingStudents = ref(false)

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

const selectedGroupconfig = computed(() => {
  if (!form.value.groupconfig_id) return null
  return groupconfigs.value.find((gc) => Number(gc.id) === Number(form.value.groupconfig_id)) ?? null
})

const selectedClassId = computed<number | null>(() => {
  const gc = selectedGroupconfig.value
  if (!gc) return null
  const rawClassId = gc.class_id ?? gc.class?.id ?? null
  return rawClassId !== null && rawClassId !== undefined ? Number(rawClassId) : null
})

const groupconfigOptions = computed<SelectOption[]>(() =>
  groupconfigs.value.map((gc) => ({
    label: gc.name,
    value: gc.id,
  }))
)

const subjectOptions = computed<SelectOption[]>(() => {
  const classId = selectedClassId.value
  if (!classId) return []

  const allowedSubjectIds = new Set(
    classSubjectStore.classSubjects
      .filter((cs) => Number(cs.class_id) === classId)
      .map((cs) => Number(cs.subject_id))
  )

  return subjects.value
    .filter((sub) => allowedSubjectIds.has(Number(sub.id)))
    .map((sub) => ({
      label: sub.name,
      value: sub.id,
    }))
})

const teacherOptions = computed<SelectOption[]>(() =>
  teachers.value.map((t) => ({
    label: t.user?.name || t.codenumber || `Professor #${t.id}`,
    value: t.id,
  }))
)

const filteredStudentRows = computed(() => {
  const q = studentSearchQuery.value.trim().toLowerCase()
  if (!q) return studentRows.value
  return studentRows.value.filter(
    (row) =>
      row.name.toLowerCase().includes(q) ||
      (row.processnum && row.processnum.toLowerCase().includes(q))
  )
})

const liveCounts = computed(() => {
  const present = studentRows.value.filter((r) => r.status === 'PRESENT').length
  const absent = studentRows.value.filter((r) => r.status === 'ABSENT').length
  const justified = studentRows.value.filter((r) => r.status === 'JUSTIFICATED').length
  return { present, absent, justified }
})

const formatStudentLabel = (row: StudentRow) =>
  row.processnum ? `${row.name} (${row.processnum})` : row.name

const getFieldError = (field: string) => fieldErrors.value[field]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)

const clearFieldError = (field: string) => {
  if (fieldErrors.value[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

const loadOptions = async () => {
  try {
    const [gcRes, tRes, sRes] = await Promise.all([
      api.get<any[]>('/groupconfigs').catch(() => []),
      api.get<any[]>('/teachers').catch(() => []),
      api.get<any[]>('/subjects').catch(() => []),
      classSubjectStore.list().catch(() => []),
    ])
    groupconfigs.value = gcRes || []
    teachers.value = tRes || []
    subjects.value = sRes || []
  } catch {}
}

onMounted(loadOptions)

const buildStudentRows = async (groupconfigId: number | null) => {
  if (!groupconfigId) {
    studentRows.value = []
    return
  }

  loadingStudents.value = true
  try {
    const existingList = props.existingPresence?.student_presence_lists || []

    const gc = groupconfigs.value.find((g) => Number(g.id) === Number(groupconfigId))
    let registers = gc?.registers || []

    if (!registers.length) {
      const registersRes = await api.get<any[]>('/registers').catch(() => [])
      registers = (registersRes || []).filter(
        (r: any) => Number(r.groupconfig_id) === Number(groupconfigId)
      )
    }

    if (registers.length) {
      studentRows.value = registers.map((reg: any) => {
        const student = reg.student || {}
        const savedItem = existingList.find((item) => item.student_id === reg.student_id)
        return {
          list_id: savedItem?.id,
          student_id: reg.student_id,
          name: student.user?.name || student.name || `Aluno #${reg.student_id}`,
          processnum: String(student.processnum ?? student.codenumber ?? ''),
          status: savedItem?.status || 'PRESENT',
        }
      })
    } else if (existingList.length) {
      studentRows.value = existingList.map((item: any) => ({
        list_id: item.id,
        student_id: item.student_id,
        name: item.student?.user?.name || item.student?.name || `Aluno #${item.student_id}`,
        processnum: String(item.student?.processnum ?? item.student?.codenumber ?? ''),
        status: item.status,
      }))
    } else {
      studentRows.value = []
    }
  } finally {
    loadingStudents.value = false
  }
}

watch(
  () => props.initialData,
  async (newData) => {
    form.value = newData
      ? { ...newData }
      : {
          date: new Date().toISOString().slice(0, 10),
          groupconfig_id: null,
          teacher_id: null,
          subject_id: null,
          school_id: null,
        }
    studentSearchQuery.value = ''
    fieldErrors.value = {}
    generalMessage.value = ''
    if (!classSubjectStore.classSubjects.length) {
      await classSubjectStore.list().catch(() => [])
    }
    await buildStudentRows(form.value.groupconfig_id)
  },
  { immediate: true, deep: true }
)

const onGroupconfigChange = async () => {
  clearFieldError('groupconfig_id')
  studentSearchQuery.value = ''

  if (!classSubjectStore.classSubjects.length) {
    await classSubjectStore.list().catch(() => [])
  }

  const validSubjectIds = new Set(subjectOptions.value.map((opt) => Number(opt.value)))
  if (form.value.subject_id && !validSubjectIds.has(Number(form.value.subject_id))) {
    form.value.subject_id = null
  }

  await buildStudentRows(form.value.groupconfig_id)
}

const markAllAs = (status: PresenceStatus) => {
  const targetIds = new Set(filteredStudentRows.value.map((r) => r.student_id))
  studentRows.value = studentRows.value.map((row) =>
    targetIds.has(row.student_id) ? { ...row, status } : row
  )
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
      school_id: form.value.school_id,
    }

    let presenceRecord: StudentPresence

    if (props.isEditing && form.value.id) {
      presenceRecord = await presenceStore.update(form.value.id, payload)
    } else {
      presenceRecord = await presenceStore.create(payload)
    }

    for (const row of studentRows.value) {
      if (row.list_id) {
        await presenceListStore.update(row.list_id, {
          status: row.status,
        })
      } else {
        await presenceListStore.create({
          student_presence_id: presenceRecord.id,
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
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
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
          @click="$emit('close')"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors"
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
          <div
            class="lg:col-span-4 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 lg:overflow-y-auto"
          >
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dados da Aula
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >Data</label
              >
              <input
                v-model="form.date"
                @input="clearFieldError('date')"
                type="date"
                :class="[
                  'w-full bg-white dark:bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all',
                  hasError('date')
                    ? 'border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500',
                ]"
              />
              <span
                v-if="hasError('date')"
                class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium"
                >{{ getFieldError('date') }}</span
              >
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >Turma</label
              >
              <Select
                v-model="form.groupconfig_id"
                :options="groupconfigOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione a turma"
                filter
                showClear
                @change="onGroupconfigChange"
                :class="[
                  'w-full rounded-xl text-sm',
                  hasError('groupconfig_id') ? 'border-red-500' : '',
                ]"
              />
              <span
                v-if="hasError('groupconfig_id')"
                class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium"
                >{{ getFieldError('groupconfig_id') }}</span
              >
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >Disciplina</label
              >
              <Select
                v-model="form.subject_id"
                :options="subjectOptions"
                optionLabel="label"
                optionValue="value"
                :disabled="!selectedClassId"
                :placeholder="
                  selectedClassId ? 'Seleccione a disciplina' : 'Seleccione primeiro a turma'
                "
                filter
                showClear
                @change="clearFieldError('subject_id')"
                :class="[
                  'w-full rounded-xl text-sm',
                  hasError('subject_id') ? 'border-red-500' : '',
                ]"
              />
              <span
                v-if="hasError('subject_id')"
                class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium"
                >{{ getFieldError('subject_id') }}</span
              >
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >Professor</label
              >
              <Select
                v-model="form.teacher_id"
                :options="teacherOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione o professor"
                filter
                showClear
                @change="clearFieldError('teacher_id')"
                :class="[
                  'w-full rounded-xl text-sm',
                  hasError('teacher_id') ? 'border-red-500' : '',
                ]"
              />
              <span
                v-if="hasError('teacher_id')"
                class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium"
                >{{ getFieldError('teacher_id') }}</span
              >
            </div>

            <div
              v-if="studentRows.length"
              class="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center"
            >
              <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span class="block text-sm font-bold text-emerald-600 dark:text-emerald-400">{{
                  liveCounts.present
                }}</span>
                <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                  >Presentes</span
                >
              </div>
              <div class="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <span class="block text-sm font-bold text-red-600 dark:text-red-400">{{
                  liveCounts.absent
                }}</span>
                <span class="text-[10px] font-semibold text-red-700 dark:text-red-300">Faltas</span>
              </div>
              <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span class="block text-sm font-bold text-amber-600 dark:text-amber-400">{{
                  liveCounts.justified
                }}</span>
                <span class="text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                  >Justif.</span
                >
              </div>
            </div>
          </div>

          <div class="lg:col-span-8 p-6 flex flex-col space-y-3 lg:overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span
                class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Alunos da Turma ({{ filteredStudentRows.length }} / {{ studentRows.length }})
              </span>
              <div v-if="studentRows.length" class="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  @click="markAllAs('PRESENT')"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                >
                  Todos Presentes
                </button>
                <button
                  type="button"
                  @click="markAllAs('ABSENT')"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                >
                  Todos Faltas
                </button>
                <button
                  type="button"
                  @click="markAllAs('JUSTIFICATED')"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                >
                  Todos Justificados
                </button>
              </div>
            </div>

            <div v-if="studentRows.length" class="relative">
              <i
                class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              ></i>
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
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <div
              v-if="loadingStudents"
              class="flex-1 flex items-center justify-center py-10 text-xs text-slate-500 dark:text-slate-400"
            >
              <i class="fa-solid fa-spinner animate-spin mr-1.5"></i> A carregar alunos da turma...
            </div>

            <div
              v-else-if="!studentRows.length"
              class="flex-1 flex items-center justify-center py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 px-4"
            >
              Seleccione uma turma com alunos matriculados para marcar presenças.
            </div>

            <div
              v-else-if="!filteredStudentRows.length"
              class="flex-1 flex items-center justify-center py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 px-4"
            >
              Nenhum aluno encontrado para "{{ studentSearchQuery }}".
            </div>

            <div v-else class="space-y-2 overflow-y-auto pr-1 flex-1">
              <div
                v-for="row in filteredStudentRows"
                :key="row.student_id"
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ formatStudentLabel(row) }}
                </p>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="row.status = 'PRESENT'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      row.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    ]"
                  >
                    Presente
                  </button>
                  <button
                    type="button"
                    @click="row.status = 'ABSENT'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      row.status === 'ABSENT'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    ]"
                  >
                    Falta
                  </button>
                  <button
                    type="button"
                    @click="row.status = 'JUSTIFICATED'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      row.status === 'JUSTIFICATED'
                        ? 'bg-amber-500 text-white shadow'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    ]"
                  >
                    Justificado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
        >
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar Chamada' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>