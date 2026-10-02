<script setup lang="ts">
import { openModal } from '@/services/general_service'

const notices = [
  { icon: 'fa-triangle-exclamation', card: 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', iconBox: 'bg-amber-500', time: 'text-amber-700 dark:text-amber-300', title: 'Reunião Geral de Ciências', text: 'Prazo final para entrega de planos de aula laboratoriais.', when: 'Hoje, 14:00' },
  { icon: 'fa-calendar-check', card: 'bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20', iconBox: 'bg-indigo-600', time: 'text-indigo-700 dark:text-indigo-300', title: 'Feira de Ciências 2026', text: 'Inscrição dos projetos dos alunos do ensino médio.', when: 'Até 28/11' },
]
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Avisos Importantes</h3>
        <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-xl">Comunicados</span>
      </div>
      <div class="space-y-3">
        <div v-for="n in notices" :key="n.title" :class="n.card" class="p-3.5 rounded-2xl border flex items-start gap-3">
          <div :class="n.iconBox" class="w-8 h-8 rounded-xl text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
            <i :class="n.icon" class="fa-solid"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ n.title }}</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{{ n.text }}</p>
            <span :class="n.time" class="text-[10px] font-semibold mt-1 block">{{ n.when }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
      <button @click="openModal('modal-notice')" class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2">
        <i class="fa-solid fa-plus"></i> Novo Comunicado
      </button>
    </div>
  </div>
</template>
