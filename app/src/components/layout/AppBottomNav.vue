<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { activeTab, isDark, logout, sidebarExpanded, toggleSidebar, toggleTheme } from '@/services/general_service'
import { useNotifications } from '@/composables/useNotifications'

const userStore = useUserStore()
const { notifications, unread, markAllRead } = useNotifications()

type Sheet = 'profile' | 'notifications' | null
const sheet = ref<Sheet>(null)

function openSheet(name: Exclude<Sheet, null>) {
  sidebarExpanded.value = false
  sheet.value = sheet.value === name ? null : name
}
function openMenu() {
  sheet.value = null
  toggleSidebar()
}
function closeAll() {
  sheet.value = null
  sidebarExpanded.value = false
}
function onLogout() {
  sheet.value = null
  logout()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeAll()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

const tabBase = 'relative flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400'
const tabClass = (active: boolean) => [tabBase, active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 active:text-indigo-500']
</script>

<template>
  <!-- Barra inferior: só existe abaixo de lg (no desktop continua a barra lateral) -->
  <nav
    class="lg:hidden fixed inset-x-0 bottom-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
    aria-label="Navegação rápida"
  >
    <div class="flex h-16">
      <RouterLink
        :to="{ name: 'dashboard' }"
        :class="tabClass(activeTab === 'dashboard' && !sheet && !sidebarExpanded)"
        :aria-current="activeTab === 'dashboard' ? 'page' : undefined"
        @click="closeAll"
      >
        <span v-if="activeTab === 'dashboard' && !sheet && !sidebarExpanded" class="absolute top-0 h-1 w-8 rounded-b-full bg-indigo-600 dark:bg-indigo-400"></span>
        <i class="fa-solid fa-house text-lg"></i>
        <span>Início</span>
      </RouterLink>

      <button type="button" :class="tabClass(sheet === 'profile')" :aria-expanded="sheet === 'profile'" @click="openSheet('profile')">
        <span v-if="sheet === 'profile'" class="absolute top-0 h-1 w-8 rounded-b-full bg-indigo-600 dark:bg-indigo-400"></span>
        <i class="fa-solid fa-user text-lg"></i>
        <span>Perfil</span>
      </button>

      <button type="button" :class="tabClass(sheet === 'notifications')" :aria-expanded="sheet === 'notifications'" @click="openSheet('notifications')">
        <span v-if="sheet === 'notifications'" class="absolute top-0 h-1 w-8 rounded-b-full bg-indigo-600 dark:bg-indigo-400"></span>
        <span class="relative">
          <i class="fa-solid fa-bell text-lg"></i>
          <span
            v-if="unread > 0"
            class="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
          >{{ unread }}</span>
        </span>
        <span>Notificações</span>
      </button>

      <button type="button" :class="tabClass(sidebarExpanded)" :aria-expanded="sidebarExpanded" @click="openMenu">
        <span v-if="sidebarExpanded" class="absolute top-0 h-1 w-8 rounded-b-full bg-indigo-600 dark:bg-indigo-400"></span>
        <i class="fa-solid fa-bars text-lg"></i>
        <span>Menu</span>
      </button>
    </div>
  </nav>

  <!-- Fundo escurecido das folhas (Perfil / Notificações) -->
  <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
    <div v-if="sheet" class="lg:hidden fixed inset-0 z-[35] bg-slate-900/50" aria-hidden="true" @click="sheet = null"></div>
  </Transition>

  <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-y-full" leave-active-class="transition-transform duration-200 ease-in" leave-to-class="translate-y-full">
    <section
      v-if="sheet"
      class="lg:hidden fixed inset-x-0 bottom-0 z-[36] max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-100 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      aria-modal="true"
      :aria-label="sheet === 'profile' ? 'Perfil' : 'Notificações'"
    >
      <div class="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700"></div>

      <!-- Perfil -->
      <div v-if="sheet === 'profile'" class="p-5 space-y-4 overflow-y-auto">
        <div class="flex items-center gap-4">
          <img v-if="userStore.currentUser?.photo" :src="userStore.currentUser.photo" :alt="userStore.currentUser?.name" class="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50" />
          <div v-else class="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/40 flex items-center justify-center">
            <i class="fa-solid fa-user text-2xl"></i>
          </div>
          <div class="min-w-0">
            <h3 class="font-bold text-slate-800 dark:text-slate-100 truncate">{{ userStore.currentUser?.name }}</h3>
            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {{ userStore.getUserRole()?.role?.name || 'Sem função' }}
            </span>
          </div>
        </div>

        <button type="button" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium" @click="toggleTheme">
          <i :class="isDark ? 'fa-sun' : 'fa-moon'" class="fa-solid w-5 text-center"></i>
          {{ isDark ? 'Ativar modo claro' : 'Ativar modo escuro' }}
        </button>

        <button type="button" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-semibold" @click="onLogout">
          <i class="fa-solid fa-power-off w-5 text-center"></i>
          Sair da conta
        </button>
      </div>

      <!-- Notificações -->
      <div v-else class="flex flex-col min-h-0">
        <div class="px-5 pt-4 pb-3 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 dark:text-slate-100">Notificações</h3>
          <span class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full">
            {{ unread > 0 ? `${unread} novas` : 'Tudo lido' }}
          </span>
        </div>
        <div class="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="n in notifications" :key="n.title" class="px-5 py-3.5 flex gap-3">
            <div :class="n.color" class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <i :class="n.icon" class="fa-solid text-sm"></i>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ n.title }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ n.text }}</p>
              <span class="text-[10px] text-slate-400 mt-1 block">{{ n.time }}</span>
            </div>
          </div>
        </div>
        <div v-if="unread > 0" class="p-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" class="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-[0.99]" @click="markAllRead">Marcar todas como lidas</button>
        </div>
      </div>
    </section>
  </Transition>
</template>