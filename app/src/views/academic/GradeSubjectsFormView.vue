<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useGradeSubjectStore } from '@/stores/grade_subject.store'
import { useAcademicGradeStore } from '@/stores/academic_grade.store'
import { useSubjectStore } from '@/stores/subject.store'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'

const props = defineProps<{
  isOpen: boolean
  initialData?: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const gradeSubjectStore = useGradeSubjectStore()
const gradeStore = useAcademicGradeStore()
const subjectStore = useSubjectStore()

const selectedGradeId = ref<number | null>(null)
const selectedSubjectIds = ref<number[]>([])
const internalLoading = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  try {
    await Promise.all([
      gradeStore.list(),
      subjectStore.list()
    ])
  } catch {}
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      selectedGradeId.value = newData.id
      // Suporta tanto o formato antigo como o novo 'gradeSubjects'
      const subjectsList = newData.subjects || newData.gradeSubjects || []
      selectedSubjectIds.value = subjectsList.map((s: any) => s.subjectId || s.subject?.id) || []
    } else {
      selectedGradeId.value = null
      selectedSubjectIds.value = []
    }
    errorMessage.value = null
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  if (!selectedGradeId.value) {
    errorMessage.value = 'Por favor, selecione uma classe.'
    return
  }

  internalLoading.value = true
  errorMessage.value = null

  try {
    await gradeSubjectStore.save(selectedGradeId.value, selectedSubjectIds.value)
    emit('saved')
    emit('close')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Erro ao guardar associação.'
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <!-- Cabeçalho -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Atribuir Disciplinas à Classe</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Selecione a classe e associe múltiplas disciplinas de uma vez.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="errorMessage" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Classe</label>
          <Select
            v-model="selectedGradeId"
            :options="gradeStore.academicGrades"
            optionLabel="name"
            optionValue="id"
            filter
            dataKey="id"
            placeholder="Selecione ou pesquise a classe..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <!-- Slot para o valor selecionado renderizar corretamente -->
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-900 dark:text-white">
                  {{ gradeStore.academicGrades.find(g => g.id === slotProps.value)?.name || 'Classe selecionada' }}
                </span>
              </div>
              <span v-else class="text-slate-400 dark:text-slate-500 text-xs">
                {{ slotProps.placeholder }}
              </span>
            </template>

            <!-- Slot para cada item da lista dropdown -->
            <template #option="slotProps">
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-medium text-slate-900 dark:text-white">{{ slotProps.option.name }}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-500">Nível {{ slotProps.option.level }}</span>
              </div>
            </template>
          </Select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Disciplinas Curriculares</label>
          <MultiSelect
            v-model="selectedSubjectIds"
            :options="subjectStore.subjects"
            optionLabel="name"
            optionValue="id"
            filter
            dataKey="id"
            placeholder="Pesquisar e selecionar disciplinas..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            display="chip"
          >
            <template #option="slotProps">
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-medium text-slate-900 dark:text-white">{{ slotProps.option.name }}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">{{ slotProps.option.code }}</span>
              </div>
            </template>
          </MultiSelect>
          <p class="text-[11px] text-slate-500 mt-1">Pode selecionar várias disciplinas em simultâneo utilizando a pesquisa.</p>
        </div>
        
        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar Atribuição' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>