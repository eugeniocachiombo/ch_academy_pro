<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher.store'
import { useGroupconfigStore } from '@/stores/groupconfig.store'
import { useSubjectStore } from '@/stores/subject.store'
import { useYearStore } from '@/stores/year.store'
import { useTeacherocupationStore } from '@/stores/teacherocupation.store'
import { useAuthStore } from '@/stores/auth.store'
import Select from 'primevue/select'

type Id = number | string

const teacherStore = useTeacherStore()
const groupconfigStore = useGroupconfigStore()
const subjectStore = useSubjectStore()
const yearStore = useYearStore()
const teacherocupationStore = useTeacherocupationStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)
const canEdit = () => p('teacherocupations.update') || p('teacherocupations.manage')

const same = (a: Id, b: Id) => String(a) === String(b)

const selectedTeacherId = ref<Id | null>(null)
const selectedYearId = ref<Id | null>(null)
const selectedSubjectId = ref<Id | null>(null)

const assignmentMap = ref<Record<string, Id[]>>({}) 
const originalAssignmentMap = ref<Record<string, Id[]>>({})

const teacherSearchQuery = ref('')
const subjectSearchQuery = ref('')
const internalLoading = ref(false)
const globalError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const buildMapping = () => {
  const mapping: Record<string, Id[]> = {}
  teacherocupationStore.teacherocupations.forEach((to: any) => {
    const tId = String(to.teacher_id)
    const yId = String(to.year_id)
    const sId = to.subject_id

    if (sId == null) return

    const key = `${tId}_${yId}`
    if (!mapping[key]) mapping[key] = []
    mapping[key].push(sId)
  })
  assignmentMap.value = JSON.parse(JSON.stringify(mapping))
  originalAssignmentMap.value = JSON.parse(JSON.stringify(mapping))
}

onMounted(async () => {
  try {
    await Promise.all([
      teacherStore.list(),
      groupconfigStore.list(),
      subjectStore.list(),
      yearStore.list(),
      teacherocupationStore.list()
    ])

    if (teacherStore.teachers.length > 0) {
      selectedTeacherId.value = teacherStore.teachers[0].id
    }
    if (yearStore.years.length > 0) {
      selectedYearId.value = yearStore.years[0].id
    }

    buildMapping()
  } catch {}
})

const totalTeachersCount = computed(() => teacherStore.teachers.filter((t: any) => t != null).length)
const totalSubjectsCount = computed(() => subjectStore.subjects.filter((s: any) => s != null).length)

const filteredTeachers = computed(() => {
  const q = teacherSearchQuery.value.toLowerCase()
  return teacherStore.teachers.filter((teacher: any) => {
    if (!teacher) return false
    const name = teacher.user?.name || ''
    return !q || name.toLowerCase().includes(q) || String(teacher.codenumber || '').toLowerCase().includes(q)
  })
})

const currentTeacher = computed(() => {
  if (selectedTeacherId.value == null) return null
  return teacherStore.teachers.find((t: any) => same(t.id, selectedTeacherId.value!)) || null
})

const filteredSubjects = computed(() => {
  const q = subjectSearchQuery.value.toLowerCase()
  return subjectStore.subjects.filter((subj: any) => {
    if (!subj) return false
    return !q ||
      subj.name?.toLowerCase().includes(q) ||
      subj.code?.toLowerCase().includes(q)
  })
})

const currentKey = computed(() => {
  if (selectedTeacherId.value == null || selectedYearId.value == null) return null
  return `${selectedTeacherId.value}_${selectedYearId.value}`
})

const isSubjectAssigned = (subjectId: Id) => {
  const key = currentKey.value
  if (!key) return false
  const assigned = assignmentMap.value[key] || []
  return assigned.some(id => same(id, subjectId))
}

const toggleSubject = (subjectId: Id) => {
  const key = currentKey.value
  if (!key || !canEdit()) return

  globalError.value = null
  successMessage.value = null

  const currentAssigned = assignmentMap.value[key] || []
  if (currentAssigned.some(id => same(id, subjectId))) {
    assignmentMap.value[key] = currentAssigned.filter(id => !same(id, subjectId))
  } else {
    assignmentMap.value[key] = [...currentAssigned, subjectId]
  }
}

