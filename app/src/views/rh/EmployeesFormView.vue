<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeStore, type EmployeePayload } from '@/stores/employee.store'
import { useDepartmentStore } from '@/stores/department.store'
import { usePositionStore } from '@/stores/position.store'
import { useProvinceStore } from '@/stores/province.store'
import { useMunicipalityStore } from '@/stores/municipality.store'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (EmployeePayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const positionStore = usePositionStore()
const provinceStore = useProvinceStore()
const municipalityStore = useMunicipalityStore()

const genderOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Feminino', value: 'F' },
]

const monthOptions = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 100 }, (_, idx) => {
  const year = currentYear - 5 - idx
  return { label: String(year), value: year }
})

const createEmptyForm = (): EmployeePayload & { id?: number; position_ids: number[] } => ({
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
    house_number: null,
  },
  department_id: null,
  position_id: null,
  position_ids: [],
})

const form = ref<EmployeePayload & { id?: number; position_ids: number[] }>(createEmptyForm())
const birthDay = ref<number | null>(null)
const birthMonth = ref<number | null>(null)
const birthYear = ref<number | null>(null)

const selectedProvinceId = ref<number | null>(null)
const selectedMunicipalityId = ref<number | null>(null)
const isHydrating = ref(false)

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

const getFieldError = (field: string) =>
  fieldErrors.value[field]?.[0] ?? fieldErrors.value[`person.${field}`]?.[0] ?? ''
const hasError = (field: string) => !!getFieldError(field)

const clearFieldError = (field: string) => {
  const keys = [field, `person.${field}`]
  const next = { ...fieldErrors.value }
  for (const key of keys) {
    delete next[key]
  }
  fieldErrors.value = next
}

const daysInMonth = computed(() => {
  if (!birthMonth.value) return 31
  const yearForCalc = birthYear.value || 2000
  return new Date(yearForCalc, birthMonth.value, 0).getDate()
})

const dayOptions = computed(() =>
  Array.from({ length: daysInMonth.value }, (_, idx) => {
    const day = idx + 1
    return { label: String(day).padStart(2, '0'), value: day }
  })
)

