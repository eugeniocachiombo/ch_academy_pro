<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { activeTab, sidebarExpanded, toggleSidebar, logout, type TabId } from '@/services/general_service'

const userStore = useUserStore()

// Estado para controlar quais menus com submenu estão expandidos
const openMenus = ref<Record<string, boolean>>({
  academic: false,
  financial: false,
  students: false,
  teachers: false,
  communications: false,
  reports: false,
  settings: false,
})

interface SubMenu {
  id: TabId
  label: string
  icon: string
  permition?: boolean
}

interface MenuItem {
  key: string
  label: string
  icon: string
  children?: SubMenu[]
  singleRoute?: TabId
  permition?: boolean
}

const p = (name: string) => userStore.getPermition(name)

// computed: recalcula sozinho quando as permissões chegarem / mudarem
const menuItems = computed(() => [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-chart-pie',
    singleRoute: 'dashboard',
    permition: true,
  },
  {
    key: 'academic',
    label: 'Acadêmico',
    icon: 'fa-book-open',
    children: [
      { id: 'academic-courses', label: 'Cursos', icon: 'fa-graduation-cap', permition: p('courses.manage') },
      { id: 'academic-grades', label: 'Classes', icon: 'fa-layer-group', permition: p('grades.manage') },
      { id: 'academic-classes', label: 'Turmas', icon: 'fa-chalkboard', permition: p('classes.manage') },
      { id: 'academic-subjects', label: 'Disciplinas', icon: 'fa-book', permition: p('subjects.manage') }, 
      { id: 'academic-rooms', label: 'Salas', icon: 'fa-door-open', permition: p('rooms.manage') },
      { id: 'academic-grade-subjects', label: 'Disciplinas por Classe', icon: 'fa-book-open-reader', permition: p('grade_subjects.manage') },
      { id: 'academic-course-grades', label: 'Classes por Cursos', icon: 'fa-network-wired', permition: p('course-grades.manage') },
      { id: 'academic-marks', label: 'Notas', icon: 'fa-star', permition: p('grades.manage') },
      { id: 'academic-attendance', label: 'Frequência', icon: 'fa-clipboard-user', permition: p('attendance.manage') },
    ],
  },
  {
    key: 'financial',
    label: 'Financeiro',
    icon: 'fa-wallet',
    children: [
      { id: 'financial-fees', label: 'Mensalidades', icon: 'fa-file-invoice-dollar', permition: p('fee.manage') },
      { id: 'financial-bills', label: 'Boletos', icon: 'fa-barcode', permition: p('bill.manage') },
      { id: 'financial-cashflow', label: 'Caixa', icon: 'fa-cash-register', permition: p('cashflow.manage') },
    ],
  },
  {
    key: 'students',
    label: 'Alunos',
    icon: 'fa-users',
    children: [
      { id: 'students-directory', label: 'Diretório', icon: 'fa-address-book', permition: p('student.manage') },
      { id: 'students-enrollment', label: 'Matrícula', icon: 'fa-user-plus', permition: p('enrollment.manage') },
    ],
  },
  {
    key: 'teachers',
    label: 'Professores',
    icon: 'fa-chalkboard-user',
    children: [
      { id: 'teachers-directory', label: 'Corpo Docente', icon: 'fa-id-badge', permition: p('teacher.manage') },
      { id: 'teachers-schedule', label: 'Horários', icon: 'fa-calendar-days', permition: p('schedule.manage') },
    ],
  },
  {
    key: 'communications',
    label: 'Comunicações',
    icon: 'fa-bullhorn',
    children: [
      { id: 'communications-wall', label: 'Mural', icon: 'fa-rectangle-ad', permition: p('wall.manage') },
      { id: 'communications-send', label: 'Enviar', icon: 'fa-paper-plane', permition: p('message.send') },
    ],
  },
  {
    key: 'reports',
    label: 'Relatórios',
    icon: 'fa-file-lines',
    children: [
      { id: 'reports-academic', label: 'Acadêmicos', icon: 'fa-file-contract', permition: p('report_academic.manage') },
      { id: 'reports-financial', label: 'Financeiros', icon: 'fa-file-invoice', permition: p('report_financial.manage') },
      { id: 'reports-attendance', label: 'Frequência', icon: 'fa-file-shield', permition: p('report_attendance.manage') },
    ],
  },
  {
    key: 'settings',
    label: 'Configurações',
    icon: 'fa-gears',
    children: [
      { id: 'settings-academic-year', label: 'Ano Letivo', icon: 'fa-calendar-days', permition: p('academic_year.manage') },
      { id: 'settings-users', label: 'Utilizadores', icon: 'fa-user-gear', permition: p('user.manage') },
      { id: 'settings-roles', label: 'Funções', icon: 'fa-user-shield', permition: p('role.manage') },
      { id: 'settings-permitions', label: 'Permissões', icon: 'fa-key', permition: p('permition.manage') },
      { id: 'settings-role-permitions', label: 'Perm. de Funções', icon: 'fa-shield-halved', permition: p('role_permition.manage') },
      { id: 'settings-user-roles', label: 'Vínculos de Funções', icon: 'fa-users-gear', permition: p('user_role.manage') },
    ],
  }
])

