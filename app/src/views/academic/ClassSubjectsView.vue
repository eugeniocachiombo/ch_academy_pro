<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/class.store'
import { useSubjectStore } from '@/stores/subject.store'
import { useClassSubjectStore } from '@/stores/class-subject.store'
import { useAuthStore } from '@/stores/auth.store'

type Id = number | string

const classStore = useClassStore()
const subjectStore = useSubjectStore()
const classSubjectStore = useClassSubjectStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)
const canEdit = () => p('class_subject.edit') || p('class_subject.manage')

const same = (a: Id, b: Id) => String(a) === String(b)

const selectedClassId = ref<Id | null>(null)
const classSubjectMap = ref<Record<string, Id[]>>({}) 
const originalClassSubjectMap = ref<Record<string, Id[]>>({})

const classSearchQuery = ref('')
const searchQuery = ref('')
const internalLoading = ref(false)
const globalError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const buildMapping = () => {
  const mapping: Record<string, Id[]> = {}
  classSubjectStore.classSubjects.forEach((cs: any) => {
    const cId = String(cs.class_id)
    const subjectId = cs.subject_id
    if (subjectId == null) return
    if (!mapping[cId]) mapping[cId] = []
    mapping[cId].push(subjectId)
  })
  classSubjectMap.value = JSON.parse(JSON.stringify(mapping))
  originalClassSubjectMap.value = JSON.parse(JSON.stringify(mapping))
}

onMounted(async () => {
  try {
    await Promise.all([
      classStore.list(),
      subjectStore.list(),
      classSubjectStore.list()
    ])

    if (classStore.classes.length > 0) {
      selectedClassId.value = classStore.classes[0].id
    }

    buildMapping()
  } catch {}
})

const totalClassesCount = computed(() => classStore.classes.filter((c: any) => c != null).length)
const totalSubjectsCount = computed(() => subjectStore.subjects.filter((s: any) => s != null).length)

const filteredClasses = computed(() => {
  const q = classSearchQuery.value.toLowerCase()
  return classStore.classes.filter((cls: any) => {
    if (!cls) return false
    return !q || cls.name?.toLowerCase().includes(q)
  })
})

const currentClass = computed(() => {
  if (selectedClassId.value == null) return null
  return classStore.classes.find((c: any) => same(c.id, selectedClassId.value!)) || null
})

const filteredSubjects = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return subjectStore.subjects.filter((subject: any) => {
    if (!subject) return false
    return !q ||
      subject.name?.toLowerCase().includes(q) ||
      subject.description?.toLowerCase().includes(q)
  })
})

const isSubjectAssigned = (subjectId: Id) => {
  if (selectedClassId.value == null) return false
  const assigned = classSubjectMap.value[String(selectedClassId.value)] || []
  return assigned.some(id => same(id, subjectId))
}

const toggleSubject = (subjectId: Id) => {
  if (selectedClassId.value == null) return
  if (!canEdit()) return

  globalError.value = null
  successMessage.value = null

  const key = String(selectedClassId.value)
  const currentAssigned = classSubjectMap.value[key] || []
  if (currentAssigned.some(id => same(id, subjectId))) {
    classSubjectMap.value[key] = currentAssigned.filter(id => !same(id, subjectId))
  } else {
    classSubjectMap.value[key] = [...currentAssigned, subjectId]
  }
}

const saveChanges = async () => {
  if (selectedClassId.value == null) return
  if (!canEdit()) return

  internalLoading.value = true
  globalError.value = null
  successMessage.value = null

  try {
    const classId = selectedClassId.value
    const key = String(classId)
    const currentSelected = classSubjectMap.value[key] || []
    const originalSelected = originalClassSubjectMap.value[key] || []

    const toAdd = currentSelected.filter(subjectId => !originalSelected.some(o => same(o, subjectId)))
    const toRemove = originalSelected.filter(subjectId => !currentSelected.some(c => same(c, subjectId)))

    for (const subjectId of toRemove) {
      const found = classSubjectStore.classSubjects.find(
        (cs: any) =>
          same(cs.class_id, classId) &&
          same(cs.subject_id, subjectId)
      )
      if (found && found.id) {
        await classSubjectStore.remove(found.id)
      }
    }

    for (const subjectId of toAdd) {
      await classSubjectStore.create({
        class_id: classId,
        subject_id: subjectId
      })
    }

    await classSubjectStore.list()
    buildMapping()

    successMessage.value = 'Disciplinas da classe actualizadas com sucesso!'
    setTimeout(() => {
      successMessage.value = null
    }, 4000)
  } catch (err: any) {
    globalError.value = classSubjectStore.error || err.message || 'Erro ao sincronizar as disciplinas da classe.'
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Atribuição de Disciplinas a Classes</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure o currículo associando disciplinas específicas a cada classe.</p>
      </div>
      <button
        v-if="selectedClassId && (p('class_subject.edit') || p('class_subject.manage'))"
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
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Classes</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-chalkboard text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalClassesCount }}</div>
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

    <div v-if="globalError || classStore.error || subjectStore.error || classSubjectStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ globalError || classStore.error || subjectStore.error || classSubjectStore.error }}</span>
    </div>

    <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-check text-lg"></i>
      <span>{{ successMessage }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 lg:col-span-1 h-fit">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Selecionar Classe</h2>
        
        <div class="relative w-full">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="classSearchQuery"
            type="text"
            placeholder="Pesquisar classe..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div v-if="classStore.isLoading && !classStore.classes.length" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <div v-else-if="filteredClasses.length === 0" class="py-6 text-center text-slate-400 text-xs">
          Nenhuma classe encontrada.
        </div>
        <div v-else class="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          <button
            v-for="cls in (filteredClasses as any)"
            :key="cls.id"
            @click="selectedClassId = cls.id"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left',
              selectedClassId === cls.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <i class="fa-solid fa-chalkboard text-sm opacity-80"></i>
              <span class="truncate">{{ cls.name }}</span>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
          </button>
        </div>
      </div>

      <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">
              Disciplinas para: <span class="text-indigo-600 dark:text-indigo-400">{{ currentClass?.name || 'Selecione uma classe' }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marque as caixas de seleção correspondentes às disciplinas vinculadas.</p>
          </div>
        </div>

        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar por nome ou descrição da disciplina..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[480px]">
          <div v-if="subjectStore.isLoading || classSubjectStore.isLoading" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar disciplinas...</p>
          </div>
          <div v-else-if="filteredSubjects.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma disciplina encontrada.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="subject in (filteredSubjects as any)"
              :key="subject.id"
              @click="toggleSubject(subject.id)"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                isSubjectAssigned(subject.id)
                  ? 'bg-indigo-600/5 border-indigo-500/40 dark:bg-indigo-600/10 dark:border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :checked="isSubjectAssigned(subject.id)"
                @click.stop="toggleSubject(subject.id)"
                class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div class="flex-1 truncate">
                <div class="font-mono text-xs font-bold text-slate-900 dark:text-white">{{ subject.name }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ subject.description || 'Sem descrição' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>