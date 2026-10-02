<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

interface ChatMessage {
  id: number
  from: 'me' | 'support'
  text: string
}

const open = ref(false)
const unread = ref(1)
const draft = ref('')
const list = ref<HTMLElement | null>(null)
const messages = ref<ChatMessage[]>([
  { id: 1, from: 'support', text: 'Olá! Seja bem-vindo ao suporte técnico EduSmart PRO. Como podemos auxiliar a gestão da sua instituição hoje?' },
])

let nextId = 2
const timers: ReturnType<typeof setTimeout>[] = []

function toggle() {
  open.value = !open.value
  if (open.value) unread.value = 0
}

async function scrollToEnd() {
  await nextTick()
  if (list.value) list.value.scrollTop = list.value.scrollHeight
}

// Mostra o texto digitado como texto puro (o Vue escapa o HTML), sem risco de XSS
function send() {
  const text = draft.value.trim()
  if (!text) return
  messages.value.push({ id: nextId++, from: 'me', text })
  draft.value = ''

  timers.push(
    setTimeout(() => {
      messages.value.push({
        id: nextId++,
        from: 'support',
        text: 'Recebemos sua mensagem! Nossa equipe pedagógica/técnica responderá em instantes.',
      })
    }, 1000),
  )
}

watch(() => messages.value.length, scrollToEnd)
watch(open, (isOpen) => isOpen && scrollToEnd())
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40">
    <button
      class="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xl flex items-center justify-center text-xl hover:scale-105 transition-all relative"
      :aria-label="open ? 'Fechar chat de suporte' : 'Abrir chat de suporte'"
      :aria-expanded="open"
      @click="toggle"
    >
      <i class="fa-solid fa-comments"></i>
      <span v-if="unread > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[9px] font-bold flex items-center justify-center">{{ unread }}</span>
    </button>

    <Transition name="pop">
      <div v-if="open" class="absolute bottom-20 right-0 w-[calc(100vw-3rem)] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col origin-bottom-right" role="dialog" aria-label="Suporte EduSmart PRO">
        <div class="bg-gradient-to-r from-indigo-900 to-violet-900 p-4 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="" class="w-9 h-9 rounded-full object-cover" />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-indigo-900"></span>
            </div>
            <div>
              <h4 class="text-xs font-bold">Suporte EduSmart PRO</h4>
              <span class="text-[10px] text-emerald-400 font-medium">Online agora • Resposta rápida</span>
            </div>
          </div>
          <button class="text-slate-300 hover:text-white p-1" aria-label="Fechar chat" @click="toggle"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div ref="list" class="p-4 bg-slate-50 dark:bg-slate-800/60 h-64 overflow-y-auto space-y-3 text-xs" aria-live="polite">
          <div v-for="m in messages" :key="m.id" :class="m.from === 'me' ? 'justify-end' : ''" class="flex gap-2 items-start">
            <div v-if="m.from === 'support'" class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">ES</div>
            <div
              :class="m.from === 'me' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'"
              class="p-3 rounded-2xl shadow-xs max-w-[80%] break-words"
            >{{ m.text }}</div>
          </div>
        </div>

        <form class="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2" @submit.prevent="send">
          <input
            v-model="draft"
            type="text"
            maxlength="500"
            aria-label="Mensagem para o suporte"
            placeholder="Digite sua mensagem..."
            class="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button type="submit" class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors" aria-label="Enviar mensagem">
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>
