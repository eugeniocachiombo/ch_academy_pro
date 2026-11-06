<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useStudentStore, type StudentPayload } from '@/stores/student.store.js'
import { useSchoolStore } from '@/stores/school.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (StudentPayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const studentStore = useStudentStore()
const schoolStore = useSchoolStore()
const authStore = useAuthStore()

const emptyForm = (): StudentPayload & { id?: number } => ({
  processnum: undefined,
  phone: '',
  address: '',
  fathername: '',
  mothername: '',
  origin_school: '',
  school_id: authStore.currentUser.school_id || null,
  person: {
    firstname: '',
    lastname: '',
    middlename: '',
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
    house_number: ''
  }
})

const form = ref<StudentPayload & { id?: number }>(emptyForm())

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

onMounted(async () => {
  try {
    await schoolStore.list?.()
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares', e)
  }
})

const schools = computed(() => schoolStore.schools || [])

const normalizeErrors = (err: any): Record<string, string[]> => {
  const raw = err?.errors ?? err?.fieldErrors ?? err?.response?.data?.errors ?? err?.data?.errors ?? {}
  const result: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(raw)) {
    result[key] = Array.isArray(value) ? (value as string[]) : [String(value)]
  }
  return result
}

const getFieldError = (field: string): string => fieldErrors.value[field]?.[0] ?? ''

const hasError = (field: string): boolean => !!getFieldError(field)

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
      const base = emptyForm()
      form.value = {
        ...base,
        ...newData,
        phone: newData.phone ?? '',
        school_id: newData.school_id || authStore.currentUser.school_id || null,
        person: {
          ...base.person!,
          ...newData.person,
          birthday: newData.person?.birthday ? newData.person.birthday.split('T')[0] : ''
        }
      }
    } else {
      form.value = emptyForm()
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
    const person = form.value.person!
    const payload: StudentPayload = {
      processnum: form.value.processnum ? Number(form.value.processnum) : undefined,
      phone: form.value.phone || '',
      address: form.value.address || null,
      fathername: form.value.fathername || null,
      mothername: form.value.mothername || null,
      origin_school: form.value.origin_school || null,
      school_id: form.value.school_id
        ? Number(form.value.school_id)
        : (authStore.currentUser.school_id ? Number(authStore.currentUser.school_id) : null),
      person: {
        ...person,
        email: person.email || null,
        birthday: person.birthday ? new Date(person.birthday).toISOString() : ''
      }
    }

    if (props.isEditing && form.value.id) {
      await studentStore.update(form.value.id, payload)
    } else {
      await studentStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = normalizeErrors(err)
    generalMessage.value = err?.message || 'Ocorreu um erro ao guardar o estudante.'

    showNotification(generalMessage.value, 'error')
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-user-graduate"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Estudante' : 'Novo Estudante' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha as informações pessoais do estudante.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto flex-1">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Escola</label>
          <Select
            v-model="form.school_id"
            :options="schools"
            optionLabel="name"
            optionValue="id"
            filter
            disabled
            placeholder="Selecione a escola..."
            class="w-full opacity-75 cursor-not-allowed"
            :class="{ 'p-invalid': hasError('school_id') }"
          />
          <span v-if="hasError('school_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('school_id') }}</span>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Dados Pessoais</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primeiro Nome *</label>
              <input
                v-model="form.person!.firstname"
                @input="clearFieldError('person.firstname')"
                type="text"
                placeholder="Ex: João"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('person.firstname') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('person.firstname')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.firstname') }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Meio</label>
              <input
                v-model="form.person!.middlename"
                type="text"
                placeholder="Ex: Manuel"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Último Nome *</label>
              <input
                v-model="form.person!.lastname"
                @input="clearFieldError('person.lastname')"
                type="text"
                placeholder="Ex: Silva"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('person.lastname') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('person.lastname')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.lastname') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nº do BI *</label>
              <input
                v-model="form.person!.bi_number"
                @input="clearFieldError('person.bi_number')"
                type="text"
                placeholder="Ex: 000000000LA000"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('person.bi_number') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('person.bi_number')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.bi_number') }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento *</label>
              <input
                v-model="form.person!.birthday"
                @input="clearFieldError('person.birthday')"
                type="date"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('person.birthday') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('person.birthday')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.birthday') }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gênero *</label>
              <select
                v-model="form.person!.gender"
                @change="clearFieldError('person.gender')"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('person.gender') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              <span v-if="hasError('person.gender')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.gender') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <input
                v-model="form.person!.email"
                @input="clearFieldError('person.email')"
                type="text"
                placeholder="Ex: joao@email.com"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('person.email') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('person.email')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.email') }}</span>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Informações de Estudante & Contacto</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone *</label>
              <input
                v-model="form.phone"
                @input="clearFieldError('phone')"
                type="text"
                placeholder="Ex: 923000000"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('phone') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('phone')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('phone') }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Escola de Origem</label>
              <input
                v-model="form.origin_school"
                @input="clearFieldError('origin_school')"
                type="text"
                placeholder="Ex: Colégio ABC"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('origin_school') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('origin_school')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('origin_school') }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Pai</label>
              <input
                v-model="form.fathername"
                @input="clearFieldError('fathername')"
                type="text"
                placeholder="Nome do pai"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('fathername') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('fathername')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('fathername') }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Mãe</label>
              <input
                v-model="form.mothername"
                @input="clearFieldError('mothername')"
                type="text"
                placeholder="Nome da mãe"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('mothername') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('mothername')" class="text-[11px] text-red-600 dark:text-red-400 mt-1.5 block font-medium">{{ getFieldError('mothername') }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
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