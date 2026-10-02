<script setup lang="ts">
const classes = [
  { icon: 'fa-calculator', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', title: 'Matemática Avançada', teacher: 'Prof. Carlos • Turma 9º A', time: '08:30' },
  { icon: 'fa-atom', color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400', title: 'Física Quântica Base', teacher: 'Profª. Helena • Turma 3ºEM', time: '10:15' },
  { icon: 'fa-book-atlas', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', title: 'História Geral', teacher: 'Prof. Roberto • Turma 8º B', time: '13:30' },
]
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Próximas Aulas</h3>
        <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-xl">Horário</span>
      </div>
      <div class="space-y-3">
        <div v-for="c in classes" :key="c.title" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="c.color" class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm">
              <i :class="c.icon" class="fa-solid"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ c.title }}</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ c.teacher }}</p>
            </div>
          </div>
          <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">{{ c.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
