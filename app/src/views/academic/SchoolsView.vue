<!-- SchoolsView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSchoolStore, type School, type SchoolPayload } from '@/stores/school.store'
import { showNotification } from '@/services/general_service'
import SchoolsFormView from './SchoolsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const schoolStore = useSchoolStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedSchool = ref<School | null>(null)
const formData = ref<(SchoolPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const schoolToDeleteId = ref<number | null>(null)
const schoolToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await schoolStore.list()
  } catch {}
})

const totalCount = computed(() => schoolStore.schools.filter((s: any) => s != null).length)

const filteredSchools = computed(() => {
  return schoolStore.schools.filter((s: any) => {
    if (!s) return false
    return !searchQuery.value || s.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || (s.email && s.email.toLowerCase().includes(searchQuery.value.toLowerCase()))
  })
})

const openCreateModal = () => {
  if (!p('school.create')) return
  isEditing.value = false
  selectedSchool.value = null
  formData.value = {
    name: '',
    registed_by: null,
    nif: '',
    alternative_phone: '',
    email: '',
    province_id: null,
    municipality_id: null,
  }
  isModalOpen.value = true
}

const openEditModal = (school: School) => {
  if (!p('school.edit')) return
  isEditing.value = true
  selectedSchool.value = school
  formData.value = {
    id: school.id,
    name: school.name,
    registed_by: school.registed_by,
    nif: school.nif,
    alternative_phone: school.alternative_phone,
    email: school.email,
    province_id: school.province_id,
    municipality_id: school.municipality_id,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedSchool.value = null
  formData.value = null
  schoolStore.clearError()
}

const handleSaved = async () => {
  await schoolStore.list()
  closeModal()
  showNotification('Escola guardada com sucesso.', 'success')
}

const confirmDeleteSchool = (school: School) => {
  if (!p('school.delete')) return
  schoolToDeleteId.value = school.id
  schoolToDeleteName.value = school.name
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  schoolToDeleteId.value = null
  schoolToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!schoolToDeleteId.value) return
  isDeleting.value = true

  try {
    await schoolStore.remove(schoolToDeleteId.value)
    await schoolStore.list()

    isDeleteModalOpen.value = false
    schoolToDeleteId.value = null
    schoolToDeleteName.value = ''

    showNotification('Escola eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = schoolStore.error || err.message || 'Erro ao eliminar escola.'
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
          Escolas
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira as instituições escolares do sistema.
        </p>
      </div>
      <button
        v-if="p('school.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Nova Escola</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Escolas</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-school text-sm"></i>
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
          placeholder="Pesquisar por nome ou email..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable"
        :value="filteredSchools"
        :loading="schoolStore.isLoading"
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
        <Column field="name" header="Nome da Escola" sortable style="width: 25%">
          <template #body="slotProps">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-school text-xs"></i>
              </div>
              <span class="font-semibold text-slate-900 dark:text-white text-sm">{{ slotProps.data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="nif" header="NIF" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.nif || '-' }}</span>
          </template>
        </Column>
        <Column field="email" header="Email" sortable style="width: 25%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.email || '-' }}</span>
          </template>
        </Column>
        <Column field="alternative_phone" header="Telefone" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.alternative_phone || '-' }}</span>
          </template>
        </Column>
        <Column header="Ações" style="width: 10%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('school.edit') || p('school.delete')">
              <button
                v-if="p('school.edit')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('school.delete')"
                @click="confirmDeleteSchool(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <SchoolsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="schoolStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Escola"
      :message="`Tem certeza de que deseja eliminar permanentemente a escola <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${schoolToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>
<style scoped>
  @import '../../mobile.css';
</style>