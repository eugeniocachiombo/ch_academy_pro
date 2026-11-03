<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCourseStore, type Course, type CoursePayload } from '@/stores/course.store'
import { showNotification } from '@/services/general_service'
import CoursesFormView from './CoursesFormView.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const courseStore = useCourseStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedCourse = ref<Course | null>(null)
const formData = ref<(CoursePayload & { id?: number }) | null>(null)

onMounted(async () => {
  try {
    await courseStore.list()
  } catch {}
})

const totalCount = computed(() => courseStore.courses.filter((c: any) => c != null).length)

const filteredCourses = computed(() => {
  return courseStore.courses.filter((c: any) => {
    if (!c) return false
    return (
      !searchQuery.value ||
      c.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
})

const openCreateModal = () => {
  if (!p('course.create')) return
  isEditing.value = false
  selectedCourse.value = null
  formData.value = { name: '', code: '', description: '', school_id: null }
  isModalOpen.value = true
}

const openEditModal = (course: Course) => {
  if (!p('course.edit')) return
  isEditing.value = true
  selectedCourse.value = course
  formData.value = {
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description || '',
    school_id: course.school_id,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCourse.value = null
  formData.value = null
  courseStore.clearError()
}

const handleSaved = async () => {
  await courseStore.list()
  closeModal()
  showNotification('Curso guardado com sucesso.', 'success')
}

const deleteCourse = async (id: number) => {
  if (!p('course.delete')) return
  if (!confirm('Tem certeza de que deseja eliminar permanentemente este curso?')) return
  try {
    await courseStore.remove(id)
    showNotification('Curso eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = courseStore.error || 'Erro ao eliminar curso.'
    showNotification(errorMsg, 'error')
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
          Cursos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure e gira os cursos oferecidos.
        </p>
      </div>
      <button
        v-if="p('course.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Curso</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Cursos</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-graduation-cap text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4"
    >
      <div class="relative flex-1 w-full">
        <i
          class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
        ></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome ou código..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        class="custom-datatable"
        :value="filteredCourses"
        :loading="courseStore.isLoading"
        paginator
        :rows="10"
        tableStyle="min-width: 50rem"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhum registo encontrado.</p>
          </div>
        </template>
        <Column field="code" header="Código" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{{
              slotProps.data.code
            }}</span>
          </template>
        </Column>
        <Column field="name" header="Nome do Curso" sortable style="width: 45%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">{{
              slotProps.data.name
            }}</span>
          </template>
        </Column>
        <Column header="Acções" style="width: 20%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('course.edit') || p('course.delete')">
              <button
                v-if="p('course.edit')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('course.delete')"
                @click="deleteCourse(slotProps.data.id)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <CoursesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="courseStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>
