<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore, type Employee, type EmployeePayload } from '@/stores/employee.store'
import { useTeacherStore, type TeacherPayload } from '@/stores/teacher.store.js'
import { showNotification } from '@/services/general_service'
import { extractEmployeePositions, hasPositionNamed } from '@/helpers/employee-positions'
import EmployeesFormView from './EmployeesFormView.vue'
import EmployeeDetail from './EmployeeDetail.vue'
import TeachersFormView from '@/views/teacher/TeachersFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'
import { useAuthStore } from '@/stores/auth.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const employeeStore = useEmployeeStore()
const teacherStore = useTeacherStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const formData = ref<(EmployeePayload & { id?: number }) | null>(null)

const isDetailModalOpen = ref(false)
const employeeToView = ref<Employee | null>(null)

const isTeacherModalOpen = ref(false)
const teacherFormData = ref<(TeacherPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const employeeToDeleteId = ref<number | null>(null)
const employeeToDeleteName = ref('')
const isDeleting = ref(false)

onMounted(async () => {
  await Promise.allSettled([employeeStore.list(), teacherStore.list()])
})

const toId = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

const normalizeBi = (v: any): string =>
  typeof v === 'string' ? v.trim().toLowerCase().replace(/\s/g, '') : ''

const currentSchoolId = computed<number | null>(() =>
  toId((authStore.currentUser as any)?.school_id ?? (authStore.currentUser as any)?.school?.id),
)

const getEmployeeSchoolId = (emp: Employee): number | null =>
  toId(emp.school_id ?? (emp as any).school?.id) ?? currentSchoolId.value

const totalCount = computed(() => employeeStore.employees.filter((emp: any) => emp != null).length)

const getEmployeeLabel = (emp: Employee) => {
  const fullName = [emp.person?.firstname, emp.person?.middlename, emp.person?.lastname]
    .filter(Boolean)
    .join(' ')
  return fullName || `Funcionário #${emp.id}`
}

const getEmployeePositions = (emp: Employee) => extractEmployeePositions(emp)

const hasTeacherPosition = (emp: Employee): boolean => hasPositionNamed(emp, 'professor')

const hasTeacherAccount = (emp: Employee): boolean => {
  const schoolId = getEmployeeSchoolId(emp)

  const person_id = emp?.person?.id;
  const tr = teacherStore.teachers.find((e) => e.user?.person?.id == person_id  && e.school_id == schoolId);

  return tr;
}

const canAssociateTeacher = (emp: Employee): boolean =>
  p('teachers.create') && hasTeacherPosition(emp) && !hasTeacherAccount(emp)

const filteredEmployees = computed(() => {
  return employeeStore.employees.filter((emp: any) => {
    if (!emp) return false
    const q = searchQuery.value.toLowerCase()
    const fullName = getEmployeeLabel(emp).toLowerCase()
    const positionsText = getEmployeePositions(emp)
      .map((pos) => pos.name.toLowerCase())
      .join(' ')
    return (
      !q ||
      fullName.includes(q) ||
      emp.person?.bi_number?.toLowerCase().includes(q) ||
      emp.department?.name?.toLowerCase().includes(q) ||
      positionsText.includes(q)
    )
  })
})

const openDetailModal = (emp: Employee) => {
  employeeToView.value = emp
  isDetailModalOpen.value = true
}

const closeDetailModal = () => {
  isDetailModalOpen.value = false
  employeeToView.value = null
}

const openAssociateTeacherModal = (emp: Employee) => {
  if (!p('teachers.create')) return
  const person = emp.person

  teacherFormData.value = {
    codenumber: undefined,
    degree_id: undefined,
    specialty: '',
    school_id: getEmployeeSchoolId(emp),
    person: {
      id: person?.id ?? null,
      firstname: person?.firstname ?? '',
      middlename: person?.middlename ?? '',
      lastname: person?.lastname ?? '',
      birthday: person?.birthday ? String(person.birthday).split('T')[0] : '',
      gender: person?.gender ?? '',
      bi_number: person?.bi_number ?? '',
      nif: person?.nif ?? person?.bi_number ?? '',
      phone: person?.phone ?? '',
      alternative_phone: person?.alternative_phone ?? '',
      email: person?.email ?? '',
      province: person?.province ?? '',
      municipality: person?.municipality ?? '',
      neighborhood: person?.neighborhood ?? '',
      street: person?.street ?? '',
      house_number: person?.house_number ?? '',
    },
  }
  isTeacherModalOpen.value = true
}

const closeTeacherModal = () => {
  isTeacherModalOpen.value = false
  teacherFormData.value = null
  teacherStore.clearError()
}

const handleTeacherSaved = async () => {
  await Promise.allSettled([teacherStore.list(), employeeStore.list()])
  closeTeacherModal()
  showNotification('Conta de professor associada com sucesso.', 'success')
}

const openCreateModal = () => {
  if (!p('employees.create')) return
  isEditing.value = false
  selectedEmployee.value = null
  formData.value = {
    department_id: null,
    position_id: null,
    position_ids: [],
    person: {
      firstname: '',
      middlename: '',
      lastname: '',
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
      house_number: '',
    },
  }
  isModalOpen.value = true
}

const openEditModal = (emp: Employee) => {
  if (!p('employees.update')) return
  isEditing.value = true
  selectedEmployee.value = emp

  const positions = extractEmployeePositions(emp)
  const positionIds = positions.map((pos) => pos.id)
  const primaryId =
    positions.find((pos) => pos.is_primary)?.id ??
    (emp.position_id ? Number(emp.position_id) : null) ??
    positionIds[0] ??
    null

  formData.value = {
    id: emp.id,
    department_id: emp.department_id ?? null,
    position_id: primaryId,
    position_ids: positionIds,
    person: {
      firstname: emp.person?.firstname ?? '',
      middlename: emp.person?.middlename ?? '',
      lastname: emp.person?.lastname ?? '',
      birthday: emp.person?.birthday ? String(emp.person.birthday).slice(0, 10) : '',
      gender: emp.person?.gender ?? '',
      bi_number: emp.person?.bi_number ?? '',
      nif: emp.person?.nif ?? '',
      phone: emp.person?.phone ?? '',
      alternative_phone: emp.person?.alternative_phone ?? '',
      email: emp.person?.email ?? '',
      province: emp.person?.province ?? '',
      municipality: emp.person?.municipality ?? '',
      neighborhood: emp.person?.neighborhood ?? '',
      street: emp.person?.street ?? '',
      house_number: emp.person?.house_number ?? '',
    },
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedEmployee.value = null
  formData.value = null
  employeeStore.clearError()
}

const handleSaved = async () => {
  await employeeStore.list()
  closeModal()
  showNotification('Funcionário guardado com sucesso.', 'success')
}

const confirmDeleteEmployee = (emp: Employee) => {
  if (!p('employees.delete')) return
  employeeToDeleteId.value = emp.id
  employeeToDeleteName.value = getEmployeeLabel(emp)
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  employeeToDeleteId.value = null
  employeeToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!employeeToDeleteId.value) return
  isDeleting.value = true

  try {
    await employeeStore.remove(employeeToDeleteId.value)
    await employeeStore.list()

    isDeleteModalOpen.value = false
    employeeToDeleteId.value = null
    employeeToDeleteName.value = ''

    showNotification('Funcionário eliminado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = employeeStore.error || err.message || 'Erro ao eliminar funcionário.'
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
          Funcionários
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira os funcionários e respetivos cargos na instituição.
        </p>
      </div>
      <button
        v-if="p('employees.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-plus-circle text-sm"></i>
        <span>Novo Funcionário</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg">
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Total de Funcionários</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-users text-sm"></i>
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
          placeholder="Pesquisar por nome, BI, departamento ou cargo..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
    >
      <DataTable
        class="custom-datatable"
        :value="filteredEmployees"
        :loading="employeeStore.isLoading"
        paginator
        :rows="10"
        tableStyle="min-width: 55rem"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhum registo encontrado.</p>
          </div>
        </template>

        <Column field="person.firstname" header="Funcionário" sortable style="width: 26%">
          <template #body="slotProps">
            <div class="flex flex-col">
              <span class="font-semibold text-slate-900 dark:text-white text-sm">{{
                getEmployeeLabel(slotProps.data)
              }}</span>
              <span v-if="slotProps.data.person?.bi_number" class="text-xs text-slate-500">
                BI: {{ slotProps.data.person.bi_number }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="department.name" header="Departamento" sortable style="width: 18%">
          <template #body="slotProps">
            <span class="text-sm text-slate-600 dark:text-slate-300">{{
              slotProps.data.department?.name || '—'
            }}</span>
          </template>
        </Column>

        <Column header="Cargos" style="width: 28%">
          <template #body="slotProps">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="pos in getEmployeePositions(slotProps.data)"
                :key="pos.id"
                :class="
                  pos.is_primary
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                "
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium border"
              >
                <i v-if="pos.is_primary" class="fa-solid fa-star text-[10px] text-indigo-500"></i>
                <span>{{ pos.name }}</span>
              </span>
              <span
                v-if="!getEmployeePositions(slotProps.data).length"
                class="text-sm text-slate-400"
              >
                —
              </span>
            </div>
          </template>
        </Column>

        <Column header="Acções" style="width: 28%">
          <template #body="slotProps">
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                @click="openDetailModal(slotProps.data)"
                title="Ver ficha"
                aria-label="Ver ficha"
                class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <i class="fa-solid fa-eye text-xs"></i>
              </button>

              <button
                v-if="p('employees.update')"
                @click="openEditModal(slotProps.data)"
                title="Editar funcionário"
                aria-label="Editar funcionário"
                class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>

              <button
                v-if="p('employees.delete')"
                @click="confirmDeleteEmployee(slotProps.data)"
                title="Eliminar funcionário"
                aria-label="Eliminar funcionário"
                class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>

              <button
                v-if="canAssociateTeacher(slotProps.data)"
                type="button"
                @click="openAssociateTeacherModal(slotProps.data)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <i class="fa-solid fa-chalkboard-user text-[11px]"></i>
                <span>Associar uma conta de professor</span>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <EmployeesFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="employeeStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <EmployeeDetail
      :is-open="isDetailModalOpen"
      :employee="employeeToView"
      @close="closeDetailModal"
    />

    <TeachersFormView
      :is-open="isTeacherModalOpen"
      :is-editing="false"
      :is-loading="teacherStore.isLoading"
      :initial-data="teacherFormData"
      @close="closeTeacherModal"
      @saved="handleTeacherSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Funcionário"
      :message="`Tem certeza de que deseja eliminar permanentemente o funcionário <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${employeeToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>
<style scoped>
  @import '../../mobile.css';
</style>