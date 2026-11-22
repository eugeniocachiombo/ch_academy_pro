<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePositionStore, type Position, type PositionPayload } from '@/stores/position.store'
import { showNotification } from '@/services/general_service'
import PositionsFormView from './PositionsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const positionStore = usePositionStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedPosition = ref<Position | null>(null)
const formData = ref<(PositionPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const positionToDeleteId = ref<number | null>(null)
const positionToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await positionStore.list()
  } catch {}
})

const totalCount = computed(() => positionStore.positions.filter((pos: any) => pos != null).length)

const filteredPositions = computed(() => {
  return positionStore.positions.filter((pos: any) => {
    if (!pos) return false
    const q = searchQuery.value.toLowerCase()
    return (
      !q ||
      pos.name?.toLowerCase().includes(q) ||
      pos.department?.name?.toLowerCase().includes(q)
    )
  })
})

const openCreateModal = () => {
  if (!p('positions.create')) return
  isEditing.value = false
  selectedPosition.value = null
  formData.value = { name: '', department_id: null }
  isModalOpen.value = true
}

const openEditModal = (pos: Position) => {
  if (!p('positions.update')) return
  isEditing.value = true
  selectedPosition.value = pos
  formData.value = {
    id: pos.id,
    name: pos.name,
    department_id: pos.department_id ?? null,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPosition.value = null
  formData.value = null
  positionStore.clearError()
}

const handleSaved = async () => {
  await positionStore.list()
  closeModal()
  showNotification('Cargo guardado com sucesso.', 'success')
}

const confirmDeletePosition = (pos: Position) => {
  if (!p('positions.delete')) return
  positionToDeleteId.value = pos.id
  positionToDeleteName.value = pos.name
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  positionToDeleteId.value = null
  positionToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!positionToDeleteId.value) return
  isDeleting.value = true

  try {
    await positionStore.remove(positionToDeleteId.value)
    await positionStore.list()

    isDeleteModalOpen.value = false
    positionToDeleteId.value = null
    positionToDeleteName.value = ''

    showNotification('Cargo eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = positionStore.error || err.message || 'Erro ao eliminar cargo.'
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
          Cargos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira os cargos existentes na instituição.
        </p>
      </div>
      <button
        v-if="p('positions.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Cargo</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Cargos</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-briefcase text-sm"></i>
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
          placeholder="Pesquisar por nome ou departamento..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        class="custom-datatable"
        :value="filteredPositions"
        :loading="positionStore.isLoading"
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
        <Column field="name" header="Nome do Cargo" sortable style="width: 45%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">{{
              slotProps.data.name
            }}</span>
          </template>
        </Column>
        <Column field="department.name" header="Departamento" sortable style="width: 35%">
          <template #body="slotProps">
            <span class="text-sm text-slate-600 dark:text-slate-300">{{
              slotProps.data.department?.name || '—'
            }}</span>
          </template>
        </Column>
        <Column header="Acções" style="width: 20%">
          <template #body="slotProps">
            <div
              class="flex items-center gap-1.5"
              v-if="p('positions.update') || p('positions.delete')"
            >
              <button
                v-if="p('positions.update') && slotProps.data.editable !== false"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('positions.delete') && slotProps.data.editable !== false"
                @click="confirmDeletePosition(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <PositionsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="positionStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Cargo"
      :message="`Tem certeza de que deseja eliminar permanentemente o cargo <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${positionToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>
<style scoped>
  @import '../../mobile.css';
</style>