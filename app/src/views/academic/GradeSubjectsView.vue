<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGradeSubjectStore, type GradeSubjectGroup } from '@/stores/grade_subject.store'
import { useUserStore } from '@/stores/user.store'
import { showNotification } from '@/services/general_service'
import { useConfirmToast } from '@/components/useConfirmToast'
import ConfirmToast from '@/components/ConfirmToast.vue'
import GradeSubjectsFormView from './GradeSubjectsFormView.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const gradeSubjectStore = useGradeSubjectStore()
const userStore = useUserStore()
const confirmToast = useConfirmToast('confirm-delete')

const p = (name: string) => userStore.getPermition(name)

const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedGroup = ref<any | null>(null)

onMounted(async () => {
  try {
    await gradeSubjectStore.list()
  } catch {}
})

const totalCount = computed(() => gradeSubjectStore.gradeSubjects.length)

const filteredItems = computed(() => {
  return gradeSubjectStore.gradeSubjects.filter((item: GradeSubjectGroup) => {
    if (!item) return false
    const query = searchQuery.value.toLowerCase()
    const matchesGrade = item.name?.toLowerCase().includes(query)
    // Suporta tanto item.subjects como item.gradeSubjects
    const subjectsList = item.subjects || (item as any).gradeSubjects || []
    const matchesSubject = subjectsList.some((s: any) => 
      s.subject?.name?.toLowerCase().includes(query) || 
      s.subject?.code?.toLowerCase().includes(query)
    )
    return !query || matchesGrade || matchesSubject
  })
})

const openCreateModal = () => {
  if (!p('grade_subjects.create')) return
  selectedGroup.value = null
  isModalOpen.value = true
}

const openEditModal = (group: GradeSubjectGroup) => {
  if (!p('grade_subjects.edit')) return
  // Normaliza os dados para que o formulário receba 'subjects' com a lista correta
  selectedGroup.value = {
    ...group,
    subjects: group.subjects || (group as any).gradeSubjects || []
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedGroup.value = null
  gradeSubjectStore.clearError()
}

const handleSaved = async () => {
  await gradeSubjectStore.list()
  closeModal()
  showNotification('Matriz curricular guardada com sucesso.', 'success')
}

const deleteAssociation = async (gradeId: number) => {
  if (!p('grade_subjects.delete')) return
  try {
    await gradeSubjectStore.remove(gradeId)
    await gradeSubjectStore.list()
    showNotification('Disciplinas removidas desta classe com sucesso.', 'success')
  } catch (err: any) {
    showNotification(gradeSubjectStore.error || 'Erro ao remover disciplinas.', 'error')
  }
}

const confirmDelete = (group: GradeSubjectGroup) => {
  if (!p('grade_subjects.delete')) return
  confirmToast.confirm({
    summary: 'Remover Disciplinas da Classe',
    detail: `Tem a certeza que deseja desassociar todas as disciplinas da classe "${group.name}"?`,
    onAccept: () => deleteAssociation(group.id),
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
          Disciplinas por Classe
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Gira o plano curricular e associe dinamicamente múltiplas disciplinas a cada classe.
        </p>
      </div>
      <button
        v-if="p('grade_subjects.create')"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
      >
        <i class="fa-solid fa-circle-plus text-sm"></i>
        <span>Atribuir Disciplinas</span>
      </button>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-5 rounded-2xl border bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Classes Configuradas</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-layer-group text-sm"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white mt-3">{{ totalCount }}</div>
      </div>
    </div>

    <!-- Barra de Pesquisa -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
      <div class="relative flex-1 w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar por classe ou nome/código da disciplina..."
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>

    <!-- Datatable PrimeVue -->
    <div class="custom-datatable-wrapper bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <DataTable
        :value="filteredItems"
        :loading="gradeSubjectStore.isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        class="custom-datatable"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-book-open-reader text-2xl mb-2 opacity-40"></i>
            <p class="text-xs">Nenhuma matriz curricular encontrada.</p>
          </div>
        </template>
        <template #loading>
          <div class="py-12 text-center text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
            <p class="text-xs">A carregar dados...</p>
          </div>
        </template>

        <Column field="name" header="Classe" sortable style="width: 25%">
          <template #body="slotProps">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-900 dark:text-white">{{ slotProps.data.name }}</span>
              <span class="text-[10px] text-slate-500">Nível {{ slotProps.data.level }}</span>
            </div>
          </template>
        </Column>

        <Column field="subjects" header="Disciplinas Associadas" style="width: 60%">
          <template #body="slotProps">
            <div class="flex flex-wrap gap-1.5 py-1">
              <span
                v-for="item in (slotProps.data.subjects || slotProps.data.gradeSubjects || [])"
                :key="item.id || item.subjectId"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium"
              >
                <span class="font-bold font-mono text-[10px] text-indigo-500 uppercase">{{ item.subject?.code }}</span>
                <span>{{ item.subject?.name }}</span>
              </span>
              <span v-if="(!slotProps.data.subjects && !slotProps.data.gradeSubjects) || (slotProps.data.subjects?.length === 0 && slotProps.data.gradeSubjects?.length === 0)" class="text-xs text-slate-400 italic">
                Nenhuma disciplina associada.
              </span>
            </div>
          </template>
        </Column>

        <Column header="Acções" style="width: 15%" :exportable="false">
          <template #body="slotProps">
            <div class="flex items-center justify-center gap-1.5">
              <button
                v-if="p('grade_subjects.edit')"
                @click="openEditModal(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                title="Editar Associações"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>

              <button
                v-if="p('grade_subjects.delete')"
                @click="confirmDelete(slotProps.data)"
                class="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                title="Remover Disciplinas"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <GradeSubjectsFormView
      :is-open="isModalOpen"
      :initial-data="selectedGroup"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>