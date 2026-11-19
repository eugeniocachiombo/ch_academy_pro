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
  <RouterView v-if="isPublic" />

  <template v-else>
    <AppSidebar />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AppHeader />

      <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-slate-950 relative">
        <RouterView />
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