<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAcademicClassStore, type AcademicClass } from '@/stores/academic_class.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { useConfirmToast } from '@/components/useConfirmToast'
import ConfirmToast from '@/components/ConfirmToast.vue'
import AcademicClassesFormView from './AcademicClassesFormView.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const academicClassStore = useAcademicClassStore()
const userStore = useUserStore()
const confirmToast = useConfirmToast('confirm-delete')

const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedAcademicClass = ref<AcademicClass | null>(null)
const formData = ref<(any & { id?: number }) | null>(null)

const activeDropdownId = ref<number | null>(null)

onMounted(async () => {
  try {
    await academicClassStore.list()
  } catch {}
})

const totalCount = computed(
  () => academicClassStore.academicClasses.filter((r: any) => r != null).length
)

const filteredAcademicClasses = computed(() => {
  return academicClassStore.academicClasses.filter((r: any) => {
    if (!r) return false
    return !searchQuery.value || r.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  if (!p('classes.create')) return
  isEditing.value = false
  selectedAcademicClass.value = null
  formData.value = { name: '' }
  isModalOpen.value = true
}

const openEditModal = (academicClass: AcademicClass) => {
  if (!p('classes.edit')) return
  isEditing.value = true
  selectedAcademicClass.value = academicClass
  formData.value = {
    id: academicClass.id,
    name: academicClass.name || '',
  }
  isModalOpen.value = true
  activeDropdownId.value = null
}

const closeModal = () => {
  isModalOpen.value = false
  selectedAcademicClass.value = null
  formData.value = null
  academicClassStore.clearError()
}

const handleSaved = async () => {
  await academicClassStore.list()
  closeModal()
  showNotification('Turma guardada com sucesso.', 'success')
}

const deleteAcademicClass = async (id: number) => {
  if (!p('classes.delete')) return

  try {
    await academicClassStore.remove(id)
    showNotification('Turma eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = academicClassStore.error || 'Erro ao eliminar turma.'
    showNotification(errorMsg, 'error')
  }
}

const confirmDelete = (academicClass: AcademicClass) => {
  if (!p('classes.delete')) return

  confirmToast.confirm({
    summary: 'Eliminar turma',
    detail: `Tem a certeza que deseja eliminar a turma "${academicClass.name}"?`,
    onAccept: () => deleteAcademicClass(academicClass.id),
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
          Gestão de Turmas
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure e gira as turmas académicas do sistema.
        </p>
      </div>
      <button
        v-if="p('classes.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-graduation-cap text-sm"></i>
        <span>Nova Turma</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Turmas</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center"
          >
            <i class="fa-solid fa-school text-sm"></i>
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
          placeholder="Pesquisar por nome da turma..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <div
      v-if="academicClassStore.error"
      class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm flex items-center gap-3"
    >
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ academicClassStore.error }}</span>
    </div>

    <div
      class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        :value="filteredAcademicClasses"
        :loading="academicClassStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma turma encontrada.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar turmas...</p>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400"
              >#{{ slotProps.data.id }}</span
            >
          </template>
        </Column>

        <Column field="name" header="Nome da Turma" sortable style="width: 50%">
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
                v-if="p('classes.edit') || p('classes.delete')"
                class="inline-flex items-center gap-1.5"
              >
                <button
                  v-if="p('classes.edit')"
                  @click="openEditModal(slotProps.data)"
                  class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                  title="Editar Turma"
                >
                  <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>

                <button
                  v-if="p('classes.delete')"
                  @click="confirmDelete(slotProps.data)"
                  class="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                  title="Eliminar Turma"
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

    <AcademicClassesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="academicClassStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>