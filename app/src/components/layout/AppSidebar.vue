<script setup lang="ts">
import { currentUser } from '@/services/auth_service'
import { activeTab, sidebarExpanded, toggleSidebar, logout, type TabId } from '@/services/general_service'

const links: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
  { id: 'academic', label: 'Acadêmico', icon: 'fa-book-open' },
  { id: 'financial', label: 'Financeiro', icon: 'fa-wallet' },
  { id: 'students', label: 'Alunos', icon: 'fa-users' },
  { id: 'teachers', label: 'Professores', icon: 'fa-chalkboard-user' },
  { id: 'communications', label: 'Comunicações', icon: 'fa-bullhorn' },
  { id: 'reports', label: 'Relatórios', icon: 'fa-file-lines' },
]

function closeSidebar() {
  sidebarExpanded.value = false
}
</script>

<template>
  <!-- Reserva o espaço da barra recolhida; a barra expandida flutua por cima no mobile -->
  <div class="relative flex-shrink-0 w-20 lg:w-64">
    <div v-if="sidebarExpanded" class="fixed inset-0 bg-slate-900/50 z-[25] lg:hidden" aria-hidden="true" @click="toggleSidebar"></div>

    <aside
      :class="sidebarExpanded ? 'w-64' : 'w-20 lg:w-64'"
      class="absolute inset-y-0 left-0 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30 shadow-xl dark:border-r dark:border-slate-800"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 lg:px-6 border-b border-slate-800 bg-slate-950/50">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <i class="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <div :class="sidebarExpanded ? 'block' : 'hidden lg:block'" class="overflow-hidden">
            <h1 class="font-extrabold text-lg tracking-wide bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">EDUSMART</h1>
            <span class="text-[10px] uppercase font-bold tracking-widest text-indigo-400">PRO SYSTEM</span>
          </div>
        </div>
      </div>

      <!-- Navegação -->
      <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Menu principal">
        <RouterLink
          v-for="link in links"
          :key="link.id"
          :to="{ name: link.id }"
          :aria-current="activeTab === link.id ? 'page' : undefined"
          :title="link.label"
          :class="
            activeTab === link.id
              ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          "
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          @click="closeSidebar"
        >
          <i
            :class="[link.icon, activeTab !== link.id && 'group-hover:text-indigo-400 transition-colors']"
            class="fa-solid w-5 text-center text-lg"
          ></i>
          <span :class="sidebarExpanded ? 'inline' : 'hidden lg:inline'">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- Perfil -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/30">
        <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <img
            :src="currentUser?.photo"
            :alt="currentUser?.name"
            class="w-10 h-10 rounded-lg object-cover ring-2 ring-indigo-500/50"
          />
          <div :class="sidebarExpanded ? 'block' : 'hidden lg:block'" class="overflow-hidden flex-1">
            <h4 class="text-xs font-bold text-white truncate">{{ currentUser?.name }}</h4>
            <span class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {{ currentUser?.role }}
            </span>
          </div>
          <button
            :class="sidebarExpanded ? 'block' : 'hidden lg:block'"
            class="text-slate-400 hover:text-red-400 transition-colors p-1"
            title="Sair"
            aria-label="Sair"
            @click="logout"
          >
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>
