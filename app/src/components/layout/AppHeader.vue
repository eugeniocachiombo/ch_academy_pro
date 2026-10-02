<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { activeTab, isDark, tabTitles, toggleSidebar, toggleTheme, openModal, searchQuery, switchTab } from '@/services/general_service'

const notificationsOpen = ref(false)
const bellRoot = ref<HTMLElement | null>(null)

const notifications = [
  { icon: 'fa-user-plus', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', title: 'Nova matrícula realizada', text: 'Matheus Lima entrou no 9º Ano B.', time: 'Há 5 minutos' },
  { icon: 'fa-file-invoice-dollar', color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400', title: 'Mensalidade Paga', text: 'Boleto #4921 quitado via PIX.', time: 'Há 22 minutos' },
  { icon: 'fa-triangle-exclamation', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', title: 'Alerta de Frequência', text: 'Turma 6º Ano A com baixa presença.', time: 'Há 1 hora' },
]
const unread = ref(notifications.length)

/* Fecha o dropdown ao clicar fora ou apertar Esc */
function onDocumentClick(e: MouseEvent) {
  if (notificationsOpen.value && bellRoot.value && !bellRoot.value.contains(e.target as Node)) {
    notificationsOpen.value = false
  }
}
function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') notificationsOpen.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

/* Busca: filtra as listas de Alunos, Acadêmico e Professores */
const searchableTabs = ['students', 'academic', 'teachers']
function onSearchEnter() {
  if (searchQuery.value.trim() && !searchableTabs.includes(activeTab.value)) switchTab('students')
}
</script>

<template>
  <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0 shadow-xs">
    <div class="flex items-center gap-4">
      <button
        class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
        aria-label="Abrir ou fechar menu"
        @click="toggleSidebar"
      >
        <i class="fa-solid fa-bars-staggered text-lg"></i>
      </button>
      <div>
        <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Portal Institucional</span>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">{{ tabTitles[activeTab] }}</h2>
      </div>
    </div>

    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Busca -->
      <div class="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-2 w-64 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
        <i class="fa-solid fa-magnifying-glass text-slate-400 mr-2.5"></i>
        <input
          v-model="searchQuery"
          type="search"
          aria-label="Buscar aluno, turma ou professor"
          placeholder="Buscar aluno, turma, professor..."
          class="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 w-full placeholder-slate-400"
          @keydown.enter="onSearchEnter"
          @keydown.esc="searchQuery = ''"
        />
      </div>

      <button
        class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all transform active:scale-95"
        @click="openModal('modal-quick-action')"
      >
        <i class="fa-solid fa-plus"></i>
        <span class="hidden sm:inline">Nova Ação</span>
      </button>

      <!-- Tema claro / escuro -->
      <button
        class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
        :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
        :title="isDark ? 'Modo claro' : 'Modo escuro'"
        @click="toggleTheme"
      >
        <i :class="isDark ? 'fa-sun' : 'fa-moon'" class="fa-solid"></i>
      </button>

      <!-- Notificações -->
      <div ref="bellRoot" class="relative">
        <button
          class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors relative"
          aria-label="Notificações"
          :aria-expanded="notificationsOpen"
          @click="notificationsOpen = !notificationsOpen"
        >
          <i class="fa-regular fa-bell"></i>
          <span v-if="unread > 0" class="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
        </button>

        <div v-show="notificationsOpen" class="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 origin-top-right">
          <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">Notificações</h4>
            <span class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {{ unread > 0 ? `${unread} novas` : 'Tudo lido' }}
            </span>
          </div>
          <div class="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            <div v-for="n in notifications" :key="n.title" class="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3">
              <div :class="n.color" class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <i :class="n.icon" class="fa-solid text-xs"></i>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-100">{{ n.title }}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ n.text }}</p>
                <span class="text-[9px] text-slate-400 mt-1 block">{{ n.time }}</span>
              </div>
            </div>
          </div>
          <div v-if="unread > 0" class="px-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" @click="unread = 0">Marcar todas como lidas</button>
          </div>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
        <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Online</span>
      </div>
    </div>
  </header>
</template>
