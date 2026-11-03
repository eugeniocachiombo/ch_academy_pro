<script setup lang="ts">
import { ref, watch } from 'vue'
import { useYearStore, type YearPayload } from '@/stores/year.store'
import { showNotification } from '@/services/general_service'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (YearPayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const yearStore = useYearStore()
const form = ref<YearPayload & { id?: number }>({
  name: '',
  school_id: null,
  isCurrent: false,
  startdate: '',
  enddate: ''
})

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

const getFieldError = (field: string) => fieldErrors.value[field]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)

const clearFieldError = (field: string) => {
  if (fieldErrors.value[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        ...newData,
        startdate: newData.startdate ? newData.startdate.split('T')[0] : '',
        enddate: newData.enddate ? newData.enddate.split('T')[0] : ''
      }
    } else {
      form.value = { name: '', school_id: null, isCurrent: false, startdate: '', enddate: '' }
    }
    fieldErrors.value = {}
    generalMessage.value = ''
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  fieldErrors.value = {}
  generalMessage.value = ''
  internalLoading.value = true

  try {
    const payload: YearPayload = {
      name: form.value.name,
      school_id: form.value.school_id,
      isCurrent: form.value.isCurrent,
      startdate: form.value.startdate ? new Date(form.value.startdate).toISOString() : null,
      enddate: form.value.enddate ? new Date(form.value.enddate).toISOString() : null
    }

    if (props.isEditing && form.value.id) {
      await yearStore.update(form.value.id, payload)
    } else {
      await yearStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar o ano letivo.'

    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-calendar"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Ano Letivo' : 'Novo Ano Letivo' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados do ano letivo.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Ano Letivo</label>
          <input
            v-model="form.name"
            @input="clearFieldError('name')"
            type="text"
            placeholder="Ex: 2024/2025"
            :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('name') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
          />
          <span v-if="hasError('name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('name') }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data de Início</label>
            <input
              v-model="form.startdate"
              @input="clearFieldError('startdate')"
              type="date"
              :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('startdate') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
            />
            <span v-if="hasError('startdate')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('startdate') }}</span>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data do Fim</label>
            <input
              v-model="form.enddate"
              @input="clearFieldError('enddate')"
              type="date"
              :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('enddate') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
            />
            <span v-if="hasError('enddate')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('enddate') }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input id="isCurrent" v-model="form.isCurrent" type="checkbox" class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700" />
          <label for="isCurrent" class="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">Marcar como Ano Atual</label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="internalLoading" class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>