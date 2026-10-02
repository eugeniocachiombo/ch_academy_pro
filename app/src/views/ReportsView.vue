<script setup lang="ts">
import { showNotification } from '@/services/general_service'

const reports = [
  { icon: 'fa-file-pdf text-rose-500', title: 'Boletim MEC Consolidado', text: 'Indicadores de aprovação, evasão e frequência global.', button: 'Baixar PDF', message: 'Gerando PDF do Boletim MEC...' },
  { icon: 'fa-file-excel text-emerald-600 dark:text-emerald-400', title: 'Planilha Financeira Anual', text: 'Fluxo de caixa detalhado por centro de custo.', button: 'Baixar Excel', message: 'Gerando planilha Excel...' },
  { icon: 'fa-chart-line text-violet-600 dark:text-violet-400', title: 'Desempenho Docente', text: 'Avaliações institucionais e entrega de diários.', button: 'Gerar Relatório', message: 'Gerando relatório de desempenho...' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-xs border border-slate-100 dark:border-slate-800">
      <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Relatórios Analíticos Avançados</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Geração de relatórios ministeriais, boletins estatísticos e dados em PDF/Excel.</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="r in reports" :key="r.title" class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <i :class="r.icon" class="fa-solid text-2xl mb-3"></i>
            <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ r.title }}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ r.text }}</p>
          </div>
          <button @click="showNotification(r.message, 'success')" class="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all">
            {{ r.button }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
