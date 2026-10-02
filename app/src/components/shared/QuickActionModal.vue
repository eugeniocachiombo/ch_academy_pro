<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import {
  addStudent,
  closeModal,
  openModals,
  quickActionPreset,
  quickActionTypes,
  showNotification,
  type QuickActionType,
} from '@/services/general_service'

const type = ref<QuickActionType>(quickActionTypes[0])
const name = ref('')
const notes = ref('')
const error = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

// Cada vez que o modal abre: limpa o formulário, aplica o tipo pré-selecionado e foca o campo de nome
watch(
  () => openModals['modal-quick-action'],
  async (open) => {
    if (!open) return
    type.value = quickActionPreset.value
    name.value = ''
    notes.value = ''
    error.value = ''
    await nextTick()
    nameInput.value?.focus()
  },
)

function close() {
  closeModal('modal-quick-action')
}

function submit() {
  const trimmed = name.value.trim()
  if (trimmed.length < 3) {
    error.value = 'Informe um nome ou identificação com pelo menos 3 caracteres.'
    nameInput.value?.focus()
    return
  }

  if (type.value === 'Matrícula de Novo Aluno') {
    const student = addStudent(trimmed)
    showNotification(`Matrícula de ${student.name} registrada (${student.enrollment}).`, 'success')
  } else {
    showNotification(`${type.value}: "${trimmed}" registrado no sistema.`, 'success')
  }
  close()
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="openModals['modal-quick-action']"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="qa-title" class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <h3 id="qa-title" class="font-bold text-base text-slate-800 dark:text-slate-100">Nova Ação Institucional</h3>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Fechar" @click="close">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="submit">
          <div>
            <label for="qa-type" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Tipo de Ação</label>
            <select id="qa-type" v-model="type" class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400">
              <option v-for="t in quickActionTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label for="qa-name" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Nome / Identificação</label>
            <input
              id="qa-name"
              ref="nameInput"
              v-model="name"
              type="text"
              maxlength="80"
              placeholder="Ex: João da Silva ou Turma 7º Ano"
              :aria-invalid="!!error"
              aria-describedby="qa-error"
              class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400"
              @input="error = ''"
            />
            <p v-if="error" id="qa-error" role="alert" class="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">{{ error }}</p>
          </div>
          <div>
            <label for="qa-notes" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Observações</label>
            <textarea id="qa-notes" v-model="notes" rows="3" maxlength="500" placeholder="Detalhes adicionais..." class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none resize-none focus:ring-2 focus:ring-indigo-400"></textarea>
          </div>
          <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
            Salvar e Processar
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>
