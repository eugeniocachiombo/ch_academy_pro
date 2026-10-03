<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAcademicGradeStore, type AcademicGrade } from '@/stores/academic_grade.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { useConfirmToast } from '@/components/useConfirmToast'
import ConfirmToast from '@/components/ConfirmToast.vue'
import AcademicGradesFormView from './AcademicGradesFormView.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const academicGradeStore = useAcademicGradeStore()
const userStore = useUserStore()
const confirmToast = useConfirmToast('confirm-delete')

const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedAcademicGrade = ref<AcademicGrade | null>(null)
const formData = ref<(any & { id?: number }) | null>(null)

onMounted(async () => {
  try {
    await academicGradeStore.list()
  } catch {}
})

const totalCount = computed(
  () => academicGradeStore.academicGrades.filter((r: any) => r != null).length
)

const filteredAcademicGrades = computed(() => {
  return academicGradeStore.academicGrades.filter((r: any) => {
    if (!r) return false
    return !searchQuery.value || r.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  if (!p('grades.create')) return
  isEditing.value = false
  selectedAcademicGrade.value = null
  formData.value = { name: '' }
  isModalOpen.value = true
}

const openEditModal = (academicGrade: AcademicGrade) => {
  if (!p('grades.edit')) return
  isEditing.value = true
  selectedAcademicGrade.value = academicGrade
  formData.value = {
    id: academicGrade.id,
    name: academicGrade.name || '',
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedAcademicGrade.value = null
  formData.value = null
  academicGradeStore.clearError()
}

const handleSaved = async () => {
  await academicGradeStore.list()
  closeModal()
  showNotification('Classe guardada com sucesso.', 'success')
}

const deleteAcademicGrade = async (id: number) => {
  if (!p('grades.delete')) return

  try {
    await academicGradeStore.remove(id)
    showNotification('Classe eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = academicGradeStore.error || 'Erro ao eliminar classe.'
    showNotification(errorMsg, 'error')
  }
}

const confirmDelete = (academicGrade: AcademicGrade) => {
  if (!p('grades.delete')) return

  confirmToast.confirm({
    summary: 'Eliminar classe',
    detail: `Tem a certeza que deseja eliminar a classe "${academicGrade.name}"?`,
    onAccept: () => deleteAcademicGrade(academicGrade.id),
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
        <h1
          class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Gestão de Classes
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure e gira as classes académicas do sistema.
        </p>
      </div>
      <button
        v-if="p('grades.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-layer-group text-sm"></i>
        <span>Nova Classe</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Classes</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center"
          >
            <i class="fa-solid fa-school-flag text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4"
    >
      <div class="relative flex-1 w-full">
        <i
          class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"
        ></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome da classe..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <div
      v-if="academicGradeStore.error"
      class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm flex items-center gap-3"
    >
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ academicGradeStore.error }}</span>
    </div>

    <div
      class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        :value="filteredAcademicGrades"
        :loading="academicGradeStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma classe encontrada.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar classes...</p>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400"
              >#{{ slotProps.data.id }}</span
            >
          </template>
        </Column>

        <Column field="name" header="Nome da Classe" sortable style="width: 50%">
          <template #body="slotProps">
            <span class="text-xs font-semibold text-slate-900 dark:text-white">{{
              slotProps.data.name
            }}</span>
          </template>
        </Column>

        <Column field="createdAt" header="Criado em" sortable style="width: 20%">
          <template #body="slotProps">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{
                slotProps.data.createdAt
                  ? new Date(slotProps.data.createdAt).toLocaleDateString()
                  : '-'
              }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 15%" :exportable="false">
          <template #body="slotProps">
            <div class="flex items-center justify-center">
              <div
                v-if="p('grades.edit') || p('grades.delete')"
                class="inline-flex items-center gap-1.5"
              >
                <button
                  v-if="p('grades.edit')"
                  @click="openEditModal(slotProps.data)"
                  class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                  title="Editar Classe"
                >
                  <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>

                <button
                  v-if="p('grades.delete')"
                  @click="confirmDelete(slotProps.data)"
                  class="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                  title="Eliminar Classe"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
              <span v-else class="text-xs text-slate-400 italic">Sem acções</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <AcademicGradesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="academicGradeStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>