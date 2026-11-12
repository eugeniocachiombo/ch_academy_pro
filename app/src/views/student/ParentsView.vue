<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useParentStore, type Parent, type ParentPayload } from '@/stores/parent.store'
import { showNotification } from '@/services/general_service'
import ParentFormModal from './ParentsFormModal.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const parentStore = useParentStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedParent = ref<Parent | null>(null)
const formData = ref<(ParentPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const parentToDeleteId = ref<number | null>(null)
const parentToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await parentStore.list()
  } catch {}
})

const totalCount = computed(() => parentStore.parents.filter((pr: any) => pr != null).length)

const filteredParents = computed(() => {
  return parentStore.parents.filter((pr: any) => {
    if (!pr) return false
    return !searchQuery.value || pr.fullname?.toLowerCase().includes(searchQuery.value.toLowerCase()) || pr.phone?.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  if (!p('parents.create') && !p('parents.manage')) return
  isEditing.value = false
  selectedParent.value = null
  formData.value = { fullname: '', phone: '', phonealt: '', ocupation: '', user_id: 1, school_id: null }
  isModalOpen.value = true
}

const openEditModal = (parent: Parent) => {
  if (!p('parents.update') && !p('parents.manage')) return
  isEditing.value = true
  selectedParent.value = parent
  formData.value = {
    id: parent.id,
    fullname: parent.fullname,
    phone: parent.phone,
    phonealt: parent.phonealt || '',
    ocupation: parent.ocupation || '',
    user_id: parent.user_id,
    school_id: parent.school_id,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedParent.value = null
  formData.value = null
  parentStore.clearError()
}

const handleSaved = async () => {
  await parentStore.list()
  closeModal()
  showNotification('Encarregado guardado com sucesso.', 'success')
}

const confirmDeleteParent = (parent: Parent) => {
  if (!p('parents.delete') && !p('parents.manage')) return
  parentToDeleteId.value = parent.id
  parentToDeleteName.value = parent.fullname
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  parentToDeleteId.value = null
  parentToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!parentToDeleteId.value) return
  isDeleting.value = true

  try {
    await parentStore.remove(parentToDeleteId.value)
    await parentStore.list()

    isDeleteModalOpen.value = false
    parentToDeleteId.value = null
    parentToDeleteName.value = ''

    showNotification('Encarregado eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = parentStore.error || err.message || 'Erro ao eliminar Encarregado.'
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
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Encarregados de Educação 
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira os pais e encarregados de educação da instituição.
        </p>
      </div>
      <button
        v-if="p('parents.create') || p('parents.manage')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Encarregado</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Encarregados</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-user-tie text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome ou telefone..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable"
        :value="filteredParents"
        :loading="parentStore.isLoading"
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
        <Column field="fullname" header="Nome Completo" sortable style="width: 30%">
          <template #body="slotProps">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-user-tie text-xs"></i>
              </div>
              <span class="font-semibold text-slate-900 dark:text-white text-sm">{{ slotProps.data.fullname }}</span>
            </div>
          </template>
        </Column>
        <Column field="phone" header="Telefone" sortable style="width: 20%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.phone }}</span>
          </template>
        </Column>
        <Column field="ocupation" header="Ocupação" sortable style="width: 20%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.ocupation || '-' }}</span>
          </template>
        </Column>
        <Column header="Ações" style="width: 20%">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                v-if="p('parents.update') || p('parents.manage')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Editar"
              >
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                v-if="p('parents.delete') || p('parents.manage')"
                @click="confirmDeleteParent(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <ParentFormModal
      :isOpen="isModalOpen"
      :isEditing="isEditing"
      :isLoading="false"
      :initialData="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :isOpen="isDeleteModalOpen"
      :title="'Eliminar Encarregado'"
      :message="`Tem certeza que deseja eliminar o Encarregado '${parentToDeleteName}'? Esta ação não pode ser desfeita.`"
      :isLoading="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>