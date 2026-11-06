<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore, type Student, type StudentPayload } from '@/stores/student.store.js'
import { showNotification } from '@/services/general_service'
import StudentsFormView from './StudentsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

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

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INACTIVE', label: 'Inactivos' }
]

onMounted(async () => {
  try {
    await studentStore.list()
  } catch {}
})

const validStudents = computed(() => studentStore.students.filter((s: any) => s != null))

const totalCount = computed(() => validStudents.value.length)
const activeCount = computed(() => validStudents.value.filter((s: any) => s.user?.status === 'ACTIVE').length)
const inactiveCount = computed(() => totalCount.value - activeCount.value)

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
    if (statusFilter.value === 'ACTIVE' && s.user?.status !== 'ACTIVE') return false
    if (statusFilter.value === 'INACTIVE' && s.user?.status === 'ACTIVE') return false
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

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-user-graduate text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-emerald-500/10 border-emerald-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Activos</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <i class="fa-solid fa-circle-check text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ activeCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-red-500/10 border-red-500/40 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inactivos</span>
          <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <i class="fa-solid fa-circle-pause text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ inactiveCount }}</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center gap-4">
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
      <div class="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 self-start lg:self-auto">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          @click="statusFilter = option.value"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all',
            statusFilter === option.value
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          ]"
        >
          {{ option.label }}
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
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum aluno corresponde à pesquisa.</p>
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

        <Column header="Aluno" style="width: 32%">
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

        <Column field="user.status" header="Estado" sortable style="width: 12%">
          <template #body="slotProps">
            <span
              v-if="slotProps.data.user?.status === 'ACTIVE'"
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Activo
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-red-500/10 text-red-500 dark:text-red-400 font-semibold border border-red-500/20"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              Inactivo
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