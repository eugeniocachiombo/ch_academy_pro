<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useStudentStore, type StudentPayload } from '@/stores/student.store.js'
import { useSchoolStore } from '@/stores/school.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

type BiStatus = 'idle' | 'checking' | 'available' | 'exists' | 'error'

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

const knownFields = [
  'school_id',
  'person.firstname',
  'person.middlename',
  'person.lastname',
  'person.bi_number',
  'person.birthday',
  'person.gender',
  'person.email',
  'phone',
  'address',
  'origin_school',
  'fathername',
  'mothername'
]

const emptyForm = (): StudentPayload & { id?: number } => ({
  processnum: undefined,
  phone: '',
  address: '',
  fathername: '',
  mothername: '',
  origin_school: '',
  school_id: authStore?.currentUser?.school_id ? Number(authStore.currentUser.school_id) : null,
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
const person = computed(() => form.value.person!)

const fieldErrors = ref<Record<string, string[]>>({})
const generalMessage = ref('')
const internalLoading = ref(false)
const formRef = ref<HTMLFormElement | null>(null)
const biInput = ref<HTMLInputElement | null>(null)

const biStatus = ref<BiStatus>('idle')
const originalBi = ref('')

const todayIso = new Date().toISOString().split('T')[0]

const schools = computed(() => schoolStore.schools || [])

const showBiCheck = computed(() => !props.isEditing || person.value.bi_number !== originalBi.value)

const biHasError = computed(() => hasError('person.bi_number') || biStatus.value === 'exists')

const age = computed(() => {
  const birthday = person.value.birthday
  if (!birthday) return null
  const date = new Date(birthday)
  if (isNaN(date.getTime())) return null
  const today = new Date()
  let years = today.getFullYear() - date.getFullYear()
  const months = today.getMonth() - date.getMonth()
  if (months < 0 || (months === 0 && today.getDate() < date.getDate())) years--
  return years >= 0 ? years : null
})

const unmatchedErrors = computed(() =>
  Object.entries(fieldErrors.value)
    .filter(([key]) => !knownFields.includes(key))
    .flatMap(([, messages]) => messages)
)

const normalizeErrors = (err: any): Record<string, string[]> => {
  const raw = err?.errors ?? err?.fieldErrors ?? err?.response?.data?.errors ?? err?.data?.errors ?? {}
  const result: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(raw)) {
    result[key] = Array.isArray(value) ? (value as string[]) : [String(value)]
  }
  return result
}

const getFieldError = (field: string): string => fieldErrors.value[field]?.[0] ?? ''

function hasError(field: string): boolean {
  return !!getFieldError(field)
}

const clearFieldError = (field: string) => {
  if (fieldErrors.value[field]) {
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

const inputClass = (field: string, force = false) => [
  'w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all',
  hasError(field) || force
    ? 'border-red-500 focus:ring-red-500/20'
    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
]

const setGender = (value: string) => {
  person.value.gender = value
  clearFieldError('person.gender')
}

const onBiInput = () => {
  clearFieldError('person.bi_number')
  biStatus.value = 'idle'
}

const verifyBi = async () => {
  const bi = (person.value.bi_number || '').trim()
  if (!bi || biStatus.value === 'checking') return
  biStatus.value = 'checking'
  clearFieldError('person.bi_number')
  try {
    const exists = await studentStore.checkBi(bi)
    biStatus.value = exists ? 'exists' : 'available'
  } catch {
    biStatus.value = 'error'
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen && !internalLoading.value) emit('close')
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  try {
    await schoolStore.list?.()
  } catch (e) {
    console.error('Erro ao carregar dados auxiliares', e)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      await nextTick()
      biInput.value?.focus()
    }
  }
)

watch(
  () => form.value.person?.bi_number,
  (value) => {
    if (!value) return
    const cleaned = value.toUpperCase().replace(/\s/g, '')
    if (cleaned !== value) form.value.person!.bi_number = cleaned
  }
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const base = emptyForm()
      form.value = {
        ...base,
        ...newData,
        phone: newData.phone ?? '',
        school_id: newData.school_id || Number(authStore.currentUser?.school_id) || null,
        person: {
          ...base.person!,
          ...newData.person,
          birthday: newData.person?.birthday ? newData.person.birthday.split('T')[0] : ''
        }
      }
      originalBi.value = props.isEditing ? (newData.person?.bi_number ?? '') : ''
    } else {
      form.value = emptyForm()
      originalBi.value = ''
    }
    biStatus.value = 'idle'
    fieldErrors.value = {}
    generalMessage.value = ''
  },
  { immediate: true, deep: true }
)

