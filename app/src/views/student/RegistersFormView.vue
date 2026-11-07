<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRegisterStore, type RegisterPayload, RegisterStatus } from '@/stores/register.store'
import { useStudentStore } from '@/stores/student.store'
import { useGroupconfigStore } from '@/stores/groupconfig.store'
import { useYearStore } from '@/stores/year.store'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (RegisterPayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const registerStore = useRegisterStore()
const studentStore = useStudentStore()
const groupconfigStore = useGroupconfigStore()
const yearStore = useYearStore()

const form = ref<RegisterPayload & { id?: number }>({
  registnum: null,
  student_id: null,
  groupconfig_id: null,
  year_id: null,
  date: new Date().toISOString().split('T')[0],
  status: RegisterStatus.ACTIVE,
  school_id: null,
})

const fieldErrors = ref<Record<string, string[]>>()
const generalMessage = ref('')
const internalLoading = ref(false)

onMounted(async () => {
  try {
    await Promise.all([
      studentStore.list?.(),
      groupconfigStore.list?.(),
      yearStore.list?.(),
    ])
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares para matrícula', e)
  }
})

const getFieldError = (field: string) => fieldErrors.value?.[field]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)

const clearFieldError = (field: string) => {
  if (fieldErrors.value?.[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

const students = computed(() => studentStore.students || [])
const groupconfigs = computed(() => groupconfigStore.groupconfigs || [])
const years = computed(() => yearStore.years || [])

const statusOptions = [
  { label: 'Activo', value: RegisterStatus.ACTIVE },
  { label: 'Transferido', value: RegisterStatus.TRANSFER },
  { label: 'Desistente', value: RegisterStatus.GIVEUP },
  { label: 'Concluído', value: RegisterStatus.CONCLUD },
  { label: 'Cancelado', value: RegisterStatus.CANCELED },
]

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && !props.isEditing) {
      const activeYear = years.value.find((y: any) => y.isCurrent) || years.value[0]
      if (activeYear) {
        form.value.year_id = activeYear.id
      }
      form.value.date = new Date().toISOString().split('T')[0]
      form.value.status = RegisterStatus.ACTIVE
      form.value.registnum = null
    }
  }
)

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData
      ? { ...newData }
      : {
          registnum: null,
          student_id: null,
          groupconfig_id: null,
          year_id: years.value.find((y: any) => y.isCurrent)?.id || null,
          date: new Date().toISOString().split('T')[0],
          status: RegisterStatus.ACTIVE,
          school_id: null,
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
    const payload: RegisterPayload = {
      registnum: form.value.registnum !== null && form.value.registnum !== undefined && form.value.registnum !== '' ? Number(form.value.registnum) : null,
      student_id: form.value.student_id ? Number(form.value.student_id) : null,
      groupconfig_id: form.value.groupconfig_id ? Number(form.value.groupconfig_id) : null,
      year_id: form.value.year_id ? Number(form.value.year_id) : null,
      date: form.value.date ? new Date(form.value.date).toISOString() : null,
      status: form.value.status || RegisterStatus.ACTIVE,
      school_id: form.value.school_id,
    }

    if (props.isEditing && form.value.id) {
      await registerStore.update(form.value.id, payload)
    } else {
      await registerStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar a matrícula.'
    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-user-graduate"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Matrícula' : 'Nova Matrícula' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados do registo académico.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Estudante</label>
          <Select
            v-model="form.student_id"
            :options="students"
            optionLabel="processnum"
            optionValue="id"
            filter
            showClear
            placeholder="Selecione o estudante..."
            @change="clearFieldError('student_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('student_id') }"
          >
            <template #option="slotProps">
              {{ slotProps.option?.user?.person?.firstname  }} {{ slotProps.option?.user?.person?.lastname  }} ({{ slotProps.option?.processnum }})
            </template>
            <template #value="slotProps">
              <span v-if="slotProps.value">
                {{ students.find(s => s.id === slotProps.value)?.user?.person?.name }} 
                ({{ students.find(s => s.id === slotProps.value)?.processnum }})
              </span>
              <span v-else class="text-slate-400">Selecione o estudante...</span>
            </template>
          </Select>
          <span v-if="hasError('student_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('student_id') }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Configuração da Turma</label>
          <Select
            v-model="form.groupconfig_id"
            :options="groupconfigs"
            optionLabel="name"
            optionValue="id"
            filter
            showClear
            placeholder="Selecione a turma configurada..."
            @change="clearFieldError('groupconfig_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('groupconfig_id') }"
          />
          <span v-if="hasError('groupconfig_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('groupconfig_id') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ano Letivo</label>
            <Select
              v-model="form.year_id"
              :options="years"
              optionLabel="name"
              optionValue="id"
              filter
              showClear
              placeholder="Selecione o ano..."
              @change="clearFieldError('year_id')"
              class="w-full"
              :class="{ 'p-invalid': hasError('year_id') }"
            >
              <template #option="slotProps">
                {{ slotProps.option.name }} {{ slotProps.option.isCurrent ? '(Activo)' : '' }}
              </template>
            </Select>
            <span v-if="hasError('year_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('year_id') }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data da Matrícula</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Estado</label>
          <Select
            v-model="form.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione o estado..."
            class="w-full"
          />
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