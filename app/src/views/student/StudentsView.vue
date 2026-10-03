<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentStore, type Student } from '@/stores/student.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { useConfirmToast } from '@/components/useConfirmToast'
import ConfirmToast from '@/components/ConfirmToast.vue'
import StudentsFormView from './StudentsFormView.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const studentStore = useStudentStore()
const userStore = useUserStore()
const confirmToast = useConfirmToast('confirm-delete')

const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedStudent = ref<Student | null>(null)
const formData = ref<any | null>(null)

onMounted(async () => {
  try {
    await studentStore.list()
  } catch {}
})

const totalCount = computed(
  () => studentStore.students.filter((r: any) => r != null).length
)

const filteredStudents = computed(() => {
  return studentStore.students.filter((r: any) => {
    if (!r) return false
    const query = searchQuery.value.toLowerCase()
    const fullName = `${r.person?.firstname || ''} ${r.person?.lastname || ''}`.toLowerCase()
    const bi = r.person?.bi_number?.toLowerCase() || ''
    const number = String(r.student_number || '')
    return !query || fullName.includes(query) || bi.includes(query) || number.includes(query)
  })
})

const openCreateModal = () => {
  if (!p('student.create')) return
  isEditing.value = false
  selectedStudent.value = null
  formData.value = {
    firstname: '',
    middlename: '',
    lastname: '',
    birthday: '',
    gender: 'M',
    bi_number: '',
    nif: '',
    phone: '',
    alternative_phone: '',
    email: '',
    province: 'Luanda',
    municipality: '',
    neighborhood: '',
    street: '',
    house_number: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_bi: '',
    origin_school: '',
  }
  isModalOpen.value = true
}

const openEditModal = (student: Student) => {
  if (!p('student.edit')) return
  isEditing.value = true
  selectedStudent.value = student
  formData.value = {
    id: student.id,
    firstname: student.person?.firstname || '',
    middlename: student.person?.middlename || '',
    lastname: student.person?.lastname || '',
    birthday: student.person?.birthday ? student.person.birthday.split('T')[0] : '',
    gender: student.person?.gender || 'M',
    bi_number: student.person?.bi_number || '',
    nif: student.person?.nif || '',
    phone: student.person?.phone || '',
    alternative_phone: student.person?.alternative_phone || '',
    email: student.person?.email || '',
    province: student.person?.province || 'Luanda',
    municipality: student.person?.municipality || '',
    neighborhood: student.person?.neighborhood || '',
    street: student.person?.street || '',
    house_number: student.person?.house_number || '',
    guardian_name: student.guardian_name || '',
    guardian_phone: student.guardian_phone || '',
    guardian_bi: student.guardian_bi || '',
    origin_school: student.origin_school || '',
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

const deleteStudent = async (id: number) => {
  if (!p('student.delete')) return

  try {
    await studentStore.remove(id)
    showNotification('Estudante eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = studentStore.error || 'Erro ao eliminar estudante.'
    showNotification(errorMsg, 'error')
  }
}

const confirmDelete = (student: Student) => {
  if (!p('student.delete')) return
  const fullName = `${student.person?.firstname} ${student.person?.lastname}`

  confirmToast.confirm({
    summary: 'Eliminar estudante',
    detail: `Tem a certeza que deseja eliminar o estudante "${fullName}"?`,
    onAccept: () => deleteStudent(student.id),
  })
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <ConfirmToast
      :group="confirmToast.group"
      @accept="confirmToast.accept"
      @reject="confirmToast.reject"
    />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Alunos
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Diretório e gestão do corpo discente da instituição.
        </p>
      </div>
      <button
        v-if="p('student.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-user-plus text-sm"></i>
        <span>Novo Aluno</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Alunos</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-users text-sm"></i>
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
          placeholder="Pesquisar por nome, nº de processo ou BI..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <div v-if="studentStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ studentStore.error }}</span>
    </div>

    <div class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        :value="filteredStudents"
        :loading="studentStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 60rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-user-slash text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhum aluno encontrado.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar alunos...</p>
          </div>
        </template>

        <Column field="student_number" header="Processo" sortable style="width: 12%">
          <template #body="slotProps">
            <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold">
              #{{ slotProps.data.student_number }}
            </span>
          </template>
        </Column>

        <Column header="Nome Completo" sortable style="width: 30%">
          <template #body="slotProps">
            <div>
              <span class="text-xs font-semibold text-slate-900 dark:text-white block">
                {{ slotProps.data.person?.firstname }} {{ slotProps.data.person?.lastname }}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                BI: {{ slotProps.data.person?.bi_number }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="person.phone" header="Contacto" style="width: 18%">
          <template #body="slotProps">
            <span class="text-xs text-slate-600 dark:text-slate-300 font-mono">
              {{ slotProps.data.person?.phone }}
            </span>
          </template>
        </Column>

        <Column field="guardian_name" header="Encarregado" style="width: 25%">
          <template #body="slotProps">
            <div>
              <span class="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                {{ slotProps.data.guardian_name }}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {{ slotProps.data.guardian_phone }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Acções" style="width: 15%" :exportable="false">
          <template #body="slotProps">
            <div class="flex items-center justify-center">
              <div v-if="p('student.edit') || p('student.delete')" class="inline-flex items-center gap-1.5">
                <button
                  v-if="p('student.edit')"
                  @click="openEditModal(slotProps.data)"
                  class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                  title="Editar Aluno"
                >
                  <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>

                <button
                  v-if="p('student.delete')"
                  @click="confirmDelete(slotProps.data)"
                  class="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                  title="Eliminar Aluno"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
              <span v-else class="text-xs text-slate-400 italic">Sem acções</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <StudentsFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>