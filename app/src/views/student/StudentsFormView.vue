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

const form = ref<StudentPayload & { id?: number }>({
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
  },
  user: {
    username: '',
    password: '',
    status: 'ACTIVE'
  }
})

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)

onMounted(async () => {
  try {
    await Promise.all([
      schoolStore.list?.()
    ])
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares', e)
  }
})

const schools = computed(() => schoolStore.schools || [])

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
        school_id: newData.school_id || authStore.currentUser.school_id || null,
        person: {
          ...newData.person,
          birthday: newData.person?.birthday ? newData.person.birthday.split('T')[0] : ''
        }
      }
    } else {
      form.value = {
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
        },
        user: {
          username: '',
          password: '',
          status: 'ACTIVE'
        }
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
    const payload: StudentPayload = {
      processnum: form.value.processnum ? Number(form.value.processnum) : undefined,
      phone: form.value.phone,
      address: form.value.address,
      fathername: form.value.fathername,
      mothername: form.value.mothername,
      origin_school: form.value.origin_school,
      school_id: form.value.school_id ? Number(form.value.school_id) : (authStore.currentUser.school_id ? Number(authStore.currentUser.school_id) : null),
      person: {
        ...form.value.person,
        birthday: form.value.person?.birthday ? new Date(form.value.person.birthday).toISOString() : ''
      },
      user: {
        ...form.value.user
      }
    }

    if (props.isEditing && form.value.id) {
      await studentStore.update(form.value.id, payload)
    } else {
      await studentStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = err.response?.data?.errors || err.errors || err.fieldErrors || {}
    generalMessage.value = err.response?.data?.message || err.message || 'Ocorreu um erro ao guardar o estudante.'

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
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha as informações pessoais e de conta do estudante.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto flex-1">
        <div v-if="generalMessage && !Object.keys(fieldErrors || {}).length" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ generalMessage }}</span>
        </div>

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

        <!-- Dados Pessoais -->
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
              <span v-if="hasError('person_firstname')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person_firstname') }}</span>
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
              <span v-if="hasError('person_lastname')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person_lastname') }}</span>
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
              <span v-if="hasError('person_bi_number')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person_bi_number') }}</span>
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
              <span v-if="hasError('person_birthday')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person_birthday') }}</span>
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
              <span v-if="hasError('person_gender')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('person_gender') }}</span>
            </div>
          </div>
        </div>

        <!-- Dados Escolares e Contacto -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Informações de Estudante & Contacto</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="Ex: 923000000"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Escola de Origem</label>
              <input
                v-model="form.origin_school"
                type="text"
                placeholder="Ex: Colégio ABC"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Pai</label>
              <input
                v-model="form.fathername"
                type="text"
                placeholder="Nome do pai"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Mãe</label>
              <input
                v-model="form.mothername"
                type="text"
                placeholder="Nome da mãe"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <!-- Conta de Utilizador -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Dados da Conta</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username (Opcional)</label>
              <input
                v-model="form.user!.username"
                @input="clearFieldError('user.username')"
                type="text"
                placeholder="Gerado automaticamente se vazio"
                :class="['w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-all', hasError('user.username') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('user.username')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('user.username') }}</span>
              <span v-if="hasError('user_username')" class="text-[10px] text-red-500 mt-1 block font-medium">{{ getFieldError('user_username') }}</span>
            </div>
            <div v-if="!isEditing">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Palavra-passe (Opcional)</label>
              <input
                v-model="form.user!.password"
                type="password"
                placeholder="Padrão: 123456"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
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