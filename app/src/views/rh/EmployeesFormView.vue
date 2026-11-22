<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEmployeeStore, type EmployeePayload } from '@/stores/employee.store'
import { useDepartmentStore } from '@/stores/department.store'
import { usePositionStore } from '@/stores/position.store'
import { showNotification } from '@/services/general_service'

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

const createEmptyForm = (): EmployeePayload & { id?: number } => ({
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
  department_id: null,
  position_id: null,
})

const form = ref<EmployeePayload & { id?: number }>(createEmptyForm())
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

onMounted(async () => {
  await Promise.allSettled([
    !departmentStore.departments.length ? departmentStore.list() : Promise.resolve(),
    !positionStore.positions.length ? positionStore.list() : Promise.resolve(),
  ])
})

watch(
  () => props.initialData,
  (newData) => {
    const base = createEmptyForm()
    form.value = newData
      ? {
          id: newData.id,
          department_id: newData.department_id ?? null,
          position_id: newData.position_id ?? null,
          person: {
            ...base.person,
            ...(newData.person || {}),
          },
        }
      : base
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
    const payload: EmployeePayload = {
      person: {
        ...form.value.person,
        middlename: form.value.person.middlename || null,
        nif: form.value.person.nif || form.value.person.bi_number || null,
        phone: form.value.person.phone || null,
        alternative_phone: form.value.person.alternative_phone || null,
        email: form.value.person.email || null,
        province: form.value.person.province || null,
        municipality: form.value.person.municipality || null,
        neighborhood: form.value.person.neighborhood || null,
        street: form.value.person.street || null,
        house_number: form.value.person.house_number || null,
      },
      department_id: form.value.department_id ? Number(form.value.department_id) : null,
      position_id: form.value.position_id ? Number(form.value.position_id) : null,
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
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados pessoais e profissionais do funcionário.</p>
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

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data de Nascimento</label>
              <input
                v-model="form.person.birthday"
                @change="clearFieldError('birthday')"
                type="date"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('birthday') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('birthday')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('birthday') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Género</label>
              <select
                v-model="form.person.gender"
                @change="clearFieldError('gender')"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('gender') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              <span v-if="hasError('gender')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('gender') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Número do BI</label>
              <input
                v-model="form.person.bi_number"
                @input="clearFieldError('bi_number')"
                type="text"
                placeholder="Ex: 000000000LA000"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('bi_number') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('bi_number')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('bi_number') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NIF</label>
              <input
                v-model="form.person.nif"
                @input="clearFieldError('nif')"
                type="text"
                placeholder="Opcional"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

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

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Província</label>
              <input
                v-model="form.person.province"
                type="text"
                placeholder="Ex: Luanda"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Município</label>
              <input
                v-model="form.person.municipality"
                type="text"
                placeholder="Ex: Belas"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bairro</label>
              <input
                v-model="form.person.neighborhood"
                type="text"
                placeholder="Opcional"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rua</label>
              <input
                v-model="form.person.street"
                type="text"
                placeholder="Opcional"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nº da Casa</label>
              <input
                v-model="form.person.house_number"
                type="text"
                placeholder="Opcional"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dados do Funcionário</h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Departamento</label>
              <select
                v-model="form.department_id"
                @change="clearFieldError('department_id')"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('department_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              >
                <option :value="null">Sem departamento</option>
                <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
              <span v-if="hasError('department_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('department_id') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cargo</label>
              <select
                v-model="form.position_id"
                @change="clearFieldError('position_id')"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('position_id') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              >
                <option :value="null">Sem cargo</option>
                <option v-for="pos in positionStore.positions" :key="pos.id" :value="pos.id">
                  {{ pos.name }}
                </option>
              </select>
              <span v-if="hasError('position_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('position_id') }}</span>
            </div>
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