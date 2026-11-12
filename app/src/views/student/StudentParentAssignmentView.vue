<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useParentStore } from '@/stores/parent.store'
import { useStudentparentStore } from '@/stores/studentparent.store'
import { useStudentStore } from '@/stores/student.store'
import { useAuthStore } from '@/stores/auth.store'
import ParentFormModal from './ParentsFormModal.vue'

type Id = number | string

const parentStore = useParentStore()
const studentparentStore = useStudentparentStore()
const studentStore = useStudentStore()
const authStore = useAuthStore()

const p = (name: string) => authStore.getPermition(name)
const canEdit = () => p('studentparents.update') || p('studentparents.manage') || p('parents.manage')

const same = (a: Id, b: Id) => String(a) === String(b)

const selectedParentId = ref<Id | null>(null)

const assignmentMap = ref<Record<string, Id[]>>({}) 
const originalAssignmentMap = ref<Record<string, Id[]>>({})

const parentSearchQuery = ref('')
const studentSearchQuery = ref('')
const internalLoading = ref(false)
const globalError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedParentForEdit = ref<any | null>(null)
const formData = ref<any | null>(null)

const studentFullName = (s: any): string => {
  const person = s?.user?.person
  if (person?.firstname) {
    return [person.firstname, person.middlename, person.lastname].filter(Boolean).join(' ')
  }
  return s?.user?.name || '-'
}

const buildMapping = () => {
  const mapping: Record<string, Id[]> = {}
  studentparentStore.studentparents.forEach((sp: any) => {
    const pId = String(sp.parent_id)
    const sId = sp.student_id

    if (sId == null) return

    if (!mapping[pId]) mapping[pId] = []
    mapping[pId].push(sId)
  })
  assignmentMap.value = JSON.parse(JSON.stringify(mapping))
  originalAssignmentMap.value = JSON.parse(JSON.stringify(mapping))
}

onMounted(async () => {
  try {
    await Promise.all([
      parentStore.list(),
      studentparentStore.list(),
      studentStore.list()
    ])

    if (parentStore.parents.length > 0) {
      selectedParentId.value = parentStore.parents[0].id
    }

    buildMapping()
  } catch {}
})

const totalParentsCount = computed(() => parentStore.parents.filter((p: any) => p != null).length)
const totalStudentsCount = computed(() => studentStore.students.filter((s: any) => s != null).length)

const filteredParents = computed(() => {
  const q = parentSearchQuery.value.toLowerCase()
  return parentStore.parents.filter((parent: any) => {
    if (!parent) return false
    const name = parent.fullname || ''
    return !q || name.toLowerCase().includes(q) || String(parent.phone || '').toLowerCase().includes(q)
  })
})

const currentParent = computed(() => {
  if (selectedParentId.value == null) return null
  return parentStore.parents.find((p: any) => same(p.id, selectedParentId.value!)) || null
})

const filteredStudents = computed(() => {
  const q = studentSearchQuery.value.toLowerCase()
  return studentStore.students.filter((std: any) => {
    if (!std) return false
    const name = studentFullName(std).toLowerCase()
    const processNum = String(std.processnum || '').toLowerCase()
    const biNumber = String(std.user?.person?.bi_number || '').toLowerCase()
    return !q || name.includes(q) || processNum.includes(q) || biNumber.includes(q)
  })
})

const isStudentAssigned = (studentId: Id) => {
  if (selectedParentId.value == null) return false
  const assigned = assignmentMap.value[String(selectedParentId.value)] || []
  return assigned.some(id => same(id, studentId))
}

const toggleStudent = (studentId: Id) => {
  const pId = selectedParentId.value
  if (pId == null || !canEdit()) return

  globalError.value = null
  successMessage.value = null

  const key = String(pId)
  const currentAssigned = assignmentMap.value[key] || []
  if (currentAssigned.some(id => same(id, studentId))) {
    assignmentMap.value[key] = currentAssigned.filter(id => !same(id, studentId))
  } else {
    assignmentMap.value[key] = [...currentAssigned, studentId]
  }
}

const openCreateModal = () => {
  isEditing.value = false
  selectedParentForEdit.value = null
  formData.value = { fullname: '', phone: '', phonealt: '', ocupation: '', school_id: null }
  isModalOpen.value = true
}

const handleSaved = async () => {
  await parentStore.list()
  isModalOpen.value = false
  successMessage.value = 'Encarregado guardado com sucesso!'
  setTimeout(() => { successMessage.value = null }, 4000)
}

