<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 min-h-0 w-full h-full">
    <div class="w-20 h-20 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-6 border border-red-500/20 shadow-sm animate-pulse">
      <i class="fa-solid fa-ban"></i>
    </div>
    
    <h1 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Acesso Restrito</h1>
    <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
      Você não possui as permissões necessárias para visualizar este módulo ou executar esta ação. Entre em contato com o administrador do sistema se achar que isto é um erro.
    </p>

    <div class="mt-8">
      <button
        type="button"
        class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        @click="goBack"
      >
        <i class="fa-solid fa-arrow-left text-xs"></i>
        <span>Voltar para o Dashboard</span>
      </button>
    </div>
  </div>
</template>