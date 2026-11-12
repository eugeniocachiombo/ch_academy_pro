<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { addCommunication, closeModal, openModals, showNotification } from '@/services/general_service'

const audiences = ['Todos', 'Pais e encarregados', 'Professores', 'Alunos']

const title = ref('')
const audience = ref(audiences[0])
const body = ref('')
const error = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

watch(
  () => openModals['modal-notice'],
  async (open) => {
    if (!open) return
    title.value = ''
    audience.value = audiences[0]
    body.value = ''
    error.value = ''
    await nextTick()
    titleInput.value?.focus()
  },
)

function close() {
  closeModal('modal-notice')
}

function submit() {
  if (title.value.trim().length < 3) {
    error.value = 'Informe um título com pelo menos 3 caracteres.'
    titleInput.value?.focus()
    return
  }
  if (body.value.trim().length < 10) {
    error.value = 'A mensagem precisa ter pelo menos 10 caracteres.'
    return
  }
  addCommunication(title.value.trim(), audience.value, body.value.trim())
  showNotification('Comunicado enviado com sucesso!', 'success')
  close()
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="openModals['modal-notice']"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="nt-title" class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <h3 id="nt-title" class="font-bold text-base text-slate-800 dark:text-slate-100">Novo Comunicado</h3>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Fechar" @click="close">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="submit">
          <div>
            <label for="nt-subject" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Título</label>
            <input id="nt-subject" ref="titleInput" v-model="title" type="text" maxlength="100" placeholder="Ex: Reunião de pais e mestres" class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400" @input="error = ''" />
          </div>
          <div>
            <label for="nt-audience" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Destinatários</label>
            <select id="nt-audience" v-model="audience" class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400">
              <option v-for="a in audiences" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          <div>
            <label for="nt-body" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Mensagem</label>
            <textarea id="nt-body" v-model="body" rows="4" maxlength="600" placeholder="Escreva o comunicado..." class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none resize-none focus:ring-2 focus:ring-indigo-400" @input="error = ''"></textarea>
          </div>
          <p v-if="error" role="alert" class="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{{ error }}</p>
          <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
            Enviar comunicado
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>
