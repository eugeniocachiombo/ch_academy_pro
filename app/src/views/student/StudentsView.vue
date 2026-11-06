<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore, type Student, type StudentPayload } from '@/stores/student.store.js'
import { showNotification } from '@/services/general_service'
import StudentsFormView from './StudentsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

type UserStatus = 'ACTIVE' | 'INDEBT' | 'GIVEUP' | 'BLOCKED'
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
  INDEBT: {
    label: 'Em dívida',
    plural: 'Em dívida',
    icon: 'fa-hand-holding-dollar',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
    card: 'bg-amber-500/10 border-amber-500/30',
    cardActive: 'ring-2 ring-amber-500',
    iconBox: 'bg-amber-500/10 text-amber-500'
  },
  GIVEUP: {
    label: 'Desistente',
    plural: 'Desistentes',
    icon: 'fa-person-walking-arrow-right',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400',
    card: 'bg-slate-500/10 border-slate-500/30',
    cardActive: 'ring-2 ring-slate-500',
    iconBox: 'bg-slate-500/10 text-slate-500'
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

const statusKeys: UserStatus[] = ['ACTIVE', 'INDEBT', 'GIVEUP', 'BLOCKED']

const studentStore = useStudentStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('ALL')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedStudent = ref<Student | null>(null)
const formData = ref<(StudentPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const studentToDeleteId = ref<number | null>(null)
const studentToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  try {
    await studentStore.list()
  } catch {}
})

const validStudents = computed(() => studentStore.students.filter((s: any) => s != null))

const totalCount = computed(() => validStudents.value.length)

const countByStatus = computed(() => {
  const counts: Record<UserStatus, number> = { ACTIVE: 0, INDEBT: 0, GIVEUP: 0, BLOCKED: 0 }
  for (const s of validStudents.value as any[]) {
    const status = s.user?.status as UserStatus | undefined
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

const metaOf = (s: any): StatusMeta | null => {
  const status = s?.user?.status as UserStatus | undefined
  return status && statusMeta[status] ? statusMeta[status] : null
}

const toggleStatusFilter = (value: UserStatus) => {
  statusFilter.value = statusFilter.value === value ? 'ALL' : value
}

const fullName = (s: any): string => {
  const person = s?.user?.person
  if (person?.firstname) {
    return [person.firstname, person.middlename, person.lastname].filter(Boolean).join(' ')
  }
  return s?.user?.name || '-'
}

const initials = (s: any): string => {
  const parts = fullName(s).split(' ').filter(Boolean)
  if (!parts.length || parts[0] === '-') return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const hasActiveFilters = computed(() => !!searchQuery.value || statusFilter.value !== 'ALL')

const filteredStudents = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  return validStudents.value.filter((s: any) => {
    if (statusFilter.value !== 'ALL' && s.user?.status !== statusFilter.value) return false
    if (!term) return true
    return (
      fullName(s).toLowerCase().includes(term) ||
      String(s.processnum ?? '').toLowerCase().includes(term) ||
      s.user?.username?.toLowerCase().includes(term) ||
      s.user?.person?.bi_number?.toLowerCase().includes(term)
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
  if (!p('students.create')) return
  isEditing.value = false
  selectedStudent.value = null
  formData.value = {
    processnum: undefined,
    phone: '',
    address: '',
    fathername: '',
    mothername: '',
    origin_school: '',
    school_id: null,
    person: emptyPerson()
  }
  isModalOpen.value = true
}

const openEditModal = (student: Student) => {
  if (!p('students.update')) return
  isEditing.value = true
  selectedStudent.value = student

  const personData: any = (student.user as any)?.person

  formData.value = {
    id: student.id,
    processnum: student.processnum,
    phone: student.phone || '',
    address: student.address || '',
    fathername: student.fathername || '',
    mothername: student.mothername || '',
    origin_school: student.origin_school || '',
    school_id: student.school_id || null,
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
  selectedStudent.value = null
  formData.value = null
  studentStore.clearError()
}

const handleSaved = async () => {
  const wasEditing = isEditing.value
  await studentStore.list()
  closeModal()
  showNotification(
    wasEditing ? 'Dados do aluno actualizados com sucesso.' : 'Aluno registado com sucesso.',
    'success'
  )
}

const confirmDeleteStudent = (student: Student) => {
  if (!p('students.delete')) return
  studentToDeleteId.value = student.id
  studentToDeleteName.value = fullName(student) !== '-' ? fullName(student) : `Processo #${student.processnum}`
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  studentToDeleteId.value = null
  studentToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!studentToDeleteId.value) return
  isDeleting.value = true

  try {
    await studentStore.remove(studentToDeleteId.value)
    await studentStore.list()

    isDeleteModalOpen.value = false
    studentToDeleteId.value = null
    studentToDeleteName.value = ''

    showNotification('Aluno eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = studentStore.error || err.message || 'Erro ao eliminar o aluno.'
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
          Alunos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Consulte, registe e actualize os alunos matriculados na instituição.
        </p>
      </div>
      <button
        v-if="p('students.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Aluno</span>
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            <i class="fa-solid fa-user-graduate text-sm"></i>
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
          placeholder="Pesquisar por nome, nº de processo, BI ou utilizador..."
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
        :value="filteredStudents"
        :loading="studentStore.isLoading"
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
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum aluno corresponde aos filtros aplicados.</p>
              <button
                type="button"
                @click="clearFilters"
                class="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Limpar filtros
              </button>
            </template>
            <template v-else>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Ainda não há alunos registados.</p>
              <button
                v-if="p('students.create')"
                type="button"
                @click="openCreateModal"
                class="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Registar o primeiro aluno
              </button>
            </template>
          </div>
        </template>

        <Column field="processnum" header="Nº Processo" sortable style="width: 14%">
          <template #body="slotProps">
            <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">#{{ slotProps.data.processnum }}</span>
          </template>
        </Column>

        <Column header="Aluno" style="width: 30%">
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

        <Column header="Nº do BI" style="width: 18%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.user?.person?.bi_number || '-' }}</span>
          </template>
        </Column>

        <Column header="Telemóvel" style="width: 14%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.phone || slotProps.data.user?.person?.phone || '-' }}</span>
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

        <Column header="Acções" style="width: 10%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('students.update') || p('students.delete')">
              <button
                v-if="p('students.update')"
                @click="openEditModal(slotProps.data)"
                title="Editar aluno"
                aria-label="Editar aluno"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('students.delete')"
                @click="confirmDeleteStudent(slotProps.data)"
                title="Eliminar aluno"
                aria-label="Eliminar aluno"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <StudentsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="studentStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Aluno"
      :message="`Tem a certeza de que deseja eliminar permanentemente o aluno <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${studentToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>