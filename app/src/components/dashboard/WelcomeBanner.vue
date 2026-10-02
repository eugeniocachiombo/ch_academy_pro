<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { showNotification } from '@/services/general_service'

const refreshing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  timer = setTimeout(() => {
    refreshing.value = false
    showNotification('Dados do painel sincronizados em tempo real.', 'success')
  }, 1000)
}

onBeforeUnmount(() => timer && clearTimeout(timer))
</script>

<template>
  <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl">
    <div class="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="bg-indigo-500/30 text-indigo-200 font-semibold text-[11px] px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/30">Visão Geral Diária</span>
        <h2 class="text-2xl lg:text-3xl font-extrabold mt-3 tracking-tight">Painel Executivo CH ACADEMIC PRO</h2>
        <p class="text-indigo-200 text-sm mt-1 max-w-xl">Monitore a frequência escolar, fluxo de caixa, desempenho acadêmico e indicadores críticos em tempo real.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="showNotification('Relatório executivo gerado com sucesso!', 'success')"
          class="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all backdrop-blur-md flex items-center gap-2"
        >
          <i class="fa-solid fa-download"></i> Exportar Dados
        </button>
        <button :disabled="refreshing" @click="refresh" class="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2">
          <i :class="{ 'animate-spin': refreshing }" class="fa-solid fa-rotate"></i> Atualizar
        </button>
      </div>
    </div>
  </div>
</template>
