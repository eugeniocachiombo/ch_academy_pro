<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRegisterStore, type Register, type RegisterPayload, RegisterStatus } from '@/stores/register.store'
import { useStudentStore } from '@/stores/student.store'
import { useGroupconfigStore } from '@/stores/groupconfig.store'
import { useYearStore } from '@/stores/year.store'
import { useAuthStore } from '@/stores/auth.store'
import { showNotification } from '@/services/general_service'

import RegistersFormView from './RegistersFormView.vue'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Menu from 'primevue/menu'

const registerStore = useRegisterStore()
const studentStore = useStudentStore()
const groupconfigStore = useGroupconfigStore()
const yearStore = useYearStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)

const searchQuery = ref('')
const selectedYearFilter = ref<number | null>(null)
const selectedStudentFilter = ref<number | null>(null)
const selectedGroupconfigFilter = ref<number | null>(null)
const selectedStatusFilter = ref<string | null>(null)

const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedRegister = ref<Register | null>(null)
const formData = ref<(RegisterPayload & { id?: number }) | null>(null)

const isDeleteModalOpen = ref(false)
const registerToDeleteId = ref<number | null>(null)
const registerToDeleteName = ref('')
const isDeleting = ref(false)

const menuRef = ref<any>(null)
const activeMenuRegister = ref<Register | null>(null)

const statusOptions = [
  { label: 'Activo', value: RegisterStatus.ACTIVE },
  { label: 'Transferido', value: RegisterStatus.TRANSFER },
  { label: 'Desistente', value: RegisterStatus.GIVEUP },
  { label: 'Concluído', value: RegisterStatus.CONCLUD },
  { label: 'Cancelado', value: RegisterStatus.CANCELED },
]

const getStatusLabel = (status: string) => {
  const found = statusOptions.find(s => s.value === status)
  return found ? found.label : status
}

const statusMenuItems = computed(() => {
  return statusOptions.map(opt => ({
    label: opt.label,
    icon: activeMenuRegister.value?.status === opt.value ? 'fa-solid fa-check text-indigo-600' : 'fa-regular fa-circle text-slate-400',
    command: () => {
      if (activeMenuRegister.value) {
        handleStatusChange(activeMenuRegister.value, opt.value)
      }
    }
  }))
})

const toggleStatusMenu = (event: Event, register: Register) => {
  activeMenuRegister.value = register
  if (menuRef.value) {
    menuRef.value.toggle(event)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      registerStore.list(),
      studentStore.list(),
      groupconfigStore.list(),
      yearStore.list(),
    ])

    const activeYear = yearStore.years.find((y: any) => y?.isCurrent)
    if (activeYear) {
      selectedYearFilter.value = activeYear.id
    }
  } catch {}
})

const totalCount = computed(() => filteredRegisters.value.length)

const statusCounts = computed(() => {
  const counts = {
    ACTIVE: 0,
    TRANSFER: 0,
    GIVEUP: 0,
    CONCLUD: 0,
    CANCELED: 0,
  }

  registerStore.registers.forEach((r: any) => {
    if (r && r.status && Object.prototype.hasOwnProperty.call(counts, r.status)) {
      counts[r.status as keyof typeof counts]++
    }
  })

  return counts
})

const filteredRegisters = computed(() => {
  return registerStore.registers.filter((r: any) => {
    if (!r) return false

    if (selectedYearFilter.value && r.year_id !== selectedYearFilter.value) return false
    if (selectedStudentFilter.value && r.student_id !== selectedStudentFilter.value) return false
    if (selectedGroupconfigFilter.value && r.groupconfig_id !== selectedGroupconfigFilter.value) return false
    if (selectedStatusFilter.value && r.status !== selectedStatusFilter.value) return false

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const studentFirstName = r.student?.user?.person?.firstname?.toLowerCase() || ''
      const studentLastName = r.student?.user?.person?.lastname?.toLowerCase() || ''
      const studentFullName = `${studentFirstName} ${studentLastName}`.trim()
      const studentNum = String(r.student?.processnum || '').toLowerCase()
      const registNum = String(r.registnum || '').toLowerCase()
      const groupConfigName = r.groupconfig?.name?.toLowerCase() || ''

      return (
        studentFullName.includes(q) ||
        studentNum.includes(q) ||
        registNum.includes(q) ||
        groupConfigName.includes(q)
      )
    }

    return true
  })
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedStudentFilter.value = null
  selectedGroupconfigFilter.value = null
  selectedStatusFilter.value = null
  
  const activeYear = yearStore.years.find((y: any) => y?.isCurrent)
  selectedYearFilter.value = activeYear ? activeYear.id : null
}

