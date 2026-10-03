<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCourseGradeStore } from '@/stores/course_grade.store'
import { useCourseStore } from '@/stores/course.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { useConfirmToast } from '@/components/useConfirmToast'
import ConfirmToast from '@/components/ConfirmToast.vue'
import CourseGradesFormView from './CourseGradesFormView.vue'

const courseGradeStore = useCourseGradeStore()
const courseStore = useCourseStore()
const userStore = useUserStore()
const confirmToast = useConfirmToast('confirm-delete')

const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const formData = ref<any>(null)

onMounted(async () => {
  try {
    await Promise.all([
      courseGradeStore.list(),
      courseStore.list()
    ])
  } catch {}
})

const filteredItems = computed(() => {
  return courseGradeStore.courseGrades.filter((item: any) => {
    if (!item) return false
    const query = searchQuery.value.toLowerCase()
    return !query || 
      item.course?.name?.toLowerCase().includes(query) || 
      item.course?.code?.toLowerCase().includes(query) ||
      item.grades?.some((g: any) => g.name.toLowerCase().includes(query))
  })
})

const openCreateModal = () => {
  if (!p('course-grades.create')) return
  isEditing.value = false
  formData.value = { courseId: null, gradeIds: [] }
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  if (!p('course-grades.edit')) return
  isEditing.value = true
  formData.value = {
    courseId: item.id,
    gradeIds: item.grades.map((g: any) => g.id)
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  formData.value = null
  courseGradeStore.clearError()
}

const handleSaved = async () => {
  await courseGradeStore.list()
  closeModal()
  showNotification('Configuração guardada com sucesso.', 'success')
}

const deleteItem = async (courseId: number) => {
  if (!p('course-grades.delete')) return
  try {
    await courseGradeStore.remove(courseId)
    await courseGradeStore.list()
    showNotification('Configuração removida com sucesso.', 'success')
  } catch (err: any) {
    showNotification(courseGradeStore.error || 'Erro ao eliminar.', 'error')
  }
}

const confirmDelete = (item: any) => {
  if (!p('course-grades.delete')) return
  confirmToast.confirm({
    summary: 'Remover Configuração',
    detail: `Tem a certeza que deseja remover todas as classes associadas ao curso "${item.course?.name}"?`,
    onAccept: () => deleteItem(item.id),
  })
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <ConfirmToast
      :group="confirmToast.group"
      @accept="confirmToast.accept"
      @reject="confirmToast.reject"
    />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configuração de Classes por Curso
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira de forma dinâmica as classes afetas a cada curso da instituição.
        </p>
      </div>
      <button
        v-if="p('course-grades.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus text-sm"></i>
        <span>Nova Configuração</span>
      </button>
    </div>

    <!-- Barra de Pesquisa Dinâmica -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por curso, código ou classe..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <!-- Lista em Cartões Dinâmicos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4 transition-all hover:border-indigo-500/50"
      >
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
                {{ item.course?.code }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ item.course?.name }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Curso Oficial</p>
              </div>
            </div>
            
            <div class="flex items-center gap-1.5">
              <button
                v-if="p('course-grades.edit')"
                @click="openEditModal(item)"
                class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                title="Editar Classes"
              >
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                v-if="p('course-grades.delete')"
                @click="confirmDelete(item)"
                class="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                title="Remover Configuração"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">Classes Associadas ({{ item.grades?.length || 0 }})</span>
            <div class="flex flex-wrap gap-1.5">
              <span 
                v-for="grade in item.grades" 
                :key="grade.id"
                class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
              >
                {{ grade.name }}
              </span>
              <span v-if="!item.grades || item.grades.length === 0" class="text-xs text-slate-400 italic">
                Nenhuma classe atribuída.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-if="filteredItems.length === 0 && !courseGradeStore.isLoading" class="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
      <i class="fa-solid fa-folder-open text-3xl mb-2 opacity-40"></i>
      <p class="text-xs">Nenhuma configuração encontrada.</p>
    </div>

    <CourseGradesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="courseGradeStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>