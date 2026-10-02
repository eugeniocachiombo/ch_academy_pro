<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { isDark, showNotification } from '@/services/general_service'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

type Period = 'bimestre1' | 'bimestre2' | 'bimestre3'

const dataByPeriod: Record<Period, number[]> = {
  bimestre1: [82, 88, 80, 85, 89],
  bimestre2: [88, 92, 85, 90, 94],
  bimestre3: [91, 95, 89, 93, 97],
}

const period = ref<Period>('bimestre2')
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function create() {
  if (!canvas.value) return
  const tickColor = isDark.value ? '#94a3b8' : '#64748b'
  const gridColor = isDark.value ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 1)'
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: ['6º Ano', '7º Ano', '8º Ano', '9º Ano', 'Ensino Médio'],
      datasets: [
        {
          label: 'Média de Desempenho (%)',
          data: dataByPeriod[period.value],
          backgroundColor: [
            'rgba(99, 102, 241, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(59, 130, 246, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
          ],
          borderRadius: 12,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y}%` } },
      },
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: tickColor } },
        x: { grid: { display: false }, ticks: { color: tickColor } },
      },
    },
  })
}

// Actualiza os dados no gráfico existente (sem destruir e recriar)
watch(period, (value) => {
  if (!chart) return
  chart.data.datasets[0].data = dataByPeriod[value]
  chart.update()
  showNotification('Gráfico actualizado com sucesso!', 'success')
})

// Ao trocar o tema, recria o gráfico com as cores novas
watch(isDark, () => {
  chart?.destroy()
  create()
})

onMounted(create)
onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 lg:col-span-2 flex flex-col">
    <div class="flex items-center justify-between mb-4 gap-3">
      <div>
        <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Desempenho Acadêmico por Turma</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Média geral de notas comparativa por série e período</p>
      </div>
      <select v-model="period" aria-label="Período" class="bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-400">
        <option value="bimestre1">1º Bimestre</option>
        <option value="bimestre2">2º Bimestre</option>
        <option value="bimestre3">3º Bimestre</option>
      </select>
    </div>
    <div class="flex-1 relative min-h-[240px]">
      <canvas ref="canvas" role="img" aria-label="Gráfico de barras com a média de desempenho por série"></canvas>
    </div>
  </div>
</template>
