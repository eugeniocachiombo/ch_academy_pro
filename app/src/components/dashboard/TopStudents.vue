<script setup lang="ts">
import { computed } from 'vue'
import { formatDecimal, students, type Badge } from '@/services/general_service'

const badgeColor: Record<Badge, string> = {
  Ouro: 'text-amber-500',
  Prata: 'text-slate-400',
  Bronze: 'text-amber-700 dark:text-amber-300',
}

// Alunos recém-matriculados (sem selo/média) não entram no ranking
const topStudents = computed(() =>
  students
    .filter((s) => s.badge)
    .sort((a, b) => b.average - a.average)
    .slice(0, 3),
)
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Alunos Destaques</h3>
        <span class="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-xl">Mérito</span>
      </div>
      <div class="space-y-3">
        <div v-for="s in topStudents" :key="s.id" class="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
          <div class="flex items-center gap-3">
            <img :src="s.photo" :alt="s.name" class="w-9 h-9 rounded-xl object-cover" />
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ s.name }}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ s.className }} • Média {{ formatDecimal(s.average) }}</p>
            </div>
          </div>
          <span :class="badgeColor[s.badge!]" class="text-xs font-bold"><i class="fa-solid fa-medal"></i> {{ s.badge }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