const saveChanges = async () => {
  const pId = selectedParentId.value
  if (pId == null || !canEdit()) return

  internalLoading.value = true
  globalError.value = null
  successMessage.value = null

  try {
    const key = String(pId)
    const currentSelected = assignmentMap.value[key] || []
    const originalSelected = originalAssignmentMap.value[key] || []

    const toAdd = currentSelected.filter(studentId => !originalSelected.some(o => same(o, studentId)))
    const toRemove = originalSelected.filter(studentId => !currentSelected.some(c => same(c, studentId)))

    for (const studentId of toRemove) {
      const found = studentparentStore.studentparents.find(
        (sp: any) => same(sp.parent_id, pId) && same(sp.student_id, studentId)
      )
      if (found && found.id) {
        await studentparentStore.remove(found.id)
      }
    }

    for (const studentId of toAdd) {
      await studentparentStore.create({
        parent_id: Number(pId),
        student_id: Number(studentId),
        school_id: currentParent.value?.school_id || null
      })
    }

    await studentparentStore.list()
    buildMapping()

    successMessage.value = 'Associação de estudantes ao encarregado actualizada com sucesso!'
    setTimeout(() => { successMessage.value = null }, 4000)
  } catch (err: any) {
    globalError.value = studentparentStore.error || err.message || 'Erro ao sincronizar os estudantes do encarregado.'
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Atribuição de Estudantes a Encarregados</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure quais estudantes estão vinculados a cada encarregado.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="openCreateModal"
          class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold shadow-lg transition-all"
        >
          <i class="fa-solid fa-user-plus text-sm"></i>
          <span>Novo Encarregado</span>
        </button>
        <button
          v-if="selectedParentId && canEdit()"
          @click="saveChanges"
          :disabled="internalLoading"
          class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin text-sm"></i>
          <i v-else class="fa-solid fa-floppy-disk text-sm"></i>
          <span>{{ internalLoading ? 'A guardar...' : 'Guardar Alterações' }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Encarregados</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-user-tie text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalParentsCount }}</div>
      </div>
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Estudantes</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-graduation-cap text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalStudentsCount }}</div>
      </div>
    </div>

    <div v-if="globalError || parentStore.error || studentparentStore.error || studentStore.error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-exclamation text-lg"></i>
      <span>{{ globalError || parentStore.error || studentparentStore.error || studentStore.error }}</span>
    </div>

    <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
      <i class="fa-solid fa-circle-check text-lg"></i>
      <span>{{ successMessage }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 lg:col-span-1 h-fit">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Selecionar Encarregado</h2>
        
        <div class="relative w-full">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="parentSearchQuery"
            type="text"
            placeholder="Pesquisar encarregado..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div v-if="parentStore.isLoading && !parentStore.parents.length" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-spinner animate-spin text-lg"></i>
        </div>
        <div v-else-if="filteredParents.length === 0" class="py-6 text-center text-slate-400 text-xs">
          Nenhum encarregado encontrado.
        </div>
        <div v-else class="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          <button
            v-for="parent in (filteredParents as any)"
            :key="parent.id"
            @click="selectedParentId = parent.id"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left',
              selectedParentId === parent.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <i class="fa-solid fa-user-tie text-sm opacity-80"></i>
              <span class="truncate">{{ parent.fullname || `#${parent.id}` }}</span>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
          </button>
        </div>
      </div>

      <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">
              Estudantes de: <span class="text-indigo-600 dark:text-indigo-400">{{ currentParent?.fullname || 'Selecione um encarregado' }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marque as caixas de seleção correspondentes aos educandos deste encarregado.</p>
          </div>
        </div>

        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
            <input
              v-model="studentSearchQuery"
              type="text"
              placeholder="Pesquisar por nome, nº de processo ou BI do estudante..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[480px]">
          <div v-if="parentStore.isLoading || studentparentStore.isLoading || studentStore.isLoading" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar estudantes...</p>
          </div>
          <div v-else-if="filteredStudents.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhum estudante encontrado.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="std in (filteredStudents as any)"
              :key="std.id"
              @click="toggleStudent(std.id)"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                isStudentAssigned(std.id)
                  ? 'bg-indigo-600/5 border-indigo-500/40 dark:bg-indigo-600/10 dark:border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :checked="isStudentAssigned(std.id)"
                @click.stop="toggleStudent(std.id)"
                class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div class="flex-1 truncate">
                <div class="font-mono text-xs font-bold text-slate-900 dark:text-white">{{ studentFullName(std) }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Processo: #{{ std.processnum || 'N/A' }} | BI: {{ std.user?.person?.bi_number || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ParentFormModal :initialData="formData" :isEditing="isEditing" :isLoading="false" :isOpen="isModalOpen" @close="isModalOpen = false" @saved="handleSaved"/>
  </div>
</template>