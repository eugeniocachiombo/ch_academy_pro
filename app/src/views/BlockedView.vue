<script setup lang="ts">
import { useUserStore } from '@/stores/user.store'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = async () => {
  await userStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="w-full min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
      <div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
        <i class="fa-solid fa-user-lock"></i>
      </div>

      <div class="space-y-2">
        <h1 class="text-xl font-extrabold text-white tracking-tight">Conta Bloqueada</h1>
        <p class="text-sm text-slate-400 leading-relaxed">
          O acesso a esta conta foi suspenso temporariamente pela administração do sistema. Se acredita que isto é um erro, por favor contacte o suporte.
        </p>
      </div>

      <div class="pt-4 border-t border-slate-800/80">
        <button
          @click="handleLogout"
          class="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Terminar Sessão</span>
        </button>
      </div>
    </div>
  </div>
</template>