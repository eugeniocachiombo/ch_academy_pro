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
const notifiedMissingActiveYear = ref(false)

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
const years = computed(() => yearStore.years || [])

const activeYear = computed(() => years.value.find((y: any) => y.isCurrent) || null)
const isMissingActiveYear = computed(() => !props.isEditing && !activeYear.value)

const availableOf = (config: any): number =>
  Math.max(0, Number(config?.total_slots ?? 0) - Number(config?.total_enrolled ?? 0))

const originalGroupconfigId = computed(() =>
  props.isEditing && props.initialData?.groupconfig_id
    ? Number(props.initialData.groupconfig_id)
    : null
)

const groupconfigs = computed(() =>
  (groupconfigStore.groupconfigs || []).map((g: any) => ({
    ...g,
    available: availableOf(g),
    blocked: availableOf(g) <= 0 && Number(g.id) !== originalGroupconfigId.value,
  }))
)

const selectedGroupconfig = computed(() =>
  groupconfigs.value.find((g: any) => Number(g.id) === Number(form.value.groupconfig_id)) || null
)

const isGroupFull = computed(() => !!selectedGroupconfig.value?.blocked)

const statusOptions = [
  { label: 'Activo', value: RegisterStatus.ACTIVE },
  { label: 'Transferido', value: RegisterStatus.TRANSFER },
  { label: 'Desistente', value: RegisterStatus.GIVEUP },
  { label: 'Concluído', value: RegisterStatus.CONCLUD },
  { label: 'Cancelado', value: RegisterStatus.CANCELED },
]

const triggerMissingActiveYearNotice = () => {
  if (notifiedMissingActiveYear.value) return
  const msg = 'Não existe um ano lectivo activo. Active um ano lectivo antes de criar matrículas.'
  fieldErrors.value = { year_id: [msg] }
  generalMessage.value = msg
  showNotification(msg, 'warning')
  notifiedMissingActiveYear.value = true
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) {
      notifiedMissingActiveYear.value = false
      return
    }

    fieldErrors.value = {}
    generalMessage.value = ''
    notifiedMissingActiveYear.value = false

    const tasks: Promise<any>[] = []
    if (groupconfigStore.list) tasks.push(groupconfigStore.list().catch(() => {}))
    if (!years.value.length && yearStore.list) tasks.push(yearStore.list().catch(() => {}))
    if (tasks.length) await Promise.all(tasks)

    if (!props.isEditing && !props.initialData?.student_id) {
      form.value.year_id = activeYear.value?.id ?? null
      form.value.date = new Date().toISOString().split('T')[0]
      form.value.status = RegisterStatus.ACTIVE
      form.value.registnum = null
    }

    if (isMissingActiveYear.value) {
      triggerMissingActiveYearNotice()
    }
  }
)

watch(isMissingActiveYear, (missing) => {
  if (props.isOpen && missing) {
    triggerMissingActiveYearNotice()
  }
})

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData
      ? { ...newData }
      : {
          registnum: null,
          student_id: null,
          groupconfig_id: null,
          year_id: activeYear.value?.id ?? null,
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

  if (isMissingActiveYear.value) {
    const msg = 'Não é possível criar matrícula porque não existe um ano lectivo activo.'
    fieldErrors.value = { year_id: [msg] }
    generalMessage.value = msg
    showNotification(msg, 'error')
    return
  }

  if (isGroupFull.value) {
    fieldErrors.value = { groupconfig_id: ['Esta turma já não tem vagas disponíveis.'] }
    generalMessage.value = 'Esta turma já não tem vagas disponíveis.'
    showNotification(generalMessage.value, 'error')
    return
  }

  internalLoading.value = true

  try {
    const payload: RegisterPayload = {
      registnum:
        form.value.registnum !== null &&
        form.value.registnum !== undefined &&
        String(form.value.registnum) !== ''
          ? Number(form.value.registnum)
          : null,
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
    await groupconfigStore.list?.().catch(() => {})
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar a matrícula.'
    showNotification(generalMessage.value, 'error')
    groupconfigStore.list?.().catch(() => {})
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
        <div
          v-if="isMissingActiveYear"
          class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5"
        >
          <i class="fa-solid fa-calendar-xmark mt-0.5"></i>
          <div>
            <p class="font-semibold">Sem ano lectivo activo</p>
            <p class="mt-0.5">Active um ano lectivo antes de criar novas matrículas.</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Estudante</label>
          <Select
            v-model="form.student_id"
            :options="students"
            optionLabel="processnum"
            optionValue="id"
            filter
            :showClear="!initialData?.student_id"
            :disabled="!!initialData?.student_id || isMissingActiveYear"
            placeholder="Selecione o estudante..."
            @change="clearFieldError('student_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('student_id'), 'opacity-70 cursor-not-allowed': !!initialData?.student_id || isMissingActiveYear }"
          >
            <template #option="slotProps">
              {{ slotProps.option?.user?.person?.firstname }} {{ slotProps.option?.user?.person?.lastname }} ({{ slotProps.option?.processnum }})
            </template>
            <template #value="slotProps">
              <span v-if="slotProps.value">
                {{ students.find(s => s.id === slotProps.value)?.user?.person?.firstname }}
                {{ students.find(s => s.id === slotProps.value)?.user?.person?.lastname }}
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
            optionDisabled="blocked"
            :disabled="isMissingActiveYear"
            filter
            showClear
            placeholder="Selecione a turma configurada..."
            @change="clearFieldError('groupconfig_id')"
            class="w-full"
            :class="{ 'p-invalid': hasError('groupconfig_id') || isGroupFull }"
          >
            <template #option="slotProps">
              <div class="flex items-center justify-between gap-3 w-full">
                <span class="truncate">{{ slotProps.option.name }}</span>
                <span
                  class="text-[11px] font-semibold whitespace-nowrap"
                  :class="slotProps.option.available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ slotProps.option.available > 0 ? `${slotProps.option.available} vagas` : 'Lotada' }}
                </span>
              </div>
            </template>
          </Select>
          <span v-if="hasError('groupconfig_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('groupconfig_id') }}</span>

          <div
            v-if="selectedGroupconfig"
            class="grid grid-cols-3 gap-3 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
          >
            <div class="flex flex-col">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total de Vagas</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ selectedGroupconfig.total_slots }}</span>
            </div>
            <div class="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-3">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Matriculados</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ selectedGroupconfig.total_enrolled ?? 0 }}</span>
            </div>
            <div class="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-3">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Disponíveis</span>
              <span
                class="text-sm font-bold mt-0.5"
                :class="selectedGroupconfig.available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ selectedGroupconfig.available }}
              </span>
            </div>
          </div>

          <div
            v-if="isGroupFull"
            class="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2"
          >
            <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
            <span>Esta turma já não tem vagas disponíveis. Escolha outra configuração.</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ano Lectivo</label>
            <Select
              v-model="form.year_id"
              :options="years"
              optionLabel="name"
              optionValue="id"
              :disabled="isMissingActiveYear"
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
              :disabled="isMissingActiveYear"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
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
            :disabled="isMissingActiveYear"
            placeholder="Selecione o estado..."
            class="w-full"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading || isGroupFull || isMissingActiveYear"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>