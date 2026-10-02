<script setup lang="ts">
import { computed } from 'vue'
import { matchesSearch, openModal, searchQuery, showNotification } from '@/services/general_service'

const classes = [
  { name: '9º Ano A - Ensino Fundamental', shift: 'Matutino', teacher: 'Prof. Carlos Eduardo', enrolled: '38 / 40', label: '9º Ano A' },
  { name: '1º Ano B - Ensino Médio', shift: 'Vespertino', teacher: 'Profª. Helena R.', enrolled: '42 / 45', label: '1º Ano B' },
  { name: '8º Ano C - Ensino Fundamental', shift: 'Matutino', teacher: 'Prof. Roberto Silveira', enrolled: '35 / 40', label: '8º Ano C' },
]

const filtered = computed(() => classes.filter((c) => matchesSearch(c.name, c.teacher, c.shift)))
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-xs border border-slate-100 dark:border-slate-800">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Gestão Acadêmica e Matrizes</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Controle completo de turmas, grades curriculares, diários de classe e boletins.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all" @click="openModal('modal-quick-action', 'Criação de Nova Turma')">
          <i class="fa-solid fa-plus mr-2"></i> Criar Nova Turma
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th class="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-l-xl">Turma / Série</th>
              <th class="px-4 py-3 bg-slate-50 dark:bg-slate-800/60">Turno</th>
              <th class="px-4 py-3 bg-slate-50 dark:bg-slate-800/60">Professor Titular</th>
              <th class="px-4 py-3 bg-slate-50 dark:bg-slate-800/60">Alunos Matriculados</th>
              <th class="px-4 py-3 bg-slate-50 dark:bg-slate-800/60">Status</th>
              <th class="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 text-right rounded-r-xl">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
            <tr v-for="c in filtered" :key="c.name" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <td class="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">{{ c.name }}</td>
              <td class="px-4 py-3.5">{{ c.shift }}</td>
              <td class="px-4 py-3.5">{{ c.teacher }}</td>
              <td class="px-4 py-3.5">{{ c.enrolled }}</td>
              <td class="px-4 py-3.5"><span class="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full text-[10px]">Ativo</span></td>
              <td class="px-4 py-3.5 text-right whitespace-nowrap">
                <button :aria-label="`Abrir diário da turma ${c.label}`" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold p-1" @click="showNotification(`Abrindo diário da turma ${c.label}`, 'info')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button :aria-label="`Exportar relatório da turma ${c.label}`" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 ml-2" @click="showNotification(`Exportando relatório da turma ${c.label}`, 'success')">
                  <i class="fa-solid fa-download"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Nenhuma turma encontrada para “{{ searchQuery }}”.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
