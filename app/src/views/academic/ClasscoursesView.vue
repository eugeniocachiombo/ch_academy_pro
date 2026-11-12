<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/class.store'
import { useCourseStore } from '@/stores/course.store'
import { useClasscourseStore } from '@/stores/classcourse.store'
import { useAuthStore } from '@/stores/auth.store'

type Id = number | string

const classStore = useClassStore()
const courseStore = useCourseStore()
const classcourseStore = useClasscourseStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)
const canEdit = () => p('classcourses.update') || p('classcourses.manage')

const same = (a: Id, b: Id) => String(a) === String(b)

const selectedCourseId = ref<Id | null>(null)
const classcourseMap = ref<Record<string, Id[]>>({}) 
const originalClasscourseMap = ref<Record<string, Id[]>>({})

const courseSearchQuery = ref('')
const classSearchQuery = ref('')
const internalLoading = ref(false)
const globalError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const buildMapping = () => {
  const mapping: Record<string, Id[]> = {}
  classcourseStore.classcourses.forEach((cc: any) => {
    const courseId = String(cc.course_id)
    const cId = cc.class_id
    if (cId == null) return
    if (!mapping[courseId]) mapping[courseId] = []
    mapping[courseId].push(cId)
  })
  classcourseMap.value = JSON.parse(JSON.stringify(mapping))
  originalClasscourseMap.value = JSON.parse(JSON.stringify(mapping))
}

onMounted(async () => {
  try {
    await Promise.all([
      classStore.list(),
      courseStore.list(),
      classcourseStore.list()
    ])

    if (courseStore.courses.length > 0) {
      selectedCourseId.value = courseStore.courses[0].id
    }

    buildMapping()
  } catch {}
})

const totalClassesCount = computed(() => classStore.classes.filter((c: any) => c != null).length)
const totalCoursesCount = computed(() => courseStore.courses.filter((c: any) => c != null).length)

const filteredCourses = computed(() => {
  const q = courseSearchQuery.value.toLowerCase()
  return courseStore.courses.filter((course: any) => {
    if (!course) return false
    return !q || course.name?.toLowerCase().includes(q)
  })
})

const currentCourse = computed(() => {
  if (selectedCourseId.value == null) return null
  return courseStore.courses.find((c: any) => same(c.id, selectedCourseId.value!)) || null
})

const filteredClasses = computed(() => {
  const q = classSearchQuery.value.toLowerCase()
  return classStore.classes.filter((cls: any) => {
    if (!cls) return false
    return !q ||
      cls.name?.toLowerCase().includes(q) ||
      cls.description?.toLowerCase().includes(q)
  })
})

const isClassAssigned = (classId: Id) => {
  if (selectedCourseId.value == null) return false
  const assigned = classcourseMap.value[String(selectedCourseId.value)] || []
  return assigned.some(id => same(id, classId))
}

const toggleClass = (classId: Id) => {
  if (selectedCourseId.value == null) return
  if (!canEdit()) return

  globalError.value = null
  successMessage.value = null

  const key = String(selectedCourseId.value)
  const currentAssigned = classcourseMap.value[key] || []
  if (currentAssigned.some(id => same(id, classId))) {
    classcourseMap.value[key] = currentAssigned.filter(id => !same(id, classId))
  } else {
    classcourseMap.value[key] = [...currentAssigned, classId]
  }
}

const saveChanges = async () => {
  if (selectedCourseId.value == null) return
  if (!canEdit()) return

  internalLoading.value = true
  globalError.value = null
  successMessage.value = null

  try {
    const courseId = selectedCourseId.value
    const key = String(courseId)
    const currentSelected = classcourseMap.value[key] || []
    const originalSelected = originalClasscourseMap.value[key] || []

    const toAdd = currentSelected.filter(classId => !originalSelected.some(o => same(o, classId)))
    const toRemove = originalSelected.filter(classId => !currentSelected.some(c => same(c, classId)))

    for (const classId of toRemove) {
      const found = classcourseStore.classcourses.find(
        (cc: any) =>
          same(cc.course_id, courseId) &&
          same(cc.class_id, classId)
      )
      if (found && found.id) {
        await classcourseStore.remove(found.id)
      }
    }

    for (const classId of toAdd) {
      await classcourseStore.create({
        course_id: courseId,
        class_id: classId
      })
    }

    await classcourseStore.list()
    buildMapping()

    successMessage.value = 'Classes do curso actualizadas com sucesso!'
    setTimeout(() => {
      successMessage.value = null
    }, 4000)
  } catch (err: any) {
    globalError.value = classcourseStore.error || err.message || 'Erro ao sincronizar as classes do curso.'
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Atribuição de Classes a Cursos</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure o currículo associando classes específicas a cada curso.</p>
      </div>
      <button
        v-if="selectedCourseId && (p('classcourses.update') || p('classcourses.manage'))"
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
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Cursos</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-graduation-cap text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCoursesCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Classes Disponíveis</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-chalkboard text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalClassesCount }}</div>
      </div>
    </div>

    <div v-if="globalError || classStore.error || courseStore.error || classcourseStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ globalError || classStore.error || courseStore.error || classcourseStore.error }}</span>
    </div>

    <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-check text-lg"></i>
      <span>{{ successMessage }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 lg:col-span-1 h-fit">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Selecionar Curso</h2>
        
        <div class="relative w-full">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="courseSearchQuery"
            type="text"
            placeholder="Pesquisar curso..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div v-if="courseStore.isLoading && !courseStore.courses.length" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <div v-else-if="filteredCourses.length === 0" class="py-6 text-center text-slate-400 text-xs">
          Nenhum curso encontrado.
        </div>
        <div v-else class="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          <button
            v-for="course in (filteredCourses as any)"
            :key="course.id"
            @click="selectedCourseId = course.id"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left',
              selectedCourseId === course.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <i class="fa-solid fa-graduation-cap text-sm opacity-80"></i>
              <span class="truncate">{{ course.name }}</span>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
          </button>
        </div>
      </div>

      <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">
              Classes para: <span class="text-indigo-600 dark:text-indigo-400">{{ currentCourse?.name || 'Selecione um curso' }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marque as caixas de seleção correspondentes às classes vinculadas.</p>
          </div>
        </div>

        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
            <input
              v-model="classSearchQuery"
              type="text"
              placeholder="Pesquisar por nome ou descrição da classe..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[480px]">
          <div v-if="classStore.isLoading || classcourseStore.isLoading" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar classes...</p>
          </div>
          <div v-else-if="filteredClasses.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma classe encontrada.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="cls in (filteredClasses as any)"
              :key="cls.id"
              @click="toggleClass(cls.id)"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                isClassAssigned(cls.id)
                  ? 'bg-indigo-600/5 border-indigo-500/40 dark:bg-indigo-600/10 dark:border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :checked="isClassAssigned(cls.id)"
                @click.stop="toggleClass(cls.id)"
                class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div class="flex-1 truncate">
                <div class="font-mono text-xs font-bold text-slate-900 dark:text-white">{{ cls.name }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ cls.description || 'Sem descrição' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>