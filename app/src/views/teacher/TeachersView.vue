<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeacherStore, type Teacher, type TeacherPayload } from '@/stores/teacher.store.js'
import { showNotification } from '@/services/general_service'
import TeachersFormView from './TeachersFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

type UserStatus = 'ACTIVE' | 'BLOCKED'
type StatusFilter = 'ALL' | UserStatus

interface StatusMeta {
  label: string
  plural: string
  icon: string
  badge: string
  dot: string
  card: string
  cardActive: string
  iconBox: string
}

const statusMeta: Record<UserStatus, StatusMeta> = {
  ACTIVE: {
    label: 'Activo',
    plural: 'Activos',
    icon: 'fa-circle-check',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
    card: 'bg-emerald-500/10 border-emerald-500/30',
    cardActive: 'ring-2 ring-emerald-500',
    iconBox: 'bg-emerald-500/10 text-emerald-500'
  },
  BLOCKED: {
    label: 'Bloqueado',
    plural: 'Bloqueados',
    icon: 'fa-ban',
    badge: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20',
    dot: 'bg-red-400',
    card: 'bg-red-500/10 border-red-500/30',
    cardActive: 'ring-2 ring-red-500',
    iconBox: 'bg-red-500/10 text-red-500'
  }
}

const statusKeys: UserStatus[] = ['ACTIVE', 'BLOCKED']

const teacherStore = useTeacherStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('ALL')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedTeacher = ref<Teacher | null>(null)
const formData = ref<(TeacherPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const teacherToDeleteId = ref<number | null>(null)
const teacherToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await teacherStore.list()
  } catch {}
})

const validTeachers = computed(() => teacherStore.teachers.filter((t: any) => t != null))

const totalCount = computed(() => validTeachers.value.length)

const countByStatus = computed(() => {
  const counts: Record<UserStatus, number> = { ACTIVE: 0, BLOCKED: 0 }
  for (const t of validTeachers.value as any[]) {
    const status = t.user?.status as UserStatus | undefined
    if (status && status in counts) counts[status]++
  }
  return counts
})

const filterOptions = computed(() => [
  { value: 'ALL' as StatusFilter, label: 'Todos', count: totalCount.value },
  ...statusKeys.map((key) => ({
    value: key as StatusFilter,
    label: statusMeta[key].plural,
    count: countByStatus.value[key]
  }))
])

const metaOf = (t: any): StatusMeta | null => {
  const status = t?.user?.status as UserStatus | undefined
  return status && statusMeta[status] ? statusMeta[status] : null
}

const toggleStatusFilter = (value: UserStatus) => {
  statusFilter.value = statusFilter.value === value ? 'ALL' : value
}

const fullName = (t: any): string => {
  const person = t?.user?.person
  if (person?.firstname) {
    return [person.firstname, person.middlename, person.lastname].filter(Boolean).join(' ')
  }
  return t?.user?.name || '-'
}

const initials = (t: any): string => {
  const parts = fullName(t).split(' ').filter(Boolean)
  if (!parts.length || parts[0] === '-') return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const hasActiveFilters = computed(() => !!searchQuery.value || statusFilter.value !== 'ALL')

const filteredTeachers = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  return validTeachers.value.filter((t: any) => {
    if (statusFilter.value !== 'ALL' && t.user?.status !== statusFilter.value) return false
    if (!term) return true
    return (
      fullName(t).toLowerCase().includes(term) ||
      String(t.codenumber ?? '').toLowerCase().includes(term) ||
      t.user?.username?.toLowerCase().includes(term) ||
      t.user?.person?.bi_number?.toLowerCase().includes(term) ||
      t.specialty?.toLowerCase().includes(term) ||
      t.degree?.name?.toLowerCase().includes(term)
    )
  })
})

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'ALL'
}

const emptyPerson = () => ({
  firstname: '',
  lastname: '',
  middlename: '',
  birthday: '',
  gender: '',
  bi_number: '',
  nif: '',
  phone: '',
  alternative_phone: '',
  email: '',
  province: '',
  municipality: '',
  neighborhood: '',
  street: '',
  house_number: ''
})

const openCreateModal = () => {
  if (!p('teachers.create')) return
  isEditing.value = false
  selectedTeacher.value = null
  formData.value = {
    codenumber: undefined,
    degree_id: undefined,
    specialty: '',
    school_id: null,
    person: emptyPerson()
  }
  isModalOpen.value = true
}

