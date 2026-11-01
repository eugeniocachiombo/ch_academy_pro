<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store' 
import { isDark, showNotification, toggleTheme } from '@/services/general_service'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const usernameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)

const features = [
  { icon: 'fa-user-check', text: 'Frequência e notas acompanhadas em tempo real' },
  { icon: 'fa-wallet', text: 'Mensalidades, boletos e inadimplência num só painel' },
  { icon: 'fa-bullhorn', text: 'Comunicados para pais, alunos e professores' },
]

function redirectTarget(): string {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/'
}

async function submit() {
  if (authStore.isLoading) return
  authStore.clearError()

  if (!username.value.trim()) {
    const msg = 'Informe o nome de utilizador.'
    authStore.error = msg
    showNotification(msg, 'error')
    usernameInput.value?.focus()
    return
  }
  
  if (password.value.length < 6) {
    const msg = 'A senha deve ter pelo menos 6 caracteres.'
    authStore.error = msg
    showNotification(msg, 'error')
    passwordInput.value?.focus()
    return
  }

  try {
    await authStore.login(username.value, password.value, remember.value)
    await router.replace(redirectTarget())
    showNotification(`Bem-vindo(a), ${authStore.userName}!`, 'success')
  } catch (err: any) {
    const msg = err.message || 'Utilizador não encontrado.'
    showNotification(msg, 'error')
    passwordInput.value?.focus()
  }
}

function forgotPassword() {
  showNotification('Para redefinir a senha, fale com o administrador da instituição.', 'info')
}
</script>

<template>
  <div class="flex-1 min-h-0 overflow-y-auto flex bg-slate-50 dark:bg-slate-950">
    <aside class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-12 flex-col justify-between">
      <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
      <div class="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-violet-500/10 pointer-events-none"></div>

      <div class="relative flex items-center gap-3">
        <div class="bg-gradient-to-tr from-indigo-600 to-violet-500 p-3 rounded-xl shadow-lg shadow-indigo-500/30">
          <i class="fa-solid fa-graduation-cap text-2xl"></i>
        </div>
        <div>
          <p class="font-extrabold text-xl tracking-wide leading-none">CH ACADEMIC</p>
          <p class="text-xs font-semibold tracking-widest text-indigo-300 mt-1">PRO SYSTEM</p>
        </div>
      </div>

      <div class="relative max-w-md">
        <h2 class="text-4xl font-extrabold tracking-tight leading-tight">A gestão da sua escola, num só lugar.</h2>
        <ul class="mt-8 space-y-4">
          <li v-for="f in features" :key="f.text" class="flex items-center gap-3 text-indigo-100 text-sm">
            <span class="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
              <i :class="f.icon" class="fa-solid text-sm"></i>
            </span>
            {{ f.text }}
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-indigo-300">© {{ new Date().getFullYear() }} CH Academic PRO</p>
    </aside>

    <main class="flex-1 flex items-center justify-center p-6 relative">
      <button
        class="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
        :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
        :title="isDark ? 'Modo claro' : 'Modo escuro'"
        @click="toggleTheme"
      >
        <i :class="isDark ? 'fa-sun' : 'fa-moon'" class="fa-solid"></i>
      </button>

      <div class="w-full max-w-sm">
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <i class="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <div>
            <p class="font-extrabold text-lg tracking-wide leading-none text-slate-800 dark:text-slate-100">CH ACADEMIC</p>
            <p class="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mt-1">PRO SYSTEM</p>
          </div>
        </div>

        <h1 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">AUTENTICAÇÃO</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Acesse o painel da sua instituição.</p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
          <div>
            <label for="login-username" class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Utilizador</label>
            <div class="relative">
              <i class="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                id="login-username"
                ref="usernameInput"
                v-model="username"
                type="text"
                autocomplete="username"
                autofocus
                placeholder="seu.utilizador"
                :aria-invalid="!!authStore.error"
                class="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl pl-10 pr-3 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                @input="authStore.clearError()"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="login-password" class="block text-xs font-bold text-slate-700 dark:text-slate-200">Senha</label>
              <button type="button" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" @click="forgotPassword">Esqueceu a senha?</button>
            </div>
            <div class="relative">
              <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                id="login-password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Sua senha"
                :aria-invalid="!!authStore.error"
                class="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl pl-10 pr-11 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                @input="authStore.clearError()"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fa-eye-slash' : 'fa-eye'" class="fa-regular"></i>
              </button>
            </div>
          </div>

          <label class="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input v-model="remember" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Manter sessão iniciada
          </label>

          <p v-if="authStore.error" role="alert" class="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
            <i class="fa-solid fa-circle-exclamation"></i> {{ authStore.error }}
          </p>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i v-if="authStore.isLoading" class="fa-solid fa-circle-notch animate-spin"></i>
            {{ authStore.isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>