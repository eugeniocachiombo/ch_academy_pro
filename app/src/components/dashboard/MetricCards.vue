<script setup lang="ts">
interface Metric {
  label: string
  value: string
  badge: string
  badgeIcon: string
  icon: string
  progress: number
  iconBox: string
  badgeClass: string
  bar: string
  valueClass?: string
  cardClass?: string
}

const metrics: Metric[] = [
  { label: 'Frequência Alunos', value: '94%', badge: '+2,4%', badgeIcon: 'fa-arrow-trend-up', icon: 'fa-user-check', progress: 94, iconBox: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10', bar: 'bg-emerald-500' },
  { label: 'Novas Matrículas', value: '28', badge: '+12%', badgeIcon: 'fa-arrow-trend-up', icon: 'fa-user-plus', progress: 78, iconBox: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', badgeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10', bar: 'bg-blue-500' },
  { label: 'Recebido Mês', value: 'R$ 158.450', badge: '+5,1%', badgeIcon: 'fa-arrow-trend-up', icon: 'fa-wallet', progress: 88, iconBox: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10', bar: 'bg-amber-500', valueClass: 'text-xl lg:text-2xl' },
  { label: 'Desempenho', value: '89%', badge: '+4,2%', badgeIcon: 'fa-arrow-trend-up', icon: 'fa-award', progress: 89, iconBox: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400', badgeClass: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10', bar: 'bg-violet-600' },
  { label: 'Tarefas Pendentes', value: '355', badge: 'Ativo', badgeIcon: 'fa-clock', icon: 'fa-list-check', progress: 65, iconBox: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400', badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10', bar: 'bg-rose-500', cardClass: 'sm:col-span-2 lg:col-span-1' },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <div
      v-for="m in metrics"
      :key="m.label"
      :class="m.cardClass"
      class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ m.label }}</span>
        <div :class="m.iconBox" class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
          <i :class="m.icon" class="fa-solid"></i>
        </div>
      </div>
      <div class="mt-4 flex items-baseline justify-between">
        <h3 :class="m.valueClass ?? 'text-2xl'" class="font-extrabold text-slate-800 dark:text-slate-100">{{ m.value }}</h3>
        <span :class="m.badgeClass" class="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <i :class="m.badgeIcon" class="fa-solid"></i> {{ m.badge }}
        </span>
      </div>
      <div class="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div :class="m.bar" :style="{ width: m.progress + '%' }" class="h-full rounded-full"></div>
      </div>
    </div>
  </div>
</template>