const saveChanges = async () => {
  const key = currentKey.value
  if (!key || selectedTeacherId.value == null || selectedYearId.value == null) return
  if (!canEdit()) return

  internalLoading.value = true
  globalError.value = null
  successMessage.value = null

  try {
    const teacherId = selectedTeacherId.value
    const yearId = selectedYearId.value

    const currentSelected = assignmentMap.value[key] || []
    const originalSelected = originalAssignmentMap.value[key] || []

    const toAdd = currentSelected.filter(subjectId => !originalSelected.some(o => same(o, subjectId)))
    const toRemove = originalSelected.filter(subjectId => !currentSelected.some(c => same(c, subjectId)))

    for (const subjectId of toRemove) {
      const found = teacherocupationStore.teacherocupations.find(
        (to: any) =>
          same(to.teacher_id, teacherId) &&
          same(to.year_id, yearId) &&
          same(to.subject_id, subjectId)
      )
      if (found && found.id) {
        await teacherocupationStore.remove(found.id)
      }
    }

    for (const subjectId of toAdd) {
      await teacherocupationStore.create({
        teacher_id: teacherId,
        year_id: yearId,
        subject_id: subjectId
      })
    }

    await teacherocupationStore.list()
    buildMapping()

    successMessage.value = 'Atribuições de disciplinas actualizadas com sucesso!'
    setTimeout(() => {
      successMessage.value = null
    }, 4000)
  } catch (err: any) {
    globalError.value = teacherocupationStore.error || err.message || 'Erro ao sincronizar as atribuições do professor.'
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Atribuição de Disciplinas a Professores</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure as disciplinas lecionadas por cada professor por ano letivo.</p>
      </div>
      <button
        v-if="currentKey && (p('teacherocupations.update') || p('teacherocupations.manage'))"
        @click="saveChanges"
        :disabled="internalLoading"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
      >
        <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin text-sm"></i>
        <i v-else class="fa-solid fa-floppy-disk text-sm"></i>
        <span>{{ internalLoading ? 'A guardar...' : 'Guardar Alterações' }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Professores</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-chalkboard-user text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalTeachersCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Disciplinas Disponíveis</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-book text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalSubjectsCount }}</div>
      </div>
    </div>

    <!-- Filtro global de Ano Letivo -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Ano Letivo</label>
        <Select
          v-model="selectedYearId"
          :options="yearStore.years"
          optionLabel="name"
          optionValue="id"
          placeholder="Selecione o ano letivo"
          filter
          showClear
          class="w-full text-xs"
        />
      </div>
    </div>

    <div v-if="globalError || teacherStore.error || subjectStore.error || yearStore.error || teacherocupationStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ globalError || teacherStore.error || subjectStore.error || yearStore.error || teacherocupationStore.error }}</span>
    </div>

    <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-check text-lg"></i>
      <span>{{ successMessage }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 lg:col-span-1 h-fit">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Selecionar Professor</h2>
        
        <div class="relative w-full">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="teacherSearchQuery"
            type="text"
            placeholder="Pesquisar professor..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div v-if="teacherStore.isLoading && !teacherStore.teachers.length" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <div v-else-if="filteredTeachers.length === 0" class="py-6 text-center text-slate-400 text-xs">
          Nenhum professor encontrado.
        </div>
        <div v-else class="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          <button
            v-for="teacher in (filteredTeachers as any)"
            :key="teacher.id"
            @click="selectedTeacherId = teacher.id"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left',
              selectedTeacherId === teacher.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <i class="fa-solid fa-chalkboard-user text-sm opacity-80"></i>
              <span class="truncate">{{ teacher.user?.name || `#${teacher.codenumber}` }}</span>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
          </button>
        </div>
      </div>

      <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">
              Disciplinas para: <span class="text-indigo-600 dark:text-indigo-400">{{ currentTeacher?.user?.name || 'Selecione um professor' }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marque as caixas de seleção correspondentes às disciplinas lecionadas.</p>
          </div>
        </div>

        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
            <input
              v-model="subjectSearchQuery"
              type="text"
              placeholder="Pesquisar por nome ou código da disciplina..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[480px]">
          <div v-if="teacherStore.isLoading || subjectStore.isLoading || teacherocupationStore.isLoading" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar disciplinas...</p>
          </div>
          <div v-else-if="filteredSubjects.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma disciplina encontrada.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="subj in (filteredSubjects as any)"
              :key="subj.id"
              @click="toggleSubject(subj.id)"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                isSubjectAssigned(subj.id)
                  ? 'bg-indigo-600/5 border-indigo-500/40 dark:bg-indigo-600/10 dark:border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :checked="isSubjectAssigned(subj.id)"
                @click.stop="toggleSubject(subj.id)"
                class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div class="flex-1 truncate">
                <div class="font-mono text-xs font-bold text-slate-900 dark:text-white">{{ subj.name }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Código: {{ subj.code || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>