const openEditModal = (teacher: Teacher) => {
  if (!p('teachers.update')) return
  isEditing.value = true
  selectedTeacher.value = teacher

  const personData: any = (teacher.user as any)?.person

  formData.value = {
    id: teacher.id,
    codenumber: teacher.codenumber,
    degree_id: teacher.degree_id,
    specialty: teacher.specialty || '',
    school_id: teacher.school_id || null,
    person: {
      firstname: personData?.firstname || '',
      lastname: personData?.lastname || '',
      middlename: personData?.middlename || '',
      birthday: personData?.birthday || '',
      gender: personData?.gender || '',
      bi_number: personData?.bi_number || '',
      nif: personData?.nif || '',
      phone: personData?.phone || '',
      alternative_phone: personData?.alternative_phone || '',
      email: personData?.email || '',
      province: personData?.province || '',
      municipality: personData?.municipality || '',
      neighborhood: personData?.neighborhood || '',
      street: personData?.street || '',
      house_number: personData?.house_number || ''
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTeacher.value = null
  formData.value = null
  teacherStore.clearError()
}

const handleSaved = async () => {
  const wasEditing = isEditing.value
  await teacherStore.list()
  closeModal()
  showNotification(
    wasEditing ? 'Dados do professor actualizados com sucesso.' : 'Professor registado com sucesso.',
    'success'
  )
}

const confirmDeleteTeacher = (teacher: Teacher) => {
  if (!p('teachers.delete')) return
  teacherToDeleteId.value = teacher.id
  teacherToDeleteName.value = fullName(teacher) !== '-' ? fullName(teacher) : `Código #${teacher.codenumber}`
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  teacherToDeleteId.value = null
  teacherToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!teacherToDeleteId.value) return
  isDeleting.value = true

  try {
    await teacherStore.remove(teacherToDeleteId.value)
    await teacherStore.list()

    isDeleteModalOpen.value = false
    teacherToDeleteId.value = null
    teacherToDeleteName.value = ''

    showNotification('Professor eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = teacherStore.error || err.message || 'Erro ao eliminar o professor.'
    showNotification(errorMsg, 'error')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Professores
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Consulte, registe e actualize os professores da instituição.
        </p>
      </div>
      <button
        v-if="p('teachers.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Professor</span>
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        type="button"
        @click="statusFilter = 'ALL'"
        :class="[
          'p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/30 shadow-lg text-left transition-all hover:-translate-y-0.5',
          statusFilter === 'ALL' ? 'ring-2 ring-indigo-500' : ''
        ]"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-chalkboard-user text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </button>

      <button
        v-for="key in statusKeys"
        :key="key"
        type="button"
        @click="toggleStatusFilter(key)"
        :title="statusFilter === key ? 'Clique para limpar o filtro' : `Filtrar: ${statusMeta[key].plural}`"
        :class="[
          'p-5 rounded-2xl border shadow-lg text-left transition-all hover:-translate-y-0.5',
          statusMeta[key].card,
          statusFilter === key ? statusMeta[key].cardActive : ''
        ]"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ statusMeta[key].plural }}</span>
          <div :class="['w-9 h-9 rounded-xl flex items-center justify-center', statusMeta[key].iconBox]">
            <i :class="['fa-solid text-sm', statusMeta[key].icon]"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ countByStatus[key] }}</div>
      </button>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col xl:flex-row xl:items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por nome, código, BI, especialidade ou grau..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          title="Limpar pesquisa"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
        >
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
      <div class="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 overflow-x-auto max-w-full">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          @click="statusFilter = option.value"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2',
            statusFilter === option.value
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          ]"
        >
          <span>{{ option.label }}</span>
          <span
            :class="[
              'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              statusFilter === option.value
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            ]"
          >
            {{ option.count }}
          </span>
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable"
        :value="filteredTeachers"
        :loading="teacherStore.isLoading"
        dataKey="id"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
        rowHover
        tableStyle="min-width: 50rem"
      >
        <template #empty>
          <div class="py-14 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-3xl mb-3 opacity-40"></i>
            <template v-if="hasActiveFilters">
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum professor corresponde aos filtros aplicados.</p>
              <button
                type="button"
                @click="clearFilters"
                class="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Limpar filtros
              </button>
            </template>
            <template v-else>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Ainda não há professores registados.</p>
              <button
                v-if="p('teachers.create')"
                type="button"
                @click="openCreateModal"
                class="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Registar o primeiro professor
              </button>
            </template>
          </div>
        </template>

        <Column field="codenumber" header="Código" sortable style="width: 12%">
          <template #body="slotProps">
            <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">#{{ slotProps.data.codenumber }}</span>
          </template>
        </Column>

        <Column header="Professor" style="width: 26%">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                {{ initials(slotProps.data) }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-semibold text-slate-900 dark:text-white text-sm truncate">{{ fullName(slotProps.data) }}</span>
                <span class="text-[11px] text-slate-400 truncate">@{{ slotProps.data.user?.username || 'sem_utilizador' }}</span>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Grau / Especialidade" style="width: 20%">
          <template #body="slotProps">
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{{ slotProps.data.degree?.name || '-' }}</span>
              <span class="text-[11px] text-slate-400 truncate">{{ slotProps.data.specialty || 'Sem especialidade' }}</span>
            </div>
          </template>
        </Column>

        <Column header="Nº do BI" style="width: 14%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.user?.person?.bi_number || '-' }}</span>
          </template>
        </Column>

        <Column field="user.status" header="Estado" sortable style="width: 14%">
          <template #body="slotProps">
            <span
              v-if="metaOf(slotProps.data)"
              :class="['inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-semibold border whitespace-nowrap', metaOf(slotProps.data)!.badge]"
            >
              <span :class="['w-1.5 h-1.5 rounded-full', metaOf(slotProps.data)!.dot]"></span>
              {{ metaOf(slotProps.data)!.label }}
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-slate-500/10 text-slate-500 font-semibold border border-slate-500/20"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {{ slotProps.data.user?.status || 'Sem estado' }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 14%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('teachers.update') || p('teachers.delete')">
              <button
                v-if="p('teachers.update')"
                @click="openEditModal(slotProps.data)"
                title="Editar professor"
                aria-label="Editar professor"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('teachers.delete')"
                @click="confirmDeleteTeacher(slotProps.data)"
                title="Eliminar professor"
                aria-label="Eliminar professor"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <TeachersFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="teacherStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Professor"
      :message="`Tem a certeza de que deseja eliminar permanentemente o professor <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${teacherToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>
<style scoped>
  @import '../../mobile.css';
</style>