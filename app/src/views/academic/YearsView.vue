<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useYearStore, type Year, type YearPayload } from '@/stores/year.store'
import { showNotification } from '@/services/general_service'
import YearsFormView from './YearsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const yearStore = useYearStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedYear = ref<Year | null>(null)
const formData = ref<(YearPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const yearToDeleteId = ref<number | null>(null)
const yearToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await yearStore.list()
  } catch {}
})

const totalCount = computed(() => yearStore.years.filter((y: any) => y != null).length)

const filteredYears = computed(() => {
  return yearStore.years.filter((y: any) => {
    if (!y) return false
    return !searchQuery.value || y.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  if (!p('year.create')) return
  isEditing.value = false
  selectedYear.value = null
  formData.value = { name: '', school_id: null, isCurrent: false, startdate: '', enddate: '' }
  isModalOpen.value = true
}

const openEditModal = (year: Year) => {
  if (!p('year.edit')) return
  isEditing.value = true
  selectedYear.value = year
  formData.value = {
    id: year.id,
    name: year.name,
    startdate: year.startdate || '',
    enddate: year.enddate || '',
    isCurrent: year.isCurrent,
    school_id: year.school_id,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedYear.value = null
  formData.value = null
  yearStore.clearError()
}

const handleSaved = async () => {
  await yearStore.list()
  closeModal()
  showNotification('Ano letivo guardado com sucesso.', 'success')
}

const confirmDeleteYear = (year: Year) => {
  if (!p('year.delete')) return
  yearToDeleteId.value = year.id
  yearToDeleteName.value = year.name
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  yearToDeleteId.value = null
  yearToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!yearToDeleteId.value) return
  isDeleting.value = true

  try {
    await yearStore.remove(yearToDeleteId.value)
    await yearStore.list()

    isDeleteModalOpen.value = false
    yearToDeleteId.value = null
    yearToDeleteName.value = ''

    showNotification('Ano letivo eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = yearStore.error || err.message || 'Erro ao eliminar ano letivo.'
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
          Anos Letivos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira os anos letivos da instituição.
        </p>
      </div>
      <button
        v-if="p('year.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Ano Letivo</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Anos Letivos</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-calendar text-sm"></i>
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
          placeholder="Pesquisar por ano letivo..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        class="custom-datatable"
        :value="filteredYears"
        :loading="yearStore.isLoading"
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
        <Column field="id" header="ID" sortable style="width: 10%">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-500">#{{ slotProps.data.id }}</span>
          </template>
        </Column>
        <Column field="name" header="Ano Letivo" sortable style="width: 30%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">{{
              slotProps.data.name
            }}</span>
          </template>
        </Column>
        <Column field="isCurrent" header="Estado" sortable style="width: 20%">
          <template #body="slotProps">
            <span
              v-if="slotProps.data.isCurrent"
              class="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20"
              >Atual</span
            >
            <span
              v-else
              class="px-2.5 py-1 text-xs rounded-full bg-slate-500/10 text-slate-400 font-semibold border border-slate-500/20"
              >Inativo</span
            >
          </template>
        </Column>
        <Column header="Acções" style="width: 20%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('year.edit') || p('year.delete')">
              <button
                v-if="p('year.edit')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('year.delete')"
                @click="confirmDeleteYear(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <YearsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="yearStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Ano Letivo"
      :message="`Tem certeza de que deseja eliminar permanentemente o ano letivo <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${yearToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>