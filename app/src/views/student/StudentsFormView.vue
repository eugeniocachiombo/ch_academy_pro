<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useStudentStore } from '@/stores/student.store'
// Importa o teu store ou serviço de localizações (exemplo genérico)
// import { useLocationStore } from '@/stores/location.store'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string | string[]>
  [key: string]: any
}

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  initialData?: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const studentStore = useStudentStore()
// const locationStore = useLocationStore()

const form = ref<any>({
  firstname: '',
  middlename: '',
  lastname: '',
  birthday: '',
  gender: 'M',
  bi_number: '',
  nif: '',
  phone: '',
  alternative_phone: '',
  email: '',
  province: 'Luanda',
  municipality: '',
  neighborhood: '',
  street: '',
  house_number: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_bi: '',
  origin_school: '',
})

// Dados vindos da Base de Dados
const provincesList = ref<any[]>([]) // Ex: [{ id: 1, name: 'Luanda' }, ...]
const municipalitiesList = ref<any[]>([]) // Ex: [{ id: 1, name: 'Viana', province_id: 1 }, ...]

// Carregar províncias e municípios da BD ao montar o componente
onMounted(async () => {
  try {
    // Exemplo:
    // provincesList.value = await locationStore.fetchProvinces()
  } catch (error) {
    console.error('Erro ao carregar províncias:', error)
  }
})

// Quando a província muda, busca os municípios correspondentes à província selecionada na BD
watch(
  () => form.value.province,
  async (newProvince) => {
    if (!newProvince) {
      municipalitiesList.value = []
      return
    }
    try {
      // Exemplo: Se guardares pelo nome ou ID da província
      // municipalitiesList.value = await locationStore.fetchMunicipalities(newProvince)
    } catch (error) {
      console.error('Erro ao carregar municípios:', error)
    }
  },
  { immediate: true }
)

const formErrors = ref<ApiErrorResponse | null>(null)
const internalLoading = ref(false)

const getFieldError = (field: string) => {
  if (!formErrors.value) return ''
  const errorObj = formErrors.value.errors || formErrors.value
  const fieldError = errorObj[field]
  if (!fieldError) return ''
  return Array.isArray(fieldError) ? fieldError[0] : fieldError
}

const hasError = (field: string) => {
  return !!getFieldError(field)
}

const getGeneralMessage = () => {
  if (!formErrors.value) return ''
  if (formErrors.value.errors) return ''
  return formErrors.value.message || ''
}

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { 
        ...newData,
        birthday: newData.birthday ? new Date(newData.birthday).toISOString().split('T')[0] : ''
      }
    } else {
      form.value = {
        firstname: '',
        middlename: '',
        lastname: '',
        birthday: '',
        gender: 'M',
        bi_number: '',
        nif: '',
        phone: '',
        alternative_phone: '',
        email: '',
        province: 'Luanda',
        municipality: '',
        neighborhood: '',
        street: '',
        house_number: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_bi: '',
        origin_school: '',
      }
    }
    formErrors.value = null
  },
  { immediate: true, deep: true }
)

const handleSubmit = async () => {
  formErrors.value = null
  internalLoading.value = true

  try {
    const payload = { ...form.value }
    if (props.isEditing && form.value.id) {
      await studentStore.update(form.value.id, payload)
    } else {
      await studentStore.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (err: any) {
    if (err.response?.data) {
      formErrors.value = err.response.data
    } else {
      formErrors.value = { 
        message: err.message || 'Ocorreu um erro ao salvar o registo.' 
      }
    }
  } finally {
    internalLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ isEditing ? 'Editar Aluno' : 'Novo Aluno' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os dados pessoais e de identificação.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <div v-if="getGeneralMessage()" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ getGeneralMessage() }}</span>
        </div>

        <!-- Dados Pessoais -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">1. Dados Pessoais</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Primeiro Nome</label>
              <input
                v-model="form.firstname"
                type="text"
                placeholder="Ex: Manuel"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('firstname') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('firstname')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('firstname') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Meio</label>
              <input
                v-model="form.middlename"
                type="text"
                placeholder="Ex: da Silva"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Último Nome</label>
              <input
                v-model="form.lastname"
                type="text"
                placeholder="Ex: Costa"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('lastname') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('lastname')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('lastname') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data de Nascimento</label>
              <input
                v-model="form.birthday"
                type="date"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('birthday') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('birthday')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('birthday') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Género</label>
              <select
                v-model="form.gender"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Identificação e Documentos -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">2. Identificação</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nº do Bilhete de Identidade (BI)</label>
              <input
                v-model="form.bi_number"
                type="text"
                placeholder="Ex: 004589231LA042"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 uppercase focus:outline-none transition-all"
                :class="[hasError('bi_number') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('bi_number')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('bi_number') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NIF (Opcional)</label>
              <input
                v-model="form.nif"
                type="text"
                placeholder="Ex: 5000000000"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Contactos e Morada -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">3. Contactos e Localização</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Telemóvel / Telefone</label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="Ex: 923456789"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('phone') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('phone')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('phone') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail (Opcional)</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="Ex: aluno@escola.ao"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Província</label>
              <select
                v-model="form.province"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">Selecione a Província</option>
                <option v-for="prov in provincesList" :key="prov.id || prov" :value="prov.name || prov">{{ prov.name || prov }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Município</label>
              <select
                v-model="form.municipality"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">Selecione o Município</option>
                <option v-for="mun in municipalitiesList" :key="mun.id || mun" :value="mun.name || mun">{{ mun.name || mun }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bairro</label>
              <input
                v-model="form.neighborhood"
                type="text"
                placeholder="Ex: Maianga"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('neighborhood') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rua (Opcional)</label>
              <input
                v-model="form.street"
                type="text"
                placeholder="Ex: Rua 12"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nº Casa (Opcional)</label>
              <input
                v-model="form.house_number"
                type="text"
                placeholder="Ex: 45"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Encarregado e Escola Anterior -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">4. Encarregado de Educação</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Encarregado</label>
              <input
                v-model="form.guardian_name"
                type="text"
                placeholder="Ex: João da Costa"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('guardian_name') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('guardian_name')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('guardian_name') }}</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Telefone do Encarregado</label>
              <input
                v-model="form.guardian_phone"
                type="text"
                placeholder="Ex: 933123456"
                class="w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none transition-all"
                :class="[hasError('guardian_phone') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500']"
              />
              <span v-if="hasError('guardian_phone')" class="text-[11px] text-red-600 dark:text-red-400 mt-1 block font-medium">{{ getFieldError('guardian_phone') }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Escola de Proveniência (Opcional)</label>
              <input
                v-model="form.origin_school"
                type="text"
                placeholder="Ex: Complexo Escolar 11 de Novembro"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 py-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="internalLoading"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="internalLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ internalLoading ? 'A guardar...' : 'Guardar Aluno' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>