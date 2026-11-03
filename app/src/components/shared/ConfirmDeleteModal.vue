<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title?: string
  message: string
  isDeleting?: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up"
    >
      <div class="p-6 text-center space-y-4">
        <div
          class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center text-2xl shadow-inner"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ title || 'Eliminar Registo' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed" v-html="message"></p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isDeleting"
            class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="$emit('confirm')"
            :disabled="isDeleting"
            class="px-6 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="isDeleting" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ isDeleting ? 'A eliminar...' : 'Sim, eliminar' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>