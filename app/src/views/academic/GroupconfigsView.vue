<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGroupconfigStore, type Groupconfig, type GroupconfigPayload } from '@/stores/groupconfig.store'
import { useYearStore } from '@/stores/year.store'
import { useGroupStore } from '@/stores/group.store'
import { useClassStore } from '@/stores/class.store'
import { useCourseStore } from '@/stores/course.store'
import { usePeriodStore } from '@/stores/period.store'
import { useRoomStore } from '@/stores/room.store'
import { useAuthStore } from '@/stores/auth.store'
import { showNotification } from '@/services/general_service'

import GroupconfigsFormView from './GroupconfigsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'

const groupconfigStore = useGroupconfigStore()
const yearStore = useYearStore()
const groupStore = useGroupStore()
const classStore = useClassStore()
const courseStore = useCourseStore()
const periodStore = usePeriodStore()
const roomStore = useRoomStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const selectedYearFilter = ref<number | null>(null)
const selectedGroupFilter = ref<number | null>(null)
const selectedClassFilter = ref<number | null>(null)
const selectedCourseFilter = ref<number | null>(null)
const selectedPeriodFilter = ref<number | null>(null)
const selectedRoomFilter = ref<number | null>(null)

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
    await Promise.all([
      groupconfigStore.list(),
      yearStore.list(),
      groupStore.list(),
      classStore.list(),
      courseStore.list(),
      periodStore.list(),
      roomStore.list()
    ])

    const activeYear = yearStore.years.find((y: any) => y?.isCurrent)
    if (activeYear) {
      selectedYearFilter.value = activeYear.id
    }
  } catch {}
})

const totalCount = computed(() => filteredGroupconfigs.value.length)

const filteredGroupconfigs = computed(() => {
  return groupconfigStore.groupconfigs.filter((g: any) => {
    if (!g) return false

    if (selectedYearFilter.value && g.year_id !== selectedYearFilter.value) return false
    if (selectedGroupFilter.value && g.group_id !== selectedGroupFilter.value) return false
    if (selectedClassFilter.value && g.class_id !== selectedClassFilter.value) return false
    if (selectedCourseFilter.value && g.course_id !== selectedCourseFilter.value) return false
    if (selectedPeriodFilter.value && g.period_id !== selectedPeriodFilter.value) return false
    if (selectedRoomFilter.value && g.room_id !== selectedRoomFilter.value) return false

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = g.name?.toLowerCase().includes(q)
      const matchGroup = g.group?.name?.toLowerCase().includes(q)
      const matchClass = g.class?.name?.toLowerCase().includes(q)
      const matchCourse = g.course?.name?.toLowerCase().includes(q)
      const matchPeriod = g.period?.name?.toLowerCase().includes(q)
      const matchRoom = g.room?.name?.toLowerCase().includes(q)
      const matchYear = g.year?.name?.toLowerCase().includes(q)

      return matchName || matchGroup || matchClass || matchCourse || matchPeriod || matchRoom || matchYear
    }

    return true
  })
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedGroupFilter.value = null
  selectedClassFilter.value = null
  selectedCourseFilter.value = null
  selectedPeriodFilter.value = null
  selectedRoomFilter.value = null
  
  const activeYear = yearStore.years.find((y: any) => y?.isCurrent)
  selectedYearFilter.value = activeYear ? activeYear.id : null
}

const openCreateModal = () => {
  if (!p('groupconfigs.create')) return
  isEditing.value = false
  selectedGroupconfig.value = null
  formData.value = {
    name: '',
    group_id: null,
    year_id: selectedYearFilter.value || null,
    course_id: null,
    class_id: null,
    period_id: null,
    room_id: null,
    school_id: null,
  }
  isModalOpen.value = true
}

const openEditModal = (groupconfig: Groupconfig) => {
  if (!p('groupconfigs.update')) return
  isEditing.value = true
  selectedGroupconfig.value = groupconfig
  formData.value = {
    id: groupconfig.id,
    name: groupconfig.name,
    group_id: groupconfig.group_id,
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
  if (!p('groupconfigs.delete')) return
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
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configurações de Turmas
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure e gerencie as parametrizações de turmas e salas por período.
        </p>
      </div>
      <button
        v-if="p('groupconfigs.create')"
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
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Encontrado
          </span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-sliders text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-filter text-indigo-500"></i>
          <span>Filtros de Pesquisa</span>
        </h2>
        <button
          @click="clearFilters"
          class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          <i class="fa-solid fa-rotate-right"></i>
          <span>Repor Filtros</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="relative w-full sm:col-span-2 lg:col-span-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisa rápida..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <Select
          v-model="selectedYearFilter"
          :options="yearStore.years"
          optionLabel="name"
          optionValue="id"
          placeholder="Ano Letivo"
          showClear
          filter
          class="w-full text-xs"
        />

        <Select
          v-model="selectedGroupFilter"
          :options="groupStore.groups"
          optionLabel="name"
          optionValue="id"
          placeholder="Todas as Turmas"
          showClear
          filter
          class="w-full text-xs"
        />

        <Select
          v-model="selectedClassFilter"
          :options="classStore.classes"
          optionLabel="name"
          optionValue="id"
          placeholder="Todas as Classes"
          showClear
          filter
          class="w-full text-xs"
        />

        <Select
          v-model="selectedCourseFilter"
          :options="courseStore.courses"
          optionLabel="name"
          optionValue="id"
          placeholder="Todos os Cursos"
          showClear
          filter
          class="w-full text-xs"
        />

        <Select
          v-model="selectedPeriodFilter"
          :options="periodStore.periods"
          optionLabel="name"
          optionValue="id"
          placeholder="Todos os Turnos"
          showClear
          filter
          class="w-full text-xs"
        />

        <Select
          v-model="selectedRoomFilter"
          :options="roomStore.rooms"
          optionLabel="name"
          optionValue="id"
          placeholder="Todas as Salas"
          showClear
          filter
          class="w-full text-xs"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable text-xs"
        :value="filteredGroupconfigs"
        :loading="groupconfigStore.isLoading"
        paginator
        :rows="10"
        tableStyle="min-width: 60rem"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma configuração encontrada com os filtros aplicados.</p>
          </div>
        </template>

        <Column field="name" header="Configuração" sortable style="width: 20%">
          <template #body="slotProps">
            <span class="font-bold text-slate-900 dark:text-white text-xs">
              {{ slotProps.data.name }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 8%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('groupconfigs.update') || p('groupconfigs.delete')">
              <button
                v-if="p('groupconfigs.update')"
                @click="openEditModal(slotProps.data)"
                class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('groupconfigs.delete')"
                @click="confirmDeleteGroupconfig(slotProps.data)"
                class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
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
<style scoped>
  @import '../../mobile.css';
</style>