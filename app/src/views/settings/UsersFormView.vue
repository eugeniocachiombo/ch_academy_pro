<script setup lang="ts">
import { ref, watch } from 'vue'
import { type RegisterPayload } from '@/stores/user.store'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  isLoading: boolean
  errors?: Record<string, string> | null
  initialData?: RegisterPayload & { id?: number; email?: string } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: RegisterPayload & { id?: number; email?: string }): void
}>()

const form = ref<RegisterPayload & { id?: number; email?: string }>({
  name: '',
  username: '',
  email: '',
  password: '',
})

const generateUsername = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._]/g, '')
}

watch(
  () => form.value.name,
  (newName) => {
    if (!props.isEditing && newName) {
      form.value.username = generateUsername(newName)
    }
  }
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
    } else {
      form.value = { name: '', username: '', email: '', password: '' }
    }
  },
  { immediate: true, deep: true }
)

const handleSubmit = () => {
  emit('save', form.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <!-- Cabeçalho -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <i :class="isEditing ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus'"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">{{ isEditing ? 'Editar Utilizador' : 'Novo Utilizador' }}</h3>
            <p class="text-xs text-slate-400">Preencha os dados cadastrais do sistema.</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="errors?.general" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
          <span>{{ errors.general }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ex: João Silva"
            :class="[
              'w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all',
              errors?.name ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="errors?.name" class="text-[11px] text-red-400 mt-1.5 block font-medium">{{ errors.name }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Ex: joao.silva"
            :class="[
              'w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all font-mono',
              errors?.username ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="errors?.username" class="text-[11px] text-red-400 mt-1.5 block font-medium">{{ errors.username }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Profissional</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Ex: joao.silva@empresa.com"
            :class="[
              'w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all',
              errors?.email ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="errors?.email" class="text-[11px] text-red-400 mt-1.5 block font-medium">{{ errors.email }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Palavra-passe <span v-if="isEditing" class="text-slate-500 font-normal">(Opcional na edição)</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            :class="[
              'w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all',
              errors?.password ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
            ]"
          />
          <span v-if="errors?.password" class="text-[11px] text-red-400 mt-1.5 block font-medium">{{ errors.password }}</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="isLoading" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ isLoading ? 'A guardar...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>