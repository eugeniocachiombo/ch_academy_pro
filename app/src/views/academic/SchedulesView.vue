<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore, type Schedule } from '@/stores/schedule.store'
import { showNotification } from '@/services/general_service'
import SchedulessFormView from './SchedulesFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const scheduleStore = useScheduleStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedSchedule = ref<Schedule | null>(null)
const formData = ref<any | null>(null)

const isDeleteModalOpen = ref(false)
const scheduleToDeleteId = ref<number | null>(null)
const scheduleToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await scheduleStore.list()
  } catch {}
})

const totalCount = computed(() => scheduleStore.schedules.filter((s: any) => s != null).length)

const filteredSchedules = computed(() => {
  return scheduleStore.schedules.filter((s: any) => {
    if (!s) return false
    const subjectName = s.subject?.name?.toLowerCase() || ''
    const teacherName = s.teacher?.user?.name?.toLowerCase() || ''
    const query = searchQuery.value.toLowerCase()
    return !searchQuery.value || subjectName.includes(query) || teacherName.includes(query) || s.day_of_week?.toLowerCase().includes(query)
  })
})

const formatDay = (day: string) => {
  const days: Record<string, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado'
  }
  return days[day] || day
}

const openCreateModal = () => {
  if (!p('schedules.create')) return
  isEditing.value = false
  selectedSchedule.value = null
  formData.value = {
    groupconfig_id: null,
    subject_id: null,
    teacher_id: null,
    day_of_week: 'MONDAY',
    start_time: '',
    end_time: '',
    school_id: null
  }
  isModalOpen.value = true
}

const openEditModal = (schedule: Schedule) => {
  if (!p('schedules.update')) return
  isEditing.value = true
  selectedSchedule.value = schedule
  formData.value = {
    id: schedule.id,
    groupconfig_id: schedule.groupconfig_id,
    subject_id: schedule.subject_id,
    teacher_id: schedule.teacher_id,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    school_id: schedule.school_id
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedSchedule.value = null
  formData.value = null
  scheduleStore.clearError()
}

const handleSaved = async () => {
  await scheduleStore.list()
  closeModal()
  showNotification('Horário guardado com sucesso.', 'success')
}

const confirmDeleteSchedule = (schedule: Schedule) => {
  if (!p('schedules.delete')) return
  scheduleToDeleteId.value = schedule.id
  scheduleToDeleteName.value = `${schedule.subject?.name || 'Disciplina'} (${formatDay(schedule.day_of_week)})`
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  scheduleToDeleteId.value = null
  scheduleToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!scheduleToDeleteId.value) return
  isDeleting.value = true

  try {
    await scheduleStore.remove(scheduleToDeleteId.value)
    await scheduleStore.list()

    isDeleteModalOpen.value = false
    scheduleToDeleteId.value = null
    scheduleToDeleteName.value = ''

    showNotification('Horário eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = scheduleStore.error || err.message || 'Erro ao eliminar horário.'
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
          Horários
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira a grelha de horários da instituição.
        </p>
      </div>
      <button
        v-if="p('schedules.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Horário</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Horários</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-clock text-sm"></i>
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
          placeholder="Pesquisar por disciplina, professor ou dia..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable"
        :value="filteredSchedules"
        :loading="scheduleStore.isLoading"
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
        <Column field="id" header="ID" sortable style="width: 8%">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-500">#{{ slotProps.data.id }}</span>
          </template>
        </Column>
        <Column field="groupconfig" header="Turma / Sala / Turno" style="width: 22%">
          <template #body="slotProps">
            <div class="text-xs font-semibold text-slate-900 dark:text-white">
              {{ slotProps.data.groupconfig?.class?.name || '-' }} ({{ slotProps.data.groupconfig?.group?.name || '-' }})
            </div>
            <div class="text-[11px] text-slate-500">
              Sala: {{ slotProps.data.groupconfig?.room?.name || '-' }} | Turno: {{ slotProps.data.groupconfig?.period?.name || '-' }}
            </div>
          </template>
        </Column>
        <Column field="subject" header="Disciplina" sortable style="width: 20%">
          <template #body="slotProps">
            <span class="font-semibold text-slate-900 dark:text-white text-xs">{{ slotProps.data.subject?.name || '-' }}</span>
          </template>
        </Column>
        <Column field="teacher" header="Professor" style="width: 20%">
          <template #body="slotProps">
            <span class="text-xs text-slate-700 dark:text-slate-300">{{ slotProps.data.teacher?.user?.name || '-' }}</span>
          </template>
        </Column>
        <Column field="day_of_week" header="Dia & Horas" sortable style="width: 15%">
          <template #body="slotProps">
            <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ formatDay(slotProps.data.day_of_week) }}</div>
            <div class="text-[11px] text-slate-500">{{ slotProps.data.start_time }} - {{ slotProps.data.end_time }}</div>
          </template>
        </Column>
        <Column header="Ações" style="width: 10%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('schedules.update') || p('schedules.delete')">
              <button
                v-if="p('schedules.update')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('schedules.delete')"
                @click="confirmDeleteSchedule(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <SchedulessFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Horário"
      :message="`Tem certeza de que deseja eliminar o horário de <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${scheduleToDeleteName}&quot;</span>?`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>
<style scoped>
  @import '../../mobile.css';
</style>