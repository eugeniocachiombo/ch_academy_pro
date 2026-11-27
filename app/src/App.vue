<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'
import QuickActionModal from '@/components/shared/QuickActionModal.vue'
import NoticeModal from '@/components/shared/NoticeModal.vue'
// import ChatWidget from '@/components/shared/ChatWidget.vue'
import { useYearStore } from '@/stores/year.store'
import { closeOverlays, showNotification } from '@/services/general_service'
import { isRouteLoading } from '@/composables/useRouteLoading'
import Toast from 'primevue/toast'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'

const route = useRoute()
const yearStore = useYearStore()
const isPublic = computed(() => route.meta.public === true)
const activeYear = computed(() => (yearStore.years || []).find((y: any) => y.isCurrent) || null)

let welcomeTimer: ReturnType<typeof setTimeout> | undefined

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeOverlays()
}

async function notifyAcademicYear() {
  if (!yearStore.years?.length && yearStore.list) {
    await yearStore.list().catch(() => {})
  }

  if (activeYear.value) {
    showNotification(`Ano lectivo activo: ${activeYear.value.name}.`, 'info')
  } else {
    showNotification('Nenhum ano lectivo activo no momento.', 'warning', 50000)
  }
}

watch(
  isPublic,
  (publicRoute) => {
    if (welcomeTimer) clearTimeout(welcomeTimer)
    if (!publicRoute) {
      welcomeTimer = setTimeout(() => {
        notifyAcademicYear()
      }, 2500)
    }
  },
  { immediate: true },
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (welcomeTimer) clearTimeout(welcomeTimer)
})
</script>

<template>
  <!-- Barra global de carregamento de rota -->
  <div
    v-if="isRouteLoading"
    class="fixed top-0 left-0 right-0 z-[9999] h-1 overflow-hidden bg-blue-500/20 pointer-events-none"
  >
    <div class="h-full w-1/3 animate-route-bar bg-blue-600 dark:bg-blue-400" />
  </div>

  <RouterView v-if="isPublic" />

  <template v-else>
    <AppSidebar />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AppHeader />

      <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-slate-950 relative">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <Transition name="page-fade" mode="out-in">
            <component :is="Component" :key="currentRoute.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- <ChatWidget /> -->
    <QuickActionModal />
    <NoticeModal />
    <AppBottomNav />
  </template>

  <Toast />
  <ToastNotification />
</template>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes route-bar {
  0% {
    transform: translateX(-120%);
  }
  50% {
    transform: translateX(150%);
  }
  100% {
    transform: translateX(360%);
  }
}

.animate-route-bar {
  animation: route-bar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>