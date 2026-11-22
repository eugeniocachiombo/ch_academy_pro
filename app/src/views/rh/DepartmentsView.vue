<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDepartmentStore, type Department, type DepartmentPayload } from '@/stores/department.store'
import { showNotification } from '@/services/general_service'
import DepartmentsFormView from './DepartmentsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const departmentStore = useDepartmentStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedDepartment = ref<Department | null>(null)
const formData = ref<(DepartmentPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const departmentToDeleteId = ref<number | null>(null)
const departmentToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await departmentStore.list()
  } catch {}
})

const totalCount = computed(() => departmentStore.departments.filter((d: any) => d != null).length)

const filteredDepartments = computed(() => {
  return departmentStore.departments.filter((d: any) => {
    if (!d) return false
    return (
      !searchQuery.value ||
      d.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
})

const openCreateModal = () => {
  if (!p('departments.create')) return
  isEditing.value = false
  selectedDepartment.value = null
  formData.value = { name: '' }
  isModalOpen.value = true
}

const openEditModal = (dept: Department) => {
  if (!p('departments.update')) return
  isEditing.value = true
  selectedDepartment.value = dept
  formData.value = {
    id: dept.id,
    name: dept.name,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedDepartment.value = null
  formData.value = null
  departmentStore.clearError()
}

const handleSaved = async () => {
  await departmentStore.list()
  closeModal()
  showNotification('Departamento guardado com sucesso.', 'success')
}

const confirmDeleteDepartment = (dept: Department) => {
  if (!p('departments.delete')) return
  departmentToDeleteId.value = dept.id
  departmentToDeleteName.value = dept.name
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  departmentToDeleteId.value = null
  departmentToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!departmentToDeleteId.value) return
  isDeleting.value = true

  try {
    await departmentStore.remove(departmentToDeleteId.value)
    await departmentStore.list()

    isDeleteModalOpen.value = false
    departmentToDeleteId.value = null
    departmentToDeleteName.value = ''

    showNotification('Departamento eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = departmentStore.error || err.message || 'Erro ao eliminar departamento.'
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
          Departamentos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira os departamentos existentes na instituição.
        </p>
      </div>
      <button
        v-if="p('departments.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Departamento</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Departamentos</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-building text-sm"></i>
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
          placeholder="Pesquisar por nome..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        class="custom-datatable"
        :value="filteredDepartments"
        :loading="departmentStore.isLoading"
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
        <Column field="name" header="Nome do Departamento" sortable style="width: 80%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">{{
              slotProps.data.name
            }}</span>
          </template>
        </Column>
        <Column header="Acções" style="width: 20%">
          <template #body="slotProps">
            <div
              class="flex items-center gap-1.5"
              v-if="p('departments.update') || p('departments.delete')"
            >
              <button
                v-if="p('departments.update') && slotProps.data.editable !== false"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('departments.delete') && slotProps.data.editable !== false"
                @click="confirmDeleteDepartment(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <DepartmentsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="departmentStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Departamento"
      :message="`Tem certeza de que deseja eliminar permanentemente o departamento <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${departmentToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>
<style scoped>
  @import '../../mobile.css';
</style>