const openCreateModal = () => {
  if (!p('registers.create')) return
  isEditing.value = false
  selectedRegister.value = null
  formData.value = {
    registnum: null,
    student_id: null,
    groupconfig_id: null,
    year_id: selectedYearFilter.value || null,
    date: new Date().toISOString().split('T')[0],
    status: RegisterStatus.ACTIVE,
    school_id: null,
  }
  isModalOpen.value = true
}

const openEditModal = (register: Register) => {
  if (!p('registers.update')) return
  isEditing.value = true
  selectedRegister.value = register
  formData.value = {
    id: register.id,
    registnum: register.registnum,
    student_id: register.student_id,
    groupconfig_id: register.groupconfig_id,
    year_id: register.year_id,
    date: register.date ? register.date.split('T')[0] : null,
    status: register.status,
    school_id: register.school_id,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRegister.value = null
  formData.value = null
  registerStore.clearError()
}

const handleSaved = async () => {
  await registerStore.list()
  closeModal()
  showNotification('Matrícula guardada com sucesso.', 'success')
}

const handleStatusChange = async (register: Register, newStatus: string) => {
  if (!p('registers.update') || !newStatus || register.status === newStatus) return

  try {
    await registerStore.update(register.id, {
      status: newStatus
    })
    await registerStore.list()
    showNotification('Estado da matrícula alterado com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = registerStore.error || err.message || 'Erro ao alterar estado da matrícula.'
    showNotification(errorMsg, 'error')
  }
}

const confirmDeleteRegister = (register: Register) => {
  if (!p('registers.delete')) return
  registerToDeleteId.value = register.id
  const studentName = `${register.student?.user?.person?.firstname || ''} ${register.student?.user?.person?.lastname || ''}`.trim() || 'Estudante'
  registerToDeleteName.value = `Nº Registo: ${register.registnum} (${studentName})`
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  registerToDeleteId.value = null
  registerToDeleteName.value = ''
}

const handleDelete = async () => {
  if (!registerToDeleteId.value) return
  isDeleting.value = true
  
  try {
    await registerStore.remove(registerToDeleteId.value)
    await registerStore.list()
    
    isDeleteModalOpen.value = false
    registerToDeleteId.value = null
    registerToDeleteName.value = ''

    showNotification('Matrícula eliminada com sucesso.', 'success')
  } catch (err: any) {
    const errorMsg = registerStore.error || err.message || 'Erro ao eliminar matrícula.'
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
          Gestão de Matrículas
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Consulte, cadastre e gerencie as matrículas dos estudantes nas turmas configuradas.
        </p>
      </div>
      <button
        v-if="p('registers.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-user-plus text-sm"></i>
        <span>Nova Matrícula</span>
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
          <div class="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <i class="fa-solid fa-user-graduate text-xs"></i>
          </div>
        </div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-2">{{ registerStore.registers.length }}</div>
      </div>

      <div class="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-emerald-500/30 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Activos</span>
          <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <i class="fa-solid fa-user-check text-xs"></i>
          </div>
        </div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-2">{{ statusCounts.ACTIVE }}</div>
      </div>

      <div class="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-amber-500/30 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Transferidos</span>
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <i class="fa-solid fa-right-left text-xs"></i>
          </div>
        </div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-2">{{ statusCounts.TRANSFER }}</div>
      </div>

      <div class="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-amber-500/30 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Desistentes</span>
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <i class="fa-solid fa-user-xmark text-xs"></i>
          </div>
        </div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-2">{{ statusCounts.GIVEUP }}</div>
      </div>

      <div class="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-blue-500/30 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Concluídos</span>
          <div class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <i class="fa-solid fa-award text-xs"></i>
          </div>
        </div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-2">{{ statusCounts.CONCLUD }}</div>
      </div>

      <div class="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-red-500/30 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Cancelados</span>
          <div class="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <i class="fa-solid fa-ban text-xs"></i>
          </div>
        </div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-2">{{ statusCounts.CANCELED }}</div>
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

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div class="relative w-full">
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
          v-model="selectedStudentFilter"
          :options="studentStore.students"
          optionLabel="processnum"
          optionValue="id"
          placeholder="Todos os Estudantes"
          showClear
          filter
          class="w-full text-xs"
        >
          <template #option="slotProps">
            {{ slotProps.option?.user?.person?.firstname }} {{ slotProps.option?.user?.person?.lastname }} ({{ slotProps.option.processnum }})
          </template>
        </Select>

        <Select
          v-model="selectedGroupconfigFilter"
          :options="groupconfigStore.groupconfigs"
          optionLabel="name"
          optionValue="id"
          placeholder="Todas as Turmas"
          showClear
          filter
          class="w-full text-xs"
        />

        <Select
          v-model="selectedStatusFilter"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos os Estados"
          showClear
          class="w-full text-xs"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        class="custom-datatable text-xs"
        :value="filteredRegisters"
        :loading="registerStore.isLoading"
        paginator
        :rows="10"
        tableStyle="min-width: 60rem"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma matrícula encontrada com os filtros aplicados.</p>
          </div>
        </template>

        <Column field="registnum" header="Nº Registo" sortable style="width: 12%">
          <template #body="slotProps">
            <span class="font-bold text-slate-900 dark:text-white text-xs">
              #{{ slotProps.data.registnum }}
            </span>
          </template>
        </Column>

        <Column header="Estudante" sortable style="width: 27%">
          <template #body="slotProps">
            <div class="flex flex-col">
              <span class="font-semibold text-slate-900 dark:text-white text-xs">
                {{ slotProps.data?.student?.user?.person?.firstname }} {{ slotProps.data?.student?.user?.person?.lastname }}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">
                Processo: {{ slotProps.data.student?.processnum || 'N/A' }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Configuração de Turma" style="width: 27%">
          <template #body="slotProps">
            <span class="text-slate-700 dark:text-slate-300 text-xs">
              {{ slotProps.data.groupconfig?.name || 'N/A' }}
            </span>
          </template>
        </Column>

        <Column header="Estado" style="width: 15%">
          <template #body="slotProps">
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="{
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20': slotProps.data.status === 'ACTIVE',
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20': slotProps.data.status === 'TRANSFER' || slotProps.data.status === 'GIVEUP',
                'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20': slotProps.data.status === 'CONCLUD',
                'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20': slotProps.data.status === 'CANCELED'
              }"
            >
              {{ getStatusLabel(slotProps.data.status) }}
            </span>
          </template>
        </Column>

        <Column header="Acções" style="width: 19%">
          <template #body="slotProps">
            <div class="flex items-center gap-1.5" v-if="p('registers.update') || p('registers.delete')">
              <button
                v-if="p('registers.update')"
                @click="(e) => toggleStatusMenu(e, slotProps.data)"
                title="Mudar Estado"
                class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              >
                <i class="fa-solid fa-rotate text-xs"></i>
              </button>
              <button
                v-if="p('registers.update')"
                @click="openEditModal(slotProps.data)"
                title="Editar"
                class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button
                v-if="p('registers.delete')"
                @click="confirmDeleteRegister(slotProps.data)"
                title="Eliminar"
                class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Menu ref="menuRef" :model="statusMenuItems" popup />

    <RegistersFormView
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :is-loading="registerStore.isLoading"
      :initial-data="formData"
      @close="closeModal"
      @saved="handleSaved"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      title="Eliminar Matrícula"
      :message="`Tem certeza de que deseja eliminar permanentemente a matrícula <span class='font-semibold text-slate-800 dark:text-slate-200'>&quot;${registerToDeleteName}&quot;</span>? Esta acção não pode ser desfeita.`"
      :is-deleting="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>