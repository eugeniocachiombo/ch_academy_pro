<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGroupconfigStore, type Groupconfig, type GroupconfigPayload } from '@/stores/groupconfig.store'
import { showNotification } from '@/services/general_service'
import GroupconfigsFormView from './GroupconfigsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const groupconfigStore = useGroupconfigStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedGroupconfig = ref<Groupconfig | null>(null)
const formData = ref<(GroupconfigPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const groupconfigToDeleteId = ref<number | null>(null)
const groupconfigToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await groupconfigStore.list()
  } catch {}
})

const totalCount = computed(() => groupconfigStore.groupconfigs.filter((g: any) => g != null).length)

const filteredGroupconfigs = computed(() => {
  return groupconfigStore.groupconfigs.filter((g: any) => {
    if (!g) return false
    return (
      !searchQuery.value ||
      g.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
})

const openCreateModal = () => {
  if (!p('groupconfig.create')) return
  isEditing.value = false
  selectedGroupconfig.value = null
  formData.value = {
    name: '',
    year_id: null,
    course_id: null,
    class_id: null,
    period_id: null,
    room_id: null,
    school_id: null,
  }
  isModalOpen.value = true
}

const openEditModal = (groupconfig: Groupconfig) => {
  if (!p('groupconfig.edit')) return
  isEditing.value = true
  selectedGroupconfig.value = groupconfig
  formData.value = {
    id: groupconfig.id,
    name: groupconfig.name,
    year_id: groupconfig.year_id,
    course_id: groupconfig.course_id,
    class_id: groupconfig.class_id,
    period_id: groupconfig.period_id,
    room_id: groupconfig.room_id,
    school_id: groupconfig.school_id,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedGroupconfig.value = null
  formData.value = null
  groupconfigStore.clearError()
}

const handleSaved = async () => {
  await groupconfigStore.list()
  closeModal()
  showNotification('Configuração de turma guardada com sucesso.', 'success')
}

const confirmDeleteGroupconfig = (groupconfig: Groupconfig) => {
  if (!p('groupconfig.delete')) return
  groupconfigToDeleteId.value = groupconfig.id
  groupconfigToDeleteName.value = groupconfig.name
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  groupconfigToDeleteId.value = null
  groupconfigToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!groupconfigToDeleteId.value) return
  isDeleting.value = true
  
  try {
    await groupconfigStore.remove(groupconfigToDeleteId.value)
    await groupconfigStore.list()
    
    isDeleteModalOpen.value = false
    groupconfigToDeleteId.value = null
    groupconfigToDeleteName.value = ''

    showNotification('Configuração de turma eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = groupconfigStore.error || err.message || 'Erro ao eliminar configuração de turma.'
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
          Configurações de Turmas
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure e gira as parametrizações de turmas.
        </p>
      </div>
      <button
        v-if="p('groupconfig.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Nova Configuração</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Configurações</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-sliders text-sm"></i>
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
        :value="filteredGroupconfigs"
        :loading="groupconfigStore.isLoading"
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
        <Column field="name" header="Nome" sortable style="width: 70%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">{{
              slotProps.data.name
            }}</span>
          </template>
        </Column>
        <Column header="Acções" style="width: 30%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('groupconfig.edit') || p('groupconfig.delete')">
              <button
                v-if="p('groupconfig.edit')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('groupconfig.delete')"
                @click="confirmDeleteGroupconfig(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <GroupconfigsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="groupconfigStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Configuração"
      :message="`Tem certeza de que deseja eliminar permanentemente a configuração <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${groupconfigToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>