// Menu com submenus só aparece se tiver pelo menos um filho visível
function hasVisibleChildren(item: MenuItem): boolean {
  if (!item.children) return false
  return item.children.some((sub) => sub.permition !== false)
}

function toggleSubmenu(key: string) {
  openMenus.value[key] = !openMenus.value[key]
}

function closeSidebar() {
  sidebarExpanded.value = false
}
</script>

<template>
  <div class="relative flex-shrink-0 w-20 lg:w-64">
    <div v-if="sidebarExpanded" class="fixed inset-0 bg-slate-900/50 z-[25] lg:hidden" aria-hidden="true"
      @click="toggleSidebar"></div>

    <aside :class="sidebarExpanded ? 'w-64' : 'w-20 lg:w-64'"
      class="absolute inset-y-0 left-0 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30 shadow-xl dark:border-r dark:border-slate-800">
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 lg:px-6 border-b border-slate-800 bg-slate-950/50">
        <div class="flex items-center gap-3">
          <div
            class="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <i class="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <div :class="sidebarExpanded ? 'block' : 'hidden lg:block'" class="overflow-hidden">
            <h1
              class="font-extrabold text-lg tracking-wide bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              CH ACADEMIC</h1>
            <span class="text-[10px] uppercase font-bold tracking-widest text-indigo-400">PRO SYSTEM</span>
          </div>
        </div>
      </div>

      <!-- Navegação com Submenus e Permissões -->
      <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Menu principal">
        <template v-for="item in menuItems" :key="item.key">

          <!-- Item simples (Ex: Dashboard) -->
          <RouterLink v-if="item.singleRoute && item.permition" :to="{ name: item.singleRoute }"
            :aria-current="activeTab === item.singleRoute ? 'page' : undefined" :title="item.label" :class="activeTab === item.singleRoute
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              "
            class="flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            @click="closeSidebar">
            <i :class="[item.icon, activeTab !== item.singleRoute && 'group-hover:text-indigo-400 transition-colors']"
              class="fa-solid w-5 text-center text-lg"></i>
            <span :class="sidebarExpanded ? 'inline' : 'hidden lg:inline'">{{ item.label }}</span>
          </RouterLink>

          <!-- Item com Submenus (só se houver pelo menos 1 filho com permissão) -->
          <div v-else-if="item.children && hasVisibleChildren(item)" class="space-y-1">
            <button type="button"
              class="w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all group focus:outline-none"
              @click="toggleSubmenu(item.key)">
              <div class="flex items-center gap-3.5">
                <i :class="item.icon"
                  class="fa-solid w-5 text-center text-lg group-hover:text-indigo-400 transition-colors"></i>
                <span :class="sidebarExpanded ? 'inline' : 'hidden lg:inline'">{{ item.label }}</span>
              </div>
              <i :class="[openMenus[item.key] ? 'rotate-90' : '', sidebarExpanded ? 'inline' : 'hidden lg:inline']"
                class="fa-solid fa-chevron-right text-xs text-slate-500 transition-transform duration-200"></i>
            </button>

            <!-- Submenus com verificação individual de permissão -->
            <div v-show="openMenus[item.key] || sidebarExpanded" class="pl-6 space-y-1 transition-all">
              <template v-for="sub in item.children" :key="sub.id">
                <RouterLink v-if="sub.permition !== false" :to="{ name: sub.id }"
                  :aria-current="activeTab === sub.id ? 'page' : undefined" :class="activeTab === sub.id
                      ? 'text-white bg-indigo-600/80 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    " class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  @click="closeSidebar">
                  <i :class="sub.icon" class="fa-solid w-4 text-center text-xs"></i>
                  <span>{{ sub.label }}</span>
                </RouterLink>
              </template>
            </div>
          </div>

        </template>
      </nav>

      <!-- Perfil -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/30">
        <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <template v-if="userStore.currentUser?.photo">
            <img :src="userStore.currentUser.photo" :alt="userStore.currentUser?.name"
              class="w-10 h-10 rounded-lg object-cover ring-2 ring-indigo-500/50 flex-shrink-0" />
          </template>
          <template v-else>
            <div
              class="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/50 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-user text-sm"></i>
            </div>
          </template>

          <div :class="sidebarExpanded ? 'block' : 'hidden lg:block'" class="overflow-hidden flex-1">
            <h4 class="text-xs font-bold text-white truncate">{{ userStore.currentUser?.name }}</h4>
            <span class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {{
                userStore.getUserRole()?.role?.name || 'Sem função' }}
            </span>
          </div>
          <button :class="sidebarExpanded ? 'block' : 'hidden lg:block'"
            class="text-slate-400 hover:text-red-400 transition-colors p-1" title="Sair" aria-label="Sair"
            @click="logout">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>