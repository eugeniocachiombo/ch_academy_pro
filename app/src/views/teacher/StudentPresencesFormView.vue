<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  useStudentPresenceStore,
  type StudentPresence,
  type StudentPresencePayload,
} from '@/stores/student-presence.store'
import {
  useStudentPresenceListStore,
  type PresenceStatus,
} from '@/stores/student-presence-list.store'
import { api } from '@/services/api'
import { showNotification } from '@/services/general_service'

interface StudentRow {
  list_id?: number
  student_id: number
  name: string
  codenumber?: string
  status: PresenceStatus
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
const loadingStudents = ref(false)

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

const loadOptions = async () => {
  try {
    const [gcRes, tRes, sRes] = await Promise.all([
      api.get<any[]>('/groupconfigs').catch(() => []),
      api.get<any[]>('/teachers').catch(() => []),
      api.get<any[]>('/subjects').catch(() => []),
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
    // Se estiver a editar, aproveita a lista já guardada
    const existingList = props.existingPresence?.student_presence_lists || []

    // Procura os alunos matriculados na turma (registers)
    const gc = groupconfigs.value.find((g) => g.id === groupconfigId)
    let registers = gc?.registers || []

    if (!registers.length) {
      const registersRes = await api.get<any[]>('/registers').catch(() => [])
      registers = (registersRes || []).filter((r: any) => r.groupconfig_id === groupconfigId)
    }

    if (registers.length) {
      studentRows.value = registers.map((reg: any) => {
        const student = reg.student || {}
        const savedItem = existingList.find((item) => item.student_id === reg.student_id)
        return {
          list_id: savedItem?.id,
          student_id: reg.student_id,
          name: student.user?.name || student.name || `Aluno #${reg.student_id}`,
          codenumber: student.codenumber || '',
          status: savedItem?.status || 'PRESENT',
        }
      })
    } else if (existingList.length) {
      studentRows.value = existingList.map((item) => ({
        list_id: item.id,
        student_id: item.student_id,
        name: item.student?.user?.name || item.student?.name || `Aluno #${item.student_id}`,
        codenumber: item.student?.codenumber || '',
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
    fieldErrors.value = {}
    generalMessage.value = ''
    await buildStudentRows(form.value.groupconfig_id)
  },
  { immediate: true, deep: true }
)

const onGroupconfigChange = async () => {
  clearFieldError('groupconfig_id')
  await buildStudentRows(form.value.groupconfig_id)
}

const markAllAs = (status: PresenceStatus) => {
  studentRows.value = studentRows.value.map((row) => ({ ...row, status }))
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

    // Guarda ou actualiza cada aluno na StudentPresenceList
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
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
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
              Seleccione a turma, disciplina, professor e marque a presença dos alunos.
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

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1">
        <div
          v-if="generalMessage && !Object.keys(fieldErrors).length"
          class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3"
        >
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >Data</label
            >
            <input
              v-model="form.date"
              @input="clearFieldError('date')"
              type="date"
              :class="[
                'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all',
                hasError('date')
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500',
              ]"
            />
            <span
              v-if="hasError('date')"
              class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium"
              >{{ getFieldError('date') }}</span
            >
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >Turma</label
            >
            <select
              v-model.number="form.groupconfig_id"
              @change="onGroupconfigChange"
              :class="[
                'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all',
                hasError('groupconfig_id')
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500',
              ]"
            >
              <option :value="null" disabled>Seleccione a turma</option>
              <option v-for="gc in groupconfigs" :key="gc.id" :value="gc.id">
                {{ gc.name }}
              </option>
            </select>
            <span
              v-if="hasError('groupconfig_id')"
              class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium"
              >{{ getFieldError('groupconfig_id') }}</span
            >
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >Disciplina</label
            >
            <select
              v-model.number="form.subject_id"
              @change="clearFieldError('subject_id')"
              :class="[
                'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all',
                hasError('subject_id')
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500',
              ]"
            >
              <option :value="null" disabled>Seleccione a disciplina</option>
              <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
            <span
              v-if="hasError('subject_id')"
              class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium"
              >{{ getFieldError('subject_id') }}</span
            >
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >Professor</label
            >
            <select
              v-model.number="form.teacher_id"
              @change="clearFieldError('teacher_id')"
              :class="[
                'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all',
                hasError('teacher_id')
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500',
              ]"
            >
              <option :value="null" disabled>Seleccione o professor</option>
              <option v-for="t in teachers" :key="t.id" :value="t.id">
                {{ t.user?.name || t.codenumber }}
              </option>
            </select>
            <span
              v-if="hasError('teacher_id')"
              class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium"
              >{{ getFieldError('teacher_id') }}</span
            >
          </div>
        </div>

        <!-- Lista de Alunos da Turma -->
        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Lista de Alunos ({{ studentRows.length }})
            </span>
            <div v-if="studentRows.length" class="flex items-center gap-1.5">
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
            </div>
          </div>

          <div
            v-if="loadingStudents"
            class="py-8 text-center text-xs text-slate-500 dark:text-slate-400"
          >
            <i class="fa-solid fa-spinner animate-spin mr-1.5"></i> A carregar alunos da turma...
          </div>

          <div
            v-else-if="!studentRows.length"
            class="py-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400"
          >
            Seleccione uma turma com alunos matriculados para marcar presenças.
          </div>

          <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="row in studentRows"
              :key="row.student_id"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.name }}</p>
                <p v-if="row.codenumber" class="text-[11px] font-mono text-slate-500">
                  {{ row.codenumber }}
                </p>
              </div>

              <div class="flex items-center gap-1.5">
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

        <div
          class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800"
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