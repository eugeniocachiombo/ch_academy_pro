<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePermitionStore, type Permition } from '@/stores/permition.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import PermitionFormView from './PermitionsFormView.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const permitionStore = usePermitionStore()
const userStore = useUserStore()

const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedPermition = ref<Permition | null>(null)
const formData = ref<(any & { id?: number }) | null>(null)

const activeDropdownId = ref<number | null>(null)

onMounted(async () => {
  try {
    await permitionStore.list()
  } catch {}
})

const totalCount = computed(() => permitionStore.permitions.filter((r: any) => r != null).length)

const filteredPermitions = computed(() => {
  return permitionStore.permitions.filter((r: any) => {
    if (!r) return false
    return !searchQuery.value || 
      r.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openCreateModal = () => {
  if (!p('permition.create')) return
  isEditing.value = false
  selectedPermition.value = null
  formData.value = { name: '', description: '' }
  isModalOpen.value = true
}

const openEditModal = (permition: Permition) => {
  if (!p('permition.edit')) return
  isEditing.value = true
  selectedPermition.value = permition
  formData.value = {
    id: permition.id,
    name: permition.name || '',
    description: (permition as any).description || '',
  }
  isModalOpen.value = true
  activeDropdownId.value = null
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPermition.value = null
  formData.value = null
  permitionStore.clearError()
}

const handleSaved = async () => {
  await permitionStore.list()
  closeModal()
  showNotification('Permissão guardada com sucesso.', 'success')
}

const deletePermition = async (id: number) => {
  if (!p('permition.delete')) return
  activeDropdownId.value = null
  if (!confirm('Tem certeza de que deseja eliminar permanentemente esta permissão?')) return

  try {
    await permitionStore.remove(id)
    showNotification('Permissão eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = permitionStore.error || 'Erro ao eliminar permissão.'
    showNotification(errorMsg, 'error')
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Permissões</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure e gira as permissões de acesso do sistema.</p>
      </div>
      <button
        v-if="p('permition.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-key text-sm"></i>
        <span>Nova Permissão</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Permissões</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-key text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome ou descrição da permissão..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <div v-if="permitionStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ permitionStore.error }}</span>
    </div>

    <div class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        :value="filteredPermitions"
        :loading="permitionStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma permissão encontrada.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar permissões...</p>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="width: 10%">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">#{{ slotProps.data.id }}</span>
          </template>
        </Column>

        <Column field="name" header="Nome / Slug" sortable style="width: 25%">
          <template #body="slotProps">
            <span class="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{{ slotProps.data.name }}</span>
          </template>
        </Column>

        <Column field="description" header="Descrição" style="width: 35%">
          <template #body="slotProps">
            <span class="text-slate-600 dark:text-slate-300 text-xs">{{ slotProps.data.description || '-' }}</span>
          </template>
        </Column>

        <Column field="createdAt" header="Criado em" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString() : '-' }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 15%" :exportable="false">
          <template #body="slotProps">
            <div class="text-right relative">
              <div v-if="p('permition.edit') || p('permition.delete')" class="inline-block text-left">
                <button
                  @click="activeDropdownId = activeDropdownId === slotProps.data.id ? null : slotProps.data.id"
                  class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                >
                  <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
                </button>

                <div v-if="activeDropdownId === slotProps.data.id" class="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-20 text-left">
                  <button
                    v-if="p('permition.edit')"
                    @click="openEditModal(slotProps.data)"
                    class="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <i class="fa-solid fa-pen-to-square text-indigo-500 dark:text-indigo-400"></i>
                    <span>Editar Permissão</span>
                  </button>

                  <div v-if="p('permition.edit') && p('permition.delete')" class="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

                  <button
                    v-if="p('permition.delete')"
                    @click="deletePermition(slotProps.data.id)"
                    class="w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                  >
                    <i class="fa-solid fa-trash"></i>
                    <span>Eliminar Permissão</span>
                  </button>
                </div>
              </div>
              <span v-else class="text-xs text-slate-400 italic">Sem acções</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <PermitionFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="permitionStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>