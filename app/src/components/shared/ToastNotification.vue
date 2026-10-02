<script setup lang="ts">
import { computed } from 'vue'
import { toast } from '@/services/general_service'

// Mapeia a cor de fundo e o ícone de acordo com o tipo do toast
const toastConfig = computed(() => {
  switch (toast.type) {
    case 'success':
      return {
        bg: 'bg-emerald-500',
        icon: 'fa-check'
      }
    case 'error':
      return {
        bg: 'bg-rose-500',
        icon: 'fa-circle-exclamation'
      }
    case 'warning':
      return {
        bg: 'bg-amber-500',
        icon: 'fa-triangle-exclamation'
      }
    case 'info':
    default:
      return {
        bg: 'bg-indigo-600',
        icon: 'fa-circle-info'
      }
  }
})
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    :class="toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-[200%] opacity-0 pointer-events-none'"
    class="fixed top-6 right-6 z-[60] transform transition-all duration-300"
  >
    <div class="bg-slate-900 dark:bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-700">
      <div
        :class="toastConfig.bg"
        class="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-sm transition-colors duration-300"
      >
        <i :class="['fa-solid', toastConfig.icon]"></i>
      </div>
      <div>
        <h4 class="text-xs font-bold">{{ toast.title }}</h4>
        <p class="text-[11px] text-slate-300">{{ toast.description }}</p>
      </div>
    </div>
  </div>
</template>