const scrollToFirstError = async () => {
  await nextTick()
  const target = formRef.value?.querySelector('[aria-invalid="true"]') as HTMLElement | null
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.focus?.()
  } else {
    formRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSubmit = async () => {
  if (internalLoading.value) return
  fieldErrors.value = {}
  generalMessage.value = ''

  if (showBiCheck.value && person.value.bi_number && biStatus.value !== 'available') {
    await verifyBi()
  }

  if (biStatus.value === 'exists') {
    generalMessage.value = 'Verifique os campos do formulário'
    fieldErrors.value = { 'person.bi_number': ['Já existe uma pessoa registada com este Nº do BI.'] }
    await scrollToFirstError()
    return
  }

  internalLoading.value = true

  try {
    const currentPerson = form.value.person!
    const payload: StudentPayload = {
      processnum: form.value.processnum ? String(form.value.processnum) : undefined,
      phone: form.value.phone || '',
      address: form.value.address || null,
      fathername: form.value.fathername || null,
      mothername: form.value.mothername || null,
      origin_school: form.value.origin_school || null,
      school_id: form.value.school_id
        ? Number(form.value.school_id)
        : (authStore.currentUser?.school_id ? Number(authStore.currentUser?.school_id) : null),
      person: {
        ...currentPerson,
        email: currentPerson.email || null,
        birthday: currentPerson.birthday ? new Date(currentPerson.birthday).toISOString() : ''
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
    generalMessage.value = err?.message || 'Ocorreu um erro ao guardar o aluno.'
    showNotification(generalMessage.value, 'error')
    await scrollToFirstError()
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-user-graduate"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Aluno' : 'Novo Aluno' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Os campos marcados com <span class="text-red-500 font-bold">*</span> são obrigatórios.
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          title="Fechar (Esc)"
          aria-label="Fechar"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form ref="formRef" @submit.prevent="handleSubmit" class="p-6 space-y-6 overflow-y-auto flex-1" novalidate>
        <div
          v-if="generalMessage"
          role="alert"
          class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3"
        >
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 shrink-0"></i>
          <div class="space-y-1">
            <p class="font-semibold">{{ generalMessage }}</p>
            <ul v-if="unmatchedErrors.length" class="list-disc pl-4 space-y-0.5">
              <li v-for="(message, index) in unmatchedErrors" :key="index">{{ message }}</li>
            </ul>
          </div>
        </div>

        <div
          v-if="!isEditing"
          class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs flex items-start gap-3"
        >
          <i class="fa-solid fa-circle-info text-base mt-0.5 shrink-0"></i>
          <p>
            O <strong>nº de processo</strong> é gerado automaticamente e serve de <strong>nome de utilizador</strong>.
            A palavra-passe inicial é <strong>123456</strong>.
          </p>
        </div>

        <section>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-fingerprint"></i> Identificação
          </h4>
          <label for="student-bi" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nº do BI <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              id="student-bi"
              ref="biInput"
              v-model="person.bi_number"
              @input="onBiInput"
              @keydown.enter.prevent="verifyBi"
              type="text"
              autocomplete="off"
              maxlength="20"
              placeholder="Ex: 000000000LA000"
              :aria-invalid="biHasError"
              :class="[...inputClass('person.bi_number', biStatus === 'exists'), 'uppercase', 'flex-1']"
            />
            <button
              v-if="showBiCheck"
              type="button"
              @click="verifyBi"
              :disabled="!person.bi_number || biStatus === 'checking'"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              <i v-if="biStatus === 'checking'" class="fa-solid fa-spinner animate-spin text-xs"></i>
              <i v-else class="fa-solid fa-magnifying-glass text-xs"></i>
              <span>{{ biStatus === 'checking' ? 'A verificar...' : 'Verificar BI' }}</span>
            </button>
          </div>
          <p v-if="biStatus === 'available'" class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check"></i> BI disponível, ainda não está registado.
          </p>
          <p v-else-if="biStatus === 'exists'" class="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-circle-xmark"></i> Já existe uma pessoa registada com este Nº do BI.
          </p>
          <p v-else-if="biStatus === 'error'" class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-triangle-exclamation"></i> Não foi possível verificar o BI. Tente novamente.
          </p>
          <span v-if="hasError('person.bi_number')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.bi_number') }}</span>
        </section>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="student-school" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Escola</label>
            <Select
              inputId="student-school"
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
            <span v-if="hasError('school_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('school_id') }}</span>
          </div>
          <div v-if="isEditing">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nº de Processo</label>
            <div class="w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <i class="fa-solid fa-lock text-[10px] text-slate-400"></i>
              #{{ form.processnum || '-' }}
            </div>
          </div>
        </div>

        <section>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-id-card"></i> Dados Pessoais
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label for="student-firstname" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primeiro Nome <span class="text-red-500">*</span></label>
              <input
                id="student-firstname"
                v-model="person.firstname"
                @input="clearFieldError('person.firstname')"
                type="text"
                autocomplete="off"
                placeholder="Ex: João"
                :aria-invalid="hasError('person.firstname')"
                :class="inputClass('person.firstname')"
              />
              <span v-if="hasError('person.firstname')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.firstname') }}</span>
            </div>
            <div>
              <label for="student-middlename" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Meio</label>
              <input
                id="student-middlename"
                v-model="person.middlename"
                type="text"
                autocomplete="off"
                placeholder="Ex: Manuel"
                :class="inputClass('person.middlename')"
              />
            </div>
            <div>
              <label for="student-lastname" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Último Nome <span class="text-red-500">*</span></label>
              <input
                id="student-lastname"
                v-model="person.lastname"
                @input="clearFieldError('person.lastname')"
                type="text"
                autocomplete="off"
                placeholder="Ex: Silva"
                :aria-invalid="hasError('person.lastname')"
                :class="inputClass('person.lastname')"
              />
              <span v-if="hasError('person.lastname')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.lastname') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label for="student-birthday" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data de Nascimento <span class="text-red-500">*</span>
                <span v-if="age !== null" class="font-normal text-slate-400 ml-1">({{ age }} {{ age === 1 ? 'ano' : 'anos' }})</span>
              </label>
              <input
                id="student-birthday"
                v-model="person.birthday"
                @input="clearFieldError('person.birthday')"
                type="date"
                :max="todayIso"
                :aria-invalid="hasError('person.birthday')"
                :class="inputClass('person.birthday')"
              />
              <span v-if="hasError('person.birthday')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.birthday') }}</span>
            </div>
            <div>
              <span class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Género <span class="text-red-500">*</span></span>
              <div
                class="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="Género"
                :aria-invalid="hasError('person.gender')"
                tabindex="-1"
              >
                <button
                  type="button"
                  role="radio"
                  :aria-checked="person.gender === 'M'"
                  @click="setGender('M')"
                  :class="[
                    'px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                    person.gender === 'M'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                      : hasError('person.gender')
                        ? 'border-red-500 text-slate-600 dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                  ]"
                >
                  <i class="fa-solid fa-mars text-xs"></i> Masculino
                </button>
                <button
                  type="button"
                  role="radio"
                  :aria-checked="person.gender === 'F'"
                  @click="setGender('F')"
                  :class="[
                    'px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                    person.gender === 'F'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                      : hasError('person.gender')
                        ? 'border-red-500 text-slate-600 dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                  ]"
                >
                  <i class="fa-solid fa-venus text-xs"></i> Feminino
                </button>
              </div>
              <span v-if="hasError('person.gender')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.gender') }}</span>
            </div>
            <div>
              <label for="student-email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <input
                id="student-email"
                v-model="person.email"
                @input="clearFieldError('person.email')"
                type="email"
                autocomplete="off"
                placeholder="Ex: joao@email.com"
                :aria-invalid="hasError('person.email')"
                :class="inputClass('person.email')"
              />
              <span v-if="hasError('person.email')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.email') }}</span>
            </div>
          </div>
        </section>

        <section class="pt-5 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-address-book"></i> Contacto e Filiação
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="student-phone" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telemóvel <span class="text-red-500">*</span></label>
              <input
                id="student-phone"
                v-model="form.phone"
                @input="clearFieldError('phone')"
                type="tel"
                inputmode="tel"
                autocomplete="off"
                maxlength="15"
                placeholder="Ex: 923 000 000"
                :aria-invalid="hasError('phone')"
                :class="inputClass('phone')"
              />
              <span v-if="hasError('phone')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('phone') }}</span>
            </div>
            <div>
              <label for="student-address" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Morada</label>
              <input
                id="student-address"
                v-model="form.address"
                @input="clearFieldError('address')"
                type="text"
                autocomplete="off"
                placeholder="Ex: Bairro Azul, Rua 12"
                :class="inputClass('address')"
              />
            </div>
            <div>
              <label for="student-fathername" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Pai</label>
              <input
                id="student-fathername"
                v-model="form.fathername"
                @input="clearFieldError('fathername')"
                type="text"
                autocomplete="off"
                placeholder="Nome completo do pai"
                :class="inputClass('fathername')"
              />
            </div>
            <div>
              <label for="student-mothername" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Mãe</label>
              <input
                id="student-mothername"
                v-model="form.mothername"
                @input="clearFieldError('mothername')"
                type="text"
                autocomplete="off"
                placeholder="Nome completo da mãe"
                :class="inputClass('mothername')"
              />
            </div>
            <div class="sm:col-span-2">
              <label for="student-origin" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Escola de Origem</label>
              <input
                id="student-origin"
                v-model="form.origin_school"
                @input="clearFieldError('origin_school')"
                type="text"
                autocomplete="off"
                placeholder="Ex: Colégio ABC"
                :class="inputClass('origin_school')"
              />
            </div>
          </div>
        </section>

        <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="internalLoading"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading || biStatus === 'checking'"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <i v-else class="fa-solid fa-floppy-disk text-xs"></i>
            <span>{{ internalLoading ? 'A guardar...' : (isEditing ? 'Guardar alterações' : 'Registar aluno') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>