import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/img/pwa-192x192.png', 'assets/img/pwa-512x512.png'],
      manifest: {
        name: 'CH Academic Pro',
        short_name: 'CH Academic',
        description: 'Painel Executivo e Sistema de Gestão Escolar',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'pt',
        icons: [
          {
            src: '/assets/img/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/img/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/assets/img/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000, 
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
})