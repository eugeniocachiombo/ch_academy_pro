<script setup lang="ts">
import { computed, ref } from 'vue'

interface CalendarEvent {
  year: number
  month: number // 0 = janeiro
  from: number
  to: number
  title: string
  tone: 'indigo' | 'amber'
}

const events: CalendarEvent[] = [
  { year: 2026, month: 10, from: 15, to: 19, title: 'Provas Bimestrais', tone: 'indigo' },
  { year: 2026, month: 10, from: 22, to: 22, title: 'Reunião Geral de Pais', tone: 'amber' },
  { year: 2026, month: 10, from: 28, to: 28, title: 'Prazo de inscrição da Feira de Ciências', tone: 'indigo' },
]

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())
const selectedDay = ref<number | null>(today.getDate())

const monthLabel = computed(() => `${monthNames[viewMonth.value]} ${viewYear.value}`)
const daysInMonth = computed(() => new Date(viewYear.value, viewMonth.value + 1, 0).getDate())
// Semana começa na segunda: getDay() (0 = domingo) -> 0 = segunda
const leadingBlanks = computed(() => (new Date(viewYear.value, viewMonth.value, 1).getDay() + 6) % 7)
const days = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1))

const isCurrentMonth = computed(() => viewYear.value === today.getFullYear() && viewMonth.value === today.getMonth())

function eventsOn(day: number): CalendarEvent[] {
  return events.filter((e) => e.year === viewYear.value && e.month === viewMonth.value && day >= e.from && day <= e.to)
}

const monthEvents = computed(() => events.filter((e) => e.year === viewYear.value && e.month === viewMonth.value))
const selectedEvents = computed(() => (selectedDay.value ? eventsOn(selectedDay.value) : []))

function isToday(day: number): boolean {
  return isCurrentMonth.value && day === today.getDate()
}

function dayClass(day: number): string[] {
  const dayEvents = eventsOn(day)
  const classes: string[] = []
  if (dayEvents.some((e) => e.tone === 'amber')) classes.push('bg-amber-500 text-white font-bold shadow-md shadow-amber-500/30')
  else if (dayEvents.length) classes.push('bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30')
  else if (isToday(day)) classes.push('bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold')
  else classes.push('hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200')
  if (day === selectedDay.value) classes.push('ring-2 ring-offset-1 ring-slate-700 dark:ring-slate-200 dark:ring-offset-slate-900')
  return classes
}

function changeMonth(dir: -1 | 1) {
  let month = viewMonth.value + dir
  let year = viewYear.value
  if (month < 0) {
    month = 11
    year--
  } else if (month > 11) {
    month = 0
    year++
  }
  viewMonth.value = month
  viewYear.value = year
  selectedDay.value = isCurrentMonth.value ? today.getDate() : null
}

function eventRange(e: CalendarEvent): string {
  return e.from === e.to ? `${e.from}` : `${e.from}-${e.to}`
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 lg:col-span-1 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4 gap-2">
        <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Calendário Acadêmico</h3>
        <div class="flex items-center gap-1">
          <button class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors" aria-label="Mês anterior" @click="changeMonth(-1)">
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200 px-2 w-28 text-center" aria-live="polite">{{ monthLabel }}</span>
          <button class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors" aria-label="Próximo mês" @click="changeMonth(1)">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
        <span v-for="d in weekdays" :key="d">{{ d }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
        <div v-for="n in leadingBlanks" :key="'blank-' + n" aria-hidden="true"></div>
        <button
          v-for="day in days"
          :key="day"
          :class="dayClass(day)"
          :aria-pressed="day === selectedDay"
          :aria-label="`${day} de ${monthNames[viewMonth]}`"
          class="h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all"
          @click="selectedDay = day"
        >
          {{ day }}
        </button>
      </div>
    </div>

    <div class="mt-6 bg-indigo-50/50 dark:bg-indigo-500/10 p-3 rounded-2xl">
      <template v-if="selectedDay">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200">{{ selectedDay }} de {{ monthNames[viewMonth] }}</span>
          <span v-if="isToday(selectedDay)" class="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">Hoje</span>
        </div>
        <ul v-if="selectedEvents.length" class="mt-1 space-y-1">
          <li v-for="e in selectedEvents" :key="e.title" class="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-200">
            <span :class="e.tone === 'amber' ? 'bg-amber-500' : 'bg-indigo-600'" class="w-2 h-2 rounded-full"></span>{{ e.title }}
          </li>
        </ul>
        <p v-else class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Nenhum evento neste dia.</p>
      </template>
      <p v-else class="text-xs font-bold text-indigo-900 dark:text-indigo-200">Selecione um dia</p>

      <p v-if="monthEvents.length" class="text-[11px] text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-500/20">
        <span v-for="(e, i) in monthEvents" :key="e.title">{{ i ? ' | ' : '' }}{{ eventRange(e) }}: {{ e.title }}</span>
      </p>
    </div>
  </div>
</template>
