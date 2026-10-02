<script setup lang="ts">
import { communications, openModal } from '@/services/general_service'
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-xs border border-slate-100 dark:border-slate-800">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Central de Comunicados Escolares</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Envio de circulares, avisos para pais e mensagens push no aplicativo móvel.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all" @click="openModal('modal-notice')">
          <i class="fa-solid fa-plus mr-2"></i> Novo Comunicado
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="m in communications" :key="m.id" class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ m.title }}</h4>
            <span class="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Enviado para {{ m.audience }}</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-2">{{ m.body }}</p>
          <span class="text-[10px] text-slate-400 mt-2 block">{{ m.meta }}</span>
        </div>
        <p v-if="!communications.length" class="text-xs text-slate-500 dark:text-slate-400 text-center py-8">Nenhum comunicado enviado. Use “Novo Comunicado” para criar o primeiro.</p>
      </div>
    </div>
  </div>
</template>
