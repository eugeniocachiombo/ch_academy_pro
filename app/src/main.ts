import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { initTableLabels } from './tableLabels'

// @ts-ignore
import 'virtual:pwa-register'

const app = createApp(App)

app.use(createPinia())
app.use(ToastService)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
    },
  },
})

app.mount('#app')
initTableLabels()