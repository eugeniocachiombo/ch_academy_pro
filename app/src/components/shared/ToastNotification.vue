<script setup lang="ts">
import { toast } from '@/services/general_service'
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
        :class="toast.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-600'"
        class="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-sm"
      >
        <i :class="toast.type === 'success' ? 'fa-check' : 'fa-bell'" class="fa-solid"></i>
      </div>
      <div>
        <h4 class="text-xs font-bold">{{ toast.title }}</h4>
        <p class="text-[11px] text-slate-300">{{ toast.description }}</p>
      </div>
    </div>
  </div>
</template>
