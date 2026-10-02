<script setup lang="ts">
import { computed } from 'vue'
import { matchesSearch, openModal, searchQuery, students } from '@/services/general_service'

const filtered = computed(() => students.filter((s) => matchesSearch(s.name, s.className, s.enrollment)))

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-xs border border-slate-100 dark:border-slate-800">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Diretório de Alunos</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Lista completa de estudantes matriculados e histórico escolar.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex-shrink-0" @click="openModal('modal-quick-action', 'Matrícula de Novo Aluno')">
          <i class="fa-solid fa-user-plus mr-2"></i> Nova Matrícula
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="s in filtered" :key="s.id" class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-4">
          <img v-if="s.photo" :src="s.photo" :alt="s.name" loading="lazy" class="w-12 h-12 rounded-2xl object-cover" />
          <div v-else class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center" aria-hidden="true">{{ initials(s.name) }}</div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{{ s.name }}</h4>
            <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{{ s.className }} • Matrícula {{ s.enrollment }}</span>
            <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Situação: {{ s.status }}</p>
          </div>
        </div>
      </div>
      <p v-if="!filtered.length" class="text-xs text-slate-500 dark:text-slate-400 text-center py-8">Nenhum aluno encontrado para “{{ searchQuery }}”.</p>
    </div>
  </div>
</template>
