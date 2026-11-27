<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'

interface SetupStep {
  step: number
  module: string
  title: string
  description: string
  requirement?: string
}

const setupSteps: SetupStep[] = [
  {
    step: 1,
    module: 'Académico',
    title: 'Turnos e Salas',
    description: 'Crie os turnos/períodos letivos e cadastre as salas disponíveis.',
  },
  {
    step: 2,
    module: 'Académico',
    title: 'Ano Letivo',
    description: 'Crie o ano letivo e defina-o como ativo/atual no sistema.',
  },
  {
    step: 3,
    module: 'Académico',
    title: 'Turmas',
    description: 'Crie as turmas e conclua a configuração inicial de cada turma.',
  },
  {
    step: 4,
    module: 'Recursos Humanos',
    title: 'Funcionários e Contas de Professor',
    description: 'Cadastre o funcionário e associe/ative a conta de professor.',
  },
  {
    step: 5,
    module: 'Professores',
    title: 'Alocação de Professores',
    description: 'Atribua cada professor às respetivas turmas e disciplinas.',
    requirement: 'Requer funcionários com perfil de professor já cadastrados.',
  },
  {
    step: 6,
    module: 'Académico',
    title: 'Horários',
    description: 'Monte e configure os horários das turmas.',
    requirement: 'Só é possível configurar após atribuir professores às turmas e associar as disciplinas.',
  },
]

const containerRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const selectedModule = ref('Todos')

let ctx: gsap.Context | undefined

const modules = computed(() => {
  const uniqueModules = Array.from(new Set(setupSteps.map((item) => item.module)))
  return ['Todos', ...uniqueModules]
})

const filteredSteps = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return setupSteps.filter((item) => {
    const matchesModule =
      selectedModule.value === 'Todos' || item.module === selectedModule.value

    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.module.toLowerCase().includes(query) ||
      (item.requirement && item.requirement.toLowerCase().includes(query))

    return matchesModule && matchesQuery
  })
})

const progressPercent = computed(() => {
  if (!setupSteps.length) return 0
  return Math.round((filteredSteps.value.length / setupSteps.length) * 100)
})

function animateHeader() {
  if (!containerRef.value) return

  ctx?.revert()
  ctx = gsap.context(() => {
    gsap.from('.gsap-hero', {
      y: 18,
      opacity: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    })
  }, containerRef.value)
}

async function animateCards() {
  await nextTick()
  if (!containerRef.value) return

  const cards = containerRef.value.querySelectorAll('.gsap-step-card')
  if (!cards.length) return

  gsap.killTweensOf(cards)
  gsap.fromTo(
    cards,
    { y: 16, opacity: 0, scale: 0.99 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    },
  )
}

function clearFilters() {
  searchQuery.value = ''
  selectedModule.value = 'Todos'
}

onMounted(() => {
  animateHeader()
  animateCards()
})

watch([searchQuery, selectedModule], () => {
  animateCards()
})

onBeforeUnmount(() => {
  ctx?.revert()
})
</script>

<template>
  <div
    ref="containerRef"
    class="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 text-slate-900 dark:text-slate-100"
  >
    <header
      class="gsap-hero relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-blue-50/60 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1.5">
          <span
            class="inline-flex items-center rounded-full border border-blue-200 bg-blue-100/80 px-3 py-0.5 text-xs font-semibold text-blue-800 dark:border-blue-500/30 dark:bg-blue-950/80 dark:text-blue-300"
          >
            Preparação do Sistema
          </span>
          <h1 class="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Guia de Configuração Inicial
          </h1>
          <p class="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Siga as etapas na sequência indicada para deixar tudo pronto antes de iniciar a utilização diária.
          </p>
        </div>

        <div class="w-full sm:w-44 space-y-1.5">
          <div class="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>Etapas visíveis</span>
            <span>{{ filteredSteps.length }}/{{ setupSteps.length }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
        </div>
      </div>
    </header>

    <section
      class="gsap-hero flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-3.5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div class="flex flex-wrap gap-2">
        <button
          v-for="mod in modules"
          :key="mod"
          type="button"
          class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
          :class="
            selectedModule === mod
              ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500 dark:text-slate-950'
              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
          "
          @click="selectedModule = mod"
        >
          {{ mod }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Pesquisar etapa ou requisito..."
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-64 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        />

        <button
          v-if="searchQuery || selectedModule !== 'Todos'"
          type="button"
          class="cursor-pointer rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="clearFilters"
        >
          Limpar
        </button>
      </div>
    </section>

    <ol v-if="filteredSteps.length > 0" class="space-y-3.5">
      <li
        v-for="item in filteredSteps"
        :key="item.step"
        class="gsap-step-card group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/40"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-blue-500 dark:text-slate-950"
          >
            {{ item.step }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <span>Passo {{ item.step }}</span>
              <span class="text-slate-300 dark:text-slate-600">•</span>
              <span class="rounded bg-blue-50 px-2 py-0.5 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200">
                {{ item.module }}
              </span>
            </div>

            <h2 class="mt-1.5 text-base font-semibold text-slate-950 dark:text-white">
              {{ item.title }}
            </h2>

            <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {{ item.description }}
            </p>

            <div
              v-if="item.requirement"
              class="mt-3 rounded-lg border border-amber-300/80 bg-amber-50/90 px-3 py-2 text-xs font-medium text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-200"
            >
              <span class="font-semibold">Pré-requisito:</span> {{ item.requirement }}
            </div>
          </div>
        </div>
      </li>
    </ol>

    <div
      v-else
      class="gsap-step-card rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
    >
      Nenhuma etapa encontrada para o filtro selecionado.
    </div>

    <div
      class="gsap-hero rounded-xl border border-emerald-300/80 bg-emerald-50/90 p-4 text-sm font-medium text-emerald-950 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-200"
    >
      Pronto! Configurações finalizadas, agora basta utilizar o sistema.
    </div>
  </div>
</template>