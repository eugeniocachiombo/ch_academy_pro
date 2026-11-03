<script setup lang="ts">
import { computed } from 'vue'
import { toast, showNotification } from '@/services/general_service' // Ajuste o import se necessário para fechar manualmente

// Configuração visual dinâmica para cada tipo de toast
const toastConfig = computed(() => {
  switch (toast.type) {
    case 'success':
      return {
        bgIcon: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        borderLeft: 'border-l-emerald-500',
        icon: 'fa-circle-check',
      }
    case 'error':
      return {
        bgIcon: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        borderLeft: 'border-l-rose-500',
        icon: 'fa-circle-exclamation',
      }
    case 'warning':
      return {
        bgIcon: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        borderLeft: 'border-l-amber-500',
        icon: 'fa-triangle-exclamation',
      }
    case 'info':
    default:
      return {
        bgIcon: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        borderLeft: 'border-l-indigo-500',
        icon: 'fa-circle-info',
      }
  }
})

function close() {
  toast.visible = false
}
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    :class="toast.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'"
    class="fixed top-6 right-6 z-[9999] transform transition-all duration-300 ease-out max-w-sm w-full px-4"
  >
    <div 
      class="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 py-3.5 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 flex items-start gap-3.5 border border-slate-100 dark:border-slate-800/80 border-l-4"
      :class="toastConfig.borderLeft"
    >
      <!-- Ícone Dinâmico -->
      <div
        :class="toastConfig.bgIcon"
        class="w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 text-base transition-colors duration-300 mt-0.5"
      >
        <i :class="['fa-solid', toastConfig.icon]"></i>
      </div>

      <!-- Textos -->
      <div class="flex-1 min-w-0 pr-1">
        <h4 class="text-xs font-bold tracking-tight text-slate-900 dark:text-white">{{ toast.title }}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">{{ toast.description }}</p>
      </div>

      <!-- Botão de Fechar -->
      <button
        type="button"
        class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 -mr-1 -mt-1 rounded-lg"
        aria-label="Fechar notificação"
        @click="close"
      >
        <i class="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  </div>
</template>