const syncBirthdayPartsFromForm = () => {
  const raw = form.value.person.birthday?.trim()
  if (!raw) {
    birthDay.value = null
    birthMonth.value = null
    birthYear.value = null
    return
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (isoMatch) {
    birthYear.value = Number(isoMatch[1])
    birthMonth.value = Number(isoMatch[2])
    birthDay.value = Number(isoMatch[3])
    return
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    birthYear.value = parsed.getUTCFullYear()
    birthMonth.value = parsed.getUTCMonth() + 1
    birthDay.value = parsed.getUTCDate()
  }
}

watch([birthDay, birthMonth, birthYear], ([day, month, year]) => {
  if (isHydrating.value) return
  clearFieldError('birthday')

  if (day && month && day > daysInMonth.value) {
    birthDay.value = daysInMonth.value
    return
  }

  if (day && month && year) {
    const dd = String(day).padStart(2, '0')
    const mm = String(month).padStart(2, '0')
    form.value.person.birthday = `${year}-${mm}-${dd}`
  } else {
    form.value.person.birthday = ''
  }
})

const sortedProvinces = computed(() =>
  [...provinceStore.provinces].sort((a: any, b: any) =>
    String(a.name ?? '').localeCompare(String(b.name ?? ''), 'pt-AO', { sensitivity: 'base' })
  )
)

const filteredMunicipalities = computed(() => {
  if (!selectedProvinceId.value) return []
  return municipalityStore.municipalities
    .filter((m: any) => Number(m.province_id) === Number(selectedProvinceId.value))
    .sort((a: any, b: any) =>
      String(a.name ?? '').localeCompare(String(b.name ?? ''), 'pt-AO', { sensitivity: 'base' })
    )
})

const selectedPositions = computed(() =>
  positionStore.positions.filter((pos) => form.value.position_ids.includes(pos.id))
)

const onBiInput = () => {
  clearFieldError('bi_number')
  form.value.person.nif = form.value.person.bi_number || ''
}

const togglePosition = (positionId: number) => {
  clearFieldError('position_ids')
  clearFieldError('position_id')

  const exists = form.value.position_ids.includes(positionId)
  if (exists) {
    form.value.position_ids = form.value.position_ids.filter((id) => id !== positionId)
    if (form.value.position_id === positionId) {
      form.value.position_id = form.value.position_ids[0] ?? null
    }
  } else {
    form.value.position_ids = [...form.value.position_ids, positionId]
    if (!form.value.position_id) {
      form.value.position_id = positionId
    }
  }
}

const syncLocationIdsFromNames = () => {
  const provName = form.value.person.province?.trim().toLowerCase()
  const munName = form.value.person.municipality?.trim().toLowerCase()

  const foundProv = provName
    ? provinceStore.provinces.find((p: any) => p.name?.toLowerCase() === provName)
    : null
  selectedProvinceId.value = foundProv ? Number(foundProv.id) : null

  const foundMun = munName
    ? municipalityStore.municipalities.find(
        (m: any) =>
          m.name?.toLowerCase() === munName &&
          (!selectedProvinceId.value || Number(m.province_id) === Number(selectedProvinceId.value))
      )
    : null
  selectedMunicipalityId.value = foundMun ? Number(foundMun.id) : null
}

watch(selectedProvinceId, (newProvId) => {
  if (isHydrating.value) return
  clearFieldError('province')
  clearFieldError('municipality')

  if (!newProvId) {
    form.value.person.province = ''
    selectedMunicipalityId.value = null
    form.value.person.municipality = ''
    return
  }

  const prov = provinceStore.provinces.find((p: any) => Number(p.id) === Number(newProvId))
  form.value.person.province = prov?.name ?? ''

  const currentMunValid = municipalityStore.municipalities.some(
    (m: any) =>
      Number(m.id) === Number(selectedMunicipalityId.value) &&
      Number(m.province_id) === Number(newProvId)
  )
  if (!currentMunValid) {
    selectedMunicipalityId.value = null
    form.value.person.municipality = ''
  }
})

watch(selectedMunicipalityId, (newMunId) => {
  if (isHydrating.value) return
  clearFieldError('municipality')

  if (!newMunId) {
    form.value.person.municipality = ''
    return
  }

  const mun = municipalityStore.municipalities.find((m: any) => Number(m.id) === Number(newMunId))
  form.value.person.municipality = mun?.name ?? ''
})

onMounted(async () => {
  await Promise.allSettled([
    !departmentStore.departments.length ? departmentStore.list() : Promise.resolve(),
    !positionStore.positions.length ? positionStore.list() : Promise.resolve(),
    !provinceStore.provinces.length ? provinceStore.list() : Promise.resolve(),
    !municipalityStore.municipalities.length ? municipalityStore.list() : Promise.resolve(),
  ])
  isHydrating.value = true
  syncBirthdayPartsFromForm()
  syncLocationIdsFromNames()
  isHydrating.value = false
})

watch(
  () => props.initialData,
  (newData) => {
    isHydrating.value = true
    const base = createEmptyForm()
    if (newData) {
      const initialIds = Array.from(
        new Set([
          ...(newData.position_id ? [Number(newData.position_id)] : []),
          ...(newData.position_ids?.map(Number) ?? []),
        ])
      )
      form.value = {
        id: newData.id,
        department_id: newData.department_id ?? null,
        position_id: newData.position_id ?? initialIds[0] ?? null,
        position_ids: initialIds,
        person: {
          ...base.person,
          ...(newData.person || {}),
          nif: newData.person?.nif || newData.person?.bi_number || '',
        },
      }
    } else {
      form.value = base
    }
    syncBirthdayPartsFromForm()
    syncLocationIdsFromNames()
    fieldErrors.value = {}
    generalMessage.value = ''
    isHydrating.value = false
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  fieldErrors.value = {}
  generalMessage.value = ''

  if (!birthDay.value || !birthMonth.value || !birthYear.value) {
    fieldErrors.value = {
      birthday: ['Selecione o dia, o mês e o ano de nascimento.'],
    }
    generalMessage.value = 'Preencha a data de nascimento completa (dia, mês e ano).'
    showNotification(generalMessage.value, 'error')
    return
  }

  internalLoading.value = true

  try {
    const normalizedIds = Array.from(new Set(form.value.position_ids.map(Number).filter(Boolean)))
    const primaryPositionId =
      form.value.position_id && normalizedIds.includes(Number(form.value.position_id))
        ? Number(form.value.position_id)
        : normalizedIds[0] ?? null

    const selectedProvName =
      provinceStore.provinces.find((p: any) => Number(p.id) === Number(selectedProvinceId.value))
        ?.name ?? form.value.person.province

    const selectedMunName =
      municipalityStore.municipalities.find(
        (m: any) => Number(m.id) === Number(selectedMunicipalityId.value)
      )?.name ?? form.value.person.municipality

    const dd = String(birthDay.value).padStart(2, '0')
    const mm = String(birthMonth.value).padStart(2, '0')
    const birthdayValue = `${birthYear.value}-${mm}-${dd}`

    const payload: EmployeePayload = {
      person: {
        ...form.value.person,
        birthday: birthdayValue,
        middlename: form.value.person.middlename || null,
        nif: form.value.person.bi_number || form.value.person.nif || null,
        phone: form.value.person.phone || null,
        alternative_phone: form.value.person.alternative_phone || null,
        email: form.value.person.email || null,
        province: selectedProvName || null,
        municipality: selectedMunName || null,
        neighborhood: form.value.person.neighborhood || null,
        street: form.value.person.street || null,
        house_number: null,
      },
      department_id: form.value.department_id ? Number(form.value.department_id) : null,
      position_id: primaryPositionId,
      position_ids: normalizedIds,
    }

    if (props.isEditing && form.value.id) {
      await employeeStore.update(form.value.id, payload)
    } else {
      await employeeStore.create(payload)
    }

    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.fieldErrors || {}
    generalMessage.value = err.message || 'Ocorreu um erro ao guardar o funcionário.'

    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Funcionário' : 'Novo Funcionário' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados pessoais e selecione um ou mais cargos.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">
        <div v-if="generalMessage && !Object.keys(fieldErrors).length" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dados Pessoais</h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Primeiro Nome</label>
              <input
                v-model="form.person.firstname"
                @input="clearFieldError('firstname')"
                type="text"
                placeholder="Ex: João"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('firstname') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('firstname')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('firstname') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Meio</label>
              <input
                v-model="form.person.middlename"
                @input="clearFieldError('middlename')"
                type="text"
                placeholder="Opcional"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Último Nome</label>
              <input
                v-model="form.person.lastname"
                @input="clearFieldError('lastname')"
                type="text"
                placeholder="Ex: Silva"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('lastname') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('lastname')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('lastname') }}</span>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Data de Nascimento</label>
            <div class="grid grid-cols-3 gap-3">
              <Select
                v-model="birthDay"
                :options="dayOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Dia"
                filter
                showClear
                :class="['w-full rounded-xl text-sm', hasError('birthday') ? 'p-invalid' : '']"
              />
              <Select
                v-model="birthMonth"
                :options="monthOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Mês"
                filter
                showClear
                :class="['w-full rounded-xl text-sm', hasError('birthday') ? 'p-invalid' : '']"
              />
              <Select
                v-model="birthYear"
                :options="yearOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Ano"
                filter
                showClear
                :class="['w-full rounded-xl text-sm', hasError('birthday') ? 'p-invalid' : '']"
              />
            </div>
            <span v-if="hasError('birthday')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('birthday') }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Género</label>
              <Select
                v-model="form.person.gender"
                @change="clearFieldError('gender')"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o género"
                filter
                showClear
                :class="['w-full rounded-xl text-sm', hasError('gender') ? 'p-invalid' : '']"
              />
              <span v-if="hasError('gender')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('gender') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Número do BI</label>
              <input
                v-model="form.person.bi_number"
                @input="onBiInput"
                type="text"
                placeholder="Ex: 000000000LA000"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('bi_number') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('bi_number')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('bi_number') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Telefone</label>
              <input
                v-model="form.person.phone"
                @input="clearFieldError('phone')"
                type="text"
                placeholder="Ex: 923000000"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail</label>
              <input
                v-model="form.person.email"
                @input="clearFieldError('email')"
                type="email"
                placeholder="exemplo@dominio.com"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('email') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('email')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('email') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Província</label>
              <Select
                v-model="selectedProvinceId"
                :options="sortedProvinces"
                optionLabel="name"
                optionValue="id"
                placeholder="Selecione a província"
                filter
                showClear
                :class="['w-full rounded-xl text-sm', hasError('province') ? 'p-invalid' : '']"
              />
              <span v-if="hasError('province')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('province') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Município</label>
              <Select
                v-model="selectedMunicipalityId"
                :options="filteredMunicipalities"
                optionLabel="name"
                optionValue="id"
                :placeholder="selectedProvinceId ? 'Selecione o município' : 'Selecione primeiro a província'"
                :disabled="!selectedProvinceId"
                filter
                showClear
                :class="['w-full rounded-xl text-sm', hasError('municipality') ? 'p-invalid' : '']"
              />
              <span v-if="hasError('municipality')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('municipality') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bairro</label>
              <input
                v-model="form.person.neighborhood"
                type="text"
                placeholder="Ex: Benfica"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rua</label>
              <input
                v-model="form.person.street"
                type="text"
                placeholder="Ex: Rua Direita"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dados do Funcionário</h4>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Departamento</label>
            <Select
              v-model="form.department_id"
              @change="clearFieldError('department_id')"
              :options="departmentStore.departments"
              optionLabel="name"
              optionValue="id"
              placeholder="Sem departamento"
              filter
              showClear
              :class="['w-full rounded-xl text-sm', hasError('department_id') ? 'p-invalid' : '']"
            />
            <span v-if="hasError('department_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('department_id') }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Cargos do Funcionário (selecione um ou mais)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <label
                v-for="pos in positionStore.positions"
                :key="pos.id"
                class="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="form.position_ids.includes(pos.id)"
                  @change="togglePosition(pos.id)"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ pos.name }}</span>
              </label>
              <p v-if="!positionStore.positions.length" class="text-xs text-slate-400 col-span-2 py-2 text-center">
                Nenhum cargo disponível.
              </p>
            </div>
            <span v-if="hasError('position_ids')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('position_ids') }}</span>
          </div>

          <div v-if="selectedPositions.length > 1">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cargo Principal</label>
            <Select
              v-model="form.position_id"
              @change="clearFieldError('position_id')"
              :options="selectedPositions"
              optionLabel="name"
              optionValue="id"
              placeholder="Selecione o cargo principal"
              filter
              showClear
              class="w-full rounded-xl text-sm"
            />
          </div>
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