<script setup lang="ts">
const transactions = [
  { title: 'Mensalidade Escolar - Matheus Lima', detail: 'PIX • Vencimento em dia', amount: '+ R$ 1.250,00' },
  { title: 'Matrícula Integral - Ana Clara Souza', detail: 'Cartão de Crédito (Parcela 1/5)', amount: '+ R$ 2.400,00' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <span class="text-xs font-bold text-slate-400 uppercase">Receita Total Acumulada</span>
        <h3 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">R$ 1.480.920</h3>
        <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1"><i class="fa-solid fa-arrow-trend-up"></i> +8,4% comparado ao ano anterior</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <span class="text-xs font-bold text-slate-400 uppercase">Inadimplência Geral</span>
        <h3 class="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">3,2%</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Abaixo da média nacional (6,5%)</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <span class="text-xs font-bold text-slate-400 uppercase">Boletos Emitidos (Mês)</span>
        <h3 class="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">642</h3>
        <p class="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-1">91% quitados em dia</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-xs border border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Últimas Transações Financeiras</h3>
      <div class="space-y-3">
        <div v-for="t in transactions" :key="t.title" class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <i class="fa-solid fa-arrow-down"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ t.title }}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ t.detail }}</p>
            </div>
          </div>
          <span class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{{ t.amount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
