<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore, type Student, type StudentPayload } from '@/stores/student.store.js'
import { showNotification } from '@/services/general_service'
import StudentsFormView from './StudentsFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const studentStore = useStudentStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
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

const totalCount = computed(() => studentStore.students.filter((s: any) => s != null).length)

const filteredStudents = computed(() => {
  return studentStore.students.filter((s: any) => {
    if (!s) return false
    const term = searchQuery.value.toLowerCase()
    const nameMatch = s.user?.name?.toLowerCase().includes(term)
    const processMatch = String(s.processnum).includes(term)
    const usernameMatch = s.user?.username?.toLowerCase().includes(term)
    return !searchQuery.value || nameMatch || processMatch || usernameMatch
  })
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
    person: {
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
    },
    user: {
      username: '',
      password: '',
      status: 'ACTIVE'
    }
  }
  isModalOpen.value = true
}

const openEditModal = (student: Student) => {
  if (!p('students.edit')) return
  isEditing.value = true
  selectedStudent.value = student

  const personData = student.user?.person

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
    },
    user: {
      username: student.user?.username || '',
      status: student.user?.status || 'ACTIVE'
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
  await studentStore.list()
  closeModal()
  showNotification('Estudante guardado com sucesso.', 'success')
}

const confirmDeleteStudent = (student: Student) => {
  if (!p('students.delete')) return
  studentToDeleteId.value = student.id
  studentToDeleteName.value = student.user?.name || `Processo #${student.processnum}`
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

    showNotification('Estudante eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = studentStore.error || err.message || 'Erro ao eliminar estudante.'
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
          Estudantes
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gerencie os estudantes matriculados na instituição.
        </p>
      </div>
      <button
        v-if="p('students.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Estudante</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Estudantes</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-user-graduate text-sm"></i>
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
          placeholder="Pesquisar por nome, processo ou utilizador..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable"
        :value="filteredStudents"
        :loading="studentStore.isLoading"
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
        <Column field="processnum" header="Nº Processo" sortable style="width: 15%">
          <template #body="slotProps">
            <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">#{{ slotProps.data.processnum }}</span>
          </template>
        </Column>
        <Column field="user.name" header="Nome Completo" sortable style="width: 30%">
          <template #body="slotProps">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0 font-semibold text-xs">
                <i class="fa-solid fa-user-graduate"></i>
              </div>
              <div class="flex flex-col">
                <span class="font-semibold text-slate-900 dark:text-white text-sm">{{ slotProps.data.user?.name || '-' }}</span>
                <span class="text-[11px] text-slate-400">@{{ slotProps.data.user?.username || 'sem_user' }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column field="user.person.bi_number" header="Nº BI" style="width: 20%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.user?.person?.bi_number || '-' }}</span>
          </template>
        </Column>
        <Column field="phone" header="Telefone" style="width: 15%">
          <template #body="slotProps">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ slotProps.data.phone || slotProps.data.user?.person?.phone || '-' }}</span>
          </template>
        </Column>
        <Column field="user.status" header="Estado" sortable style="width: 10%">
          <template #body="slotProps">
            <span
              v-if="slotProps.data.user?.status === 'ACTIVE'"
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Ativo
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-red-500/10 text-red-500 dark:text-red-400 font-semibold border border-red-500/20"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              {{ slotProps.data.user?.status || 'Inativo' }}
            </span>
          </template>
        </Column>
        <Column header="Ações" style="width: 10%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('students.edit') || p('students.delete')">
              <button
                v-if="p('students.edit')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('students.delete')"
                @click="confirmDeleteStudent(slotProps.data)"
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
      title="Eliminar Estudante"
      :message="`Tem certeza de que deseja eliminar permanentemente o estudante <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${studentToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>