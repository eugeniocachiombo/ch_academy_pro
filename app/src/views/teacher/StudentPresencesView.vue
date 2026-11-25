<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useStudentPresenceStore,
  type StudentPresence,
  type StudentPresencePayload,
} from '@/stores/student-presence.store'
import { showNotification } from '@/services/general_service'
import StudentPresencesFormView from './StudentPresencesFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const presenceStore = useStudentPresenceStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedPresence = ref<StudentPresence | null>(null)
const formData = ref<(StudentPresencePayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const presenceToDeleteId = ref<number | null>(null)
const presenceToDeleteLabel = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await presenceStore.list()
  } catch {}
})

const totalCount = computed(() => presenceStore.presences.filter((item: any) => item != null).length)

const filteredPresences = computed(() => {
  return presenceStore.presences.filter((item: any) => {
    if (!item) return false
    const q = searchQuery.value.toLowerCase()
    if (!q) return true
    return (
      item.groupconfig?.name?.toLowerCase().includes(q) ||
      item.subject?.name?.toLowerCase().includes(q) ||
      item.teacher?.user?.name?.toLowerCase().includes(q) ||
      item.teacher?.codenumber?.toLowerCase().includes(q)
    )
  })
})

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getSummary = (item: StudentPresence) => {
  const list = item.student_presence_lists || []
  const present = list.filter((l) => l.status === 'PRESENT').length
  const absent = list.filter((l) => l.status === 'ABSENT').length
  const justified = list.filter((l) => l.status === 'JUSTIFICATED').length
  return { present, absent, justified, total: list.length }
}

const openCreateModal = () => {
  if (!p('student-presences.create')) return
  isEditing.value = false
  selectedPresence.value = null
  formData.value = {
    date: new Date().toISOString().slice(0, 10),
    groupconfig_id: null,
    teacher_id: null,
    subject_id: null,
    school_id: null,
  }
  isModalOpen.value = true
}

const openEditModal = (presence: StudentPresence) => {
  if (!p('student-presences.update')) return
  isEditing.value = true
  selectedPresence.value = presence
  formData.value = {
    id: presence.id,
    date: presence.date ? new Date(presence.date).toISOString().slice(0, 10) : '',
    groupconfig_id: presence.groupconfig_id,
    teacher_id: presence.teacher_id,
    subject_id: presence.subject_id,
    school_id: presence.school_id ?? null,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPresence.value = null
  formData.value = null
  presenceStore.clearError()
}

const handleSaved = async () => {
  await presenceStore.list()
  closeModal()
  showNotification('Lista de presenças guardada com sucesso.', 'success')
}

const confirmDeletePresence = (presence: StudentPresence) => {
  if (!p('student-presences.delete')) return
  presenceToDeleteId.value = presence.id
  presenceToDeleteLabel.value = `${presence.groupconfig?.name || 'Turma'} - ${presence.subject?.name || 'Disciplina'} (${formatDate(presence.date)})`
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  presenceToDeleteId.value = null
  presenceToDeleteLabel.value = ''
}

const handleDelete = async () => {
  if (!presenceToDeleteId.value) return
  isDeleting.value = true

  try {
    await presenceStore.remove(presenceToDeleteId.value)
    await presenceStore.list()

    isDeleteModalOpen.value = false
    presenceToDeleteId.value = null
    presenceToDeleteLabel.value = ''

    showNotification('Registo de presença eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = presenceStore.error || err.message || 'Erro ao eliminar registo de presença.'
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
          Presenças de Alunos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Registe e acompanhe a assiduidade por turma, disciplina e professor.
        </p>
      </div>
      <button
        v-if="p('student-presences.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Nova Chamada</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Chamadas</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-clipboard-user text-sm"></i>
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
          placeholder="Pesquisar por turma, disciplina ou professor..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        class="custom-datatable"
        :value="filteredPresences"
        :loading="presenceStore.isLoading"
        paginator
        :rows="10"
        tableStyle="min-width: 55rem"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhum registo de presença encontrado.</p>
          </div>
        </template>

        <Column field="date" header="Data" sortable style="width: 13%">
          <template #body="slotProps">
            <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {{ formatDate(slotProps.data.date) }}
            </span>
          </template>
        </Column>

        <Column header="Turma" sortable field="groupconfig.name" style="width: 22%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-sm">
              {{ slotProps.data.groupconfig?.name || '—' }}
            </span>
          </template>
        </Column>

        <Column header="Disciplina" sortable field="subject.name" style="width: 22%">
          <template #body="slotProps">
            <span class="text-sm text-slate-700 dark:text-slate-300">
              {{ slotProps.data.subject?.name || '—' }}
            </span>
          </template>
        </Column>

        <Column header="Professor" sortable field="teacher.user.name" style="width: 20%">
          <template #body="slotProps">
            <span class="text-xs text-slate-600 dark:text-slate-400">
              {{ slotProps.data.teacher?.user?.name || slotProps.data.teacher?.codenumber || '—' }}
            </span>
          </template>
        </Column>

        <Column header="Resumo" style="width: 13%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5 text-[11px] font-semibold">
              <span class="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                P: {{ getSummary(slotProps.data).present }}
              </span>
              <span class="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                F: {{ getSummary(slotProps.data).absent }}
              </span>
              <span class="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                J: {{ getSummary(slotProps.data).justified }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Acções" style="width: 10%">
          <template #body="slotProps">
            <div
              class="flex items-center gap-1.5"
              v-if="p('student-presences.update') || p('student-presences.delete')"
            >
              <button
                v-if="p('student-presences.update')"
                @click="openEditModal(slotProps.data)"
                title="Gerir chamada"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('student-presences.delete')"
                @click="confirmDeletePresence(slotProps.data)"
                title="Eliminar chamada"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <StudentPresencesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="presenceStore.isLoading"
      :initial-data="formData"
      :existing-presence="selectedPresence"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Registo de Presença"
      :message="`Tem certeza de que deseja eliminar permanentemente a chamada <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${presenceToDeleteLabel}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
@import '../../mobile.css';
</style>