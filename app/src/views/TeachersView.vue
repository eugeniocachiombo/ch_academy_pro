<script setup lang="ts">
import { computed } from 'vue'
import { matchesSearch, searchQuery } from '@/services/general_service'

const teachers = [
  { name: 'Prof. Carlos Eduardo', subject: 'Matemática & Física', bio: 'Doutorado pela USP • 8 anos na escola', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { name: 'Profª. Helena Rodrigues', subject: 'Química & Biologia', bio: 'Mestrado pela Unicamp • 5 anos na escola', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100' },
]

const filtered = computed(() => teachers.filter((t) => matchesSearch(t.name, t.subject)))
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-xs border border-slate-100 dark:border-slate-800">
      <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Corpo Docente EduSmart</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Professores e especialistas ativos na instituição.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="t in filtered" :key="t.name" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <img :src="t.photo" :alt="t.name" loading="lazy" class="w-14 h-14 rounded-2xl object-cover" />
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ t.name }}</h4>
            <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{{ t.subject }}</p>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{{ t.bio }}</span>
          </div>
        </div>
      </div>
      <p v-if="!filtered.length" class="text-xs text-slate-500 dark:text-slate-400 text-center py-8">Nenhum professor encontrado para “{{ searchQuery }}”.</p>
    </div>
  </div>
</template>
