<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePeriodStore, type PeriodPayload } from '@/stores/period.store'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (PeriodPayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const periodStore = usePeriodStore()

const periodTypeOptions = [
  { label: 'Manhã', value: 'Manhã' },
  { label: 'Tarde', value: 'Tarde' },
  { label: 'Noite', value: 'Noite' }
]

const form = ref<{
  id?: number
  periodType: string
  startHourDate: Date | null
  endHourDate: Date | null
  description: string | null
  school_id: number | null
}>({
  periodType: 'Manhã',
  startHourDate: null,
  endHourDate: null,
  description: '',
  school_id: null
})

const formatTimeString = (dateVal: Date | null): string => {
  if (!dateVal || !(dateVal instanceof Date) || isNaN(dateVal.getTime())) return ''
  const hours = String(dateVal.getHours()).padStart(2, '0')
  const minutes = String(dateVal.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const parseTimeStringToDate = (timeStr?: string | null): Date | null => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

const formattedStartHour = computed(() => formatTimeString(form.value.startHourDate))
const formattedEndHour = computed(() => formatTimeString(form.value.endHourDate))

const computedName = computed(() => {
  const type = form.value.periodType || 'Manhã'
  const start = formattedStartHour.value || '00:00'
  const end = formattedEndHour.value || '00:00'
  return `${type} (${start} - ${end})`
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
      let pType = 'Manhã'
      if (newData.name) {
        if (newData.name.startsWith('Tarde')) pType = 'Tarde'
        else if (newData.name.startsWith('Noite')) pType = 'Noite'
      }

      form.value = {
        id: (newData as any).id,
        periodType: pType,
        startHourDate: parseTimeStringToDate(newData.starthour),
        endHourDate: parseTimeStringToDate(newData.endhour),
        description: newData.description || '',
        school_id: newData.school_id || null
      }
    } else {
      form.value = {
        periodType: 'Manhã',
        startHourDate: null,
        endHourDate: null,
        description: '',
        school_id: null
      }
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
    const payload: PeriodPayload = {
      name: computedName.value,
      description: form.value.description || null,
      starthour: formattedStartHour.value || null,
      endhour: formattedEndHour.value || null,
      school_id: form.value.school_id
    }

    if (props.isEditing && form.value.id) {
      await periodStore.update(form.value.id, payload)
    } else {
      await periodStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar o turno.'
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
            <i class="fa-solid fa-clock"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Turno' : 'Novo Turno' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados do turno.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Período</label>
          <Select
            v-model="form.periodType"
            :options="periodTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione o período"
            class="w-full text-xs"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hora de Início</label>
            <DatePicker
              v-model="form.startHourDate"
              timeOnly
              hourFormat="24"
              placeholder="00:00"
              @update:modelValue="clearFieldError('starthour')"
              class="w-full text-xs custom-timepicker-input"
            />
            <span v-if="hasError('starthour')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('starthour') }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hora de Fim</label>
            <DatePicker
              v-model="form.endHourDate"
              timeOnly
              hourFormat="24"
              placeholder="00:00"
              @update:modelValue="clearFieldError('endhour')"
              class="w-full text-xs custom-timepicker-input"
            />
            <span v-if="hasError('endhour')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('endhour') }}</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome Gerado Automaticamente</label>
          <input
            :value="computedName"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Breve descrição do turno (opcional)..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="internalLoading" class="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>