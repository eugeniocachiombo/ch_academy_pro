<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useTeacherStore, type TeacherPayload } from '@/stores/teacher.store.js'
import { useSchoolStore } from '@/stores/school.store.js'
import { useDegreeStore } from '@/stores/degree.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { showNotification } from '@/services/general_service'
import Select from 'primevue/select'

type BiStatus = 'idle' | 'checking' | 'available' | 'exists' | 'error'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  initialData?: (TeacherPayload & { id?: number }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const teacherStore = useTeacherStore()
const schoolStore = useSchoolStore()
const degreeStore = useDegreeStore()
const authStore = useAuthStore()

const knownFields = [
  'school_id',
  'degree_id',
  'specialty',
  'person.firstname',
  'person.middlename',
  'person.lastname',
  'person.bi_number',
  'person.birthday',
  'person.gender',
  'person.email',
  'person.phone'
]

const emptyForm = (): TeacherPayload & { id?: number } => ({
  codenumber: undefined,
  degree_id: undefined,
  specialty: '',
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

const form = ref<TeacherPayload & { id?: number }>(emptyForm())
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
const degrees = computed(() => degreeStore.degrees || [])

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
    const exists = await teacherStore.checkBi(bi)
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
    await Promise.all([
      schoolStore.list?.(),
      degreeStore.list?.()
    ])
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
        degree_id: newData.degree_id ? Number(newData.degree_id) : undefined,
        school_id: newData.school_id ? Number(newData.school_id) : (authStore.currentUser?.school_id ? Number(authStore.currentUser.school_id) : null),
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
    const payload: TeacherPayload = {
      degree_id: form.value.degree_id ? Number(form.value.degree_id) : undefined,
      specialty: form.value.specialty || null,
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
      await teacherStore.update(form.value.id, payload)
    } else {
      await teacherStore.create(payload)
    }
    emit('saved')
  } catch (err: any) {
    fieldErrors.value = normalizeErrors(err)
    generalMessage.value = err?.message || 'Ocorreu um erro ao guardar o professor.'
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
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Professor' : 'Novo Professor' }}</h3>
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
        <section>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-fingerprint"></i> Identificação
          </h4>
          <label for="teacher-bi" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nº do BI <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              id="teacher-bi"
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
            <label for="teacher-school" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Escola</label>
            <Select
              inputId="teacher-school"
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

          <div>
            <label for="teacher-degree" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grau Académico <span class="text-red-500">*</span></label>
            <Select
              inputId="teacher-degree"
              v-model="form.degree_id"
              :options="degrees"
              optionLabel="name"
              optionValue="id"
              filter
              placeholder="Selecione o grau..."
              class="w-full"
              @update:modelValue="clearFieldError('degree_id')"
              :class="{ 'p-invalid': hasError('degree_id') }"
            />
            <span v-if="hasError('degree_id')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('degree_id') }}</span>
          </div>
        </div>

        <section>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-id-card"></i> Dados Pessoais
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label for="teacher-firstname" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primeiro Nome <span class="text-red-500">*</span></label>
              <input
                id="teacher-firstname"
                v-model="person.firstname"
                @input="clearFieldError('person.firstname')"
                type="text"
                autocomplete="off"
                placeholder="Ex: António"
                :aria-invalid="hasError('person.firstname')"
                :class="inputClass('person.firstname')"
              />
              <span v-if="hasError('person.firstname')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.firstname') }}</span>
            </div>
            <div>
              <label for="teacher-middlename" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Meio</label>
              <input
                id="teacher-middlename"
                v-model="person.middlename"
                type="text"
                autocomplete="off"
                placeholder="Ex: Carlos"
                :class="inputClass('person.middlename')"
              />
            </div>
            <div>
              <label for="teacher-lastname" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Último Nome <span class="text-red-500">*</span></label>
              <input
                id="teacher-lastname"
                v-model="person.lastname"
                @input="clearFieldError('person.lastname')"
                type="text"
                autocomplete="off"
                placeholder="Ex: Domingos"
                :aria-invalid="hasError('person.lastname')"
                :class="inputClass('person.lastname')"
              />
              <span v-if="hasError('person.lastname')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.lastname') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label for="teacher-birthday" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data de Nascimento <span class="text-red-500">*</span>
                <span v-if="age !== null" class="font-normal text-slate-400 ml-1">({{ age }} {{ age === 1 ? 'ano' : 'anos' }})</span>
              </label>
              <input
                id="teacher-birthday"
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
              <label for="teacher-email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <input
                id="teacher-email"
                v-model="person.email"
                @input="clearFieldError('person.email')"
                type="email"
                autocomplete="off"
                placeholder="Ex: antónio@email.com"
                :aria-invalid="hasError('person.email')"
                :class="inputClass('person.email')"
              />
              <span v-if="hasError('person.email')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.email') }}</span>
            </div>
          </div>
        </section>

        <section class="pt-5 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-address-book"></i> Contacto e Profissão
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="teacher-phone" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telemóvel <span class="text-red-500">*</span></label>
              <input
                id="teacher-phone"
                v-model="person.phone"
                @input="clearFieldError('person.phone')"
                type="tel"
                inputmode="tel"
                autocomplete="off"
                maxlength="15"
                placeholder="Ex: 923 000 000"
                :aria-invalid="hasError('person.phone')"
                :class="inputClass('person.phone')"
              />
              <span v-if="hasError('person.phone')" class="text-[11px] text-red-500 mt-1 block font-medium">{{ getFieldError('person.phone') }}</span>
            </div>
            <div>
              <label for="teacher-specialty" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Especialidade</label>
              <input
                id="teacher-specialty"
                v-model="form.specialty"
                @input="clearFieldError('specialty')"
                type="text"
                autocomplete="off"
                placeholder="Ex: Matemática e Física"
                :class="inputClass('specialty')"
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
            <span>{{ internalLoading ? 'A guardar...' : (isEditing ? 'Guardar alterações' : 'Registar professor') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>